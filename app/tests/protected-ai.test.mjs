import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFile} from 'node:fs/promises'
import {protectedAiConfig,publicAiPolicy} from '../server/protected/ai-config.mjs'
import {createServerlessApi} from '../server/protected/api.mjs'
import {seal,digest} from '../server/protected/crypto.mjs'
import {createLocalProject,createDefaultWorkspace} from '../src/data/demoData.js'
import {makeRequest,startAnalysis,finishAnalysis,decideProposal} from '../src/ai/contracts.js'
import {deriveBrief} from '../src/e1/service.js'
import {isWorkspace} from '../src/storage.js'
import {loadPrivateEnvironment} from '../src/remote/client.js'
import net from 'node:net'
import {GEMINI_MODEL} from '../server/providers/gemini.mjs'

const originalConnect=net.Socket.prototype.connect,originalFetch=globalThis.fetch
let externalAttempts=0
net.Socket.prototype.connect=function(){externalAttempts++;throw Error('External traffic forbidden')}
globalThis.fetch=()=>{externalAttempts++;throw Error('External traffic forbidden')}
test.after(()=>{net.Socket.prototype.connect=originalConnect;globalThis.fetch=originalFetch;assert.equal(externalAttempts,0)})

const settings={TP_AI_MODE:'abacus',TP_ABACUS_API_KEY:'fixture-not-a-real-credential',TP_AI_MODEL:'fixture-reasoning-model',TP_AI_MAX_OUTPUT_TOKENS:'500',TP_AI_MAX_SOURCES:'2',TP_AI_MAX_INPUT_CHARS:'6000',TP_AI_MAX_SOURCE_CHARS:'1000',TP_AI_TIMEOUT_MS:'100',TP_AI_DAILY_LIMIT:'2',TP_AI_SESSION_LIMIT:'2'}
const configured=()=>protectedAiConfig(settings)
const geminiConfigured=()=>protectedAiConfig({...settings,TP_AI_MODE:'real',TP_AI_PROVIDER:'gemini',TP_GEMINI_API_KEY:'fixture-gemini-credential',TP_AI_MODEL:GEMINI_MODEL,TP_GEMINI_DATA_POLICY:'fictional-only',TP_GEMINI_BILLING_POLICY:'free-no-billing'})

test('protected AI config: disabled by default, explicit simulation, complete server-only policy',()=>{
 assert.equal(protectedAiConfig({}).mode,'disabled')
 assert.equal(protectedAiConfig({TP_AI_MODE:'simulation'}).model,'simulation-e1')
 assert.equal(JSON.stringify(publicAiPolicy(configured())).includes(settings.TP_ABACUS_API_KEY),false)
 for(const name of Object.keys(settings).filter(k=>k!=='TP_AI_MODE')){const env={...settings};delete env[name];assert.throws(()=>protectedAiConfig(env),name)}
 for(const patch of [{TP_ABACUS_API_KEY:'bad key'},{TP_AI_MODEL:'route-llm'},{TP_AI_MODEL:'simulation-e1'},{TP_AI_MODEL:'router/model'},{TP_AI_MODEL:'Jev'},{TP_AI_MODEL:'jev-v2'},{TP_AI_MODE:'automatic'},{TP_AI_DAILY_LIMIT:'0'},{TP_AI_TIMEOUT_MS:'25001'}])assert.throws(()=>protectedAiConfig({...settings,...patch}))
 for(const model of ['gpt-6-astra','gpt-6.1-sol','claude-sonnet-5-5'])assert.equal(protectedAiConfig({...settings,TP_AI_MODEL:model}).model,model)
})

