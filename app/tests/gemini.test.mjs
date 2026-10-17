import test from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import {EventEmitter} from 'node:events'
import {readFile} from 'node:fs/promises'
import {protectedAiConfig,publicAiPolicy} from '../server/protected/ai-config.mjs'
import {createConfiguredProvider,matchesServerSelection} from '../server/providers/registry.mjs'
import {createGeminiAdapter,GEMINI_MODEL,GEMINI_ENDPOINT,geminiBody} from '../server/providers/gemini.mjs'
import {createGeminiTransport} from '../server/providers/gemini-transport.mjs'
import {createAbacusAdapter} from '../server/providers/abacus.mjs'
import {describeProtectedAi,executeProtectedAnalysis} from '../server/protected/analysis.mjs'
import {createDurableStore} from '../server/protected/store.mjs'
import {createLocalProject,createDefaultWorkspace} from '../src/data/demoData.js'
import {makeRequest,startAnalysis,finishAnalysis} from '../src/ai/contracts.js'
import {isWorkspace,parseWorkspace,SCHEMA_VERSION} from '../src/storage.js'

const connect=net.Socket.prototype.connect,fetcher=globalThis.fetch
let network=0
net.Socket.prototype.connect=function(){network++;throw Error('External sockets forbidden')}
globalThis.fetch=()=>{network++;throw Error('External fetch forbidden')}
test.after(()=>{net.Socket.prototype.connect=connect;globalThis.fetch=fetcher;assert.equal(network,0)})
const env={TP_AI_MODE:'real',TP_AI_PROVIDER:'gemini',TP_AI_MODEL:GEMINI_MODEL,TP_GEMINI_API_KEY:'fixture-not-a-real-key',TP_GEMINI_DATA_POLICY:'fictional-only',TP_GEMINI_BILLING_POLICY:'free-no-billing',TP_AI_MAX_OUTPUT_TOKENS:'500',TP_AI_MAX_SOURCES:'2',TP_AI_MAX_INPUT_CHARS:'6000',TP_AI_MAX_SOURCE_CHARS:'1000',TP_AI_TIMEOUT_MS:'100',TP_AI_DAILY_LIMIT:'2',TP_AI_SESSION_LIMIT:'2'}
const ai=()=>protectedAiConfig(env)
function fixture(provider='gemini'){
 const project=createLocalProject({name:'Ficticio',objective:'Separar hecho e incertidumbre.',sources:'Hay tres reservas. Plazo desconocido.'},{e1:true})
 project.sources[0].selected=true
 project.sources.push({...project.sources[0],id:'not-selected',selected:false,content:'EXCLUDED SOURCE'})
 const request=makeRequest(project,provider==='gemini'?GEMINI_MODEL:'fixture-model','fixture-provider-'+provider,'E1',provider)
 const value={proposals:[{type:'Afirmación',title:'Reservas',content:'Hay tres reservas.',reasoning:'El plazo no está informado.',certainty:'evidence',references:[{sourceId:request.sources[0].id,quote:'Hay tres reservas.'}]}]}
 const body={modelVersion:GEMINI_MODEL,usageMetadata:{promptTokenCount:10,candidatesTokenCount:20,totalTokenCount:35,thoughtsTokenCount:5,secret:'discard'},candidates:[{finishReason:'STOP',content:{role:'model',parts:[{text:JSON.stringify(value)}]}}]}
 return {project,request,value,body}
}
function http(body,{status=200,raw,timeout=false,throws=false}={}){
 let calls=0,wire
 const requestImpl=(url,options,callback)=>{
  calls++;assert.equal(url,GEMINI_ENDPOINT);assert.equal(options.headers['x-goog-api-key'],env.TP_GEMINI_API_KEY)
  assert.equal(Object.hasOwn(options.headers,'Authorization'),false);assert.equal(new URL(url).search,'')
  if(throws)throw Error('fixture-private-message-must-not-leak')
  const req=new EventEmitter();req.destroy=()=>{req.destroyed=true};req.setTimeout=(ms,fn)=>{if(ms && timeout)queueMicrotask(fn);return req}
  req.end=payload=>{wire=JSON.parse(payload);if(timeout)return;queueMicrotask(()=>{
   const res=new EventEmitter();res.statusCode=status;res.destroy=()=>{res.destroyed=true};callback(res)
   if(!res.destroyed){res.emit('data',Buffer.from(raw??JSON.stringify(body)));if(!res.destroyed)res.emit('end')}
  })};return req
 }
 return {requestImpl,calls:()=>calls,wire:()=>wire}
}
function transportSetup(body,options={}){
 const fake=http(body,options),records=[];let reservations=0,used=false
 const admission={status:()=>({available:!used}),async reserve(sizes){assert.ok(Object.keys(sizes).every(k=>['inputChars','maxOutputTokens','bodyBytes'].includes(k)));used=true;reservations++;return {ok:true}},complete(ticket,result){records.push(result)},stop(){used=true}}
 const c=ai(),transport=createGeminiTransport({apiKey:c.key,model:c.model,maxOutputTokens:c.maxOutputTokens,timeoutMs:c.timeoutMs,maxSources:c.maxSources,maxSourceChars:c.maxSourceChars,maxInputChars:c.maxInputChars,admission,requestImpl:fake.requestImpl})
 return {...fake,transport,records,reservations:()=>reservations,admission}
}

