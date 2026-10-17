import test from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import {createAbacusAdapter} from '../server/providers/abacus.mjs'
import {createAbacusTransport} from '../server/providers/abacus-transport.mjs'
import {proposalResponseFormat,matchesProposalSchema} from '../server/providers/structured-output.mjs'
import {createLocalProject} from '../src/data/demoData.js'
import {makeRequest,PROPOSAL_TYPES} from '../src/ai/contracts.js'

const connect=net.Socket.prototype.connect,fetcher=globalThis.fetch
let network=0
net.Socket.prototype.connect=function(){network++;throw Error('Network forbidden')}
globalThis.fetch=()=>{network++;throw Error('Network forbidden')}
test.after(()=>{net.Socket.prototype.connect=connect;globalThis.fetch=fetcher;assert.equal(network,0)})
function fixture(){
 const project=createLocalProject({name:'Ficticio',objective:'Separar lo conocido de lo incierto.',sources:'Hay tres reservas.'},{e1:true});project.sources[0].selected=true
 const request=makeRequest(project,'gpt-6-astra','fixture-schema','E1')
 const value={proposals:[{type:'Afirmación',title:'Reservas',content:'Hay tres reservas.',reasoning:'La fuente lo declara.',certainty:'evidence',references:[{sourceId:project.sources[0].id,quote:'Hay tres reservas.'}]}]}
 return {request,value}
}
function envelope(request,value){return {status:200,externalAttempted:true,body:{model:request.model,usage:{prompt_tokens:10,completion_tokens:15,total_tokens:25},choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]}}}

test('structured wire derives the existing types, required fields and selected source IDs',async()=>{
 const {request,value}=fixture();let wire
 const result=await createAbacusAdapter(async r=>{wire=r.body;return envelope(request,value)}).analyze(request)
 assert.equal(result.ok,true);assert.equal(wire.response_format.type,'json_schema');assert.equal(wire.response_format.json_schema.strict,true)
 const schema=wire.response_format.json_schema.schema,item=schema.properties.proposals.items
 assert.equal(schema.additionalProperties,false);assert.equal(item.additionalProperties,false)
 assert.deepEqual(item.properties.type.enum,Object.values(PROPOSAL_TYPES));assert.deepEqual(item.properties.certainty.enum,Object.keys(PROPOSAL_TYPES))
 assert.deepEqual(item.properties.references.items.properties.sourceId.enum,request.sources.map(s=>s.id))
 assert.deepEqual(Object.keys(wire).sort(),['max_tokens','messages','model','response_format','stream'])
 assert.equal(wire.messages.length,3)
})

for(const [name,change] of [
 ['missing field',v=>{delete v.proposals[0].reasoning}],
 ['semantic mismatch',v=>{v.proposals[0].type='Hipótesis'}],
 ['invented quote',v=>{v.proposals[0].references[0].quote='Inventado'}],
 ['foreign source',v=>{v.proposals[0].references[0].sourceId='foreign'}],
 ['additional root property',v=>{v.extra='not allowed'}],
 ['additional proposal property',v=>{v.proposals[0].extra='not allowed'}],
 ['additional reference property',v=>{v.proposals[0].references[0].extra='not allowed'}],
])test('strict output does not replace local rejection: '+name,async()=>{
 const {request,value}=fixture();change(value)
 const result=await createAbacusAdapter(async()=>envelope(request,value)).analyze(request)
 assert.equal(result.ok,false);assert.equal(result.code,'invalid');assert.equal(result.modelReported,request.model);assert.equal(result.usage.total_tokens,25)
})

test('shape validator also rejects non-objects, absent proposals and invalid reference types',()=>{
 for(const value of [null,[],{}, {proposals:null},{proposals:[{type:'Afirmación'}]}])assert.equal(matchesProposalSchema(value,['source']),false)
 assert.equal(matchesProposalSchema({proposals:[]},['source']),true)
})

test('transport schema allowlist rejects downgrade, drift and undocumented parameters before reservation',async()=>{
 const {request,value}=fixture();let body,reservations=0,attempts=0
 await createAbacusAdapter(async r=>{body=r.body;return envelope(request,value)}).analyze(request)
 const transport=createAbacusTransport({apiKey:'fixture-never-a-real-key',model:request.model,maxOutputTokens:1800,
  admission:{status:()=>({available:true}),async reserve(){reservations++;throw Error('must stay offline')}},
  requestImpl(){attempts++;throw Error('must stay offline')}})
 const changes=[b=>{delete b.response_format},b=>{b.response_format.type='json_object'},b=>{b.response_format.json_schema.strict=false},b=>{b.response_format.json_schema.schema.additionalProperties=true},b=>{b.response_format.json_schema.schema.properties.proposals.items.properties.references.items.properties.sourceId.enum=['foreign']},b=>{b.reasoning_effort='high'}]
 for(const change of changes){const candidate=structuredClone(body);change(candidate);const result=await transport({url:'https://routellm.abacus.ai/v1/chat/completions',method:'POST',body:candidate});assert.equal(result.code,'invalid');assert.equal(result.externalAttempted,false)}
 assert.equal(reservations,0);assert.equal(attempts,0)
})

test('provider schema incompatibility is one failure, never a JSON-only fallback or repair',async()=>{
 const {request}=fixture();let calls=0
 const result=await createAbacusAdapter(async()=>{calls++;return {status:400,externalAttempted:true}}).analyze(request)
 assert.equal(result.ok,false);assert.equal(calls,1)
 assert.equal(proposalResponseFormat(['a']).json_schema.strict,true)
})
