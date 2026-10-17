import https from 'node:https'
import {isDeepStrictEqual} from 'node:util'
import {GEMINI_ENDPOINT,GEMINI_MODEL,geminiBody} from './gemini.mjs'

// No env lookup, redirects, retries, logging, model router or historic ledger access.
export function createGeminiTransport({apiKey,admission,model,maxOutputTokens,timeoutMs,maxSources,maxSourceChars,maxInputChars,requestImpl=https.request}={}) {
  let credential=typeof apiKey==='string' && /^[\x21-\x7e]{16,512}$/.test(apiKey)?apiKey:null
  const configured=model===GEMINI_MODEL && [[maxOutputTokens,1800],[timeoutMs,25000],[maxSources,10],[maxSourceChars,6000],[maxInputChars,12000]].every(([v,max])=>Number.isInteger(v)&&v>=1&&v<=max)
  const transport=async({url,method,body,signal})=>{
    const blocked=code=>({status:0,code,externalAttempted:false})
    if(!configured)return blocked('invalid')
    if(!credential || !admission || !admission.status().available)return blocked('disconnected')
    if(signal?.aborted)return blocked('cancelled')
    if(url!==GEMINI_ENDPOINT || method!=='POST')return blocked('invalid')
    let context,sources
    try {
      if(body?.contents?.length!==2)return blocked('invalid')
      context=JSON.parse(body.contents[0].parts[0].text)
      sources=JSON.parse(body.contents[1].parts[0].text)
      if(!context || Object.keys(context).some(k=>!['request','humanContext'].includes(k)) || typeof context.request!=='string' || !context.request.trim())return blocked('invalid')
      if(!sources || Object.keys(sources).length!==1 || !Array.isArray(sources.sources) || sources.sources.length<1 || sources.sources.length>maxSources)return blocked('invalid')
      if(sources.sources.some(s=>!s || Object.keys(s).length!==3 || ['id','name','content'].some(k=>typeof s[k]!=='string' || !s[k].trim())))return blocked('invalid')
      if(new Set(sources.sources.map(s=>s.id)).size!==sources.sources.length)return blocked('invalid')
      const canonical=geminiBody({userRequest:context.request,sources:sources.sources,...(Object.hasOwn(context,'humanContext')?{stage:'E1',humanContext:context.humanContext}:{})},maxOutputTokens)
      if(!isDeepStrictEqual(body,canonical))return blocked('invalid')
    }catch{return blocked('invalid')}
    const sourceChars=sources.sources.reduce((n,s)=>n+s.content.length,0)
    const inputChars=sourceChars+context.request.length+(context.humanContext?JSON.stringify(context.humanContext).length:0)
    const payload=JSON.stringify(body),bytes=Buffer.byteLength(payload)
    if(sourceChars>maxSourceChars || inputChars>maxInputChars || bytes>40000)return blocked('invalid')
    const ticket=await admission.reserve({inputChars,maxOutputTokens,bodyBytes:bytes})
    if(!ticket.ok)return blocked(ticket.code)
    if(!credential || signal?.aborted){admission.complete(ticket,{status:0,code:'cancelled',externalAttempted:false});return blocked('cancelled')}
    const result=await new Promise(resolve=>{
      let settled=false,req,deadline
      const done=value=>{if(settled)return;settled=true;clearTimeout(deadline);signal?.removeEventListener('abort',abort);req?.setTimeout(0);resolve({...value,externalAttempted:true})}
      const abort=()=>{done({status:0,code:'cancelled'});req?.destroy()}
      const timeout=()=>{done({status:0,code:'error',diagnostic:{stage:'transport',reason:'timeout'}});req?.destroy()}
      try {
        req=requestImpl(GEMINI_ENDPOINT,{method:'POST',agent:false,headers:{'x-goog-api-key':credential,'Content-Type':'application/json','Content-Length':bytes}},res=>{
          if(res.statusCode>=300&&res.statusCode<400){done({status:res.statusCode,code:'error',diagnostic:{stage:'transport',reason:'redirect'}});res.destroy();return}
          let size=0;const chunks=[]
          res.on('data',chunk=>{size+=chunk.length;if(size>262144){done({status:res.statusCode,code:'invalid',diagnostic:{stage:'transport',reason:'response_too_large'}});res.destroy();return}chunks.push(chunk)})
          res.on('aborted',()=>done({status:0,code:'incomplete'}))
          res.on('error',()=>done({status:0,code:'error'}))
          res.on('end',()=>{
            let value
            try{value=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{done({status:res.statusCode,code:'invalid',diagnostic:{stage:'provider_format',reason:'invalid_json'}});return}
            if(!value || typeof value!=='object' || Array.isArray(value)){done({status:res.statusCode,code:'invalid',diagnostic:{stage:'provider_format',reason:'invalid_envelope'}});return}
            // Error messages, response IDs and unrelated fields never cross this boundary.
            done({status:res.statusCode,body:{modelVersion:value.modelVersion,usageMetadata:value.usageMetadata,candidates:value.candidates}})
          })
        })
        req.on('error',()=>done({status:0,code:signal?.aborted?'cancelled':'error'}))
        req.setTimeout(timeoutMs,timeout);deadline=setTimeout(timeout,timeoutMs)
        signal?.addEventListener('abort',abort,{once:true})
        if(signal?.aborted){abort();return}
        req.end(payload)
      }catch{done({status:0,code:'error',diagnostic:{stage:'transport',reason:'exception'}});req?.destroy()}
    })
    admission.complete(ticket,result)
    return result
  }
  transport.close=()=>{credential=null;admission?.stop?.()}
  return transport
}