// Shared durable double across fresh API instances. No PostgreSQL or provider network.
function harness({ai=configured(),response,hold,missing=false,finishFailure=false,expireAfterSend=false}={}) {
 const raw='a'.repeat(43),sid=digest(raw),authId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
 const identity={email:'fixture@example.test',userId:'11111111-1111-4111-8111-111111111111',googleSubject:'111111111111111111111'}
 const token='fixture.'+Buffer.from(JSON.stringify({session_id:authId})).toString('base64url')+'.fixture'
 const encryptionKey='a'.repeat(64)
 const record={kind:'session',expiresAt:Date.now()+28800000,idleUntil:Date.now()+1800000,tokenExpires:Date.now()+3600000,actor:identity.userId,authSessionId:authId,csrf:'fixture-csrf',sealed:seal({token,refresh:'fixture-refresh'},encryptionKey,sid)}
 const config={origin:'https://private.example.test',url:'https://fixture.supabase.co',publicKey:'fixture',encryptionKey,identities:[identity],ai}
 let calls=0,authCalls=0,closed=0,wire,workspace=createDefaultWorkspace(),alive=true
 const attempts=new Map()
 function prepare(){let p=createLocalProject({name:'Ficticio',objective:'Separar un hecho y una incertidumbre.',sources:'Hay tres reservas. No se conoce el plazo.'},{e1:true});p.sources[0].selected=true;const request=makeRequest(p,ai.model??'fixture-reasoning-model',crypto.randomUUID(),'E1',ai.provider);p=startAnalysis(p,request).project;workspace={...workspace,activeProjectId:p.id,projects:[...workspace.projects,p]};return request}
 const store={
  async session(action,id){assert.equal(id,sid);return alive?record:null},
  async load(){return structuredClone(workspace)},
  async aiAnalysis(t,id,request,action,lease,result,policy){
   assert.equal(t,token);assert.equal(id,sid);assert.equal('key' in policy,false)
   if(missing)throw Error('missing-rpc')
   const fingerprint=createHash('sha256').update(JSON.stringify(request)).digest('hex')
   const old=attempts.get(request.requestId),version=ai.provider==='gemini'?2:1
   if(old){assert.equal(old.fingerprint,fingerprint);assert.equal(old.provider,ai.provider);if(old.status==='complete')return {version,status:'complete',result:structuredClone(old.result)};if(old.status==='uncertain')return {version,status:'interrupted'};if(action==='finish'&&old.lease===lease){if(finishFailure)throw Error('lost-ack');old.status=result.code==='uncertain'?'uncertain':'complete';old.result=structuredClone(result);return {version,status:'complete',result}};return {version,status:'busy'}}
   if([...attempts.values()].some(a=>a.status!=='complete'))return {version,status:'busy'}
   if(attempts.size>=policy.dailyLimit||attempts.size>=policy.sessionLimit)return {version,status:'limit'}
   if(action==='status')return {version,status:'ready'}
   assert.equal(action,'claim');attempts.set(request.requestId,{fingerprint,status:'processing',lease,provider:ai.provider});return {version,status:'claimed'}
  },
 }
 const fetcher=async(url)=>{assert.equal(url,config.url+'/auth/v1/user');authCalls++;return Response.json({id:identity.userId,email:identity.email,email_confirmed_at:'fixture',app_metadata:{provider:'google'},identities:[{provider:'google',id:identity.googleSubject}]})}
 const transportFactory=options=>{
  assert.equal(options.apiKey,ai.key)
  const transport=async request=>{
   const ticket=await options.admission.reserve();assert.equal(ticket.ok,true)
   calls++;wire=structuredClone(request);if(hold)await hold
   if(expireAfterSend)alive=false
   if(response)return response(request)
   if(ai.provider==='gemini'){
    const source=JSON.parse(request.body.contents[1].parts[0].text).sources[0]
    return {status:200,externalAttempted:true,body:{modelVersion:ai.model,usageMetadata:{promptTokenCount:40,candidatesTokenCount:20,totalTokenCount:60},candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({proposals:[{type:'Afirmación',title:'Reservas',content:'Hay tres reservas; plazo desconocido.',reasoning:'La nota no informa un plazo.',certainty:'evidence',references:[{sourceId:source.id,quote:'Hay tres reservas.'}]}]})}]}}]}}
   }
   const source=JSON.parse(request.body.messages[2].content).sources[0]
   return {status:200,externalAttempted:true,body:{model:ai.model,usage:{prompt_tokens:40,completion_tokens:20,total_tokens:60,secret:'discard'},choices:[{finish_reason:'stop',message:{content:JSON.stringify({proposals:[{type:'Afirmación',title:'Reservas',content:'Hay tres reservas; plazo desconocido.',reasoning:'La nota no informa un plazo.',certainty:'evidence',references:[{sourceId:source.id,quote:'Hay tres reservas.'}]}]})}}]}}
  }
  transport.close=()=>closed++
  return transport
 }
 async function call(path,body,headers={}){
  const res={setHeader(){},writeHead(status){this.status=status},end(value){this.value=JSON.parse(value)}}
  await createServerlessApi(config,store,{fetcher,transportFactory})({method:body?'POST':'GET',body,url:'/api/'+path,headers:{host:'private.example.test','x-forwarded-proto':'https',cookie:'__Host-tp_session='+raw,...(body?{origin:config.origin,'content-type':'application/json','x-tp-csrf':record.csrf}:{}),...headers}},res,path)
  return res
 }
 return {prepare,call,store,attempts,config,workspace:()=>workspace,counters:()=>({calls,closed,authCalls}),wire:()=>wire}
}

