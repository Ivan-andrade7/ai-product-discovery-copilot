import {isAnalysisRequest,LIMITS,validateResult} from '../../src/ai/contracts.js'
import {invalidResult,safeDiagnostic,safeFinishReason} from '../../src/ai/diagnostics.js'
import {proposalResponseFormat,matchesProposalSchema} from './structured-output.mjs'
import {analysisMessages} from './messages.mjs'

// Official REST generateContent contract; documentary compatibility, NOT account access.
export const GEMINI_MODEL='gemini-3.8-flash'
export const GEMINI_ENDPOINT=`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
export function geminiBody(request,maxOutputTokens) {
  const messages=analysisMessages(request)
  return {systemInstruction:{parts:[{text:messages[0].content}]},
    contents:messages.slice(1).map(m=>({role:'user',parts:[{text:m.content}]})),
    generationConfig:{candidateCount:1,maxOutputTokens,responseMimeType:'application/json',responseJsonSchema:proposalResponseFormat(request.sources.map(s=>s.id)).json_schema.schema}}
}
export function createGeminiAdapter(transport,{maxOutputTokens=1800}={}) {
  return {async analyze(request,{signal}={}) {
    let meta={externalAttempted:false,modelReported:null,usage:null,httpStatus:null,finishReason:null}
    const reject=(stage,reason)=>({...invalidResult(stage,reason),...meta})
    if(typeof transport!=='function')return {ok:false,code:'disconnected',...meta}
    if(!isAnalysisRequest(request) || request.provider!=='gemini' || request.model!==GEMINI_MODEL)return reject('control','invalid_request')
    if(signal?.aborted)return {ok:false,code:'cancelled',...meta}
    try {
      const response=await transport({url:GEMINI_ENDPOINT,method:'POST',body:geminiBody(request,maxOutputTokens),signal})
      if(!response || typeof response!=='object' || Array.isArray(response))return reject('provider_format','invalid_envelope')
      const b=response.body,usage={}
      for(const [source,target] of [['promptTokenCount','prompt_tokens'],['candidatesTokenCount','completion_tokens'],['totalTokenCount','total_tokens']])if(Number.isSafeInteger(b?.usageMetadata?.[source]) && b.usageMetadata[source]>=0)usage[target]=b.usageMetadata[source]
      meta={externalAttempted:response.externalAttempted===true,modelReported:typeof b?.modelVersion==='string' && /^[\w./:-]{1,120}$/.test(b.modelVersion)?b.modelVersion:null,usage:Object.keys(usage).length?usage:null,httpStatus:Number.isInteger(response.status)?response.status:null,finishReason:safeFinishReason(b?.candidates?.[0]?.finishReason)}
      if(signal?.aborted)return {ok:false,code:'cancelled',...meta}
      if(response.status===0)return {ok:false,code:['invalid','incomplete','cancelled','budget_blocked','busy','disconnected'].includes(response.code)?response.code:'error',...meta,diagnostic:safeDiagnostic(response.diagnostic)}
      if([401,403].includes(response.status))return {ok:false,code:'permission',...meta}
      // 429 does not distinguish rate from exhausted free quota. Never infer balance.
      if(response.status===429)return {ok:false,code:'rate_limit',...meta}
      if(response.status!==200)return {ok:false,code:'error',...meta}
      if(response.code)return {ok:false,code:['invalid','incomplete'].includes(response.code)?response.code:'error',...meta,diagnostic:safeDiagnostic(response.diagnostic)}
      if(!b || typeof b!=='object' || Array.isArray(b))return reject('provider_format','invalid_envelope')
      if(!Array.isArray(b.candidates) || b.candidates.length!==1)return reject('provider_format','missing_choices')
      const c=b.candidates[0]
      if(!c || typeof c!=='object' || Array.isArray(c))return reject('provider_format','invalid_choice')
      if(typeof c.finishReason!=='string')return reject('provider_format','missing_finish_reason')
      if(c.finishReason!=='STOP')return {ok:false,code:'incomplete',diagnostic:{stage:'control',reason:'incomplete_response'},...meta}
      // Preserve the provider's exact modelVersion. No alias guessing/normalization.
      if(meta.modelReported!==request.model)return reject('control','model_mismatch')
      const parts=c.content?.parts
      if(!Array.isArray(parts) || parts.length!==1 || typeof parts[0]?.text!=='string' || parts[0].thought===true || Object.keys(parts[0]).some(k=>k!=='text'))return reject('content_extraction','non_text_content')
      const content=parts[0].text
      if(content.length>LIMITS.outputChars)return reject('content_extraction','content_too_large')
      let value
      try {value=JSON.parse(content)}catch{return reject('json_parse','invalid_json')}
      const valid=validateResult(value,request)
      if(!valid.ok)return {...valid,...meta}
      if(!matchesProposalSchema(value,request.sources.map(s=>s.id)))return reject('structure','invalid_fields')
      return {ok:true,value,...meta}
    } catch {return {ok:false,code:signal?.aborted?'cancelled':'error',diagnostic:{stage:'transport',reason:'exception'},...meta}}
  }}
}