test('server config separates mode/provider/model, keeps legacy Abacus and fails closed without complete Gemini policy',()=>{
 assert.deepEqual(protectedAiConfig({}),{mode:'disabled',provider:null,model:null})
 assert.equal(ai().provider,'gemini');assert.equal(ai().mode,'real')
 for(const key of Object.keys(env).filter(k=>k!=='TP_AI_MODE')){const missing={...env};delete missing[key];assert.throws(()=>protectedAiConfig(missing),key)}
 const defaultDisabled={...env};delete defaultDisabled.TP_AI_MODE;assert.equal(protectedAiConfig(defaultDisabled).mode,'disabled')
 for(const patch of [{TP_AI_MODEL:'gemini-2.5-flash'},{TP_AI_PROVIDER:'groq'},{TP_AI_PROVIDER:''},{TP_GEMINI_API_KEY:'bad key'},{TP_GEMINI_BILLING_POLICY:'paid'},{TP_GEMINI_DATA_POLICY:'real-clients'}])assert.throws(()=>protectedAiConfig({...env,...patch}))
 const legacy=protectedAiConfig({...env,TP_AI_MODE:'abacus',TP_AI_PROVIDER:'abacus',TP_ABACUS_API_KEY:'fixture-abacus-key',TP_AI_MODEL:'fixture-model'})
 assert.equal(legacy.mode,'real');assert.equal(legacy.provider,'abacus');assert.equal(publicAiPolicy(legacy).mode,'abacus')
 assert.equal(publicAiPolicy(ai()).mode,'real');assert.equal('key' in publicAiPolicy(ai()),false)
 assert.throws(()=>protectedAiConfig({...env,TP_AI_MODE:'abacus',TP_ABACUS_API_KEY:'fixture-key-not-real'}))
})

test('common registry selects server provider only; missing key stays offline; simulation remains explicit',async()=>{
 const {request,body}=fixture();const fake=transportSetup(body)
 const provider=createConfiguredProvider(ai(),{admission:fake.admission,transportFactory:()=>fake.transport})
 assert.equal((await provider.adapter.analyze(request)).ok,true);provider.close();assert.equal(fake.calls(),1)
 const noKey=createConfiguredProvider({...ai(),key:undefined},{admission:{status:()=>({available:true})}})
 assert.equal((await noKey.adapter.analyze(request)).externalAttempted,false);noKey.close()
 assert.throws(()=>createConfiguredProvider({mode:'real',provider:'groq'}))
 assert.throws(()=>createConfiguredProvider({mode:'disabled'}))
 const simulated=createConfiguredProvider({mode:'simulation',model:'simulation-e1'})
 const p=fixture().project,r=makeRequest(p,'simulation-e1','simulation-fixture','E1','simulation')
 const result=await simulated.adapter.analyze(r);assert.equal(result.simulated,true);assert.equal(result.externalAttempted,false)
 for(const patch of [{provider:'abacus'},{model:'other'},{url:'https://other.test'},{endpoint:GEMINI_ENDPOINT},{credential:'fake'}])assert.equal(matchesServerSelection(ai(),{...request,...patch}),false)
})

