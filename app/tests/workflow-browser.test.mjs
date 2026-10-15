import test from 'node:test'
import assert from 'node:assert/strict'
import { createDefaultWorkspace } from '../src/data/demoData.js'
import { STORAGE_KEY } from '../src/storage.js'

// Opt-in, using an already-installed browser runtime; fictitious data only.
// WORKFLOW_UI_TESTS=1 PLAYWRIGHT_MODULE=file:///.../playwright/index.mjs
test('workflow browser: drafts, exact destinations, creation retries, keyboard and isolated conflicts', { skip: process.env.WORKFLOW_UI_TESTS !== '1', timeout: 180000 }, async () => {
  const { createServer } = await import('vite')
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE)
  const server = await createServer({ server: { host: '127.0.0.1', port: 0, strictPort: true, open: false } })
  await server.listen()
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  let browser
  const contexts = [], errors = [], external = [], measurements = []
  let focusChecks = 0
  const seed = createDefaultWorkspace()
  seed.projects[0].proposals.forEach((proposal) => { proposal.sourceRefs = [{ sourceId: 'original-request', quote: 'información dispersa' }] })
  const other = structuredClone(seed.projects[0])
  other.id = 'other-fictitious-project'; other.name = 'Otro proyecto ficticio'; other.mode = 'historical'
  seed.projects.push(other)
  async function isolated(workspace = seed, fault) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true })
    contexts.push(context)
    await context.route('**/*', async (route) => {
      if (new URL(route.request().url()).origin !== origin) { external.push(route.request().url()); await route.abort(); return }
      await route.continue()
    })
    await context.addInitScript(({ key, raw, fault }) => {
      if (!sessionStorage.getItem('workflow-seeded')) { localStorage.setItem(key, raw); sessionStorage.setItem('workflow-seeded', 'yes') }
      if (fault === 'read') Storage.prototype.getItem = () => { throw new Error('isolated-read-fault') }
    }, { key: STORAGE_KEY, raw: typeof workspace === 'string' ? workspace : JSON.stringify(workspace), fault })
    const page = await context.newPage()
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()) })
    await page.goto(origin)
    return { page, context }
  }
  const button = (page, name) => page.getByRole('button', { name, exact: true })
  const click = (page, name) => button(page, name).click()
  const home = (page) => page.locator('.brand-button').click()
  const workspace = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY)
  async function fit(page, state) {
    for (const width of [320, 390, 901, 1024, 1025, 1280]) {
      await page.setViewportSize({ width, height: 844 })
      const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }))
      assert.ok(size.document <= size.viewport, `${state} ${width}: ${JSON.stringify(size)}`)
      measurements.push({ state, width, ...size })
    }
    await page.setViewportSize({ width: 390, height: 844 })
  }
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true })
    const { page, context } = await isolated()
    await page.getByRole('button', { name: /Discovery v0.1/ }).click()
    await click(page, 'Work')
    const original = (await workspace(page)).projects[0].proposals[0].content
    const draft = '  Borrador ficticio exacto\n' + 'CadenaSinEspacios'.repeat(40)
    await click(page, 'Editar')
    await page.getByLabel('Editar propuesta antes de aceptar').fill(draft)
    const rawBeforeNavigation = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
    await fit(page, 'draft')
    for (const name of ['Sources', 'Overview', 'Decisions', 'Deliverables', 'AI Activity']) {
      await click(page, name); await click(page, 'Work')
      assert.equal(await page.getByLabel('Editar propuesta antes de aceptar').inputValue(), draft)
    }
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), rawBeforeNavigation)
    await page.getByRole('button', { name: /La decisión final debe permanecer/ }).click()
    await click(page, 'Editar')
    await page.getByLabel('Editar propuesta antes de aceptar').fill('Borrador independiente')
    await page.getByRole('button', { name: /La información dispersa dificulta/ }).click()
    assert.equal(await page.getByLabel('Editar propuesta antes de aceptar').inputValue(), draft)
    await click(page, 'Descartar borrador')
    assert.equal(await page.locator('.proposal-content').textContent(), original)
    await home(page)
    await page.getByRole('region', { name: 'Borradores pendientes' }).waitFor()
    await fit(page, 'exit-warning')
    await button(page, 'Continuar editando').focus()
    await page.keyboard.press('Tab')
    assert.equal(await button(page, 'Descartar y salir').evaluate((el) => el === document.activeElement && getComputedStyle(el).outlineStyle === 'solid'), true)
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Enter')
    assert.equal(await page.getByLabel('Editar propuesta antes de aceptar').inputValue(), 'Borrador independiente')
    await button(page, 'Guardar y aceptar').dblclick()
    assert.equal((await workspace(page)).projects[0].decisions.length, 1)
    await click(page, 'Deliverables')
    await page.getByText('Borrador independiente', { exact: true }).waitFor()
    await home(page)
    assert.equal(await page.getByRole('region', { name: 'Borradores pendientes' }).count(), 0)
    await page.getByRole('button', { name: /Otro proyecto ficticio/ }).click(); await click(page, 'Work')
    assert.equal(await page.getByLabel('Editar propuesta antes de aceptar').count(), 0)
    await click(page, 'Editar'); await home(page)
    assert.equal(await page.getByRole('region', { name: 'Borradores pendientes' }).count(), 0) // unchanged editor
    await page.getByRole('button', { name: /Discovery v0.1/ }).click()
    const titles = seed.projects[0].proposals.map((proposal) => proposal.title)
    for (const title of [titles[1], titles[0], titles[2], titles[1]]) {
      await click(page, 'Sources')
      await page.locator('.linked-proposals button').filter({ hasText: title }).click()
      assert.equal(await page.locator('.proposal-review h2').textContent(), title)
    }
    await click(page, 'Reabrir decisión')
    await click(page, 'Editar'); await page.getByLabel('Editar propuesta antes de aceptar').fill('Pendiente de salir')
    await home(page); await click(page, 'Descartar y salir')
    await page.getByRole('button', { name: /Discovery v0.1/ }).click(); await click(page, 'Work')
    assert.equal(await page.getByLabel('Editar propuesta antes de aceptar').count(), 0)
    // Reload warns through beforeunload (browser-controlled) and discards session draft, not confirmed data.
    await click(page, 'Editar'); await page.getByLabel('Editar propuesta antes de aceptar').fill('No durable')
    let unloadDialogs = 0
    page.on('dialog', async (dialog) => { if (dialog.type() === 'beforeunload') unloadDialogs++; await dialog.accept() })
    const storedBeforeReload = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
    await page.reload()
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), storedBeforeReload)
    await page.getByRole('button', { name: /Discovery v0.1/ }).click(); await click(page, 'Work')
    assert.equal(await page.getByLabel('Editar propuesta antes de aceptar').count(), 0)
    // Two tabs: external change cannot silently discard a pending session draft.
    await click(page, 'Editar'); await page.getByLabel('Editar propuesta antes de aceptar').fill('Borrador frente a conflicto')
    const second = await context.newPage(); await second.goto(origin)
    await second.getByRole('button', { name: /Discovery v0.1/ }).click(); await click(second, 'Work'); await click(second, 'Aceptar')
    await page.getByText('Hay cambios de otra pestaña.', { exact: false }).waitFor()
    await click(page, 'Cargar cambios externos')
    await page.getByRole('region', { name: 'Borradores pendientes' }).waitFor()
    await fit(page, 'conflict-exit-warning')
    await click(page, 'Continuar editando')
    assert.equal(await page.getByLabel('Editar propuesta antes de aceptar').inputValue(), 'Borrador frente a conflicto')
    assert.equal(await button(page, 'Guardar y aceptar').isDisabled(), true)
    await click(page, 'Cargar cambios externos'); await click(page, 'Descartar y salir')
    await page.getByRole('heading', { name: 'Tus proyectos' }).waitFor()

    // New project validation preserves meaningful original literally.
    const fresh = await isolated()
    await click(fresh.page, 'Nuevo proyecto')
    for (const value of ['', '   ', '\t\t', '\n\r\n']) {
      await fresh.page.getByLabel('Solicitud original', { exact: true }).fill(value)
      await click(fresh.page, 'Crear y continuar')
      assert.equal((await workspace(fresh.page)).projects.length, 2)
      if (value) await fresh.page.getByRole('alert').waitFor()
    }
    await fit(fresh.page, 'request-error')
    await fresh.page.getByLabel('Solicitud original', { exact: true }).fill('  ¿Qué ocurrió? 日本語\n ')
    await button(fresh.page, 'Crear y continuar').focus(); await fresh.page.keyboard.press('Enter')
    assert.equal((await workspace(fresh.page)).projects[2].originalRequest, '  ¿Qué ocurrió? 日本語\n ')
    await click(fresh.page, 'Work')
    assert.equal(await button(fresh.page, 'Analizar contenido seleccionado').isDisabled(), true)
    assert.equal((await workspace(fresh.page)).projects[2].proposals.length, 0)
    await click(fresh.page, 'Sources'); await fresh.page.getByText('Aportada · sin revisar').first().waitFor()

    // Repeated submit while write fails retains one exact candidate and existing rescue.
    const failing = await isolated()
    await click(failing.page, 'Nuevo proyecto')
    await failing.page.getByLabel('Nombre', { exact: true }).fill('Intento ficticio')
    await failing.page.getByLabel('Solicitud original', { exact: true }).fill('  Solicitud literal\n ')
    await failing.page.getByLabel('Texto de la fuente aportada (opcional)').fill(' Fuente literal \n')
    const persisted = await failing.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
    await failing.page.evaluate(() => {
      const original = Storage.prototype.setItem
      window.workflowAllowWrite = false
      Storage.prototype.setItem = function (...args) { if (!window.workflowAllowWrite) throw new Error('fictitious-write-failure'); return original.apply(this, args) }
    })
    await button(failing.page, 'Crear y continuar').dblclick()
    await button(failing.page, 'Reintentar guardado').focus()
    await failing.page.keyboard.down('Enter'); await failing.page.keyboard.down('Enter'); await failing.page.keyboard.up('Enter')
    await fit(failing.page, 'write-error-retry')
    assert.equal(await failing.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), persisted)
    const downloadPromise = failing.page.waitForEvent('download')
    await click(failing.page, 'Exportar respaldo')
    const download = await downloadPromise, chunks = []
    for await (const chunk of await download.createReadStream()) chunks.push(chunk)
    const backup = JSON.parse(Buffer.concat(chunks).toString())
    await download.delete()
    assert.equal(backup.workspace.projects.length, 3)
    const candidate = backup.workspace.projects[2]
    assert.equal(candidate.originalRequest, '  Solicitud literal\n ')
    assert.equal(candidate.sources[1].content, ' Fuente literal \n')
    await failing.page.evaluate(() => { window.workflowAllowWrite = true })
    await click(failing.page, 'Reintentar guardado')
    assert.deepEqual((await workspace(failing.page)).projects[2], candidate)
    await home(failing.page); await click(failing.page, 'Nuevo proyecto')
    await failing.page.getByLabel('Nombre', { exact: true }).fill('Intento ficticio')
    await failing.page.getByLabel('Solicitud original', { exact: true }).fill('  Solicitud literal\n ')
    await button(failing.page, 'Crear y continuar').dblclick()
    assert.equal((await workspace(failing.page)).projects.length, 4)
    assert.notEqual((await workspace(failing.page)).projects[3].id, candidate.id)
    await failing.page.reload()
    assert.equal((await workspace(failing.page)).projects.length, 4)

    const unsaved = await isolated()
    await click(unsaved.page, 'Nuevo proyecto')
    await unsaved.page.getByLabel('Solicitud original', { exact: true }).fill('Candidato sólo en memoria')
    const unchangedRaw = await unsaved.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
    await unsaved.page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('isolated-write-fault') } })
    await click(unsaved.page, 'Crear y continuar')
    await unsaved.page.getByText('No se pudo guardar.', { exact: false }).waitFor()
    await unsaved.page.reload()
    assert.equal(await unsaved.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), unchangedRaw)
    assert.equal((await workspace(unsaved.page)).projects.length, 2)

    // Unchanged review lifecycle: repeated actions cannot hit the next item.
    const review = await isolated()
    await review.page.getByRole('button', { name: /Discovery v0.1/ }).click(); await click(review.page, 'Work')
    await button(review.page, 'Aceptar').dblclick()
    assert.equal((await workspace(review.page)).projects[0].decisions.length, 1)
    assert.equal((await workspace(review.page)).projects[0].proposals[1].status, 'pending')
    await click(review.page, 'Reabrir decisión'); await click(review.page, 'Editar')
    await review.page.getByLabel('Editar propuesta antes de aceptar').fill('Revisión confirmada ficticia')
    await button(review.page, 'Guardar y aceptar').focus(); await review.page.keyboard.press('Enter')
    await click(review.page, 'Deliverables'); await review.page.getByText('Revisión confirmada ficticia', { exact: true }).waitFor()
    await click(review.page, 'Work'); await click(review.page, 'Reabrir decisión')
    await button(review.page, 'Rechazar').focus()
    await review.page.keyboard.down('Enter'); await review.page.keyboard.down('Enter'); await review.page.keyboard.up('Enter')
    assert.equal((await workspace(review.page)).projects[0].decisions.length, 5)
    await review.page.getByRole('button', { name: /La decisión final debe permanecer/ }).click()
    await click(review.page, 'Mantener pendiente')
    assert.equal((await workspace(review.page)).projects[0].decisions.length, 5)
    await click(review.page, 'Decisions'); await review.page.getByText('5 acciones', { exact: false }).waitFor()
    await click(review.page, 'Deliverables'); await review.page.getByText('Todavía no hay decisiones aceptadas', { exact: false }).waitFor()
    await click(review.page, 'AI Activity'); await review.page.getByText('Propuesta editada y aceptada', { exact: true }).waitFor()
    await fit(review.page, 'reviewed-activity')
    const confirmedRaw = await review.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
    await review.page.reload()
    assert.equal(await review.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), confirmedRaw)

    const recovery = await isolated('{"incompatible":true}')
    await recovery.page.getByRole('heading', { name: 'Recuperación requerida' }).waitFor()
    assert.equal(await recovery.page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY), '{"incompatible":true}')
    await fit(recovery.page, 'recovery')
    const readFailure = await isolated(seed, 'read')
    await readFailure.page.getByRole('heading', { name: 'Recuperación requerida' }).waitFor()
    await fit(readFailure.page, 'read-failure')

    // Existing project navigation still reveals the full outline in its internal scroller.
    await review.page.getByRole('button', { name: /Discovery v0.1/ }).click()
    const destinations = ['Overview', 'Work', 'Sources', 'Decisions', 'Deliverables', 'AI Activity']
    for (const width of [320, 390, 901, 1024, 1025, 1280]) {
      await review.page.setViewportSize({ width, height: 844 })
      for (const name of destinations) {
        await button(review.page, name).focus()
        await review.page.keyboard.press('Tab'); await review.page.keyboard.press('Shift+Tab')
        const visible = await button(review.page, name).evaluate((el) => {
          const nav = el.closest('nav'), r = el.getBoundingClientRect(), n = nav.getBoundingClientRect(), style = getComputedStyle(el)
          const margin = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
          const clipping = nav.scrollWidth > nav.clientWidth
          return el === document.activeElement && style.outlineStyle === 'solid' && parseFloat(style.outlineWidth) >= 3 && r.left - margin >= (clipping ? n.left + nav.clientLeft : 0) - 1 && r.right + margin <= (clipping ? n.left + nav.clientLeft + nav.clientWidth : innerWidth) + 1
        })
        assert.equal(visible, true, `focus ${name} at ${width}`)
        focusChecks++
        await review.page.keyboard.press('Enter')
        await review.page.getByRole('heading', { name, exact: true }).waitFor()
      }
    }

    // Render the existing component with invalid destinations; no product backdoor or provider fixture.
    for (const selection of [{ projectId: seed.projects[0].id, proposalId: 'missing' }, { projectId: 'foreign', proposalId: seed.projects[0].proposals[0].id }]) {
      const harness = await isolated()
      await harness.page.evaluate(async ({ project, selection }) => {
        const reactModule = await import('/node_modules/.vite/deps/react.js')
        const React = reactModule.default ?? reactModule
        const domModule = await import('/node_modules/.vite/deps/react-dom_client.js')
        const createRoot = domModule.createRoot ?? domModule.default.createRoot
        const { WorkScreen } = await import('/src/screens/WorkScreen.jsx')
        const host = document.createElement('div'); document.body.replaceChildren(host)
        createRoot(host).render(React.createElement(WorkScreen, { project, proposals: project.proposals, selection, drafts: {}, onHome() {}, onNavigate() {}, onSelectProposal() {}, connection: { available: false, code: 'disconnected' } }))
      }, { project: seed.projects[0], selection })
      await harness.page.getByRole('heading', { name: 'Propuesta no disponible' }).waitFor()
      assert.equal(await harness.page.locator('.proposal-review').count(), 0)
      await fit(harness.page, 'unavailable-target')
    }
    assert.deepEqual(external, [])
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ workflowBrowser: 'PASS', layout: measurements, focusChecks, unloadDialogs, externalAttempts: external.length, consoleErrors: errors.length }))
  } finally {
    for (const context of contexts) await context.close()
    await browser?.close()
    await server.close()
  }
})
