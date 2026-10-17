import {createDefaultWorkspace} from '../data/demoData.js'
import {isWorkspace} from '../storage.js'
import {sameContext} from '../ai/contracts.js'
let csrf

export async function callPrivate(path, body, signal) {
  const response=await fetch('/api/'+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',
    ...(body?{headers:{'Content-Type':'application/json',...(csrf?{'X-TP-CSRF':csrf}:{})},body:JSON.stringify(body)}:{}),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(path==='analysis'?45000:15000)]):AbortSignal.timeout(path==='analysis'?45000:15000)})
  if(response.status===401||response.status===403)throw Error('permission')
  if(path==='analysis'&&!response.ok){let result;try{result=await response.json()}catch{throw Error('uncertain')};return {...Object.fromEntries(['externalAttempted','modelReported','httpStatus','usage','finishReason','diagnostic'].filter(k=>result?.[k]!==undefined).map(k=>[k,result[k]])),ok:false,code:['invalid','stale','busy','quota','rate_limit','uncertain'].includes(result?.code)?result.code:'uncertain'}}
  if(!response.ok)throw Error('uncertain')
  const result=await response.json()
  if(path==='session')csrf=result.csrf
  if(path==='logout')csrf=undefined
  return result
}
function connectionFrom(session) {
  const ai=session?.ai
  if(ai && (['disabled','simulation','abacus'].includes(ai.mode) || (ai.mode==='real' && ['abacus','gemini'].includes(ai.provider))))return {...ai,available:ai.available===true && typeof ai.model==='string' && ai.mode!=='disabled',simulated:ai.mode==='simulation'}
  // Explicit compatibility with the earlier simulation-only private API, never implicit fallback.
  return session?.simulatedProvider===true ? {available:true,model:'simulation-e1',mode:'simulation',simulated:true,code:'ready'} : {available:false,model:null,mode:'disabled',simulated:false,code:'disconnected'}
}
export function createPrivateEnvironment(initialLoad, api=callPrivate, session) {
  let active=true, pending=null
  let connection=connectionFrom(session)
  const repository={remote:true,keyFor:key=>'unused-remote:'+key,
    load:()=>initialLoad,
    async save(candidate,revision,writerId){
      if(!active)return {ok:false,type:'permission'}
      pending ??= {candidate,revision,writerId,operationId:crypto.randomUUID()}
      // An uncertain command is resolved explicitly, before any new intention.
      if(candidate!==pending.candidate)return {ok:false,type:'uncertain'}
      try{
        const result=await api('workspace',pending)
        if(result.type==='conflict')result.message='Hay cambios de otra sesión. Esta copia quedó bloqueada para evitar sobrescrituras.'
        if(!active)return {ok:false,type:'permission'}
        if(result.ok && !isWorkspace(result.workspace))return {ok:false,type:'validation-error'}
        if(result.ok && !sameContext(JSON.stringify(result.workspace),JSON.stringify({...pending.candidate,revision:pending.revision+1,writerId:pending.writerId})))return {ok:false,type:'uncertain',message:'La confirmación no contiene el mismo guardado esperado. El intento y los borradores siguen pendientes.'}
        if(result.ok||result.type==='conflict')pending=null
        return result
      }catch(error){return {ok:false,type:error.message==='permission'?'permission':'uncertain'}}
    },
    async retry(){if(!pending)return {ok:false,type:'validation-error'};return this.save(pending.candidate,pending.revision,pending.writerId)},
  }
  return {remote:true,get simulated(){return connection.simulated},get connection(){return connection},repository,auth:{authorized:()=>active},deactivate(){active=false},
    checkConnection:async()=>{connection=connectionFrom(await api('session'));return connection},
    async analyze(request,signal){try{return await api('analysis',request,signal)}catch(error){return {ok:false,code:error.message==='permission'?'permission':'uncertain',externalAttempted:false}}},
  }
}
export async function loadPrivateEnvironment(api=callPrivate){
  const session=await api('session')
  const {workspace}=await api('workspace')
  if(workspace!==null&&!isWorkspace(workspace))throw Error('incompatible')
  const recovered=workspace && {...workspace,projects:workspace.projects.map(p=>({...p,runs:p.runs.map(r=>r.status==='analyzing'?{...r,status:'interrupted'}:r)}))}
  return createPrivateEnvironment({workspace:recovered??createDefaultWorkspace(),status:workspace?'ready':'new'},api,session)
}