test('private real adapter prepared: available, selected E1 input, durable replay, human decision and brief',async()=>{
 const h=harness(),request=h.prepare()
 const status=await h.call('session');assert.equal(status.value.ai.available,true);assert.equal(status.value.simulatedProvider,false);assert.equal(JSON.stringify(status.value).includes(settings.TP_ABACUS_API_KEY),false)
 const result=(await h.call('analysis',request)).value
 assert.equal(result.ok,true);assert.equal(result.modelReported,settings.TP_AI_MODEL);assert.deepEqual(result.usage,{prompt_tokens:40,completion_tokens:20,total_tokens:60})
 assert.equal(h.wire().body.model,settings.TP_AI_MODEL);assert.equal(h.wire().body.max_tokens,500)
 assert.equal(JSON.parse(h.wire().body.messages[1].content).request,request.userRequest)
 assert.deepEqual(JSON.parse(h.wire().body.messages[1].content).humanContext,request.humanContext)
 assert.deepEqual(JSON.parse(h.wire().body.messages[2].content).sources,request.sources)
 const p=h.workspace().projects.at(-1),finished=finishAnalysis(p,request,result),accepted=decideProposal(finished,finished.proposals[0].id,{status:'accepted'},'accepted','pending')
 assert.equal(accepted.proposals[0].origin,'model');assert.equal(deriveBrief(accepted).blocks.length,1)
 assert.equal(deriveBrief(decideProposal(accepted,accepted.proposals[0].id,{status:'pending'},'reopened','accepted')).blocks.length,0)
 const persisted=JSON.parse(JSON.stringify({...h.workspace(),projects:[...h.workspace().projects.slice(0,-1),accepted]}));assert.equal(isWorkspace(persisted),true)
 assert.deepEqual((await h.call('analysis',request)).value,result);assert.equal(h.counters().calls,1);assert.equal(h.counters().closed,1)
 assert.equal(JSON.stringify([...h.attempts.values()]).includes(request.userRequest),false)
 assert.equal(JSON.stringify([...h.attempts.values()]).includes(settings.TP_ABACUS_API_KEY),false)
})

test('private duplicate/in-flight and new invocation replay never send twice',async()=>{
 let release;const hold=new Promise(r=>release=r),h=harness({hold}),request=h.prepare()
 const first=h.call('analysis',request)
 while(!h.counters().calls)await new Promise(r=>setImmediate(r))
 assert.equal((await h.call('analysis',request)).value.code,'busy')
 release();assert.equal((await first).value.ok,true);assert.equal((await h.call('analysis',request)).value.ok,true);assert.equal(h.counters().calls,1)
})

