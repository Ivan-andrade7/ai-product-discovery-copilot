-- PREPARED ONLY. Apply after schema.sql, with separate remote authorization.
-- No project data migration/reset. No administrative key is used by the app.
begin;
alter table tp_private.identities add column if not exists user_id uuid;
alter table tp_private.identities add column if not exists google_subject text;
create table if not exists tp_private.server_config(singleton boolean primary key default true check(singleton), key_hash text not null);
create table if not exists tp_private.server_sessions(
 id text primary key, record jsonb not null, revoked boolean not null default false,
 refresh_lease text, refresh_until timestamptz
);
create table if not exists tp_private.analysis_attempts(
 request_id text primary key, project_id text not null, actor uuid not null,
 fingerprint text not null, status text not null, lease text not null,
 lease_until timestamptz not null, result jsonb
);
alter table tp_private.server_config enable row level security;
alter table tp_private.server_sessions enable row level security;
alter table tp_private.analysis_attempts enable row level security;
revoke all on all tables in schema tp_private from public, anon, authenticated;

-- Administrative setup only, not a web endpoint. Supply verified UUID/sub pairs
-- and SHA256 of a newly generated dedicated session-store credential at the next gate.
create or replace function public.tp_configure_protected(p_identities jsonb,p_key_hash text) returns void
language plpgsql security definer set search_path='' as $$
declare i jsonb;
begin
 if jsonb_typeof(p_identities)<>'array' or jsonb_array_length(p_identities)<>2 or p_key_hash !~ '^[0-9a-f]{64}$'
 or (select count(distinct x->>'email') from jsonb_array_elements(p_identities) x where x->>'email' in ('ivanandradeuxui@gmail.com','ivanandradecarp@gmail.com'))<>2
 then raise invalid_parameter_value; end if;
 for i in select * from jsonb_array_elements(p_identities) loop
   if not exists(select 1 from auth.users u join auth.identities g on g.user_id=u.id
    where u.id=(i->>'userId')::uuid and u.email=i->>'email' and u.email_confirmed_at is not null
    and g.provider='google' and g.provider_id=i->>'googleSubject') then raise insufficient_privilege; end if;
   update tp_private.identities set user_id=(i->>'userId')::uuid,google_subject=i->>'googleSubject' where email=i->>'email';
 end loop;
 insert into tp_private.server_config values(true,p_key_hash) on conflict(singleton) do update set key_hash=excluded.key_hash;
 -- Explicit reconfiguration invalidates sessions, never workspace/history.
 update tp_private.server_sessions set revoked=true;
end; $$;
revoke all on function public.tp_configure_protected(jsonb,text) from public,anon,authenticated;

