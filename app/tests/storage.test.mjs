import test from 'node:test'
import assert from 'node:assert/strict'
import { createDefaultWorkspace, createLocalProject, migrateLegacyWorkspace, defaultProject, initialProposals, initialSources } from '../src/data/demoData.js'
import { loadWorkspace, persistWorkspace, parseWorkspace, createBackup, recoverBackup, STORAGE_KEY, LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY, upgradeV2 } from '../src/storage.js'
import { makeRequest } from '../src/ai/contracts.js'

const clone = (v) => JSON.parse(JSON.stringify(v))
function memory(entries = {}) {
  const map = new Map(Object.entries(entries))
  const writes = []
  return { map, writes, getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { writes.push(key); map.set(key, value) } }
}
const load = (storage) => loadWorkspace({ createDefaultWorkspace, migrateLegacy: migrateLegacyWorkspace, storage })
const v1 = () => ({ project: { ...defaultProject }, proposals: clone(initialProposals), decisions: [], extraHistoricalData: { keep: true } })
const v2 = () => ({ schemaVersion: 2, revision: 5, writerId: 'old-writer', activeProjectId: defaultProject.id, projects: [{ ...defaultProject, sources: clone(initialSources), proposals: clone(initialProposals), decisions: [], customHistorical: 'preserve' }] })

