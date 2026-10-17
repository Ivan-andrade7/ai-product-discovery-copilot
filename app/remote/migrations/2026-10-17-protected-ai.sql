-- PREPARED ONLY: apply after protected-schema.sql with separate authorization.
-- Additive: no deletion, reclassification, reset or migration of project/history data.
begin;
create table if not exists tp_private.real_analysis_attempts(
 request_id text primary key, project_id text not null, actor uuid not null,
 fingerprint text not null, status text not null, lease text not null, lease_until timestamptz not null, result jsonb,
 ai_mode text not null check(ai_mode='abacus'), model text not null, session_id text not null,
 created_at timestamptz not null default clock_timestamp()
);
alter table tp_private.real_analysis_attempts enable row level security;
revoke all on tp_private.real_analysis_attempts from public,anon,authenticated;

create or replace function public.tp_protected_ai_analysis(p_key text,p_sid text,p_request jsonb,p_action text,p_lease text,p_result jsonb,p_policy jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare a tp_private.real_analysis_attempts; project jsonb; run jsonb;
 fingerprint text=encode(sha256(convert_to(p_request::text,'UTF8')),'hex');
 daily integer; per_session integer; input_chars integer;
begin
 -- Both the backend capability and the authenticated, pinned session are mandatory.
 if length(p_key)<>64 or not exists(select 1 from tp_private.server_config where key_hash=encode(sha256(convert_to(p_key,'UTF8')),'hex')) then raise insufficient_privilege; end if;
 perform tp_private.require_session(p_sid);
 if p_policy->>'mode' is distinct from 'abacus' or coalesce(p_policy->>'model','') !~ '^[a-zA-Z0-9_.:-]{1,100}$'
 or p_policy->>'model'='simulation-e1' or p_policy->>'model' ~* '^(auto|router)$|route[-_]?llm|^jev([_.:-]|$)'
 or coalesce((p_policy->>'dailyLimit')::integer,0) not between 1 and 20
 or coalesce((p_policy->>'sessionLimit')::integer,0) not between 1 and 5
 or coalesce((p_policy->>'timeoutMs')::integer,0) not between 1 and 25000
 or coalesce((p_policy->>'maxOutputTokens')::integer,0) not between 1 and 1800
 or coalesce((p_policy->>'maxInputChars')::integer,0) not between 1 and 12000
 or coalesce((p_policy->>'maxSourceChars')::integer,0) not between 1 and 6000
 or coalesce((p_policy->>'maxSources')::integer,0) not between 1 and 10 then raise invalid_parameter_value; end if;
 -- Same lock order as workspace saves and legacy analysis; serializes reservations.
 perform pg_advisory_xact_lock(627418203);
 if p_action<>'status' then
   select * into a from tp_private.real_analysis_attempts where request_id=p_request->>'requestId' for update;
   if found then
     if a.ai_mode<>'abacus' or a.actor<>auth.uid() or a.project_id is distinct from p_request->>'projectId' or a.fingerprint<>fingerprint or a.model is distinct from p_policy->>'model' then raise insufficient_privilege; end if;
     if a.status='complete' then return jsonb_build_object('version',1,'status','complete','result',a.result); end if;
     if a.status in ('interrupted','uncertain') or a.lease_until<clock_timestamp() then
       update tp_private.real_analysis_attempts set status='interrupted' where request_id=a.request_id;
       return '{"version":1,"status":"interrupted"}'::jsonb;
     end if;
     if p_action='finish' and a.lease=p_lease then
       if jsonb_typeof(p_result) is distinct from 'object' or jsonb_typeof(p_result->'ok') is distinct from 'boolean' or p_result->>'simulated'='true' or octet_length(p_result::text)>200000 then raise invalid_parameter_value; end if;
       update tp_private.real_analysis_attempts set status=case when p_result->>'code'='uncertain' then 'uncertain' else 'complete' end,result=p_result where request_id=a.request_id;
       return jsonb_build_object('version',1,'status','complete','result',p_result);
     end if;
     return '{"version":1,"status":"busy"}'::jsonb;
   end if;
 end if;
 update tp_private.real_analysis_attempts set status='interrupted' where status='processing' and lease_until<clock_timestamp();
 if exists(select 1 from tp_private.real_analysis_attempts where status in ('interrupted','uncertain')) then return '{"version":1,"status":"interrupted"}'::jsonb; end if;
 if exists(select 1 from tp_private.real_analysis_attempts where status='processing') then return '{"version":1,"status":"busy"}'::jsonb; end if;
 select count(*) into daily from tp_private.real_analysis_attempts where ai_mode='abacus' and created_at>=(date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC');
 select count(*) into per_session from tp_private.real_analysis_attempts where ai_mode='abacus' and session_id=p_sid;
 if daily>=(p_policy->>'dailyLimit')::integer or per_session>=(p_policy->>'sessionLimit')::integer then return '{"version":1,"status":"limit"}'::jsonb; end if;
 if p_action='status' then return '{"version":1,"status":"ready"}'::jsonb; end if;
 if p_action<>'claim' or length(p_lease)<>43 or p_request->>'stage' is distinct from 'E1' or p_request->>'model' is distinct from p_policy->>'model' then raise invalid_parameter_value; end if;
 select p into project from tp_private.workspace w,jsonb_array_elements(w.data->'projects') p where p->>'id'=p_request->>'projectId';
 select r into run from jsonb_array_elements(project->'runs') r where r->>'id'=p_request->>'requestId';
 if project->>'mode' is distinct from 'personal' or run is null or run->>'status' is distinct from 'analyzing' or run->'request' is distinct from p_request then raise invalid_parameter_value; end if;
 select coalesce(sum(length(s->>'content')),0) into input_chars from jsonb_array_elements(p_request->'sources') s;
 if jsonb_array_length(p_request->'sources') not between 1 and (p_policy->>'maxSources')::integer or input_chars>(p_policy->>'maxSourceChars')::integer or input_chars+length(p_request->>'userRequest')+length((p_request->'humanContext')::text)>(p_policy->>'maxInputChars')::integer then raise invalid_parameter_value; end if;
 insert into tp_private.real_analysis_attempts(request_id,project_id,actor,fingerprint,status,lease,lease_until,ai_mode,model,session_id)
 values(p_request->>'requestId',project->>'id',auth.uid(),fingerprint,'processing',p_lease,clock_timestamp()+interval '90 seconds','abacus',p_policy->>'model',p_sid);
 return '{"version":1,"status":"claimed"}'::jsonb;
end; $$;
revoke all on function public.tp_protected_ai_analysis(text,text,jsonb,text,text,jsonb,jsonb) from public,anon;
grant execute on function public.tp_protected_ai_analysis(text,text,jsonb,text,text,jsonb,jsonb) to authenticated;
commit;