create or replace function public.tp_session_store(p_key text,p_action text,p_id text,p_record jsonb default '{}',p_lease text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
declare s tp_private.server_sessions; t bigint=(extract(epoch from clock_timestamp())*1000)::bigint; data jsonb;
begin
 if length(p_key)<>64 or not exists(select 1 from tp_private.server_config where key_hash=encode(sha256(convert_to(p_key,'UTF8')),'hex'))
 or p_id !~ '^[0-9a-f]{64}$' then raise insufficient_privilege; end if;
 if p_action='create' then
   if p_record->>'kind' not in ('login','session') or length(p_record->>'sealed')>12000 then raise invalid_parameter_value; end if;
   data=p_record || jsonb_build_object('expiresAt',least((p_record->>'expiresAt')::bigint,t+case when p_record->>'kind'='login' then 600000 else 28800000 end));
   if data->>'kind'='session' then
     if not exists(select 1 from tp_private.identities i join auth.sessions a on a.user_id=i.user_id
       where i.user_id=(data->>'actor')::uuid and a.id=(data->>'authSessionId')::uuid and i.google_subject is not null) then raise insufficient_privilege; end if;
     data=data || jsonb_build_object('idleUntil',t+1800000);
   end if;
   insert into tp_private.server_sessions(id,record) values(p_id,data);return data;
 end if;
 select * into s from tp_private.server_sessions where id=p_id for update;
 if not found then return null; end if;
 if p_action='revoke' then update tp_private.server_sessions set revoked=true where id=p_id;return '{}'::jsonb; end if;
 if s.revoked or (s.record->>'expiresAt')::bigint<=t or (s.record->>'kind'='session' and (s.record->>'idleUntil')::bigint<=t)
 or (s.refresh_lease is not null and s.refresh_until<clock_timestamp()) then
   update tp_private.server_sessions set revoked=true where id=p_id;return null;
 end if;
 if p_action='take' then
   if s.record->>'kind'<>'login' then raise insufficient_privilege; end if;
   update tp_private.server_sessions set revoked=true where id=p_id;return s.record;
 end if;
 if p_action='get' then
   if s.record->>'kind'='session' then
     s.record=s.record || jsonb_build_object('idleUntil',least((s.record->>'expiresAt')::bigint,t+1800000));
     update tp_private.server_sessions set record=s.record where id=p_id;
   end if;
   return s.record || jsonb_build_object('refreshing',s.refresh_lease is not null);
 end if;
 if p_action='lease' then
   if s.record->>'kind'<>'session' or s.refresh_lease is not null or length(p_lease)<>43 or s.record->>'sealed' is distinct from p_record->>'sealed' then return null; end if;
   update tp_private.server_sessions set refresh_lease=p_lease,refresh_until=clock_timestamp()+interval '30 seconds' where id=p_id;
   return s.record;
 end if;
 if p_action='renew' then
   if s.refresh_lease is distinct from p_lease or s.refresh_lease is null then return null; end if;
   data=s.record || jsonb_build_object('sealed',p_record->>'sealed','tokenExpires',(p_record->>'tokenExpires')::bigint);
   update tp_private.server_sessions set record=data,refresh_lease=null,refresh_until=null where id=p_id;return data;
 end if;
 raise invalid_parameter_value;
end; $$;
revoke all on function public.tp_session_store(text,text,text,jsonb,text) from public,anon,authenticated;
-- Anonymous transport, authorized by a separate 256-bit backend capability.
-- It accesses encrypted session records only; never workspace/tables/user data RPCs.
grant execute on function public.tp_session_store(text,text,text,jsonb,text) to anon;

create or replace function tp_private.require_session(p_sid text) returns void
language plpgsql security definer set search_path='' as $$
declare s tp_private.server_sessions; t bigint=(extract(epoch from clock_timestamp())*1000)::bigint;
begin
 select * into s from tp_private.server_sessions where id=p_sid for share;
 if not found or s.revoked or s.record->>'kind'<>'session' or (s.record->>'expiresAt')::bigint<=t or (s.record->>'idleUntil')::bigint<=t or (s.refresh_lease is not null and s.refresh_until<clock_timestamp())
 or s.record->>'actor' is distinct from auth.uid()::text or s.record->>'authSessionId' is distinct from auth.jwt()->>'session_id'
 or not exists(select 1 from auth.sessions a where a.id=(auth.jwt()->>'session_id')::uuid and a.user_id=auth.uid())
 or not exists(select 1 from tp_private.identities i join auth.users u on u.id=i.user_id join auth.identities g on g.user_id=u.id
   where u.id=auth.uid() and u.email=i.email and u.email_confirmed_at is not null and g.provider='google' and g.provider_id=i.google_subject)
 or auth.jwt()->'app_metadata'->>'provider' is distinct from 'google' then raise insufficient_privilege; end if;
end; $$;
revoke all on function tp_private.require_session(text) from public,anon,authenticated;

create or replace function public.tp_protected_read(p_sid text) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 perform tp_private.require_session(p_sid);
 update tp_private.analysis_attempts set status='interrupted' where status='processing' and lease_until<clock_timestamp();
 return public.tp_read_workspace();
end; $$;
create or replace function public.tp_protected_save(p_sid text,p_candidate jsonb,p_revision bigint,p_writer text,p_operation uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin perform tp_private.require_session(p_sid);return public.tp_save_workspace(p_candidate,p_revision,p_writer,p_operation);end; $$;
revoke all on function public.tp_read_workspace() from authenticated;
revoke all on function public.tp_save_workspace(jsonb,bigint,text,uuid) from authenticated;
revoke all on function public.tp_protected_read(text) from public,anon;
revoke all on function public.tp_protected_save(text,jsonb,bigint,text,uuid) from public,anon;
grant execute on function public.tp_protected_read(text) to authenticated;
grant execute on function public.tp_protected_save(text,jsonb,bigint,text,uuid) to authenticated;

create or replace function public.tp_protected_analysis(p_sid text,p_request jsonb,p_action text,p_lease text,p_result jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare attempt tp_private.analysis_attempts; project jsonb; run jsonb; fingerprint text=encode(sha256(convert_to(p_request::text,'UTF8')),'hex');
begin
 perform tp_private.require_session(p_sid);
 if p_request->>'stage' is distinct from 'E1' or p_request->>'model' is distinct from 'simulation-e1' then raise invalid_parameter_value; end if;
 -- Same workspace/transaction lock order as saves, then the unique attempt row.
 perform pg_advisory_xact_lock(627418203);
 select p into project from tp_private.workspace w,jsonb_array_elements(w.data->'projects') p where p->>'id'=p_request->>'projectId';
 if project is null or project->>'mode' is distinct from 'personal' then raise insufficient_privilege; end if;
 select r into run from jsonb_array_elements(project->'runs') r where r->>'id'=p_request->>'requestId';
 if run is null or run->>'status' is distinct from 'analyzing' or run->'request' is distinct from p_request then raise invalid_parameter_value; end if;
 select * into attempt from tp_private.analysis_attempts where request_id=p_request->>'requestId' for update;
 if found then
   if attempt.project_id<>project->>'id' or attempt.fingerprint<>fingerprint or attempt.actor<>auth.uid() then raise insufficient_privilege; end if;
   if attempt.status='complete' then return jsonb_build_object('status','complete','result',attempt.result); end if;
   if attempt.status='interrupted' or attempt.lease_until<clock_timestamp() then
     update tp_private.analysis_attempts set status='interrupted' where request_id=attempt.request_id;
     return '{"status":"interrupted"}'::jsonb;
   end if;
   if p_action='finish' and attempt.lease=p_lease and p_result->>'simulated'='true' and p_result->>'externalAttempted'='false' then
     update tp_private.analysis_attempts set status='complete',result=p_result where request_id=attempt.request_id;
     return jsonb_build_object('status','complete','result',p_result);
   end if;
   return '{"status":"uncertain"}'::jsonb;
 end if;
 if p_action<>'claim' or length(p_lease)<>43 then raise invalid_parameter_value; end if;
 insert into tp_private.analysis_attempts values(p_request->>'requestId',project->>'id',auth.uid(),fingerprint,'processing',p_lease,clock_timestamp()+interval '30 seconds',null);
 return '{"status":"claimed"}'::jsonb;
end; $$;
revoke all on function public.tp_protected_analysis(text,jsonb,text,text,jsonb) from public,anon;
grant execute on function public.tp_protected_analysis(text,jsonb,text,text,jsonb) to authenticated;
commit;