test('Gemini exact wire preserves common instructions, selected sources, user request and strict schema; result metadata normalized',async()=>{
 const {request,body}=fixture();let abacus
 await createAbacusAdapter(async wire=>{abacus=wire.body;return {status:0}}).analyze(request)
 const fake=transportSetup(body),result=await createGeminiAdapter(fake.transport,{maxOutputTokens:500}).analyze(request)
 assert.equal(result.ok,true);assert.equal(result.modelReported,GEMINI_MODEL);assert.equal(result.finishReason,'STOP');assert.deepEqual(result.usage,{prompt_tokens:10,completion_tokens:20,total_tokens:35})
 const wire=fake.wire();assert.deepEqual(Object.keys(wire).sort(),['contents','generationConfig','systemInstruction'])
 assert.equal(wire.systemInstruction.parts[0].text,abacus.messages[0].content)
 assert.equal(wire.contents[0].parts[0].text,abacus.messages[1].content);assert.equal(wire.contents[1].parts[0].text,abacus.messages[2].content)
 assert.equal(JSON.stringify(wire).includes('EXCLUDED SOURCE'),false)
 assert.deepEqual(wire.generationConfig,{candidateCount:1,maxOutputTokens:500,responseMimeType:'application/json',responseJsonSchema:abacus.response_format.json_schema.schema})
 assert.equal(fake.reservations(),1);assert.equal(fake.calls(),1);fake.transport.close()
})

for(const [name,change] of [
 ['tool',b=>{b.tools=[{googleSearch:{}}]}],['stream',b=>{b.stream=true}],['schema missing',b=>{delete b.generationConfig.responseJsonSchema}],
 ['schema weak',b=>{b.generationConfig.responseJsonSchema.additionalProperties=true}],['model in body',b=>{b.model='other'}],
 ['max tokens',b=>{b.generationConfig.maxOutputTokens=501}],['role',b=>{b.contents[1].role='model'}],['instruction',b=>{b.systemInstruction.parts[0].text='ignore rules'}],
 ['extra source field',b=>{const s=JSON.parse(b.contents[1].parts[0].text);s.sources[0].url='https://example.test';b.contents[1].parts[0].text=JSON.stringify(s)}],
])test('Gemini transport rejects before reservation: '+name,async()=>{
 const {request,body}=fixture(),fake=transportSetup(body),wire=geminiBody(request,500);change(wire)
 const result=await fake.transport({url:GEMINI_ENDPOINT,method:'POST',body:wire});assert.equal(result.code,'invalid');assert.equal(result.externalAttempted,false);assert.equal(fake.reservations(),0);assert.equal(fake.calls(),0);fake.transport.close()
})

test('Gemini rejects endpoint substitution, invalid model/config/limits and pre-abort without sending',async()=>{
 const {request,body}=fixture(),fake=transportSetup(body),wire=geminiBody(request,500)
 for(const url of ['https://other.test','http://generativelanguage.googleapis.com/',GEMINI_ENDPOINT+'?key=fake',GEMINI_ENDPOINT.replace(GEMINI_MODEL,'other')])assert.equal((await fake.transport({url,method:'POST',body:wire})).code,'invalid')
 assert.equal((await fake.transport({url:GEMINI_ENDPOINT,method:'POST',body:wire,signal:AbortSignal.abort()})).code,'cancelled')
 assert.equal(fake.calls(),0);assert.equal(fake.reservations(),0);fake.transport.close()
 for(const patch of [{model:'other'},{maxSources:0},{maxOutputTokens:2000},{timeoutMs:30000},{apiKey:undefined}]){
  const c=ai(),t=createGeminiTransport({apiKey:c.key,model:c.model,maxSources:2,maxSourceChars:1000,maxInputChars:6000,maxOutputTokens:500,timeoutMs:100,...patch,admission:fake.admission,requestImpl:fake.requestImpl})
  assert.equal((await t({url:GEMINI_ENDPOINT,method:'POST',body:wire})).externalAttempted,false);t.close()
 }
})

