import {opaque,digest,challenge,seal,unseal} from './crypto.mjs'
import {isDeepStrictEqual} from 'node:util'
import {isAnalysisRequest,contextVersion,sameContext} from '../../src/ai/contracts.js'
import {describeProtectedAi,executeProtectedAnalysis} from './analysis.mjs'
import {matchesServerSelection} from '../providers/registry.mjs'

const SESSION='__Host-tp_session', LOGIN='__Host-tp_login'
const cookie=(req,name)=>new RegExp('(?:^|; )'+name+'=([A-Za-z0-9_-]{43})(?:;|$)').exec(req.headers.cookie??'')?.[1]
export function createServerlessApi(config,store,{fetcher=fetch,now=Date.now,provider,transportFactory}={}) {
  const {origin,url,publicKey,encryptionKey,identities}=config
  const ai=config.ai ?? {mode:'disabled',model:null}
  const pack=(value,id)=>seal(value,encryptionKey,id),unpack=(value,id)=>unseal(value,encryptionKey,id)
  async function auth(path,token,body){
    const response=await fetcher(url+'/auth/v1/'+path,{method:body?'POST':'GET',headers:{apikey:publicKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(10000)})
    if(!response.ok)throw Error([400,401,403].includes(response.status)?'permission':'uncertain')
    return response.status===204?null:response.json()
  }
  // Auth JSON serializes the external provider_id as identity.id, not identity_id.
  function permitted(user){return user?.email_confirmed_at && user.app_metadata?.provider==='google' && identities.some(i=>i.email===user.email && i.userId===user.id && user.identities?.some(g=>g.provider==='google'&&g.id===i.googleSubject))}
  function authSession(token){const claims=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());if(!/^[\da-f-]{36}$/i.test(claims.session_id??''))throw Error('permission');return claims.session_id}
  async function authenticate(req){
    const raw=cookie(req,SESSION);if(!raw)throw Error('permission')
    const id=digest(raw);let record=await store.session('get',id)
    if(!record||record.kind!=='session'||record.expiresAt<=now()||record.idleUntil<=now())throw Error('permission')
    if(record.refreshing)throw Error('uncertain')
    let credentials=unpack(record.sealed,id)
    if(record.tokenExpires<=now()+60000){
      const lease=opaque(),locked=await store.session('lease',id,{sealed:record.sealed},lease)
      if(!locked)throw Error('uncertain')
      try{
        const next=await auth('token?grant_type=refresh_token',null,{refresh_token:credentials.refresh})
        const user=await auth('user',next.access_token)
        if(!permitted(user)||user.id!==record.actor||authSession(next.access_token)!==record.authSessionId)throw Error('permission')
        credentials={token:next.access_token,refresh:next.refresh_token}
        record=await store.session('renew',id,{sealed:pack(credentials,id),tokenExpires:now()+next.expires_in*1000},lease)
        if(!record)throw Error('permission')
      }catch{await store.session('revoke',id);throw Error('permission')}
    }
    // getUser verifies the token remotely. Decoded JWT claims alone never authorize.
    const user=await auth('user',credentials.token)
    if(!permitted(user)||record.actor!==user.id||record.authSessionId!==authSession(credentials.token))throw Error('permission')
    if(!await store.session('get',id))throw Error('permission')
    return {id,record,credentials,user}
  }
  async function body(req){
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']??''))throw Error('invalid')
    // Vercel may parse the body; local Node requests remain streams.
    if(req.body!==undefined){const value=typeof req.body==='string'?JSON.parse(req.body):req.body;if(Buffer.byteLength(JSON.stringify(value))>2000000)throw Error('invalid');return value}
    let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>2000000)throw Error('invalid')}return JSON.parse(raw)
  }
  return async(req,res,path)=>{
    res.setHeader('Cache-Control','no-store, private');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff')
    const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(value))}
    const cookies=[];const set=(name,value,age)=>{cookies.push(`${name}=${value}; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}`);res.setHeader('Set-Cookie',cookies)}
    const redirect=to=>{res.writeHead(303,{Location:to});res.end()}
    // Fixed configured origin. Never infer trusted host/protocol from forwarding headers.
    if(req.headers.host!==new URL(origin).host||req.headers['x-forwarded-proto']!=='https'){send(403,{code:'permission'});return}
    if(!['GET','POST'].includes(req.method)){send(405,{code:'method'});return}
    if(req.method==='POST'&&(req.headers.origin!==origin||req.headers['sec-fetch-site']==='cross-site')){send(403,{code:'permission'});return}
    try{
      if(path==='login'&&req.method==='GET'){
        if(req.headers['sec-fetch-site']==='cross-site'){send(403,{code:'permission'});return}
        const raw=opaque(),id=digest(raw),verifier=opaque()+opaque()
        await store.session('create',id,{kind:'login',sealed:pack({verifier},id),expiresAt:now()+600000})
        set(LOGIN,raw,600)
        const dest=new URL(url+'/auth/v1/authorize');dest.search=new URLSearchParams({provider:'google',redirect_to:origin+'/api/auth/callback',code_challenge:challenge(verifier),code_challenge_method:'s256',scopes:'openid email profile',prompt:'select_account'}).toString();redirect(dest.href);return
      }
      if(path==='auth/callback'&&req.method==='GET'){
        const raw=cookie(req,LOGIN),code=new URL(req.url,origin).searchParams.get('code');set(LOGIN,'',0)
        const attempt=raw&&await store.session('take',digest(raw))
        if(!attempt||attempt.kind!=='login'||!code)throw Error('permission')
        const {verifier}=unpack(attempt.sealed,digest(raw)),token=await auth('token?grant_type=pkce',null,{auth_code:code,code_verifier:verifier})
        const user=await auth('user',token.access_token)
        if(!permitted(user))throw Error('permission')
        const previous=cookie(req,SESSION)
        if(previous)await store.session('revoke',digest(previous))
        const sid=opaque(),id=digest(sid)
        await store.session('create',id,{kind:'session',actor:user.id,authSessionId:authSession(token.access_token),csrf:opaque(),sealed:pack({token:token.access_token,refresh:token.refresh_token},id),expiresAt:now()+28800000,idleUntil:now()+1800000,tokenExpires:now()+token.expires_in*1000})
        set(SESSION,sid,28800);redirect('/private');return
      }
      if(path==='logout'&&req.method==='POST'){
        const raw=cookie(req,SESSION),id=raw&&digest(raw),record=id&&await store.session('get',id)
        if(record && req.headers['x-tp-csrf']!==record.csrf){send(403,{code:'permission'});return}
        if(record){
          await store.session('revoke',id)
          try{await auth('logout?scope=local',unpack(record.sealed,id).token,{})}catch{/* Product revocation is already durable. */}
        }
        set(SESSION,'',0);send(200,{ok:true});return
      }
      const session=await authenticate(req)
      if(req.method==='POST'&&req.headers['x-tp-csrf']!==session.record.csrf){send(403,{code:'permission'});return}
      if(path==='session'&&req.method==='GET'){const capability=await describeProtectedAi(ai,store,session.credentials.token,session.id);send(200,{authorized:true,email:session.user.email,csrf:session.record.csrf,simulatedProvider:ai.mode==='simulation',ai:capability});return}
      if(path==='workspace'&&req.method==='GET'){send(200,{workspace:await store.load(session.credentials.token,session.id)});return}
      if(path==='workspace'&&req.method==='POST'){send(200,await store.save(session.credentials.token,session.id,await body(req)));return}
      if(path==='analysis'&&req.method==='POST'){
        const request=await body(req)
        if(ai.mode==='disabled'){send(200,{ok:false,code:'disconnected',externalAttempted:false});return}
        if(!isAnalysisRequest(request)||request.stage!=='E1'||!matchesServerSelection(ai,request)){send(400,{code:'invalid'});return}
        const workspace=await store.load(session.credentials.token,session.id),project=workspace?.projects.find(p=>p.id===request.projectId),run=project?.runs.find(r=>r.id===request.requestId)
        if(project?.mode!=='personal'||!run||!isDeepStrictEqual(run.request,request)||!sameContext(contextVersion(project,'E1'),request.contextVersion)){send(409,{code:'stale'});return}
        const result=await executeProtectedAnalysis({ai,store,token:session.credentials.token,sid:session.id,request,reauthenticate:()=>authenticate(req),provider,transportFactory})
        send(['busy','uncertain'].includes(result.code)?409:200,result);return
      }
      send(404,{code:'not-found'})
    }catch(error){
      // No request URLs, cookies, auth/provider bodies or content are logged.
      if(path==='auth/callback'){set(SESSION,'',0);redirect('/private?access=denied')}
      else send(error.message==='permission'?403:error.message==='invalid'?400:503,{code:error.message==='permission'?'permission':error.message==='invalid'?'invalid':'uncertain'})
    }
  }
}