test('Gemini server routing uses the same review contract and persists provenance without rewriting Abacus',async()=>{
 const h=harness({ai:geminiConfigured()}),request=h.prepare()
 const session=(await h.call('session')).value
 assert.equal(session.ai.mode,'real');assert.equal(session.ai.provider,'gemini');assert.equal(session.ai.model,GEMINI_MODEL);assert.equal(session.ai.available,true)
 for(const patch of [{provider:'abacus'},{model:'gpt-6-astra'},{endpoint:'https://other.test'},{apiKey:'client-key'},{mode:'simulation'}])assert.equal((await h.call('analysis',{...request,...patch})).status,400)
 const absent={...request};delete absent.provider;assert.equal((await h.call('analysis',absent)).status,400)
 assert.equal(h.counters().calls,0)
 const result=(await h.call('analysis',request)).value;assert.equal(result.ok,true);assert.equal(result.finishReason,'STOP');assert.equal(result.usage.total_tokens,60)
 const project=h.workspace().projects.at(-1),finished=finishAnalysis(project,request,result)
 const accepted=decideProposal(finished,finished.proposals[0].id,{status:'accepted'},'accepted','pending')
 assert.equal(accepted.runs[0].provider,'gemini');assert.equal(accepted.proposals[0].origin,'model');assert.equal(deriveBrief(accepted).blocks.length,1)
 const workspace={...h.workspace(),projects:[...h.workspace().projects.slice(0,-1),accepted]}
 assert.equal(isWorkspace(JSON.parse(JSON.stringify(workspace))),true)
 const corrupt=structuredClone(workspace);corrupt.projects.at(-1).runs[0].provider='abacus';assert.equal(isWorkspace(corrupt),false)
 assert.deepEqual((await h.call('analysis',request)).value,result);assert.equal(h.counters().calls,1)
 assert.equal(JSON.stringify([...h.attempts.values()]).includes(request.userRequest),false)
})

test('Gemini capability requires v2 reservation; lost finish blocks replay without fallback',async()=>{
 for(const options of [{missing:true},{finishFailure:true}]){
  const h=harness({ai:geminiConfigured(),...options}),r=h.prepare()
  if(options.missing)assert.equal((await h.call('session')).value.ai.available,false)
  assert.equal((await h.call('analysis',r)).value.code,'uncertain')
  await h.call('analysis',r);assert.equal(h.counters().calls,options.missing?0:1)
 }
})

test('disabled, missing durable RPC, manipulated model/CSRF/origin, limits stay offline',async()=>{
 const disabled=harness({ai:{mode:'disabled',model:null}}),r=disabled.prepare();assert.equal((await disabled.call('session')).value.ai.available,false);assert.equal((await disabled.call('analysis',r)).value.code,'disconnected');assert.equal(disabled.counters().calls,0)
 const missing=harness({missing:true}),request=missing.prepare();assert.equal((await missing.call('session')).value.ai.available,false);assert.equal((await missing.call('analysis',request)).value.code,'uncertain');assert.equal(missing.counters().calls,0)
 const h=harness(),q=h.prepare();assert.equal((await h.call('analysis',{...q,model:'manipulated'})).status,400);assert.equal((await h.call('analysis',q,{'x-tp-csrf':'bad'})).status,403);assert.equal((await h.call('analysis',q,{origin:'https://other.example'})).status,403);assert.equal(h.counters().calls,0)
 const tight=harness({ai:{...configured(),maxInputChars:1}});assert.equal((await tight.call('analysis',tight.prepare())).value.code,'invalid');assert.equal(tight.counters().calls,0)
 const capped=harness({ai:{...configured(),dailyLimit:1}});assert.equal((await capped.call('analysis',capped.prepare())).value.ok,true);assert.equal((await capped.call('analysis',capped.prepare())).value.code,'budget_blocked');assert.equal(capped.counters().calls,1)
})

