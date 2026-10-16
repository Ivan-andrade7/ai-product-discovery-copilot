import http from 'node:http'
import path from 'node:path'
import os from 'node:os'
import {createServer} from 'vite'
import {createProtectedApi} from './private-api.mjs'
import {createRemoteStore} from './remote-store.mjs'
import {readPrivateConfig} from './private-config.mjs'

// Configuration lives outside OneDrive/repository. No .env or global credentials.
const configPath=path.join(os.homedir(),'AppData','Local','AI-Discovery-Copilot','private-test.json')
const config=await readPrivateConfig(configPath)
const origin='http://127.0.0.1:5182'
if(config.environment!=='private-local-test'||config.url!=='https://lkzgydnglkrcmztviqsf.supabase.co'||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.publicKey??''))throw Error('wrong-test-project-or-key')
const api=createProtectedApi({...config,origin,store:createRemoteStore(config)})
const vite=await createServer({server:{middlewareMode:true},appType:'spa'})
const server=http.createServer(async(req,res)=>{
  if(req.headers.host!=='127.0.0.1:5182'){res.writeHead(403);res.end();return}
  if(await api(req,res))return
  vite.middlewares(req,res)
})
server.listen(5182,'127.0.0.1',()=>console.log('Prueba privada: http://127.0.0.1:5182/private · IA simulada'))
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>vite.close()))
