import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import {createHash} from 'node:crypto'
import {createProtectedApi} from '../server/private-api.mjs'
import {createPrivateEnvironment,loadPrivateEnvironment} from '../src/remote/client.js'
import {createDefaultWorkspace,createLocalProject} from '../src/data/demoData.js'
import {applyCreationAttempt} from '../src/workflow.js'
import {makeRequest,startAnalysis,finishAnalysis,decideProposal} from '../src/ai/contracts.js'
import {isWorkspace} from '../src/storage.js'
import {addHumanInput,closeInterruptedSimulation} from '../src/e1/service.js'
import {createSimulatedProvider} from '../src/e1/test-adapters.js'

test('JSONB round trip preserves historical context, human provenance and analysis validation',async()=>{
 const jsonb=v=>Array.isArray(v)?v.map(jsonb):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).reverse().map(([k,x])=>[k,jsonb(x)])):v
 let p=createLocalProject({name:'JSONB fixture',objective:'Original',sources:'Fuente seleccionada'},{e1:true});p.sources[0].selected=true
 p=addHumanInput(p,{content:'Declaración humana',sourceIds:[p.sources[0].id]})
 const req=makeRequest(p,'simulation-e1','jsonb-fixture','E1'),snapshot=req.contextVersion
 const started=startAnalysis(p,req).project
 const w=jsonb(applyCreationAttempt(createDefaultWorkspace(),started))
 assert.equal(isWorkspace(w),true)
 const stored=w.projects.at(-1),request=stored.runs[0].request
 assert.equal(request.contextVersion,snapshot)
 const result=await createSimulatedProvider().analyze(request)
 const finished=finishAnalysis(stored,request,result)
 assert.equal(finished.runs[0].status,'complete');assert.ok(finished.proposals.length)
 assert.deepEqual(finished.stageWork.E1.humanInputs,stored.stageWork.E1.humanInputs)
 const changed={...stored,originalRequest:'Contenido cambiado'}
 assert.equal(finishAnalysis(changed,request,result).runs[0].status,'stale')
 const corrupted=structuredClone(w);corrupted.projects.at(-1).runs[0].request.sources[0].content='Otra fuente'
 assert.equal(isWorkspace(corrupted),false)
 const interrupted={...stored,runs:stored.runs.map(r=>({...r,status:'interrupted'}))}
 const closed=closeInterruptedSimulation(interrupted)
 assert.equal(closed.runs[0].status,'cancelled');assert.deepEqual(closed.runs[0].request,request)
 assert.equal(closeInterruptedSimulation(closed),closed)
 const real={...interrupted,runs:interrupted.runs.map(r=>({...r,provider:'abacus',externalAttempted:true}))}
 assert.equal(closeInterruptedSimulation(real),real)
})

test('private API: isolated auth double, PKCE binding, denied identities, two sessions, simulation, logout and CSRF',async()=>{
 let workspace=null,reads=0,writes=0,challenge
 const user={id:'fixture-ivan',email:'ivan@example.test',email_confirmed_at:'fixture',app_metadata:{provider:'google'},identities:[{provider:'google'}]}
 const fetcher=async(url,opts)=>{
   if(url.includes('grant_type=pkce')){const body=JSON.parse(opts.body);assert.equal(createHash('sha256').update(body.code_verifier).digest('base64url'),challenge);return Response.json({access_token:body.auth_code,refresh_token:'fixture-only',expires_in:3600})}
   if(url.endsWith('/user'))return Response.json(opts.headers.Authorization==='Bearer foreign'?{...user,email:'foreign@example.test'}:user)
   if(url.includes('/logout'))return new Response(null,{status:204})
   throw Error('Unexpected external call')
 }
 let api
 const server=http.createServer((req,res)=>api(req,res))
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 const origin='http://127.0.0.1:'+server.address().port
 const jsonb=value=>Array.isArray(value)?value.map(jsonb):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,jsonb(v)])):value
 const store={async load(){reads++;return jsonb(structuredClone(workspace))},async save(token,c){writes++;if(workspace&&workspace.revision!==c.revision)return {ok:false,type:'conflict',workspace};workspace={...structuredClone(c.candidate),revision:c.revision+1,writerId:c.writerId};return {ok:true,workspace}}}
 api=createProtectedApi({url:'https://fixture.supabase.co',publicKey:'fixture-public-only',allowedEmails:['ivan@example.test'],origin,store,fetcher})
 const call=(path,cookie,body,requestOrigin=origin)=>fetch(origin+'/api/'+path,{redirect:'manual',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:requestOrigin}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})})
 async function login(code){const start=await call('login');challenge=new URL(start.headers.get('location')).searchParams.get('code_challenge');const response=await call('auth/callback?code='+code,start.headers.get('set-cookie').split(';')[0]);return response}
 try{
   for(const [path,body] of [['workspace',null],['workspace',{}],['analysis',{}]])assert.equal((await call(path,null,body)).status,403)
   assert.equal(reads+writes,0)
   assert.equal((await login('foreign')).headers.get('location'),'/private?access=denied')
   const a=(await login('fixture-a')).headers.get('set-cookie').split(';')[0]
   const b=(await login('fixture-b')).headers.get('set-cookie').split(';')[0]
   assert.notEqual(a,b)
   const p=createLocalProject({name:'Ficticio',objective:'Pedido original',sources:'Nota ficticia'},{e1:true});p.sources[0].selected=true
   const w=applyCreationAttempt(createDefaultWorkspace(),p)
   assert.equal((await call('workspace',a,{candidate:w,revision:0,writerId:'a',operationId:crypto.randomUUID()})).status,200)
   const other=await (await call('workspace',b)).json();assert.equal(other.workspace.projects.at(-1).originalRequest,'Pedido original')
   const stale=await (await call('workspace',b,{candidate:w,revision:0,writerId:'b',operationId:crypto.randomUUID()})).json();assert.equal(stale.type,'conflict')
   const req=makeRequest(p,'simulation-e1','fixture-run','E1');const started=startAnalysis(p,req).project;workspace.projects[workspace.projects.length-1]=started
   const result=await(await call('analysis',a,req)).json();assert.equal(result.simulated,true);assert.equal(result.externalAttempted,false)
   const finished=finishAnalysis(started,req,result);const decided=decideProposal(finished,finished.proposals[0].id,{status:'accepted'},'accepted','pending')
   assert.equal(decided.decisions.length,1);assert.equal(decided.proposals[0].originalContent,finished.proposals[0].originalContent)
   assert.equal((await call('workspace',a,{},'https://foreign.test')).status,403)
   assert.equal((await call('logout',a,{})).status,200)
   assert.equal((await call('workspace',a)).status,403)
   assert.equal((await call('analysis',a,req)).status,403)
   assert.equal((await call('workspace',b)).status,200)
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r))}
})

