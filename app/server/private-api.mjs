import {randomBytes, createHash} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
import {isAnalysisRequest,contextVersion,sameContext} from '../src/ai/contracts.js'
import {createSimulatedProvider} from '../src/e1/test-adapters.js'

const opaque = () => randomBytes(32).toString('base64url')
const cookie = req => /(?:^|; )tp_session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1]
export function createProtectedApi({url, publicKey, allowedEmails, origin, store, fetcher=fetch}) {
  if (!url?.startsWith('https://') || !publicKey || !allowedEmails?.length || !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) throw Error('invalid-private-test-config')
  const sessions=new Map(), logins=new Map(), analyses=new Map(), provider=createSimulatedProvider()
  const allowed=new Set(allowedEmails.map(e=>e.toLowerCase()))
  const headers=(token)=>({apikey:publicKey,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})})
  const setCookie=(res,id)=>res.setHeader('Set-Cookie',`tp_session=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`)
  const clearCookie=res=>res.setHeader('Set-Cookie','tp_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
  async function authCall(path, token, body) {
    const r=await fetcher(url+'/auth/v1/'+path,{method:body?'POST':'GET',headers:headers(token),...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)})
    if(!r.ok)throw Error(r.status===401||r.status===403?'permission':'disconnected')
    return r.status===204?null:r.json()
  }
  const valid=u=>u?.email_confirmed_at && allowed.has(u.email?.toLowerCase()) && u.app_metadata?.provider==='google' && u.identities?.some(i=>i.provider==='google')
  async function authenticate(req) {
    const id=cookie(req),s=sessions.get(id)
    if(!s || s.until<Date.now()){sessions.delete(id);throw Error('permission')}
    if(s.expires<Date.now()+30000){
      // Refresh is authentication only. It never resubmits a data/analysis operation.
      s.refreshing ??= authCall('token?grant_type=refresh_token',null,{refresh_token:s.refresh}).then(t=>{s.token=t.access_token;s.refresh=t.refresh_token;s.expires=Date.now()+t.expires_in*1000}).finally(()=>{s.refreshing=null})
      await s.refreshing
    }
    const user=await authCall('user',s.token)
    if(!valid(user)||sessions.get(id)!==s){sessions.delete(id);throw Error('permission')}
    return {...s,user}
  }
  async function readBody(req) {
    if(req.headers['content-type']!=='application/json')throw Error('invalid')
    let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>2000000)throw Error('invalid')}
    return JSON.parse(body)
  }
  return async (req,res) => {
    if(!req.url?.startsWith('/api/'))return false
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer')
    const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value))}
    const redirect=path=>{res.writeHead(303,{Location:path});res.end()}
    const target=new URL(req.url,origin)
    if(req.headers.host!==new URL(origin).host || (req.method!=='GET' && req.headers.origin!==origin)){send(403,{code:'permission'});return true}
    try{
      if(req.method==='GET'&&target.pathname==='/api/login'){
        const id=opaque(),verifier=opaque()+opaque();logins.set(id,{verifier,until:Date.now()+600000});setCookie(res,id)
        for(const [k,v] of logins)if(v.until<Date.now())logins.delete(k)
        const dest=new URL(url+'/auth/v1/authorize');dest.search=new URLSearchParams({provider:'google',redirect_to:origin+'/api/auth/callback',code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'s256',scopes:'openid email profile',prompt:'select_account'}).toString();redirect(dest.href);return true
      }
      if(req.method==='GET'&&target.pathname==='/api/auth/callback'){
        const id=cookie(req),attempt=logins.get(id);logins.delete(id)
        if(!attempt||attempt.until<Date.now()||!target.searchParams.get('code')){clearCookie(res);redirect('/private?access=denied');return true}
        const token=await authCall('token?grant_type=pkce',null,{auth_code:target.searchParams.get('code'),code_verifier:attempt.verifier})
        const user=await authCall('user',token.access_token)
        if(!valid(user)){clearCookie(res);redirect('/private?access=denied');return true}
        const sid=opaque();sessions.set(sid,{token:token.access_token,refresh:token.refresh_token,expires:Date.now()+token.expires_in*1000,until:Date.now()+28800000});setCookie(res,sid);redirect('/private');return true
      }
      if(req.method==='POST'&&target.pathname==='/api/logout'){
        const id=cookie(req),s=sessions.get(id);sessions.delete(id);clearCookie(res)
        if(s){try{await fetcher(url+'/auth/v1/logout?scope=local',{method:'POST',headers:headers(s.token),signal:AbortSignal.timeout(5000)})}catch{/* Local revocation is effective even offline. */}}
        send(200,{ok:true});return true
      }
      const session=await authenticate(req)
      if(req.method==='GET'&&target.pathname==='/api/session'){send(200,{authorized:true,email:session.user.email,simulatedProvider:true});return true}
      if(req.method==='GET'&&target.pathname==='/api/workspace'){send(200,{workspace:await store.load(session.token)});return true}
      if(req.method==='POST'&&target.pathname==='/api/workspace'){send(200,await store.save(session.token,await readBody(req)));return true}
      if(req.method==='POST'&&target.pathname==='/api/analysis'){
        const request=await readBody(req)
        if(!isAnalysisRequest(request)||request.stage!=='E1'||request.model!=='simulation-e1'){send(400,{code:'invalid'});return true}
        const workspace=await store.load(session.token),project=workspace?.projects.find(p=>p.id===request.projectId)
        const run=project?.runs.find(r=>r.id===request.requestId)
        if(!run || run.status!=='analyzing' || !isDeepStrictEqual(run.request,request) || !sameContext(contextVersion(project,'E1'),request.contextVersion)){send(409,{code:'stale'});return true}
        const key=session.user.id+':'+request.requestId
        if(!analyses.has(key))analyses.set(key,provider.analyze(request))
        const result=await analyses.get(key)
        // Revalidate the live session after work, including logout during execution.
        await authenticate(req);send(200,result);return true
      }
      send(404,{code:'not-found'})
    }catch(error){
      // Never log provider bodies, auth codes, tokens, or user content.
      if(target.pathname==='/api/auth/callback'){clearCookie(res);redirect('/private?access=denied')}
      else send(error.message==='permission'?403:503,{code:error.message==='permission'?'permission':'uncertain'})
    }
    return true
  }
}
