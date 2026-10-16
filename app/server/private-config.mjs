import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import {randomBytes} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'

export async function readPrivateConfig(configPath) {
 try{return JSON.parse((await fs.readFile(configPath,'utf8')).replace(/^\uFEFF/,''))}catch(error){if(error.code!=='ENOENT')throw Error('invalid-private-config')}
 // One-time loopback form. It accepts only the dedicated project's publishable key.
 const nonce=randomBytes(32).toString('hex'),origin='http://127.0.0.1:5182'
 return new Promise((resolve,reject)=>{
  const server=http.createServer(async(req,res)=>{
   res.setHeader('Cache-Control','no-store');res.setHeader('Content-Security-Policy',"default-src 'none'; form-action 'self'; frame-ancestors 'none'")
   if(req.headers.host!=='127.0.0.1:5182'){res.writeHead(403);res.end();return}
   if(req.method==='GET'&&req.url==='/local-setup'){
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(`<h1>Configuración privada del TP</h1><p>Sólo Publishable key del proyecto dedicado. Fuera de OneDrive y Git.</p><form method="post" action="/local-setup"><input type="hidden" name="nonce" value="${nonce}"><label>Publishable key<input name="key" type="password" autocomplete="off" required></label><button>Guardar configuración local</button></form>`);return
   }
   if(req.method==='POST'&&req.url==='/local-setup'&&req.headers.origin===origin&&req.headers['content-type']==='application/x-www-form-urlencoded'){
    try{
     let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2048)throw Error('invalid')}
     const data=new URLSearchParams(raw),key=data.get('key')
     if(data.get('nonce')!==nonce||!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key??''))throw Error('invalid')
     const directory=path.dirname(configPath);await fs.mkdir(directory,{recursive:true})
     if(process.platform==='win32')await promisify(execFile)('icacls',[directory,'/inheritance:r','/grant:r',`${process.env.USERDOMAIN}\\${process.env.USERNAME}:(OI)(CI)F`],{windowsHide:true})
     const config={environment:'private-local-test',url:'https://lkzgydnglkrcmztviqsf.supabase.co',publicKey:key,allowedEmails:['ivanandradeuxui@gmail.com','ivanandradecarp@gmail.com']}
     await fs.writeFile(configPath,JSON.stringify(config),{flag:'wx',mode:0o600})
     res.writeHead(303,{Location:'/private'});res.end();server.close(()=>resolve(config))
    }catch{res.writeHead(400);res.end('No se guardo la configuracion. No se sobrescribio ningun archivo.')}
    return
   }
   res.writeHead(404);res.end('Abrir /local-setup para la configuracion inicial.')
  })
  server.on('error',reject);server.listen(5182,'127.0.0.1',()=>console.log('Configuración inicial: http://127.0.0.1:5182/local-setup'))
 })
}