for(const [name,change,stage] of [
 ['missing candidates',b=>{delete b.candidates},'provider_format'],['multiple candidates',b=>{b.candidates.push(b.candidates[0])},'provider_format'],
 ['missing finish',b=>{delete b.candidates[0].finishReason},'provider_format'],['non text',b=>{b.candidates[0].content.parts=[{functionCall:{name:'bad'}}]},'content_extraction'],
 ['invalid JSON',b=>{b.candidates[0].content.parts[0].text='not JSON'},'json_parse'],
 ['extra field',b=>{const v=JSON.parse(b.candidates[0].content.parts[0].text);v.extra=true;b.candidates[0].content.parts[0].text=JSON.stringify(v)},'structure'],
 ['invalid type',b=>{const v=JSON.parse(b.candidates[0].content.parts[0].text);v.proposals[0].type='string';b.candidates[0].content.parts[0].text=JSON.stringify(v)},'structure'],
 ['foreign reference',b=>{const v=JSON.parse(b.candidates[0].content.parts[0].text);v.proposals[0].references[0].sourceId='foreign';b.candidates[0].content.parts[0].text=JSON.stringify(v)},'references'],
 ['invented quote',b=>{const v=JSON.parse(b.candidates[0].content.parts[0].text);v.proposals[0].references[0].quote='not present';b.candidates[0].content.parts[0].text=JSON.stringify(v)},'references'],
 ['reported model mismatch',b=>{b.modelVersion='different-model'},'control'],['truncation',b=>{b.candidates[0].finishReason='MAX_TOKENS'},'control'],
])test('Gemini rejects without losing available usage/model metadata: '+name,async()=>{
 const {request,body}=fixture();change(body);let calls=0
 const result=await createGeminiAdapter(async()=>{calls++;return {status:200,externalAttempted:true,body}}).analyze(request)
 assert.equal(result.ok,false);assert.equal(result.diagnostic.stage,stage);assert.equal(result.usage.total_tokens,35);assert.equal(result.modelReported,body.modelVersion);assert.equal(calls,1)
})

for(const [name,options,code] of [['permission',{status:403},'permission'],['rate/quota ambiguous',{status:429},'rate_limit'],['server',{status:503},'error'],['redirect',{status:302},'error'],['timeout',{timeout:true},'error'],['transport',{throws:true},'error'],['invalid envelope JSON',{raw:'not-json'},'invalid'],['array envelope',{raw:'[]'},'invalid'],['oversized',{raw:'x'.repeat(262145)},'invalid']])test('Gemini one bounded failed send, no retry/fallback: '+name,async()=>{
 const {request,body}=fixture(),fake=transportSetup(body,options),adapter=createGeminiAdapter(fake.transport,{maxOutputTokens:500})
 const result=await adapter.analyze(request);assert.equal(result.ok,false);assert.equal(result.code,code);assert.equal(result.externalAttempted,true);assert.equal(fake.calls(),1);assert.equal(fake.reservations(),1)
 assert.equal((await adapter.analyze(request)).externalAttempted,false);assert.equal(fake.calls(),1);assert.equal(JSON.stringify(result).includes('fixture-private-message'),false);fake.transport.close()
})

test('Gemini requires versioned durable capability and does not reuse the prepared Abacus RPC',async()=>{
 const c=ai(),{request}=fixture();let calls=0
 const store={aiAnalysis:async()=>({version:1,status:'ready'})}
 assert.equal((await describeProtectedAi(c,store,'fixture','fixture')).available,false)
 store.aiAnalysis=async()=>({version:1,status:'claimed'})
 const result=await executeProtectedAnalysis({ai:c,store,request,reauthenticate:async()=>{},transportFactory(){calls++;throw Error('no')}})
 assert.equal(result.code,'uncertain');assert.equal(calls,0)
 const paths=[];const durable=createDurableStore({url:'https://fixture.test',publicKey:'fixture',storeKey:'fixture-cap'},async(url)=>{paths.push(url);return Response.json({version:2,status:'ready'})})
 await durable.aiAnalysis('fixture','fixture',{},'status','',null,publicAiPolicy(c))
 await durable.aiAnalysis('fixture','fixture',{},'status','',null,{provider:'abacus',mode:'abacus'})
 assert.deepEqual(paths,['https://fixture.test/rest/v1/rpc/tp_protected_gemini_analysis','https://fixture.test/rest/v1/rpc/tp_protected_ai_analysis'])
 const source=await readFile(new URL('../server/protected/analysis.mjs',import.meta.url),'utf8');assert.doesNotMatch(source,/import.*abacus/)
 const sql=await readFile(new URL('../remote/migrations/2026-10-17-provider-boundary.sql',import.meta.url),'utf8')
 assert.match(sql,/PREPARED ONLY/);assert.match(sql,/require_session/);assert.match(sql,/pg_advisory_xact_lock\(627418203\)/);assert.match(sql,/a.provider<>'gemini'/);assert.doesNotMatch(sql,/delete from|drop table|update.*set provider/i)
})