test('new workspace: v3 demo separate, new personal projects have zero proposals', () => {
  const result = load(memory())
  assert.equal(result.status, 'new')
  const personal = createLocalProject({ name: 'Ficticio', objective: ' Original intacto \n', sources: ' Texto ficticio \n' })
  assert.equal(personal.proposals.length, 0)
  assert.equal(personal.originalRequest, ' Original intacto \n')
  assert.equal(personal.sources[1].content, ' Texto ficticio \n')
  assert.equal(personal.sources[1].selected, false)
  assert.equal(result.workspace.projects[0].mode, 'demo')
  assert.equal(result.workspace.projects[0].proposals[0].origin, 'demo')
})
test('existing v3 run without userRequest is normalized conservatively and raw stays untouched until save', () => {
  const project = createLocalProject({ name: 'Histórico ficticio', objective: 'Solicitud histórica intacta', sources: '' })
  const request = makeRequest(project, 'model-fixture-not-real', 'historical-run')
  delete request.userRequest
  project.runs.push({ id: request.requestId, status: 'interrupted', provider: 'abacus', modelRequested: request.model, request, externalAttempted: false })
  const workspace = createDefaultWorkspace()
  workspace.projects.push(project); workspace.activeProjectId = project.id
  const raw = JSON.stringify(workspace)
  const storage = memory({ [STORAGE_KEY]: raw })
  const loaded = load(storage)
  assert.equal(loaded.status, 'ready')
  assert.equal(loaded.workspace.projects[1].runs[0].request.userRequest, project.originalRequest)
  assert.equal(storage.getItem(STORAGE_KEY), raw)
  assert.equal(storage.writes.length, 0)
  const saved = persistWorkspace(loaded.workspace, 0, 'normalized-writer', storage)
  assert.equal(saved.ok, true)
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).projects[1].runs[0].request.userRequest, project.originalRequest)
})
for (const [name, key, value] of [['v1', LEGACY_STORAGE_KEY, v1()], ['v2', PREVIOUS_STORAGE_KEY, v2()]]) {
  test(name + ' migrates once; originals byte-identical; backup restores in isolated store', () => {
    const raw = JSON.stringify(value, null, 2)
    const s = memory({ [key]: raw })
    const first = load(s)
    assert.equal(first.status, 'migration-pending')
    assert.equal(s.writes.length, 0)
    assert.equal(first.workspace.projects[0].proposals[0].origin, 'unknown')
    assert.deepEqual(first.workspace.projects[0].decisions, value.decisions ?? value.projects[0].decisions)
    const saved = persistWorkspace(first.workspace, 0, 'new-writer', s)
    assert.equal(saved.ok, true)
    assert.equal(s.getItem(key), raw)
    assert.deepEqual(s.writes, [STORAGE_KEY])
    assert.equal(load(s).status, 'ready')
    const before = s.getItem(STORAGE_KEY)
    assert.equal(persistWorkspace(first.workspace, 0, 'strict-mode-second-effect', s).type, 'conflict')
    assert.equal(s.getItem(STORAGE_KEY), before)
    const recovered = recoverBackup(JSON.stringify(createBackup(saved.workspace)))
    assert.equal(recovered.ok, true)
    assert.deepEqual(recovered.workspace, saved.workspace)
    assert.equal(recovered.workspace.predecessors[key], raw)
    const isolated = memory({ [STORAGE_KEY]: JSON.stringify(recovered.workspace), [key]: raw })
    assert.deepEqual(load(isolated).workspace, saved.workspace)
    assert.equal(s.getItem(key), raw)
  })
}
for (const [name, key, raw] of [
  ['invalid JSON', LEGACY_STORAGE_KEY, '{'],
  ['incomplete v1', LEGACY_STORAGE_KEY, '{"project":{}}'],
  ['malformed proposal', LEGACY_STORAGE_KEY, JSON.stringify({ ...v1(), proposals: [{ ...initialProposals[0], title: null }] })],
  ['malformed v1 project', LEGACY_STORAGE_KEY, JSON.stringify({ ...v1(), project: { ...defaultProject, originalRequest: 123 } })],
  ['incompatible v2', PREVIOUS_STORAGE_KEY, '{"schemaVersion":2}'],
  ['invalid v2 previously persisted', PREVIOUS_STORAGE_KEY, JSON.stringify({ ...v2(), projects: [{ ...v2().projects[0], proposals: [{ content: 'broken' }] }] })],
  ['invalid v3', STORAGE_KEY, '{"schemaVersion":3}'],
]) {
  test(name + ': recovery, no writes, raw preserved', () => {
    const s = memory({ [key]: raw })
    const result = load(s)
    assert.equal(result.status, 'recovery-required')
    assert.equal(result.recoveryRaw, raw)
    assert.equal(s.getItem(key), raw)
    assert.deepEqual(s.writes, [])
  })
}
test('v3 existing has precedence even when older data is invalid', () => {
  const raw = JSON.stringify(createDefaultWorkspace())
  const s = memory({ [STORAGE_KEY]: raw, [PREVIOUS_STORAGE_KEY]: '{broken' })
  assert.equal(load(s).status, 'ready')
  assert.equal(s.getItem(STORAGE_KEY), raw)
  assert.equal(s.writes.length, 0)
})
test('v2 existing has precedence over v1, both originals preserved', () => {
  const s = memory({ [PREVIOUS_STORAGE_KEY]: JSON.stringify(v2()), [LEGACY_STORAGE_KEY]: JSON.stringify(v1()) })
  const r = load(s)
  assert.equal(r.workspace.projects[0].customHistorical, 'preserve')
  assert.equal(persistWorkspace(r.workspace, 0, 'writer', s).ok, true)
  assert.equal(s.getItem(PREVIOUS_STORAGE_KEY), JSON.stringify(v2()))
  assert.equal(s.getItem(LEGACY_STORAGE_KEY), JSON.stringify(v1()))
})
test('unknown/custom historical fields and explicit simulation retained', () => {
  const old = v2()
  old.projects[0].proposals[0].source = 'Contenido simulado del producto'
  old.projects[0].proposals[0].evidence = 'Contenido ficticio para probar la interacción. No deriva de las fuentes aportadas a este proyecto.'
  old.projects[0].proposals[0].custom = 'keep'
  const result = load(memory({ [PREVIOUS_STORAGE_KEY]: JSON.stringify(old) }))
  assert.equal(result.workspace.projects[0].proposals[0].origin, 'demo')
  assert.equal(result.workspace.projects[0].proposals[0].custom, 'keep')
  assert.equal(result.workspace.projects[0].proposals[1].origin, 'unknown')
})
test('reserved-field collision is recovery, never silently overwritten', () => {
  const old = v2()
  old.projects[0].mode = 'do-not-overwrite'
  const s = memory({ [PREVIOUS_STORAGE_KEY]: JSON.stringify(old) })
  assert.equal(load(s).status, 'recovery-required')
  assert.equal(s.writes.length, 0)
})
test('read failures at every key: recovery with zero writes, including localStorage accessor', () => {
  for (const key of [STORAGE_KEY, PREVIOUS_STORAGE_KEY, LEGACY_STORAGE_KEY]) {
    const s = memory()
    s.getItem = (k) => { if (k === key) throw new Error('denied'); return null }
    assert.equal(load(s).status, 'recovery-required')
    assert.equal(s.writes.length, 0)
  }
  globalThis.window = Object.defineProperty({}, 'localStorage', { get() { throw new Error('denied') } })
  assert.equal(loadWorkspace({ createDefaultWorkspace, migrateLegacy: migrateLegacyWorkspace }).status, 'recovery-required')
  delete globalThis.window
})
test('write failure leaves migration originals and candidate recoverable', () => {
  const raw = JSON.stringify(v2())
  const s = memory({ [PREVIOUS_STORAGE_KEY]: raw })
  const r = load(s)
  s.setItem = () => { throw new Error('quota') }
  assert.equal(persistWorkspace(r.workspace, 0, 'writer', s).type, 'write-error')
  assert.equal(s.getItem(STORAGE_KEY), null)
  assert.equal(s.getItem(PREVIOUS_STORAGE_KEY), raw)
  assert.equal(recoverBackup(JSON.stringify(createBackup(r.workspace))).ok, true)
})
test('stale tab, deleted key, legacy modification and read error cannot overwrite', () => {
  const s = memory()
  const candidate = createDefaultWorkspace()
  const a = persistWorkspace(candidate, 0, 'A', s)
  assert.equal(a.ok, true)
  assert.equal(persistWorkspace(candidate, 0, 'B', s).type, 'conflict')
  s.map.delete(STORAGE_KEY)
  assert.equal(persistWorkspace(a.workspace, 1, 'A', s).type, 'conflict')
  s.map.set(PREVIOUS_STORAGE_KEY, 'new old-version value')
  assert.equal(persistWorkspace(candidate, 0, 'A', s).type, 'recovery-required')
  s.getItem = () => { throw new Error('read') }
  assert.equal(persistWorkspace(candidate, 0, 'A', s).type, 'read-error')
})
test('invalid v3 and duplicate IDs rejected before any storage access', () => {
  const w = createDefaultWorkspace()
  w.projects[0].proposals.push(w.projects[0].proposals[0])
  assert.equal(persistWorkspace(w, 0, 'x', { getItem() { throw new Error('must not read') } }).type, 'validation-error')
  assert.equal(parseWorkspace(JSON.stringify(w)).ok, false)
})
test('v2 programmatic backup recovery preserves legacy original', () => {
  const recovered = recoverBackup(JSON.stringify({ backupFormat: 'ai-product-discovery-copilot-backup', workspace: v2(), legacyV01: 'raw v1' }))
  assert.equal(recovered.ok, true)
  assert.equal(recovered.workspace.predecessors[LEGACY_STORAGE_KEY], 'raw v1')
  assert.throws(() => upgradeV2({}, {}))
})

