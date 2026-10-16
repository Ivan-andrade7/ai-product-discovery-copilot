import test from 'node:test'
import assert from 'node:assert/strict'
import {STORAGE_KEY} from '../src/storage.js'
import {TEST_PREFIX} from '../src/e1/test-adapters.js'

test('E1 browser integrated: shared creation/retry/review/brief, recovery without automatic analysis, production exclusion', {skip:process.env.WORKFLOW_UI_TESTS!=='1',timeout:90000},async()=>{
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE)
 const {createServer,preview}=await import('vite')
 const server=await createServer({server:{host:'127.0.0.1',port:0,open:false}});await server.listen()
 const production=await preview({preview:{host:'127.0.0.1',port:0,open:false}})
 const origin='http://127.0.0.1:'+server.httpServer.address().port,prod='http://127.0.0.1:'+production.httpServer.address().port
 let browser;const external=[],errors=[]
 try{
 browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:390,height:844}})
 await context.route('**/*',async route=>{if(![origin,prod].includes(new URL(route.request().url()).origin)){external.push(route.request().url());await route.abort()}else await route.continue()})
 await context.addInitScript(({key,personal,devOrigin})=>{if(location.origin!==devOrigin)return;const old=Storage.prototype.setItem;let fail=!sessionStorage.getItem('e1-ack-failed');localStorage.setItem(personal,'fictional-personal-sentinel');Storage.prototype.setItem=function(k,v){old.call(this,k,v);if(k===key&&fail&&JSON.parse(v).projects.some(p=>p.stageWork?.E1)){fail=false;old.call(sessionStorage,'e1-ack-failed','1');throw Error('fictitious lost acknowledgement')}}},{key:TEST_PREFIX+STORAGE_KEY,personal:STORAGE_KEY,devOrigin:origin})
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
 await page.goto(origin+'/?e1');await page.getByRole('button',{name:'Simular acceso no autorizado',exact:true}).click();await page.getByRole('alert').filter({hasText:'Acceso denegado'}).waitFor()
 await page.getByRole('button',{name:'Simular acceso de Iván',exact:true}).click();await page.getByRole('heading',{name:'Tus proyectos',exact:true}).waitFor()
 const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),TEST_PREFIX+STORAGE_KEY)
 await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();await page.getByLabel('Nombre',{exact:true}).fill('Brief integrado ficticio');const original='  Aclarar un pedido de diseño.\n';await page.getByLabel('Solicitud original',{exact:true}).fill(original);await page.getByLabel('Resultado esperado, si ya lo conocés').fill('Preparar brief')
 await page.getByRole('button',{name:'Crear y continuar'}).click();await page.getByRole('button',{name:'Reintentar guardado'}).waitFor();const savedId=(await state()).projects.find(p=>p.stageWork?.E1).id
 await page.getByRole('button',{name:'Reintentar guardado'}).click();await page.getByRole('region',{name:'Trabajo E1'}).waitFor();assert.equal((await state()).projects.filter(p=>p.stageWork?.E1).length,1);assert.equal((await state()).activeProjectId,savedId)
 const panel=page.getByRole('region',{name:'Trabajo E1'});assert.equal(await panel.getByRole('button',{name:'Obtener orientación simulada'}).isDisabled(),true)
 assert.equal((await state()).projects.find(p=>p.id===savedId).sources.length,0)
 await panel.getByLabel('Nombre de fuente',{exact:true}).fill('Nota ficticia');await panel.getByLabel('Contenido de fuente',{exact:true}).fill('El ejercicio tiene un alcance por aclarar.');await panel.getByRole('button',{name:'Guardar fuente',exact:true}).click()
 await panel.getByLabel('Aporte humano',{exact:true}).fill('El plazo declarado por Iván es viernes');await panel.getByRole('button',{name:'Guardar aporte humano'}).click();await panel.getByRole('button',{name:'Obtener orientación simulada'}).click()
 await panel.getByRole('status').filter({hasText:'Respuesta completa'}).waitFor();let p=(await state()).projects.find(p=>p.id===savedId);assert.equal(p.runs.length,1);assert.equal(p.runs[0].request.humanContext.contributions[0].content,'El plazo declarado por Iván es viernes');assert.equal(p.originalRequest,original)
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'E1 panel overflow '+width)}
 await panel.getByRole('button',{name:'Revisar propuestas en Work'}).click();await page.getByRole('heading',{name:'Work',exact:true}).waitFor();await page.getByText('Simulación E1 · no es IA real',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Editar',exact:true}).click();await page.getByLabel('Editar propuesta antes de aceptar').fill('Síntesis revisada por Iván');await page.getByRole('button',{name:'Guardar y aceptar'}).click()
 await page.getByRole('button',{name:'Decisions',exact:true}).click();await page.getByText('Síntesis revisada por Iván',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Overview',exact:true}).click();await panel.getByLabel('Aporte humano',{exact:true}).fill('Sin entrevistas');await panel.getByLabel('Responde a una pregunta').selectOption({label:'¿Qué restricción cambia el próximo paso?'});await panel.getByRole('button',{name:'Guardar aporte humano'}).click()
 await panel.getByLabel('Próxima acción humana').fill('Revisar el brief antes de diseñar');await panel.getByRole('button',{name:'Cerrar E1 con pendientes visibles'}).click();await panel.getByText('E1 cerrado con pendientes visibles',{exact:false}).waitFor()
 await page.getByRole('button',{name:'Deliverables',exact:true}).click();await page.getByRole('heading',{name:'Brief E1 · revisado',exact:true}).waitFor();await page.getByText('Síntesis revisada por Iván',{exact:true}).waitFor();await page.getByText('Revisar el brief antes de diseñar',{exact:true}).waitFor()
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'overflow '+width)}
 await page.reload();await page.getByRole('button',{name:'Simular acceso de Iván',exact:true}).click();await page.getByRole('button',{name:/Brief integrado ficticio/}).click();p=(await state()).projects.find(p=>p.id===savedId);assert.equal(p.runs.length,1);assert.equal(p.stageWork.E1.nextAction,'Revisar el brief antes de diseñar');assert.equal(p.stageWork.E1.closed,true)
 await page.getByRole('button',{name:'Work',exact:true}).click();await page.locator('.proposal-queue button').filter({hasText:'Síntesis del contexto aportado'}).click();await page.getByRole('button',{name:'Reabrir decisión',exact:true}).click();await page.getByRole('button',{name:'Deliverables',exact:true}).click();assert.equal((await state()).projects.find(p=>p.id===savedId).runs.length,1)
 await page.locator('.brand-button').click();await page.getByRole('button',{name:'Nuevo proyecto',exact:true}).click();await page.getByLabel('Nombre',{exact:true}).fill('Brief integrado ficticio');await page.getByLabel('Solicitud original',{exact:true}).fill(original);await page.getByRole('button',{name:'Crear y continuar'}).click();await page.getByRole('region',{name:'Trabajo E1'}).waitFor();assert.equal((await state()).projects.filter(p=>p.stageWork?.E1).length,2)
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),STORAGE_KEY),'fictional-personal-sentinel')
 await page.getByRole('button',{name:'Cerrar sesión de prueba'}).click();assert.equal(await page.getByRole('heading',{name:'Overview',exact:true}).count(),0)
 await page.goto(prod+'/?e1');await page.getByRole('heading',{name:'Tus proyectos',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Simular acceso de Iván'}).count(),0)
 for(const path of ['/src/e1/E1Development.jsx','/src/e1/test-adapters.js']){const res=await context.request.get(prod+path);assert.ok(!res.headers()['content-type']?.includes('javascript'));assert.equal((await res.text()).includes('createTestEnvironment'),false)}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[])
 }finally{await browser?.close();await server.close();await new Promise(resolve=>production.httpServer.close(resolve))}
})
