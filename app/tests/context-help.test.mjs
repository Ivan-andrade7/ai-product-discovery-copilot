import test from 'node:test'
import assert from 'node:assert/strict'
import { helpPosition, sectionHelp, conceptHelp } from '../src/components/help-content.js'

test('help content distinguishes human decisions, simulation and unavailable public AI', () => {
  assert.match(sectionHelp.Revisión, /Pendiente.*Aceptada.*Rechazada/)
  assert.match(sectionHelp.Decisiones, /no convierte un supuesto en evidencia/)
  assert.match(conceptHelp.analysis, /IA pública sigue deshabilitada/)
  assert.match(conceptHelp.creation, /No ejecuta IA ni genera propuestas/)
})

test('help placement clamps long content and edge triggers to the viewport', () => {
  for (const width of [320, 390, 768, 901, 1024, 1280, 1440]) {
    for (const left of [0, width - 44]) {
      const panelWidth = Math.min(350, width - 32)
      const position = helpPosition({ left, top: 760, bottom: 804 }, panelWidth, 400, width, 844)
      assert.ok(position.left >= 16)
      assert.ok(position.left + panelWidth <= width - 16)
      assert.ok(position.top >= 16 && position.top + 400 <= 828)
    }
  }
})

test('context help browser: native popover, dialog, keyboard, navigation and reflow without external traffic', { skip: process.env.WORKFLOW_UI_TESTS !== '1', timeout: 90000 }, async () => {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE)
  const { createServer } = await import('vite')
  const server = await createServer({ server: { host: '127.0.0.1', port: 0, open: false } })
  await server.listen()
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  let browser
  const external = [], errors = [], measurements = []
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true })
    const context = await browser.newContext()
    await context.route('**/*', async route => {
      if (new URL(route.request().url()).origin !== origin) { external.push(route.request().url()); await route.abort() }
      else await route.continue()
    })
    const page = await context.newPage()
    async function expanded(control, value) {
      const id = await control.getAttribute('aria-controls')
      // Native toggle events are queued; wait for React to reflect the observed state.
      await page.locator(`button[aria-controls="${id}"][aria-expanded="${value}"]`).waitFor()
      assert.equal(await control.getAttribute('aria-expanded'), value)
    }
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(origin)
    await page.getByRole('button', { name: /Discovery v0.1/ }).click()
    const demo = page.getByRole('button', { name: 'Ayuda: Demo · no validado', exact: true })
    await demo.press('Enter')
    await expanded(demo, 'true')
    assert.equal(await page.locator('.context-help:popover-open').count(), 1)
    await demo.press('Escape')
    await expanded(demo, 'false')
    assert.equal(await demo.evaluate(element => element === document.activeElement), true)
    await demo.click()
    const section = page.getByRole('button', { name: 'Ayuda: Resumen', exact: true })
    await section.click()
    assert.equal(await page.locator('.context-help:popover-open').count(), 1)
    await expanded(demo, 'false')
    await page.getByRole('button', { name: 'Cerrar ayuda', exact: true }).click()
    assert.equal(await section.evaluate(element => element === document.activeElement), true)
    await section.press('Space')
    await page.getByRole('button', { name: 'Cerrar ayuda', exact: true }).press('Escape')
    assert.equal(await section.evaluate(element => element === document.activeElement), true)
    await section.click(); await section.click()
    await expanded(section, 'false')
    const guide = page.getByRole('button', { name: 'Ayuda', exact: true })
    await guide.press('Enter')
    assert.equal(await page.getByRole('dialog', { name: 'Cómo usar la plataforma' }).isVisible(), true)
    assert.equal(await page.getByRole('button', { name: 'Cerrar guía' }).evaluate(element => element === document.activeElement), true)
    await page.getByRole('button', { name: 'Cerrar guía' }).press('Tab')
    assert.equal(await page.getByRole('button', { name: 'Cerrar guía' }).evaluate(element => element === document.activeElement), true)
    await page.getByRole('button', { name: 'Cerrar guía' }).press('Escape')
    assert.equal(await guide.evaluate(element => element === document.activeElement), true)
    for (const width of [320, 390, 768, 901, 902, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 844 })
      for (const name of ['Resumen', 'Revisión', 'Fuentes', 'Decisiones', 'Entregables', 'Actividad de IA']) {
        await page.getByRole('button', { name, exact: true }).click()
        await page.getByRole('button', { name: `Ayuda: ${name}`, exact: true }).click()
        const bounds = await page.locator('.context-help:popover-open').boundingBox()
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width)
        assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 844)
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true)
        measurements.push({ width, view: name, document: await page.evaluate(() => document.documentElement.scrollWidth) })
        await page.getByRole('button', { name: 'Cerrar ayuda', exact: true }).click()
      }
      await guide.click()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true)
      await page.getByRole('button', { name: 'Cerrar guía' }).click()
    }
    await page.getByRole('button', { name: '← Volver a proyectos', exact: true }).click()
    await page.getByRole('button', { name: 'Nuevo proyecto', exact: true }).click()
    await page.getByRole('button', { name: 'Ayuda: Crear proyecto', exact: true }).click()
    await page.getByText(conceptHelp.creation, { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Cerrar ayuda', exact: true }).click()
    await page.getByLabel('Nombre', { exact: true }).fill('Ensayo ficticio ' + 'NombreContinuo'.repeat(18))
    await page.getByLabel('Solicitud original', { exact: true }).fill('Conservar un pedido ficticio, sin ejecutar IA.')
    await page.getByRole('button', { name: 'Crear y continuar', exact: true }).click()
    await page.setViewportSize({ width: 320, height: 422 })
    await page.getByRole('button', { name: 'Revisión', exact: true }).click()
    await page.getByRole('button', { name: 'Ayuda: Revisión', exact: true }).click()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true)
    const longPanel = await page.locator('.context-help:popover-open').boundingBox()
    assert.ok(longPanel.y >= 0 && longPanel.y + longPanel.height <= 422)
    await page.getByRole('button', { name: 'Cerrar ayuda', exact: true }).click()
    const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    await touchContext.route('**/*', async route => {
      if (new URL(route.request().url()).origin !== origin) { external.push(route.request().url()); await route.abort() }
      else await route.continue()
    })
    const touch = await touchContext.newPage()
    await touch.goto(origin)
    await touch.getByRole('button', { name: 'Ayuda: Demo · no validado', exact: true }).tap()
    assert.equal(await touch.locator('.context-help:popover-open').count(), 1)
    await touch.getByRole('button', { name: 'Cerrar ayuda', exact: true }).tap()
    assert.equal(await touch.locator('.context-help:popover-open').count(), 0)
    await touchContext.close()
    assert.deepEqual(external, [])
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ helpMeasurements: measurements, external: external.length, errors }))
  } finally { await browser?.close(); await server.close() }
})