test('v0.3 accepts explicit Gemini provenance and preserves legacy Abacus snapshots byte-for-byte',()=>{
 const f=fixture('abacus');delete f.request.provider
 const p=startAnalysis(f.project,f.request).project
 const historical=finishAnalysis(p,f.request,{ok:true,value:f.value,modelReported:'fixture-model',externalAttempted:true})
 const w=createDefaultWorkspace();w.projects.push(historical);const raw=JSON.stringify(w)
 assert.equal(SCHEMA_VERSION,3);assert.equal(isWorkspace(w),true);assert.equal(JSON.stringify(parseWorkspace(raw).workspace),raw)
 const g=fixture(),started=startAnalysis(g.project,g.request).project,finished=finishAnalysis(started,g.request,{ok:true,value:g.value,modelReported:GEMINI_MODEL,externalAttempted:true})
 const before=JSON.stringify(w.projects);w.projects.push(finished);assert.equal(isWorkspace(w),true);assert.equal(JSON.stringify(w.projects.slice(0,-1)),before)
 assert.equal(parseWorkspace(JSON.stringify(w)).workspace.projects.at(-1).runs[0].provider,'gemini')
})

test('lost acknowledgement retains observed metadata, never confuses entering adapter with external traffic',async()=>{
 const {request,body}=fixture()
 for(const sent of [false,true]){
  let calls=0,claimed=false
  const store={async aiAnalysis(t,s,r,action){if(action==='claim'){if(claimed)return {version:2,status:'busy'};claimed=true;return {version:2,status:'claimed'}};throw Error('lost finish')}}
  const transportFactory=()=>{const transport=async()=>{calls++;return sent?{status:200,externalAttempted:true,body}:{status:0,code:'disconnected',externalAttempted:false}};transport.close=()=>{};return transport}
  const options={ai:ai(),store,request,reauthenticate:async()=>{if(!sent)throw Error('revoked')},transportFactory}
  const result=await executeProtectedAnalysis(options)
  assert.equal(result.code,'uncertain');assert.equal(result.externalAttempted,sent)
  if(sent){assert.equal(result.modelReported,GEMINI_MODEL);assert.equal(result.httpStatus,200);assert.equal(result.finishReason,'STOP');assert.equal(result.usage.total_tokens,35)}
  assert.equal(Object.hasOwn(result,'value'),false)
  await executeProtectedAnalysis(options);assert.equal(calls,1)
 }
})

test('stored runs cannot turn the reserved simulation model into Abacus or mismatch requested model',async()=>{
 const project=fixture().project
 const r=makeRequest(project,'simulation-e1','legacy-sim','E1')
 const {createSimulatedProvider}=await import('../src/e1/test-adapters.js')
 const p=finishAnalysis(startAnalysis(project,r).project,r,await createSimulatedProvider().analyze(r))
 const w=createDefaultWorkspace();w.projects.push(p)
 assert.equal(isWorkspace(w),true)
 p.runs[0].provider='abacus';p.proposals.forEach(proposal=>{proposal.origin='model'})
 assert.equal(isWorkspace(w),false)
 const f=fixture('abacus'),started=startAnalysis(f.project,f.request).project
 const valid=finishAnalysis(started,f.request,{ok:true,value:f.value,modelReported:'fixture-model',externalAttempted:true})
 w.projects[w.projects.length-1]=valid;assert.equal(isWorkspace(w),true)
 valid.runs[0].modelRequested='different-requested-model';assert.equal(isWorkspace(w),false)
})