for(const [name,response,code,reason] of [
 ['bad JSON',()=>({status:200,externalAttempted:true,body:{model:settings.TP_AI_MODEL,choices:[{finish_reason:'stop',message:{content:'broken'}}]}}),'invalid','invalid_json'],
 ['bad references',()=>({status:200,externalAttempted:true,body:{model:settings.TP_AI_MODEL,choices:[{finish_reason:'stop',message:{content:JSON.stringify({proposals:[{type:'Afirmación',title:'X',content:'X',reasoning:'X',certainty:'evidence',references:[{sourceId:'invented',quote:'X'}]}]})}}]}}),'invalid','unknown_source'],
 ['wrong model',()=>({status:200,externalAttempted:true,body:{model:'unexpected',choices:[{finish_reason:'stop',message:{content:'{"proposals":[]}'}}]}}),'invalid','model_mismatch'],
 ['quota',()=>({status:402,externalAttempted:true}),'quota'],
 ['permission',()=>({status:403,externalAttempted:true}),'permission'],
 ['rate limit',()=>({status:429,externalAttempted:true}),'rate_limit'],
 ['truncation',()=>({status:200,externalAttempted:true,body:{model:settings.TP_AI_MODEL,choices:[{finish_reason:'length',message:{content:'partial'}}]}}),'incomplete','incomplete_response'],
 ['timeout after send',()=>({status:0,code:'error',externalAttempted:true,diagnostic:{stage:'transport',reason:'timeout'}}),'uncertain','timeout'],
 ['timeout before send',()=>({status:0,code:'cancelled',externalAttempted:false,diagnostic:{stage:'transport',reason:'timeout'}}),'cancelled','timeout'],
])test('private provider fictitious '+name,async()=>{
 const h=harness({response}),r=h.prepare(),result=(await h.call('analysis',r)).value
 assert.equal(result.code,code);if(reason)assert.equal(result.diagnostic.reason,reason)
 await h.call('analysis',r);assert.equal(h.counters().calls,1)
 if(code==='uncertain'){assert.equal((await h.call('session')).value.ai.available,false);assert.equal((await h.call('analysis',h.prepare())).value.code,'busy')}
})

test('lost finalization or logout after send leaves reservation blocking, never retries',async()=>{
 for(const options of [{finishFailure:true},{expireAfterSend:true}]){const h=harness(options),r=h.prepare();const result=(await h.call('analysis',r)).value;assert.equal(result.code,'uncertain');await h.call('analysis',r);assert.equal(h.counters().calls,1);assert.equal(h.attempts.size,1)}
})

test('private client uses explicit server capability, never assumes simulation or model',async()=>{
 for(const ai of [{mode:'disabled',model:null,available:false,code:'disconnected'},{mode:'abacus',model:'fixture-model',available:true,code:'ready'}]){
  const env=await loadPrivateEnvironment(async p=>p==='session'?{ai}:{workspace:null})
  assert.equal(env.simulated,false);assert.equal(env.connection.model,ai.model);assert.equal((await env.checkConnection()).available,ai.available)
 }
 const empty=await loadPrivateEnvironment(async p=>p==='session'?{}:{workspace:null});assert.equal(empty.connection.available,false)
})

test('SQL migration is additive, capability-gated and serialized; static evidence only',async()=>{
 const sql=await readFile(new URL('../remote/migrations/2026-10-17-protected-ai.sql',import.meta.url),'utf8')
 assert.match(sql,/PREPARED ONLY/);assert.match(sql,/require_session/);assert.match(sql,/p_key/);assert.match(sql,/pg_advisory_xact_lock\(627418203\)/);assert.match(sql,/request_id text primary key/);assert.match(sql,/dailyLimit/);assert.match(sql,/sessionLimit/)
 assert.doesNotMatch(sql,/delete from|drop table|alter table tp_private\.analysis_attempts/i)
})
