import test from 'node:test'
import assert from 'node:assert/strict'
import {randomBytes} from 'node:crypto'
import https from 'node:https'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createServerlessApi} from '../server/protected/api.mjs'
import {protectedConfig} from '../server/protected/config.mjs'
import {protectedEntry} from '../server/protected/entry.mjs'
import {createDurableStore} from '../server/protected/store.mjs'
import {digest,challenge,seal,unseal} from '../server/protected/crypto.mjs'
import {createSimulatedProvider} from '../src/e1/test-adapters.js'
import {createDefaultWorkspace,createLocalProject} from '../src/data/demoData.js'
import {applyCreationAttempt} from '../src/workflow.js'
import {makeRequest,startAnalysis,finishAnalysis,decideProposal} from '../src/ai/contracts.js'
import {createPrivateEnvironment,loadPrivateEnvironment} from '../src/remote/client.js'

// Isolated durable-store double, deliberately shared across disposable API instances.
// It is not evidence that the prepared PostgreSQL functions have been applied.
function fixture({userTransform=user=>user,identityIndex=0}={}){
 let clock=Date.now(),workspace=null,calls=0,refreshes=0,holdRefresh
 const rows=new Map(),attempts=new Map(),commands=new Map(),challenges=new Set()
 const config={ai:{mode:'simulation',model:'simulation-e1'},origin:'https://private.example.test',url:'https://fixture.supabase.co',publicKey:'fixture-only',encryptionKey:randomBytes(32).toString('hex'),
  identities:[{email:'ivanandradecarp@gmail.com',userId:'11111111-1111-4111-8111-111111111111',googleSubject:'111111111111111111111'},
  {email:'ivanandradeuxui@gmail.com',userId:'22222222-2222-4222-8222-222222222222',googleSubject:'222222222222222222222'}]}
 const identity=config.identities[identityIndex],authId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
 const jwt=kind=>'fixture.'+Buffer.from(JSON.stringify({session_id:authId,kind})).toString('base64url')+'.fixture'
 const token=jwt('allowed')
 function live(id){const r=rows.get(id);if(!r||r.revoked||r.expiresAt<=clock||(r.kind==='session'&&r.idleUntil<=clock))return null;return r}
 const store={
  async session(action,id,data={},lease=''){
   if(action==='create'){assert.equal(rows.has(id),false);rows.set(id,structuredClone(data));return data}
   const r=live(id)
   if(action==='revoke'){const any=rows.get(id);if(any)any.revoked=true;return {}}
   if(!r)return null
   if(r.refreshing&&r.refreshUntil<clock){r.revoked=true;return null}
   if(action==='take'){r.revoked=true;return structuredClone(r)}
   if(action==='get'){if(r.kind==='session')r.idleUntil=Math.min(r.expiresAt,clock+1800000);return structuredClone(r)}
   if(action==='lease'){if(r.refreshing||data.sealed!==r.sealed)return null;r.refreshing=true;r.lease=lease;r.refreshUntil=clock+30000;return structuredClone(r)}
   if(action==='renew'){if(r.lease!==lease||!r.refreshing)return null;Object.assign(r,data,{refreshing:false});return structuredClone(r)}
   throw Error('unexpected-session-action')
  },
  async load(t,id){assert.ok(live(id));assert.equal(t,token);return structuredClone(workspace)},
  async save(t,id,c){
   assert.ok(live(id));assert.equal(t,token)
   if(commands.has(c.operationId)){assert.deepEqual(commands.get(c.operationId).command,c);return structuredClone(commands.get(c.operationId).result)}
   if(workspace&&workspace.revision!==c.revision)return {ok:false,type:'conflict',workspace:structuredClone(workspace)}
   workspace={...structuredClone(c.candidate),revision:c.revision+1,writerId:c.writerId}
   const result={ok:true,workspace:structuredClone(workspace)};commands.set(c.operationId,{command:structuredClone(c),result});return result
  },
  async analysis(t,id,request,action,lease,result){
   assert.ok(live(id));const a=attempts.get(request.requestId)
   if(a){assert.deepEqual(a.request,request);if(a.status==='complete')return {status:'complete',result:a.result};if(a.until<clock){a.status='interrupted';return {status:'interrupted'}}
    if(action==='finish'&&a.lease===lease){Object.assign(a,{status:'complete',result});return {status:'complete',result}}
    return {status:'uncertain'}
   }
   assert.equal(action,'claim');attempts.set(request.requestId,{request:structuredClone(request),lease,status:'processing',until:clock+30000});return {status:'claimed'}
  },
 }
 const fetcher=async(url,options)=>{
  if(url.includes('grant_type=pkce')){const body=JSON.parse(options.body);assert.ok(challenges.has(challenge(body.code_verifier)));return Response.json({access_token:body.auth_code==='wrong-sub'?jwt('foreign'):token,refresh_token:'fixture-refresh-only',expires_in:3600})}
  if(url.includes('grant_type=refresh_token')){refreshes++;if(holdRefresh)await holdRefresh;return Response.json({access_token:token,refresh_token:'fixture-rotated-only',expires_in:3600})}
  if(url.endsWith('/user')){
   const externalId=options.headers.Authorization==='Bearer '+token?identity.googleSubject:'999999999999999999999'
   // Supabase Auth wire contract: id is the external subject; identity_id is a UUID.
   return Response.json(userTransform({id:identity.userId,email:identity.email,email_confirmed_at:'fixture',app_metadata:{provider:'google'},identities:[{identity_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',id:externalId,user_id:identity.userId,provider:'google',identity_data:{sub:externalId,email:identity.email,email_verified:true}}]}))
  }
  if(url.includes('/logout'))return new Response(null,{status:204})
  throw Error('external-network-not-permitted')
 }
 const provider={async analyze(r){calls++;return createSimulatedProvider().analyze(r)}}
 async function call(path,{cookie,body,method=body?'POST':'GET',headers={}}={}){
  const response={headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v},writeHead(s,h={}){this.status=s;Object.entries(h).forEach(([k,v])=>this.setHeader(k,v))},end(value=''){this.text=value;try{this.value=JSON.parse(value)}catch{}}}
  const req={method,url:'/api/'+path,body,headers:{host:new URL(config.origin).host,'x-forwarded-proto':'https',...(cookie?{cookie}:{}),...(body?{origin:config.origin,'content-type':'application/json'}:{}),...headers}}
  // New instance for every request: no shared handler/Map is available to production code.
  await createServerlessApi(config,store,{fetcher,now:()=>clock,provider})(req,response,path.split('?')[0]);return response
 }
 async function login(code='allowed'){
  const start=await call('login'),dest=new URL(start.headers.location);challenges.add(dest.searchParams.get('code_challenge'))
  const loginCookie=start.headers['set-cookie'][0].split(';')[0],callback=await call('auth/callback?code='+code,{cookie:loginCookie})
  return {start,callback,loginCookie,cookie:callback.headers['set-cookie']?.find(c=>c.startsWith('__Host-tp_session=')&&!c.includes('Max-Age=0'))?.split(';')[0]}
 }
 return {config,store,call,login,rows,attempts,token,handler:(req,res,p)=>createServerlessApi(config,store,{fetcher,now:()=>clock,provider})(req,res,p),now:()=>clock,advance:n=>{clock+=n},setWorkspace:w=>{workspace=w},workspace:()=>workspace,
  counters:()=>({calls,refreshes}),hold:p=>{holdRefresh=p},sessionRow:cookie=>rows.get(digest(cookie.split('=')[1]))}
}

test('official Auth identity JSON requires the exact pinned Google subject and Supabase user',async t=>{
 for(const identityIndex of [0,1])await t.test('pinned identity '+identityIndex,async()=>{
  const f=fixture({identityIndex}),a=await f.login();assert.ok(a.cookie)
  assert.equal((await f.call('session',{cookie:a.cookie})).status,200)
 })
 const invalid=[
  ['foreign Supabase user',u=>({...u,id:'99999999-9999-4999-8999-999999999999'})],
  ['foreign external subject',u=>({...u,identities:[{...u.identities[0],id:'999999999999999999999'}]})],
  ['wrong user provider',u=>({...u,app_metadata:{provider:'github'}})],
  ['wrong identity provider',u=>({...u,identities:[{...u.identities[0],provider:'github'}]})],
  ['missing user id',u=>({...u,id:undefined})],
  ['missing external id',u=>({...u,identities:[{...u.identities[0],id:undefined}]})],
  ['numeric external id',u=>({...u,identities:[{...u.identities[0],id:111111111111111111111}]})],
  ['empty external id',u=>({...u,identities:[{...u.identities[0],id:''}]})],
  ['null external id',u=>({...u,identities:[{...u.identities[0],id:null}]})],
  ['SQL field is not a JSON fallback',u=>({...u,identities:[{...u.identities[0],id:undefined,provider_id:u.identities[0].id}]})],
  ['internal identity UUID is not the subject',u=>({...u,identities:[{...u.identities[0],id:u.identities[0].identity_id}]})],
  ['missing identities',u=>({...u,identities:undefined})],
  ['invalid identities',u=>({...u,identities:{}})],
  ['missing confirmation',u=>({...u,email_confirmed_at:null})],
 ]
 for(const [name,userTransform] of invalid)await t.test(name,async()=>{
  const f=fixture({userTransform}),a=await f.login()
  assert.equal(a.callback.headers.location,'/private?access=denied');assert.equal(a.cookie,undefined)
  assert.equal((await f.call('workspace')).status,403)
  assert.equal([...f.rows.values()].filter(r=>r.kind==='session').length,0)
 })
})

test('HTTPS session contract: durable PKCE, opaque secure cookies, pinned identity, replay and CSRF',async()=>{
 const f=fixture();assert.equal((await f.call('workspace')).status,403)
 assert.equal((await f.call('workspace',{cookie:'__Host-tp_session='+'a'.repeat(43)})).status,403)
 const rejected=await f.login('wrong-sub');assert.equal(rejected.callback.headers.location,'/private?access=denied');assert.equal(rejected.cookie,undefined)
 const a=await f.login(),b=await f.login();assert.notEqual(a.cookie,b.cookie)
 for(const c of [...a.start.headers['set-cookie'],...a.callback.headers['set-cookie']]){assert.match(c,/Secure; HttpOnly; SameSite=Lax; Path=\//);assert.ok(!c.includes(f.token))}
 assert.equal((await f.call('auth/callback?code=allowed',{cookie:a.loginCookie})).headers.location,'/private?access=denied')
 assert.ok(!JSON.stringify([...f.rows.values()]).includes(f.token))
 const session=await f.call('session',{cookie:a.cookie});assert.equal(session.status,200);const csrf=session.value.csrf
 assert.equal((await f.call('workspace',{cookie:a.cookie,body:{},headers:{origin:'https://evil.example'}})).status,403)
 assert.equal((await f.call('workspace',{cookie:a.cookie,body:{},headers:{'x-tp-csrf':'wrong'}})).status,403)
 assert.equal((await f.call('session',{cookie:a.cookie,headers:{host:'evil.example','x-forwarded-host':new URL(f.config.origin).host}})).status,403)
 assert.equal((await f.call('session',{cookie:a.cookie,headers:{'x-forwarded-proto':'http'}})).status,403)
 assert.equal((await f.call('logout',{cookie:a.cookie,body:{},headers:{'x-tp-csrf':csrf}})).status,200)
 assert.equal((await f.call('workspace',{cookie:a.cookie})).status,403)
 assert.equal((await f.call('analysis',{cookie:a.cookie,body:{},headers:{'x-tp-csrf':csrf}})).status,403)
 assert.equal((await f.call('session',{cookie:b.cookie})).status,200)
 f.advance(1800001);assert.equal((await f.call('session',{cookie:b.cookie})).status,403)
})

test('durable E1 across independent invocations: CAS, exact save replay, analysis claim and recovery',async()=>{
 const f=fixture(),a=await f.login(),b=await f.login()
 const csrf=(await f.call('session',{cookie:a.cookie})).value.csrf,other=(await f.call('session',{cookie:b.cookie})).value.csrf
 const post=(path,body,cookie=a.cookie,key=csrf)=>f.call(path,{cookie,body,headers:{'x-tp-csrf':key}})
 let p=createLocalProject({name:'Serverless ficticio',objective:'Pedido',sources:'Fuente ficticia'},{e1:true});p.sources[0].selected=true
 let w=applyCreationAttempt(createDefaultWorkspace(),p)
 const command={candidate:w,revision:0,writerId:'first',operationId:crypto.randomUUID()}
 const [first,repeat]=await Promise.all([post('workspace',command),post('workspace',command)]);assert.deepEqual(first.value,repeat.value)
 assert.equal(f.workspace().projects.filter(x=>x.id===p.id).length,1)
 const stale=await post('workspace',{...command,operationId:crypto.randomUUID()},b.cookie,other);assert.equal(stale.value.type,'conflict')
 w=first.value.workspace;p=w.projects.at(-1)
 const request=makeRequest(p,'simulation-e1',crypto.randomUUID(),'E1');w.projects[w.projects.length-1]=startAnalysis(p,request).project;f.setWorkspace(w)
 const foreign=makeRequest({...p,id:'not-in-space'},'simulation-e1',crypto.randomUUID(),'E1');assert.equal((await post('analysis',foreign)).status,409)
 const [r1,r2]=await Promise.all([post('analysis',request),post('analysis',request)])
 assert.equal(r1.status,200);assert.ok([200,409].includes(r2.status));assert.equal(f.counters().calls,1)
 assert.equal((await post('analysis',request)).value.simulated,true);assert.equal(f.counters().calls,1)
 const finished=finishAnalysis(w.projects.at(-1),request,r1.value),decided=decideProposal(finished,finished.proposals[0].id,{status:'accepted'},'accepted','pending')
 w.projects[w.projects.length-1]=decided;f.setWorkspace(w)
 const loaded=await f.call('workspace',{cookie:b.cookie});assert.equal(loaded.value.workspace.projects.at(-1).decisions.length,1)
 const calls=[];await loadPrivateEnvironment(async name=>{calls.push(name);return name==='session'?{authorized:true}:loaded.value})
 assert.deepEqual(calls,['session','workspace']);assert.equal(f.counters().calls,1)
 // An instance lost after claim cannot be retried as a new execution.
 const next=makeRequest(decided,'simulation-e1',crypto.randomUUID(),'E1');w.projects[w.projects.length-1]=startAnalysis(decided,next).project;f.setWorkspace(w)
 // Register the interrupted attempt through the same authenticated store path.
 await f.store.analysis(f.token,digest(a.cookie.split('=')[1]),next,'claim','fixture-lease')
 f.advance(31000);assert.equal((await post('analysis',next)).status,409);assert.equal(f.attempts.get(next.requestId).status,'interrupted');assert.equal(f.counters().calls,1)
 const interrupted=await f.call('workspace',{cookie:b.cookie});const env=await loadPrivateEnvironment(async n=>n==='session'?{}:interrupted.value)
 assert.equal(env.repository.load().workspace.projects.at(-1).runs.at(-1).status,'interrupted');assert.equal(f.counters().calls,1)
})

test('renewal uses one durable lease; logout wins against in-flight refresh; absolute expiry',async()=>{
 const f=fixture(),a=await f.login(),row=f.sessionRow(a.cookie),csrf=row.csrf
 row.tokenExpires=f.now()+1000
 let release;f.hold(new Promise(r=>{release=r}))
 const first=f.call('session',{cookie:a.cookie})
 while(!row.refreshing)await new Promise(r=>setImmediate(r))
 assert.equal((await f.call('session',{cookie:a.cookie})).status,503)
 assert.equal((await f.call('logout',{cookie:a.cookie,body:{},headers:{'x-tp-csrf':csrf}})).status,200)
 release();assert.equal((await first).status,403);assert.equal(f.counters().refreshes,1)
 const b=await f.login();f.hold(null);const second=f.sessionRow(b.cookie);second.tokenExpires=f.now()+1000
 assert.equal((await f.call('session',{cookie:b.cookie})).status,200);assert.equal(f.counters().refreshes,2)
 assert.equal((await f.call('session',{cookie:b.cookie})).status,200);assert.equal(f.counters().refreshes,2)
 second.expiresAt=f.now()-1;assert.equal((await f.call('session',{cookie:b.cookie})).status,403)
 const c=await f.login();const abandoned=f.sessionRow(c.cookie);abandoned.refreshing=true;abandoned.refreshUntil=f.now()-1
 assert.equal((await f.call('session',{cookie:c.cookie})).status,403)
})

test('protected config fails closed in demo/production and on unpinned identity; crypto binds rows',async()=>{
 const f=fixture(),env={TP_DEPLOYMENT_TARGET:'protected-test',VERCEL_ENV:'preview',TP_ORIGIN:f.config.origin,TP_SUPABASE_URL:'https://lkzgydnglkrcmztviqsf.supabase.co',TP_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',TP_ALLOWED_IDENTITIES:JSON.stringify(f.config.identities),TP_SESSION_STORE_KEY:randomBytes(32).toString('hex'),TP_SESSION_ENCRYPTION_KEY:f.config.encryptionKey}
 assert.equal(protectedConfig(env).origin,f.config.origin)
 assert.throws(()=>protectedConfig({...env,VERCEL_ENV:'production'}));assert.throws(()=>protectedConfig({...env,TP_ORIGIN:'http://private.example.test'}))
 assert.throws(()=>protectedConfig({...env,TP_ALLOWED_IDENTITIES:JSON.stringify(f.config.identities.map(i=>({email:i.email})))}))
 let status;await protectedEntry({}, {writeHead(s){status=s},end(){}},'session',{...env,VERCEL_ENV:'production'});assert.equal(status,404)
 const encrypted=seal({fixture:'value'},f.config.encryptionKey,'row-a');assert.deepEqual(unseal(encrypted,f.config.encryptionKey,'row-a'),{fixture:'value'})
 assert.throws(()=>unseal(encrypted,f.config.encryptionKey,'row-b'))
 let count=0;const repo=createPrivateEnvironment({workspace:createDefaultWorkspace()},async()=>{count++;throw Error('uncertain')})
 assert.equal(count,0);repo.deactivate();assert.equal((await repo.repository.save({},0,'x')).type,'permission');assert.equal(count,0)
})

test('actual loopback TLS with a trusted fixture CA: secure cookies and denied anonymous API',{timeout:15000},async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tp-https-fixture-')),key=path.join(dir,'key.pem'),cert=path.join(dir,'cert.pem')
 let server
 try{
  await promisify(execFile)('C:/Program Files/Git/usr/bin/openssl.exe',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','1','-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1'],{windowsHide:true})
  const ca=await fs.readFile(cert),f=fixture()
  server=https.createServer({key:await fs.readFile(key),cert:ca},(req,res)=>{req.headers['x-forwarded-proto']=req.socket.encrypted?'https':'http';f.handler(req,res,req.url.slice(5))})
  await new Promise(r=>server.listen(0,'127.0.0.1',r));f.config.origin='https://127.0.0.1:'+server.address().port
  const get=p=>new Promise((resolve,reject)=>{const req=https.get(f.config.origin+'/api/'+p,{ca,agent:false},res=>{const authorized=res.socket.authorized;let text='';res.on('data',c=>{text+=c});res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text,authorized}))});req.setTimeout(5000,()=>req.destroy(Error('fixture-timeout')));req.on('error',reject)})
  const login=await get('login');assert.equal(login.status,303);assert.equal(login.authorized,true)
  assert.match(login.headers['set-cookie'][0],/^__Host-tp_login=.*; Secure; HttpOnly; SameSite=Lax; Path=\//)
  const denied=await get('workspace');assert.equal(denied.status,403);assert.equal(denied.text,'{"code":"permission"}')
 }finally{
  if(server){server.closeAllConnections();await new Promise(r=>server.close(r))}
  for(const file of [key,cert])await fs.unlink(file).catch(e=>{if(e.code!=='ENOENT')throw e})
  await fs.rmdir(dir)
 }
})

test('HTTP store separates its scoped session capability from user-JWT data operations',async()=>{
 const calls=[],config={url:'https://fixture.supabase.co',publicKey:'fixture-publishable',storeKey:'fixture-session-only'}
 const store=createDurableStore(config,async(url,options)=>{calls.push({name:url.split('/').at(-1),headers:options.headers,body:JSON.parse(options.body)});return Response.json(null)})
 await store.session('get','fixture-hash')
 assert.equal(calls[0].headers.Authorization,undefined);assert.equal(calls[0].body.p_key,config.storeKey)
 await store.load('fixture-user-token','fixture-hash')
 assert.equal(calls[1].headers.Authorization,'Bearer fixture-user-token');assert.equal(calls[1].body.p_key,undefined)
 await store.analysis('fixture-user-token','fixture-hash',{},'claim')
 assert.equal(calls[2].headers.Authorization,'Bearer fixture-user-token');assert.equal(calls[2].body.p_key,undefined)
 const n=calls.length;assert.equal((await store.save('fixture-user-token','fixture-hash',{})).type,'validation-error');assert.equal(calls.length,n)
 const offline=createDurableStore(config,async()=>new Response(null,{status:503}));await assert.rejects(()=>offline.load('fixture','fixture'),/uncertain/)
})