// Optional browser retest uses an already-installed Playwright runtime.
// UI_TESTS=1, PLAYWRIGHT_MODULE=file:///.../playwright/index.mjs; no install.
// All browser contexts are disposable. Non-loopback requests are blocked.
test('browser: isolated functional, migration, recovery, concurrency and layout retest', { skip: process.env.UI_TESTS !== '1', timeout: 180000 }, async () => {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE)
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const contexts = []
  const external = []
  const consoleErrors = []
  const layout = []
  let mockedCalls = 0
  async function isolated(seed, fault) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true })
    contexts.push(context)
    await context.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.hostname !== '127.0.0.1') { external.push(url.origin); await route.abort(); return }
      await route.continue()
    })
    await context.addInitScript(({ seed, fault }) => {
      if (!sessionStorage.getItem('seeded-test')) {
        for (const [key, value] of Object.entries(seed ?? {})) localStorage.setItem(key, value)
        sessionStorage.setItem('seeded-test', 'yes')
      }
      if (fault === 'read') Object.defineProperty(window, 'localStorage', { get() { throw new Error('isolated-read-fault') } })
      if (fault === 'write') Storage.prototype.setItem = function () { throw new Error('isolated-write-fault') }
    }, { seed, fault })
    const page = await context.newPage()
    page.on('pageerror', (error) => consoleErrors.push(error.message))
    page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) consoleErrors.push(message.text()) })
    await page.goto('http://127.0.0.1:5173')
    return { page, context }
  }
  async function expectText(page, text) { await page.getByText(text, { exact: false }).first().waitFor() }
  async function fit(page, label) {
    const size = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }))
    assert.ok(size.scroll <= size.width, label + ': ' + JSON.stringify(size))
    layout.push(label + ':' + size.width)
  }
  async function workspace(page) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY) }
  async function nav(page, name) { await page.getByRole('button', { name, exact: true }).click() }
  async function create(page, name) {
    await nav(page, 'Nuevo proyecto')
    await page.getByLabel('Nombre', { exact: true }).fill(name)
    await page.getByLabel('Solicitud original', { exact: true }).fill('Hay demoras en el proceso. ' + 'Largo'.repeat(80))
    await page.getByLabel('Texto de la fuente aportada (opcional)').fill('Texto ficticio de fuente. ' + 'contenido'.repeat(80))
    await page.getByLabel('Nombre de la fuente', { exact: true }).fill('Fuente ficticia ' + 'nombre'.repeat(50))
    await page.getByLabel('Referencia o URL (no se consulta automáticamente)').fill('https://example.invalid/' + 'ruta'.repeat(80))
    await nav(page, 'Crear y continuar')
  }
  try {
    const { page, context } = await isolated()
    for (const width of [320, 360, 390, 430, 1280]) { await page.setViewportSize({ width, height: 844 }); await fit(page, 'projects') }
    await create(page, 'Proyecto A ficticio')
    await nav(page, 'Work')
    await expectText(page, 'Sin propuestas todavía')
    assert.equal((await workspace(page)).projects[1].proposals.length, 0)
    assert.equal(await page.getByRole('button', { name: 'Analizar contenido seleccionado' }).isDisabled(), true)
    await nav(page, 'Comprobar servicio local')
    await expectText(page, 'Análisis no disponible.')
    assert.equal((await workspace(page)).projects[1].runs.length, 0)
    await page.getByLabel(/Fuente ficticia/).check()
    assert.equal((await workspace(page)).projects[1].sources[1].selected, true)
    await nav(page, 'Sources')
    await page.getByRole('button', { name: /Fuente ficticia/ }).click()
    await expectText(page, 'Referencia no consultada')
    await page.reload()
    await page.getByRole('button', { name: /Proyecto A ficticio/ }).click()
    await nav(page, 'Work')
    assert.equal(await page.getByLabel(/Fuente ficticia/).isChecked(), true)
    // Keyboard activation and visible focus of new controls.
    const checkbox = page.getByLabel(/Fuente ficticia/)
    await checkbox.focus()
    await page.keyboard.press('Space')
    assert.equal(await checkbox.isChecked(), false)
    assert.equal(await checkbox.evaluate((el) => getComputedStyle(el).outlineStyle), 'solid')
    await page.keyboard.press('Space')

    // Pure test-only interception. The normal service remains disabled.
    await context.route('http://127.0.0.1:4010/session', (route) => route.fulfill({ json: { available: true, externalEnabled: true, session: 'test-only', model: 'model-fixture-not-real', code: 'ready' }, headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:5173' } }))
    let nextResult = 'complete'
    let delayedResolve
    await context.route('http://127.0.0.1:4010/analysis', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:5173', 'Access-Control-Allow-Headers': 'Content-Type,X-Local-Session', 'Access-Control-Allow-Methods': 'POST' } }); return
      }
      mockedCalls++
      const req = route.request().postDataJSON()
      assert.match(req.userRequest, /^Hay demoras en el proceso\./)
      assert.equal(req.sources[0].content, req.userRequest)
      assert.ok(req.sources.some((source) => source.content.startsWith('Texto ficticio de fuente.')))
      assert.equal(req.contextVersion, JSON.stringify({ projectId: req.projectId, originalRequest: req.userRequest, sources: req.sources }))
      if (nextResult === 'delayed') await new Promise((resolve) => { delayedResolve = resolve })
      const result = nextResult === 'complete' || nextResult === 'delayed' ? { ok: true, externalAttempted: false, modelReported: 'test-only', value: { proposals: [1, 2].map((i) => ({ type: 'Hipótesis', title: 'Propuesta ficticia de prueba ' + i, content: 'Interpretación ficticia ' + i, reasoning: 'Justificación ficticia; no es evidencia de IA.', certainty: 'hypothesis', references: [{ sourceId: req.sources[0].id, quote: 'Hay demoras' }] })) } } : { ok: false, externalAttempted: false, code: nextResult }
      await route.fulfill({ json: result, headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:5173' } })
    })
    await nav(page, 'Comprobar servicio local')
    await expectText(page, 'Conexión disponible')
    await page.getByRole('button', { name: 'Analizar contenido seleccionado' }).dblclick()
    await expectText(page, 'Respuesta completa incorporada')
    assert.equal(mockedCalls, 1)
    assert.equal((await workspace(page)).projects[1].proposals.length, 2)
    await page.getByRole('button', { name: 'Aceptar', exact: true }).dblclick()
    let w = await workspace(page)
    assert.equal(w.projects[1].decisions.length, 1)
    assert.equal(w.projects[1].proposals[1].status, 'pending')
    await nav(page, 'Deliverables')
    await expectText(page, '1 bloque incluido')
    await nav(page, 'Work')
    await page.getByRole('button', { name: /Propuesta ficticia de prueba 1/ }).click()
    await nav(page, 'Reabrir decisión')
    await nav(page, 'Editar')
    await page.getByLabel('Editar propuesta antes de aceptar').fill('Edición humana de prueba')
    await nav(page, 'Guardar y aceptar')
    w = await workspace(page)
    assert.equal(w.projects[1].proposals[0].originalContent, 'Interpretación ficticia 1')
    await nav(page, 'Reabrir decisión')
    await page.getByRole('button', { name: 'Rechazar', exact: true }).focus()
    await page.keyboard.down('Enter')
    await page.keyboard.down('Enter')
    await page.keyboard.up('Enter')
    w = await workspace(page)
    assert.equal(w.projects[1].decisions.length, 5)
    assert.equal(w.projects[1].proposals[1].status, 'pending')
    await page.getByRole('button', { name: /Propuesta ficticia de prueba 2/ }).click()
    await nav(page, 'Mantener pendiente')
    assert.equal((await workspace(page)).projects[1].decisions.length, 5)
    await nav(page, 'Decisions')
    await expectText(page, '5 acciones')
    await nav(page, 'Deliverables')
    await expectText(page, 'Todavía no hay decisiones aceptadas')
    await nav(page, 'AI Activity')
    await expectText(page, 'Operación local · sin envío externo registrado')

    // Layout coverage: real screens, long text; not evidence of recovery behavior.
    for (const width of [320, 360, 390, 430, 1280]) {
      await page.setViewportSize({ width, height: 844 })
      for (const name of ['Overview', 'Work', 'Sources', 'Decisions', 'Deliverables', 'AI Activity']) {
        await nav(page, name)
        await fit(page, name)
      }
    }
    // Error results injected only by this test; no changes to existing proposals.
    await nav(page, 'Work')
    for (const code of ['quota', 'permission', 'error', 'incomplete', 'invalid']) {
      nextResult = code
      await nav(page, 'Analizar contenido seleccionado')
      await page.waitForFunction(({ key, code }) => JSON.parse(localStorage.getItem(key)).projects[1].runs.at(-1)?.status === code, { key: STORAGE_KEY, code })
      assert.equal((await workspace(page)).projects[1].proposals.length, 2)
      for (const width of [320, 360, 390, 430, 1280]) { await page.setViewportSize({ width, height: 844 }); await fit(page, 'analysis-' + code) }
    }
    // Context changes during test-only delayed result => obsolete, not applied.
    nextResult = 'delayed'
    await nav(page, 'Analizar contenido seleccionado')
    await expectText(page, 'Análisis en curso')
    await nav(page, 'Sources')
    await page.getByRole('button', { name: /Fuente ficticia/ }).click()
    await page.getByLabel('Seleccionar este texto para el análisis').uncheck()
    while (!delayedResolve) await new Promise((r) => setTimeout(r, 10))
    delayedResolve()
    await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key)).projects[1].runs.at(-1)?.status === 'stale', STORAGE_KEY)
    assert.equal((await workspace(page)).projects[1].proposals.length, 2)

    // Separate real two-tab storage conflict, not merely a styled banner.
    const tab2 = await context.newPage()
    await tab2.goto('http://127.0.0.1:5173')
    await tab2.getByRole('button', { name: /Proyecto A ficticio/ }).click()
    await nav(tab2, 'Sources')
    await page.getByLabel('Seleccionar este texto para el análisis').check()
    await expectText(tab2, 'Hay cambios de otra pestaña')
    assert.equal(await tab2.getByLabel('Seleccionar este texto para el análisis').isDisabled(), true)
    for (const width of [320, 360, 390, 430, 1280]) { await tab2.setViewportSize({ width, height: 844 }); await fit(tab2, 'conflict') }
    await nav(tab2, 'Cargar cambios externos')
    await tab2.getByRole('button', { name: /Proyecto A ficticio/ }).click()
    await nav(tab2, 'Sources')
    // Reset stale page explicitly; two independent projects afterwards.
    await page.reload()
    await create(page, 'Proyecto B ficticio')
    assert.equal((await workspace(page)).projects.length, 3)
    assert.equal((await workspace(page)).projects[1].decisions.length, 5)
    assert.equal((await workspace(page)).projects[2].decisions.length, 0)
    await page.getByRole('button', { name: /AI Discovery Copilot/ }).click()
    await nav(page, 'Nuevo proyecto')
    await page.getByLabel('Solicitud original', { exact: true }).fill('texto-largo'.repeat(150))
    await page.getByLabel('Texto de la fuente aportada (opcional)').fill('fuente-larga'.repeat(150))
    for (const width of [320, 360, 390, 430, 1280]) { await page.setViewportSize({ width, height: 844 }); await fit(page, 'new-project-long-text') }

    // Near-simultaneous writes in isolated tabs; this is NOT an atomicity guarantee.
    const { page: raceA, context: raceContext } = await isolated()
    const raceB = await raceContext.newPage()
    await raceB.goto('http://127.0.0.1:5173')
    const raceSnapshot = await workspace(raceA)
    const raceWrite = (tab, writer) => tab.evaluate(async ({ snapshot, writer }) => {
      const { persistWorkspace } = await import('/src/storage.js')
      const candidate = structuredClone(snapshot)
      candidate.projects[0].name = writer
      const result = persistWorkspace(candidate, snapshot.revision, writer)
      return { ok: result.ok, type: result.type ?? 'saved' }
    }, { snapshot: raceSnapshot, writer })
    const raceResults = await Promise.all([raceWrite(raceA, 'race-A-fictional'), raceWrite(raceB, 'race-B-fictional')])
    assert.ok(raceResults.some((result) => result.ok))
    assert.ok(raceResults.every((result) => result.ok || result.type === 'conflict'))
    assert.ok(parseWorkspace(await raceA.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).ok)
    console.log('Near-simultaneous isolated writes (residual non-atomic race remains):', JSON.stringify(raceResults))

    // Functional migration under React StrictMode, and raw storage assertions.
    for (const [key, value] of [[LEGACY_STORAGE_KEY, v1()], [PREVIOUS_STORAGE_KEY, v2()]]) {
      const raw = JSON.stringify(value)
      const { page: mp } = await isolated({ [key]: raw })
      await expectText(mp, 'Estado migrado a v0.3')
      assert.equal(await mp.evaluate((k) => localStorage.getItem(k), key), raw)
      assert.equal((await workspace(mp)).revision, 1)
      await mp.reload()
      assert.equal((await workspace(mp)).revision, 1)
      assert.equal(await mp.evaluate((k) => localStorage.getItem(k), key), raw)
    }
    for (const key of [LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY, STORAGE_KEY]) {
      const raw = '{"incompatible":true}'
      const { page: rp } = await isolated({ [key]: raw })
      await expectText(rp, 'Recuperación requerida')
      assert.equal(await rp.evaluate((k) => localStorage.getItem(k), key), raw)
      if (key !== STORAGE_KEY) assert.equal(await rp.evaluate((k) => localStorage.getItem(k), STORAGE_KEY), null)
      const downloadPromise = rp.waitForEvent('download')
      await nav(rp, 'Rescatar original')
      const download = await downloadPromise
      const stream = await download.createReadStream()
      let downloaded = ''
      for await (const chunk of stream) downloaded += chunk.toString()
      assert.equal(JSON.parse(downloaded).raw, raw)
      for (const width of [320, 360, 390, 430, 1280]) { await rp.setViewportSize({ width, height: 844 }); await fit(rp, 'recovery') }
    }
    const { page: readPage } = await isolated(null, 'read')
    await expectText(readPage, 'Recuperación requerida')
    const { page: writePage } = await isolated(null, 'write')
    await expectText(writePage, 'No se pudo crear el nuevo almacenamiento')
    await create(writePage, 'No persistido ficticio')
    await expectText(writePage, 'Los cambios siguen en esta pestaña')
    assert.equal(await writePage.evaluate((k) => localStorage.getItem(k), STORAGE_KEY), null)
    const downloadPromise = writePage.waitForEvent('download')
    await nav(writePage, 'Exportar respaldo')
    const download = await downloadPromise
    const stream = await download.createReadStream()
    let backupRaw = ''
    for await (const chunk of stream) backupRaw += chunk.toString()
    const recovered = recoverBackup(backupRaw)
    assert.equal(recovered.ok, true)
    assert.equal(recovered.workspace.projects[1].name, 'No persistido ficticio')
    for (const width of [320, 360, 390, 430, 1280]) { await writePage.setViewportSize({ width, height: 844 }); await fit(writePage, 'write-error') }
    assert.deepEqual(external, [])
    assert.deepEqual(consoleErrors, [])
    console.log('Browser evidence:', JSON.stringify({ browser: browser.version(), layoutChecks: layout.length, mockProviderCalls: mockedCalls, externalRequests: external.length, consoleErrors: consoleErrors.length }))
  } finally {
    for (const context of contexts) await context.close()
    await browser.close()
  }
})
