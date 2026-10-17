import test from 'node:test'
import assert from 'node:assert/strict'
import {createDefaultWorkspace} from '../src/data/demoData.js'
import {createSimulatedProvider} from '../src/e1/test-adapters.js'
import {readFile} from 'node:fs/promises'

test('private UI with intercepted fictitious API: async save, lost ack, two contexts, conflict, E1, logout',{
 skip:process.env.PRIVATE_UI_TESTS!=='1',timeout:90000,
},async(t)=>{
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE)
 const built=process.env.PRIVATE_BUILD_TESTS==='1'
 const origin=built?'https://private.example.test':'http://127.0.0.1:5182',browser=await chromium.launch({channel:'msedge',headless:true})
 let workspace=createDefaultWorkspace(),lost=false,loseReview=true,analyses=0,logoutAttempts=0;const commands=new Map(),external=[],errors=[],consoleIssues=[],measurements=[]
 async function context(){
  const ctx=await browser.newContext();let active=true
  await ctx.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url())
   if(url.origin!==origin){external.push(url.origin);await route.abort();return}
   if(!url.pathname.startsWith('/api/')){
    if(!built){await route.continue();return}
    const file=['/','/private'].includes(url.pathname)?'protected.html':url.pathname.slice(1)
    if(!/^(protected\.html|assets\/[\w.-]+\.(js|css|svg))$/.test(file)){await route.fulfill({status:404,body:''});return}
    await route.fulfill({body:await readFile(new URL('../dist-private/'+file,import.meta.url)),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html'});return
   }
   const send=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)})
   if(req.method()==='POST')assert.equal(req.headers()['x-tp-csrf'],'fixture-csrf')
   if(url.pathname==='/api/logout'){logoutAttempts++;if(logoutAttempts===1){await send({code:'uncertain'},503);return};active=false;await send({ok:true});return}
   if(!active){await send({code:'permission'},403);return}
   if(url.pathname==='/api/session'){await send({authorized:true,csrf:'fixture-csrf',simulatedProvider:true});return}
   if(url.pathname==='/api/workspace'&&req.method()==='GET'){await send({workspace});return}
   const body=req.postDataJSON()
   if(url.pathname==='/api/analysis'){analyses++;await send(await createSimulatedProvider().analyze(body));return}
   if(url.pathname==='/api/workspace'){
    await new Promise(r=>setTimeout(r,40))
    if(commands.has(body.operationId)){await send(commands.get(body.operationId));return}
    if(body.revision!==workspace.revision){await send({ok:false,type:'conflict',workspace});return}
    workspace={...body.candidate,revision:body.revision+1,writerId:body.writerId}
    const result={ok:true,workspace};commands.set(body.operationId,result)
    if(!lost&&workspace.projects.some(p=>p.stageWork?.E1)){lost=true;await route.abort();return}
    if(loseReview&&workspace.projects.some(p=>p.proposals.some(q=>q.status==='edited'))){loseReview=false;await route.abort();return}
    await send(result);return
   }
   throw Error('Unexpected test route')
  })
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(['error','warning'].includes(msg.type()))consoleIssues.push(msg.text())});await page.goto(origin+'/private?e1');await page.getByRole('heading',{name:'Tus proyectos',exact:true}).waitFor();return {ctx,page}
 }
 try{
  const a=await context(),b=await context(),page=a.page
  await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click()
  await page.getByLabel('Nombre',{exact:true}).fill('Recorrido remoto ficticio')
  await page.getByLabel('Solicitud original',{exact:true}).fill('Pedido ficticio original')
  await page.getByRole('button',{name:'Crear y continuar'}).click()
  await page.getByRole('button',{name:'Resolver el mismo guardado'}).waitFor()
  assert.equal(workspace.projects.filter(p=>p.stageWork?.E1).length,1)
  await page.getByRole('button',{name:'Resolver el mismo guardado'}).click()
  const panel=page.getByRole('region',{name:'Trabajo E1'});await panel.waitFor()
  // Empty forms and unchanged action do not warn; real form content does.
  await page.getByRole('button',{name:'Fuentes',exact:true}).click()
  assert.equal(await page.getByRole('region',{name:'Borradores pendientes'}).count(),0)
  await page.getByRole('button',{name:'Resumen',exact:true}).click()
  await panel.getByLabel('Nombre de fuente',{exact:true}).fill('Nombre todavía sin guardar')
  await page.getByRole('button',{name:'Fuentes',exact:true}).click()
  await page.getByRole('region',{name:'Borradores pendientes'}).waitFor()
  await page.getByRole('button',{name:'Continuar editando',exact:true}).click()
  assert.equal(await panel.getByLabel('Nombre de fuente',{exact:true}).inputValue(),'Nombre todavía sin guardar')
  await panel.getByLabel('Nombre de fuente',{exact:true}).fill('')
  for(const field of ['Aporte humano','Próxima acción humana']){
   await panel.getByLabel(field,{exact:true}).fill('Contenido pendiente '+field)
   await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click()
   await page.getByRole('region',{name:'Borradores pendientes'}).waitFor();assert.equal(logoutAttempts,0)
   await page.getByRole('button',{name:'Continuar editando',exact:true}).click()
   assert.equal(await panel.count(),1,await page.locator('body').innerText())
   assert.equal(await panel.getByLabel(field,{exact:true}).inputValue(),'Contenido pendiente '+field)
   await panel.getByLabel(field,{exact:true}).fill('')
  }
  if(built) assert.equal(await panel.getByLabel('Contenido de fuente',{exact:true}).evaluate(el=>getComputedStyle(el).minHeight),'90px')
  await panel.getByLabel('Contenido de fuente',{exact:true}).focus()
  assert.equal(await panel.getByLabel('Contenido de fuente',{exact:true}).evaluate(el=>el.matches(':focus-visible')&&getComputedStyle(el).outlineStyle!=='none'),true)
  await page.keyboard.press('Tab');assert.equal(await panel.getByRole('button',{name:'Guardar fuente',exact:true}).evaluate(el=>el===document.activeElement),true)
  await panel.getByLabel('Contenido de fuente',{exact:true}).fill('https://example.test/'+'TextoLargo'.repeat(80))
  for(const width of [320,390,901,1024,1280]){
   await page.setViewportSize({width,height:900})
   const measurement=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}))
   assert.ok(measurement.document<=measurement.viewport,JSON.stringify({width,...measurement}))
   measurements.push({view:'E1 form',width,...measurement})
  }
  await panel.getByLabel('Contenido de fuente',{exact:true}).fill('')
  await panel.getByLabel('Nombre de fuente',{exact:true}).fill('Nota ficticia')
  await panel.getByLabel('Contenido de fuente',{exact:true}).fill('La entrega requiere aclarar el pedido.')
  await panel.getByRole('button',{name:'Guardar fuente',exact:true}).click()
  await panel.getByRole('status').filter({hasText:'Guardado confirmado'}).waitFor()
  await panel.getByLabel('Aporte humano',{exact:true}).fill('Declaración humana: viernes')
  await panel.getByRole('button',{name:'Guardar aporte humano'}).click()
  await page.waitForTimeout(100)
  await panel.getByRole('button',{name:'Obtener orientación simulada'}).click()
  await panel.getByRole('status').filter({hasText:'Respuesta completa'}).waitFor()
  assert.equal(analyses,1)
  await panel.getByRole('button',{name:'Revisar propuestas'}).click()
  await page.getByRole('button',{name:'Aceptar',exact:true}).dblclick()
  await page.waitForTimeout(100)
  assert.equal(workspace.projects.at(-1).decisions.length,1)
  assert.equal(workspace.projects.at(-1).proposals.filter(p=>p.status==='accepted').length,1)
  await page.getByRole('button',{name:'Reabrir decisión',exact:true}).click()
  await page.getByRole('button',{name:'Editar',exact:true}).click()
  await page.getByLabel('Editar propuesta antes de aceptar').fill('Edición ficticia cuya confirmación se pierde')
  for(const width of [320,390,901,1024,1280]){await page.setViewportSize({width,height:900});const measurement=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));assert.ok(measurement.document<=measurement.viewport,JSON.stringify({width,...measurement}));measurements.push({view:'Revisión edit',width,...measurement})}
  await page.getByRole('button',{name:'Guardar y aceptar',exact:true}).dblclick()
  await page.getByRole('button',{name:'Resolver el mismo guardado'}).waitFor()
  await page.getByRole('button',{name:'Resolver el mismo guardado'}).click()
  await page.getByRole('button',{name:'Reabrir decisión',exact:true}).waitFor()
  await page.locator('.brand-button').click()
  assert.equal(await page.getByRole('region',{name:'Borradores pendientes'}).count(),0)
  await page.getByRole('button').filter({hasText:'Recorrido remoto ficticio'}).click()
  await page.getByRole('button',{name:'Resumen',exact:true}).click()
  await panel.getByLabel('Próxima acción humana',{exact:true}).fill('Revisar el brief ficticio')
  await panel.getByRole('button',{name:'Cerrar E1 con pendientes visibles'}).click()
  await page.waitForTimeout(100)
  assert.equal(workspace.projects.at(-1).stageWork.E1.closed,true)
  assert.equal(workspace.projects.at(-1).stageWork.E1.nextAction,'Revisar el brief ficticio')
  await b.page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click()
  await b.page.getByLabel('Nombre',{exact:true}).fill('Intento desactualizado')
  await b.page.getByLabel('Solicitud original',{exact:true}).fill('Otro pedido ficticio')
  await b.page.getByRole('button',{name:'Crear y continuar'}).click()
  await b.page.getByRole('button',{name:'Cargar cambios externos'}).waitFor()
  assert.equal(workspace.projects.some(p=>p.name==='Intento desactualizado'),false)
  await b.page.getByRole('button',{name:'Cargar cambios externos'}).click()
  await b.page.getByRole('button').filter({hasText:'Recorrido remoto ficticio'}).click()
  await b.page.getByRole('region',{name:'Trabajo E1'}).waitFor()
  assert.equal(analyses,1)
  await b.page.getByRole('button',{name:'Entregables',exact:true}).click()
  await b.page.getByRole('heading',{name:'Entregables',exact:true}).waitFor()
  await b.page.reload();await b.page.getByRole('heading',{name:'Tus proyectos',exact:true}).waitFor()
  assert.equal(analyses,1)
  await b.page.getByRole('button').filter({hasText:'Recorrido remoto ficticio'}).click()
  await b.page.getByRole('button',{name:'Revisión',exact:true}).click()
  await b.page.locator('.proposal-queue button').last().click()
  await b.page.getByRole('button',{name:'Editar',exact:true}).click()
  await b.page.getByLabel('Editar propuesta antes de aceptar').fill('Borrador antes de logout')
  await b.page.getByRole('button',{name:'Cerrar sesión',exact:true}).click()
  await b.page.getByRole('region',{name:'Borradores pendientes'}).waitFor();assert.equal(logoutAttempts,0)
  await b.page.getByRole('button',{name:'Continuar editando',exact:true}).focus();await b.page.keyboard.press('Enter')
  assert.equal(await b.page.getByLabel('Editar propuesta antes de aceptar').inputValue(),'Borrador antes de logout')
  await b.page.getByRole('button',{name:'Cerrar sesión',exact:true}).click()
  await b.page.getByRole('button',{name:'Descartar y salir',exact:true}).click()
  await b.page.getByRole('button',{name:'Reintentar cierre de sesión',exact:true}).waitFor()
  assert.equal(logoutAttempts,1);assert.equal(await b.page.getByRole('heading',{name:'Tus proyectos',exact:true}).count(),0)
  await b.page.getByRole('button',{name:'Reintentar cierre de sesión',exact:true}).click()
  await b.page.getByText('Sesión cerrada.',{exact:true}).waitFor()
  await b.page.reload();await b.page.getByRole('alert').waitFor()
  assert.equal(external.length,0);assert.deepEqual(errors,[])
  // Aborted acknowledgements and the intentional 503 are expected console network errors, not silent omissions.
  assert.equal(consoleIssues.some(issue=>issue.includes('404')),false,'Build assets, including logo/favicons, must be served by the fixture')
  assert.equal(consoleIssues.filter(s=>!s.includes('Failed to load resource')&&!s.includes('net::ERR_FAILED')).length,0,JSON.stringify(consoleIssues))
  t.diagnostic(JSON.stringify({built,analyses,external:external.length,errors,consoleIssues,measurements}))
 }finally{await browser.close()}
})
