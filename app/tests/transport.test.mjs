import test from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import { EventEmitter } from 'node:events'
import { createAbacusTransport, TRIAL_MODEL } from '../server/providers/abacus-transport.mjs'
import { createAbacusTrial, createTrialAdmission } from '../server/trial.mjs'
import { createLocalProject } from '../src/data/demoData.js'
import { makeRequest, startAnalysis, finishAnalysis } from '../src/ai/contracts.js'
import { createAbacusAdapter } from '../server/providers/abacus.mjs'

// Exclusively fictitious transports and credentials. Any actual network fails.
const realConnect = net.Socket.prototype.connect
const realFetch = globalThis.fetch
let networkAttempts = 0
net.Socket.prototype.connect = function () { networkAttempts++; throw new Error('Network forbidden in transport tests') }
globalThis.fetch = () => { networkAttempts++; throw new Error('Network forbidden in transport tests') }
test.after(() => { net.Socket.prototype.connect = realConnect; globalThis.fetch = realFetch; assert.equal(networkAttempts, 0) })
const fakeKey = 'fixture-secret-never-a-real-key'
function setup(overrides = {}) {
  const state = { requestCount: 1, usedCredits: 0, reconciled: true, reconciledThroughRequest: 1, ...overrides }
  const records = []
  const quoteInputs = []
  const accounting = {
    state: () => ({ ...state }),
    reserve({ expectedCount }) {
      if (state.requestCount !== expectedCount) throw new Error('conflict')
      state.requestCount++
      state.reconciled = false
      return { id: 'fixture-' + state.requestCount, requestNumber: state.requestCount }
    },
    record: (value) => records.push(value),
  }
  const quoteCredits = async (input) => { quoteInputs.push(input); return { unit: 'credits', maximumCredits: 30, boundVerified: true, evidence: 'Fictitious tariff and bound for isolated tests only' } }
  return { state, records, accounting, quoteCredits, quoteInputs, enabled: true }
}
function fixture() {
  const project = createLocalProject({ name: 'Prueba ficticia', objective: 'Hay demoras en el proceso.', sources: 'No seleccionado' })
  const request = makeRequest(project, TRIAL_MODEL, 'trial-fixture')
  const proposals = [{ type: 'Hipótesis', title: 'Demoras', content: 'Hipótesis ficticia', reasoning: 'Falta confirmar impacto.', certainty: 'hypothesis', references: [{ sourceId: project.sources[0].id, quote: 'Hay demoras' }] }]
  const reply = { model: TRIAL_MODEL, choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ proposals }) } }], usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150, private_field: fakeKey } }
  return { project, request, reply }
}
function fakeHttp(reply, { status = 200, raw, hang = false, timeout = false, throwOnRequest = false } = {}) {
  const calls = []
  const impl = (url, options, callback) => {
    calls.push({ url, method: options.method })
    if (throwOnRequest) throw new Error(fakeKey)
    assert.equal(options.headers.Authorization, 'Bearer ' + fakeKey)
    const req = new EventEmitter()
    req.setTimeout = (delay, fn) => { if (timeout && delay) queueMicrotask(fn); return req }
    req.destroy = () => { req.destroyed = true }
    req.end = (payload) => {
      assert.equal(JSON.parse(payload).model, TRIAL_MODEL)
      assert.equal(payload.includes('No seleccionado'), false)
      if (hang || timeout) return
      queueMicrotask(() => {
        if (req.destroyed) return
        const res = new EventEmitter()
        res.statusCode = status
        res.destroy = () => { res.destroyed = true }
        callback(res)
        if (!res.destroyed) { res.emit('data', Buffer.from(raw ?? JSON.stringify(reply))); if (!res.destroyed) res.emit('end') }
      })
    }
    return req
  }
  return { calls, impl }
}

