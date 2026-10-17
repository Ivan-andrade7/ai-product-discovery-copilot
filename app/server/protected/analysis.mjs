import {createConfiguredProvider,matchesServerSelection,providerOf,realMode} from '../providers/registry.mjs'
import {isAnalysisRequest, validateResult} from '../../src/ai/contracts.js'
import {safeDiagnostic,safeFinishReason} from '../../src/ai/diagnostics.js'
import {publicAiPolicy} from './ai-config.mjs'
import {opaque} from './crypto.mjs'

export async function describeProtectedAi(ai, store, token, sid) {
  if (ai.mode === 'disabled') return {available:false,code:'disconnected',mode:'disabled',model:null}
  if (ai.mode === 'simulation') return {available:true,code:'ready',mode:'simulation',model:'simulation-e1',simulated:true}
  try {
    const status = await store.aiAnalysis(token,sid,{},'status','',null,publicAiPolicy(ai))
    if (status?.version !== (providerOf(ai)==='gemini'?2:1) || status.status !== 'ready') return {available:false,code:status?.status === 'limit' ? 'budget_blocked' : status?.status === 'busy' ? 'busy' : 'uncertain',mode:'real',provider:providerOf(ai),model:ai.model}
    return {available:true,code:'ready',mode:'real',provider:providerOf(ai),model:ai.model,simulated:false,timeoutMs:ai.timeoutMs}
  } catch { return {available:false,code:'uncertain',mode:'real',provider:providerOf(ai),model:ai.model} }
}

// Only validated output and whitelisted metadata can reach the durable result row.
function sanitized(result, request) {
  const meta = {externalAttempted:result?.externalAttempted === true, modelReported:typeof result?.modelReported === 'string' && /^[\w./:-]{1,120}$/.test(result.modelReported) ? result.modelReported : null,
    finishReason:safeFinishReason(result?.finishReason), usage:null}
  const usage={}
  for (const key of ['prompt_tokens','completion_tokens','total_tokens']) if (Number.isSafeInteger(result?.usage?.[key]) && result.usage[key]>=0) usage[key]=result.usage[key]
  if (Object.keys(usage).length) meta.usage=usage
  if (Number.isInteger(result?.httpStatus) && result.httpStatus>=0 && result.httpStatus<=599) meta.httpStatus=result.httpStatus
  const diagnostic=safeDiagnostic(result?.diagnostic)
  if (diagnostic) meta.diagnostic=diagnostic
  if (result?.ok && meta.modelReported !== request.model) return {ok:false,code:'invalid',...meta,diagnostic:{stage:'control',reason:'model_mismatch'}}
  if (result?.ok) {
    const valid=validateResult(result.value,request)
    if (!valid.ok) return {...valid,...meta}
    const proposals=result.value.proposals.map(p=>({...Object.fromEntries(['type','title','content','reasoning','certainty','references'].map(k=>[k,k==='references'?p.references.map(r=>({sourceId:r.sourceId,quote:r.quote})):p[k]])),...(['objective','constraints'].includes(p.e1Field)?{e1Field:p.e1Field}:{})}))
    return {ok:true,value:{proposals},...meta,...(result.simulated === true ? {simulated:true} : {})}
  }
  const codes=['permission','quota','rate_limit','invalid','incomplete','cancelled','uncertain','busy','budget_blocked','error','disconnected']
  return {ok:false,code:codes.includes(result?.code)?result.code:'uncertain',...meta}
}

export async function executeProtectedAnalysis({ai,store,token,sid,request,reauthenticate,provider,transportFactory}) {
  if (ai.mode === 'disabled') return {ok:false,code:'disconnected',externalAttempted:false}
  if (!isAnalysisRequest(request) || request.stage !== 'E1' || !matchesServerSelection(ai,request)) return {ok:false,code:'invalid',externalAttempted:false}
  const real=realMode(ai)
  const sourceChars=request.sources.reduce((n,s)=>n+s.content.length,0)
  if (real && (request.sources.length>ai.maxSources || sourceChars>ai.maxSourceChars || sourceChars+request.userRequest.length+JSON.stringify(request.humanContext).length>ai.maxInputChars)) return {ok:false,code:'invalid',externalAttempted:false}
  const lease=opaque()
  const operation=(action,result=null)=>real ? store.aiAnalysis(token,sid,request,action,lease,result,publicAiPolicy(ai)) : store.analysis(token,sid,request,action,lease,result)
  const claim=await operation('claim')
  if (real && claim?.version!==(providerOf(ai)==='gemini'?2:1)) return {ok:false,code:'uncertain',externalAttempted:false}
  if (claim?.status==='complete') return sanitized(claim.result,request)
  if (claim?.status!=='claimed' || (real && claim.version!==(providerOf(ai)==='gemini'?2:1))) return {ok:false,code:claim?.status==='limit'?'budget_blocked':claim?.status==='busy'?'busy':'uncertain',externalAttempted:false}
  let transport,observed={externalAttempted:false}
  try {
    // Reservation is already durable. This one-use ticket never touches the historic ledger.
    let used=false
    const admission={status:()=>({available:!used}),async reserve(){if(used)return {ok:false,code:'busy'};used=true;return {ok:true}},complete(){},stop(){used=true}}
    transport=createConfiguredProvider(ai,{admission,transportFactory,simulationProvider:provider})
    const adapter=transport.adapter
    let result=sanitized(await adapter.analyze(request),request)
    observed=Object.fromEntries(['externalAttempted','modelReported','usage','httpStatus','finishReason','diagnostic'].filter(key=>result[key]!==undefined).map(key=>[key,result[key]]))
    if (real && result.externalAttempted && (result.code==='error' || result.code==='cancelled')) result={...result,code:'uncertain'}
    await reauthenticate()
    const completed=await operation('finish',result)
    if (completed?.status!=='complete') return {ok:false,code:'uncertain',...observed}
    return sanitized(completed.result,request)
  } catch {
    // No automatic retry/finalization after an ambiguous send or lost acknowledgement.
    return {ok:false,code:'uncertain',...observed}
  } finally {transport?.close?.()}
}
