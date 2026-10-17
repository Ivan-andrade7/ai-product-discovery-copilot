import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createDefaultWorkspace} from '../src/data/demoData.js'
import {createAbacusAdapter} from '../server/providers/abacus.mjs'
import {createGeminiAdapter,GEMINI_MODEL} from '../server/providers/gemini.mjs'

for(const provider of ['abacus','gemini'])test('private browser '+provider+' prepared with fictitious wire: selected text, review, persistence, disabled recovery', {skip:process.env.PRIVATE_UI_TESTS!=='1',timeout:90000},async t=>{
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE)
 const browser=await chromium.launch({channel:'msedge',headless:true})
 const origin='https://private.example.test',model=provider==='gemini'?GEMINI_MODEL:'fixture-reasoning-model',external=[],errors=[],measurements=[]
 let workspace=createDefaultWorkspace(),mode='real',calls=0,wire
 const adapter=(provider==='gemini'?createGeminiAdapter:createAbacusAdapter)(async request=>{
  calls++;wire=request.body
  const source=JSON.parse(provider==='gemini'?wire.contents[1].parts[0].text:wire.messages[2].content).sources[0]
  const content=JSON.stringify({proposals:[{type:'Afirmación',title:'Reserva ficticia',content:'Hay tres reservas. El plazo no está informado.',reasoning:'Se conserva la incertidumbre.',certainty:'evidence',references:[{sourceId:source.id,quote:'Hay tres reservas.'}]}]})
  return {status:200,externalAttempted:true,body:provider==='gemini'?{modelVersion:model,usageMetadata:{promptTokenCount:30,candidatesTokenCount:20,totalTokenCount:50},candidates:[{finishReason:'STOP',content:{parts:[{text:content}]}}]}:{model,usage:{prompt_tokens:30,completion_tokens:20,total_tokens:50},choices:[{finish_reason:'stop',message:{content}}]}}
 },{maxOutputTokens:500})
 try{
  const context=await browser.newContext()
  await context.route('**/*',async route=>{
   const request=route.request(),url=new URL(request.url())
   if(url.origin!==origin){external.push(url.origin);await route.abort();return}
   const send=value=>route.fulfill({contentType:'application/json',body:JSON.stringify(value)})
   if(!url.pathname.startsWith('/api/')){
    const file=['/','/private'].includes(url.pathname)?'protected.html':url.pathname.slice(1)
    if(!/^(protected\.html|assets\/[\w.-]+\.(js|css|svg))$/.test(file)){await route.fulfill({status:404,body:''});return}
    await route.fulfill({body:await readFile(new URL('../dist-private/'+file,import.meta.url)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});return
   }
   if(url.pathname==='/api/session'){await send({authorized:true,csrf:'fixture-csrf',ai:{mode,provider:mode==='real'?provider:null,available:mode==='real',model:mode==='real'?model:null,simulated:false,code:mode==='real'?'ready':'disconnected'}});return}
   if(request.method()==='POST')assert.equal(request.headers()['x-tp-csrf'],'fixture-csrf')
   if(url.pathname==='/api/workspace'&&request.method()==='GET'){await send({workspace});return}
   const body=request.postDataJSON()
   if(url.pathname==='/api/workspace'){assert.equal(body.revision,workspace.revision);workspace={...body.candidate,revision:body.revision+1,writerId:body.writerId};await send({ok:true,workspace});return}
   if(url.pathname==='/api/analysis'){assert.equal(mode,'real');assert.equal(body.model,model);assert.equal(body.provider,provider);await send(await adapter.analyze(body));return}
   throw Error('Unexpected fixture route')
  })
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(['error','warning'].includes(message.type()))errors.push(message.text())})
  await page.goto(origin+'/private');await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click()
  await page.getByLabel('Nombre',{exact:true}).fill('Ensayo privado ficticio '+ 'NombreContinuo'.repeat(12))
  await page.getByLabel('Solicitud original',{exact:true}).fill('Separar hechos de incertidumbre.')
  await page.getByLabel('Texto de la fuente aportada (opcional)',{exact:true}).fill('Hay tres reservas. No se conoce el plazo.')
  await page.getByRole('button',{name:'Crear y continuar',exact:true}).click()
  const panel=page.getByRole('region',{name:'Trabajo E1'});await panel.waitFor()
  assert.equal(await panel.getByRole('button',{name:'Obtener orientación simulada'}).count(),0)
  await page.getByRole('button',{name:'Fuentes',exact:true}).click()
  await page.getByRole('button',{name:/Fuente aportada al crear el proyecto/}).click()
  await page.getByLabel('Seleccionar este texto para el análisis').click()
  await page.waitForFunction(()=>document.querySelector('input[type="checkbox"]')?.checked===true)
  await page.getByRole('button',{name:'Resumen',exact:true}).click()
  for(const width of [320,390,768,901,902,1024,1280,1440]){
   await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true)
   measurements.push({width,view:'E1 '+provider+' prepared',document:await page.evaluate(()=>document.documentElement.scrollWidth)})
  }
  await panel.getByRole('button',{name:'Analizar fuentes seleccionadas',exact:true}).click()
  await panel.getByRole('status').filter({hasText:'Respuesta completa'}).waitFor()
  assert.equal(calls,1);assert.equal(JSON.parse(provider==='gemini'?wire.contents[1].parts[0].text:wire.messages[2].content).sources.length,1)
  assert.equal(workspace.projects.at(-1).runs[0].provider,provider)
  await panel.getByRole('button',{name:'Revisar propuestas',exact:true}).click()
  await page.getByText('Propuesta de IA · requiere revisión',{exact:true}).waitFor()
  await page.getByRole('button',{name:'Aceptar',exact:true}).click()
  await page.getByRole('button',{name:'Entregables',exact:true}).click();await page.getByText('Hay tres reservas. El plazo no está informado.',{exact:true}).waitFor()
  await page.reload();await page.getByRole('button').filter({hasText:'Ensayo privado ficticio'}).click()
  await page.getByRole('button',{name:'Revisión',exact:true}).click();await page.getByRole('button',{name:'Reabrir decisión',exact:true}).click()
  assert.equal(workspace.projects.at(-1).decisions.length,2);assert.equal(workspace.projects.at(-1).proposals[0].originalContent,'Hay tres reservas. El plazo no está informado.')
  mode='disabled';await page.reload();await page.getByRole('button').filter({hasText:'Ensayo privado ficticio'}).click()
  await panel.getByRole('button',{name:'Analizar fuentes seleccionadas'}).waitFor();assert.equal(await panel.getByRole('button',{name:'Analizar fuentes seleccionadas'}).isDisabled(),true)
  assert.equal(calls,1);assert.deepEqual(external,[]);assert.deepEqual(errors,[])
  t.diagnostic(JSON.stringify({callsToFictitiousTransport:calls,externalRequests:external.length,errors,measurements}))
 }finally{await browser.close()}
})