test('transport default closed even with a fake credential; no socket or fetch', async () => {
  const trial = createAbacusTrial({ apiKey: fakeKey })
  assert.equal(trial.status().available, false)
  assert.equal((await trial.analyze(fixture().request)).code, 'cost_pending')
  trial.close()
})
test('dollars, unverified bounds and missing catalog reconciliation never admit a request', async () => {
  for (const quote of [
    { unit: 'USD', maximumCredits: 0.144, boundVerified: true, evidence: 'Not credit pricing' },
    { unit: 'credits', maximumCredits: 30, boundVerified: false, evidence: 'Estimate only' },
    { unit: 'credits', maximumCredits: 30, boundVerified: true, evidence: '' },
  ]) {
    const config = setup()
    const http = fakeHttp(fixture().reply)
    const trial = createAbacusTrial({ ...config, apiKey: fakeKey, quoteCredits: () => quote, requestImpl: http.impl })
    assert.equal((await trial.analyze(fixture().request)).code, 'cost_pending')
    assert.equal(config.state.requestCount, 1)
    assert.equal(http.calls.length, 0)
    trial.close()
  }
  assert.equal(createTrialAdmission(setup({ usedCredits: null })).status().available, false)
  assert.equal(createTrialAdmission(setup({ reconciled: false })).status().available, false)
})
test('140-credit and five-request caps include the earlier catalog; failed reservations stay offline', async () => {
  for (const initial of [{ usedCredits: 111 }, { requestCount: 5, reconciledThroughRequest: 5 }]) {
    const config = setup(initial)
    const http = fakeHttp(fixture().reply)
    const trial = createAbacusTrial({ ...config, apiKey: fakeKey, requestImpl: http.impl })
    assert.equal((await trial.analyze(fixture().request)).code, 'budget_blocked')
    assert.equal(http.calls.length, 0)
  }
  const config = setup()
  config.accounting.reserve = () => { throw new Error('isolated-write-failure') }
  const http = fakeHttp(fixture().reply)
  assert.equal((await createAbacusTrial({ ...config, apiKey: fakeKey, requestImpl: http.impl }).analyze(fixture().request)).code, 'budget_blocked')
  assert.equal(http.calls.length, 0)
})
test('successful mocked HTTP: selected text, sanitized usage, immutable proposal, credit reconciliation blocks next', async () => {
  const config = setup()
  const { project, request, reply } = fixture()
  const http = fakeHttp(reply)
  const trial = createAbacusTrial({ ...config, apiKey: fakeKey, requestImpl: http.impl })
  const result = await trial.analyze(request)
  assert.equal(result.ok, true)
  assert.equal(result.trialRequestNumber, 2)
  assert.deepEqual(result.usage, { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 })
  assert.equal(JSON.stringify(result).includes(fakeKey), false)
  assert.equal(JSON.stringify(config.records).includes(fakeKey), false)
  assert.deepEqual(Object.keys(config.quoteInputs[0]).sort(), ['bodyBytes', 'inputChars', 'maxOutputTokens'])
  assert.equal(JSON.stringify(config.quoteInputs).includes(request.userRequest), false)
  assert.equal(JSON.stringify(config.quoteInputs).includes(request.sources[0].content), false)
  const finished = finishAnalysis(startAnalysis(project, request).project, request, result)
  assert.deepEqual(finished.runs[0].usage, result.usage)
  assert.equal(finished.proposals[0].originalContent, 'Hipótesis ficticia')
  assert.equal(trial.status().available, false)
  await trial.analyze(request)
  assert.equal(http.calls.length, 1)
  // Fictitious reconciliation belongs exclusively to this isolated test.
  config.state.usedCredits = 12
  config.state.reconciled = true
  config.state.reconciledThroughRequest = 2
  trial.reconcile()
  assert.equal(trial.status().available, true)
  trial.close()
  assert.equal(trial.status().available, false)
})
for (const [label, options, code] of [
  ['permission', { status: 401 }, 'permission'],
  ['quota', { status: 402 }, 'quota'],
  ['rate limit', { status: 429 }, 'rate_limit'],
  ['redirect', { status: 307 }, 'error'],
  ['bad JSON', { raw: 'broken' }, 'invalid'],
  ['response too large', { raw: 'x'.repeat(262145) }, 'invalid'],
  ['timeout', { timeout: true }, 'error'],
  ['transport exception containing a fake secret', { throwOnRequest: true }, 'error'],
]) {
  test('mocked ' + label + ': counts once, stops, no retry or secret output', async () => {
    const config = setup()
    const http = fakeHttp(fixture().reply, options)
    const trial = createAbacusTrial({ ...config, apiKey: fakeKey, requestImpl: http.impl })
    const result = await trial.analyze(fixture().request)
    assert.equal(result.code, code)
    assert.equal(result.externalAttempted, true)
    assert.equal(config.state.requestCount, 2)
    assert.equal(JSON.stringify(result).includes(fakeKey), false)
    await trial.analyze(fixture().request)
    assert.equal(http.calls.length, 1)
    trial.close()
  })
}
test('wrong model and oversized selected text stay offline; no substitution', async () => {
  const config = setup()
  const http = fakeHttp(fixture().reply)
  const trial = createAbacusTrial({ ...config, apiKey: fakeKey, requestImpl: http.impl })
  assert.equal((await trial.analyze({ ...fixture().request, model: 'route-llm' })).code, 'invalid')
  const { request } = fixture()
  request.sources[0].content = 'x'.repeat(6001)
  assert.equal((await trial.analyze(request)).code, 'invalid')
  assert.equal(http.calls.length, 0)
})
test('concurrent activations reserve once; in-flight cancellation is counted and cannot retry', async () => {
  const config = setup()
  const http = fakeHttp(fixture().reply, { hang: true })
  const trial = createAbacusTrial({ ...config, apiKey: fakeKey, requestImpl: http.impl })
  const controller = new AbortController()
  const first = trial.analyze(fixture().request, { signal: controller.signal })
  await new Promise((resolve) => setImmediate(resolve))
  const second = await trial.analyze(fixture().request)
  assert.equal(second.ok, false)
  assert.equal(http.calls.length, 1)
  controller.abort()
  const cancelled = await first
  assert.equal(cancelled.code, 'cancelled')
  assert.equal(cancelled.externalAttempted, true)
  assert.equal(config.state.requestCount, 2)
  trial.close()
})
test('reported model mismatch and truncated generation stop without proposals', async () => {
  for (const change of [{ model: 'different-model' }, { choices: [{ finish_reason: 'length', message: { content: '{}' } }] }]) {
    const config = setup()
    const http = fakeHttp({ ...fixture().reply, ...change })
    const trial = createAbacusTrial({ ...config, apiKey: fakeKey, requestImpl: http.impl })
    const { project, request } = fixture()
    const result = await trial.analyze(request)
    assert.equal(result.ok, false)
    assert.equal(finishAnalysis(startAnalysis(project, request).project, request, result).proposals.length, 0)
    assert.equal(trial.status().available, false)
  }
})
test('aborted before admission makes zero mock HTTP calls', async () => {
  const config = setup()
  const http = fakeHttp(fixture().reply)
  const admission = createTrialAdmission(config)
  const transport = createAbacusTransport({ apiKey: fakeKey, admission, requestImpl: http.impl })
  const controller = new AbortController()
  controller.abort()
  assert.equal((await createAbacusAdapter(transport).analyze(fixture().request, { signal: controller.signal })).code, 'cancelled')
  assert.equal(http.calls.length, 0)
  assert.equal(config.state.requestCount, 1)
})
