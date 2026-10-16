-- Dedicated test project only. No administrative credential is used by the app.
begin;
create schema if not exists tp_private;
revoke all on schema tp_private from public, anon, authenticated;
create table if not exists tp_private.identities(email text primary key);
insert into tp_private.identities values ('ivanandradeuxui@gmail.com'),('ivanandradecarp@gmail.com') on conflict do nothing;
create table if not exists tp_private.workspace(
  singleton boolean primary key default true check(singleton), data jsonb not null
);
create table if not exists tp_private.commands(
  operation uuid primary key, actor uuid not null, payload jsonb not null, result jsonb not null
);
alter table tp_private.identities enable row level security;
alter table tp_private.workspace enable row level security;
alter table tp_private.commands enable row level security;
-- No table privileges/policies: only the narrowly scoped functions below access data.
revoke all on all tables in schema tp_private from public, anon, authenticated;
create or replace function tp_private.authorized() returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null
 and auth.jwt()->'app_metadata'->>'provider' = 'google'
 and exists(select 1 from auth.users u join tp_private.identities i on i.email=lower(u.email)
   where u.id=auth.uid() and u.email_confirmed_at is not null)
 and exists(select 1 from auth.identities i where i.user_id=auth.uid() and i.provider='google');
$$;
revoke all on function tp_private.authorized() from public, anon, authenticated;
create or replace function public.tp_read_workspace() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
 if tp_private.authorized() is not true then raise insufficient_privilege; end if;
 return (select data from tp_private.workspace where singleton);
end; $$;
create or replace function public.tp_save_workspace(p_candidate jsonb,p_revision bigint,p_writer text,p_operation uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare current_data jsonb; previous tp_private.commands; payload jsonb; next_data jsonb; result jsonb;
begin
 if tp_private.authorized() is not true then raise insufficient_privilege; end if;
 if p_revision<0 or p_candidate->>'schemaVersion'<>'3' or jsonb_typeof(p_candidate->'projects')<>'array'
 or coalesce(jsonb_array_length(p_candidate->'projects'),0)=0 or length(p_writer)=0
 or (p_candidate->>'revision')::bigint<>p_revision then raise invalid_parameter_value; end if;
 -- One personal space; all explicitly authorized Google identities belong to Ivan.
 perform pg_advisory_xact_lock(627418203);
 payload=jsonb_build_object('candidate',p_candidate,'revision',p_revision,'writer',p_writer);
 select * into previous from tp_private.commands where operation=p_operation;
 if found then
   if previous.actor<>auth.uid() or previous.payload<>payload then raise invalid_parameter_value; end if;
   return previous.result;
 end if;
 select data into current_data from tp_private.workspace where singleton for update;
 if (current_data is null and p_revision<>0) or (current_data is not null and
   ((current_data->>'revision')::bigint<>p_revision or current_data->>'writerId'<>p_candidate->>'writerId')) then
   return jsonb_build_object('ok',false,'type','conflict','workspace',current_data);
 end if;
 next_data=p_candidate || jsonb_build_object('revision',p_revision+1,'writerId',p_writer);
 insert into tp_private.workspace(singleton,data) values(true,next_data)
 on conflict(singleton) do update set data=excluded.data;
 result=jsonb_build_object('ok',true,'workspace',next_data);
 insert into tp_private.commands values(p_operation,auth.uid(),payload,result);
 return result;
end; $$;
revoke all on function public.tp_read_workspace() from public, anon;
revoke all on function public.tp_save_workspace(jsonb,bigint,text,uuid) from public, anon;
grant execute on function public.tp_read_workspace() to authenticated;
grant execute on function public.tp_save_workspace(jsonb,bigint,text,uuid) to authenticated;
-- Before-user-created hook: configure in Auth Hooks before enabling Google signups.
create or replace function public.tp_before_user_created(event jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
 if event->'user'->'app_metadata'->>'provider'='google' and exists(
   select 1 from tp_private.identities where email=lower(event->'user'->>'email')) then return '{}'::jsonb; end if;
 return '{"error":{"http_code":403,"message":"Identidad no autorizada para este espacio privado."}}'::jsonb;
end; $$;
revoke all on function public.tp_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.tp_before_user_created(jsonb) to supabase_auth_admin;
commit;
