import {isWorkspace} from '../../src/storage.js'
export function createDurableStore({url,publicKey,storeKey}, fetcher=fetch) {
  async function rpc(name, body, token) {
    const response=await fetcher(url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:publicKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)})
    if(!response.ok)throw Error([401,403].includes(response.status)?'permission':'uncertain')
    return response.json()
  }
  return {
    session:(action,id,record={},lease='')=>rpc('tp_session_store',{p_key:storeKey,p_action:action,p_id:id,p_record:record,p_lease:lease}),
    async load(token,sid){const result=await rpc('tp_protected_read',{p_sid:sid},token);if(result!==null&&!isWorkspace(result))throw Error('incompatible');return result},
    async save(token,sid,c){
      if(!isWorkspace(c?.candidate)||!Number.isInteger(c.revision)||c.revision<0||typeof c.writerId!=='string'||!/^[\da-f-]{36}$/i.test(c.operationId??''))return {ok:false,type:'validation-error'}
      return rpc('tp_protected_save',{p_sid:sid,p_candidate:c.candidate,p_revision:c.revision,p_writer:c.writerId,p_operation:c.operationId},token)
    },
    analysis:(token,sid,request,action,lease='',result=null)=>rpc('tp_protected_analysis',{p_sid:sid,p_request:request,p_action:action,p_lease:lease,p_result:result},token),
    aiAnalysis:(token,sid,request,action,lease='',result=null,policy={})=>rpc(policy.provider==='gemini'?'tp_protected_gemini_analysis':'tp_protected_ai_analysis',{p_key:storeKey,p_sid:sid,p_request:request,p_action:action,p_lease:lease,p_result:result,p_policy:policy},token),
  }
}