test('remote recovery marks incomplete run interrupted, preserving request; no save or analysis on load',async()=>{
 let p=createLocalProject({name:'Ficticio',objective:'Pedido',sources:'Nota'},{e1:true});p.sources[0].selected=true
 const request=makeRequest(p,'simulation-e1','interrupted-fixture','E1');p=startAnalysis(p,request).project
 const w=applyCreationAttempt(createDefaultWorkspace(),p),calls=[]
 const env=await loadPrivateEnvironment(async name=>{calls.push(name);return name==='session'?{authorized:true}:{workspace:w}})
 const recovered=env.repository.load().workspace.projects.at(-1).runs[0]
 assert.equal(recovered.status,'interrupted');assert.deepEqual(recovered.request,request);assert.equal(w.projects.at(-1).runs[0].status,'analyzing');assert.deepEqual(calls,['session','workspace'])
})

test('remote client: uncertain confirmation preserves exact operation; explicit resolution only; no automatic generation',async()=>{
 const w=createDefaultWorkspace(),commands=[];let fail=true,analyses=0
 const api=async(path,command)=>{if(path==='analysis'){analyses++;throw Error('unexpected')};commands.push(structuredClone(command));if(fail){fail=false;throw Error('uncertain')};return {ok:true,workspace:{...w,revision:1,writerId:'writer'}}}
 const env=createPrivateEnvironment({workspace:w,status:'ready'},api)
 assert.equal(env.repository.load().workspace,w);assert.equal(analyses,0)
 assert.equal((await env.repository.save(w,0,'writer')).type,'uncertain')
 assert.equal(commands.length,1)
 assert.equal((await env.repository.save({...w},0,'writer')).type,'uncertain');assert.equal(commands.length,1)
 assert.equal((await env.repository.retry()).ok,true);assert.deepEqual(commands[0],commands[1]);assert.equal(analyses,0)
 env.deactivate();assert.equal((await env.repository.save(w,1,'writer')).type,'permission');assert.equal(commands.length,2)
})

test('remote client: unrelated valid acknowledgement never clears pending operation; exact retry confirms',async()=>{
 const w=createDefaultWorkspace(),commands=[];let correct=false
 const api=async(name,command)=>{commands.push(structuredClone(command));return {ok:true,workspace:{...w,revision:1,writerId:correct?'writer':'foreign-writer'}}}
 const env=createPrivateEnvironment({workspace:w,status:'ready'},api)
 assert.equal((await env.repository.save(w,0,'writer')).type,'uncertain')
 assert.equal((await env.repository.save({...w},0,'writer')).type,'uncertain');assert.equal(commands.length,1)
 correct=true;assert.equal((await env.repository.retry()).ok,true)
 assert.deepEqual(commands[0],commands[1])
})
