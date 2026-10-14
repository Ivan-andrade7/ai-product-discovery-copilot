import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import net from 'node:net'
import { EventEmitter } from 'node:events'
import { createTrialLedger, ONE_SHOT_AUTHORIZATION, SECOND_SHOT_AUTHORIZATION } from '../server/trial-ledger.mjs'
import { createAbacusTrial } from '../server/trial.mjs'
import { createOneShotTrial } from '../server/one-shot.mjs'
import { createLocalProject } from '../src/data/demoData.js'
import { makeRequest } from '../src/ai/contracts.js'
import { TRIAL_MODEL } from '../server/providers/abacus-transport.mjs'

const dirs = []
const connect = net.Socket.prototype.connect
let network = 0
net.Socket.prototype.connect = () => { network++; throw new Error('Network forbidden') }
test.after(() => {
  net.Socket.prototype.connect = connect
  assert.equal(network, 0)
  for (const dir of dirs) {
    assert.equal(path.dirname(dir), os.tmpdir())
    assert.ok(path.basename(dir).startsWith('copilot-one-shot-'))
    fs.rmSync(dir, { recursive: true })
  }
})
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-one-shot-')); dirs.push(dir)
  const file = path.join(dir, 'ledger.json')
  const ledger = createTrialLedger(file)
  ledger.initializeFromCatalog({ marker: { requestCount: 1, kind: 'catalog', maximumTotal: 5 }, result: { requestCount: 1, outcome: 'catalog-read', modelId: TRIAL_MODEL } })
  const project = createLocalProject({ name: 'Ficticio', objective: 'Analiza brevemente.' })
  return { file, ledger, request: makeRequest(project, TRIAL_MODEL) }
}
test('explicit one-shot preserves unknown catalog, reserves 2/5, restart cannot repeat', () => {
  const { file, ledger } = fixture()
  const catalog = structuredClone(ledger.state().attempts[0])
  assert.throws(() => ledger.reserveOneShot(ONE_SHOT_AUTHORIZATION))
  ledger.authorizeOneShot(ONE_SHOT_AUTHORIZATION)
  assert.throws(() => ledger.authorizeOneShot(ONE_SHOT_AUTHORIZATION))
  assert.equal(createTrialLedger(file).oneShotState().available, true)
  const ticket = ledger.reserveOneShot(ONE_SHOT_AUTHORIZATION)
  const reopened = createTrialLedger(file)
  assert.equal(ticket.requestNumber, 2)
  assert.deepEqual(reopened.state().attempts[0], catalog)
  assert.equal(reopened.state().attempts[1].maximumCredits, null)
  assert.equal(reopened.state().usedCredits, null)
  assert.equal(reopened.state().halted, true)
  assert.equal(reopened.oneShotState().available, false)
  assert.throws(() => reopened.reserveOneShot(ONE_SHOT_AUTHORIZATION))
  assert.throws(() => reopened.reserve({ expectedCount: 2, maximumCredits: 0, maximumTotal: 5, budgetCredits: 140 }))
})
test('unarmed/missing/incompatible ledger and oversized/multiple sources stay offline', async () => {
  const { file, ledger, request } = fixture()
  let calls = 0
  const trial = createOneShotTrial({ apiKey: 'fixture-only', accounting: ledger, requestImpl: () => { calls++; throw new Error() } })
  assert.equal((await trial.analyze(request)).externalAttempted, false)
  ledger.authorizeOneShot(ONE_SHOT_AUTHORIZATION)
  for (const sources of [[{ id: 's', name: 's', content: 'x'.repeat(1001) }], [{ id: 's1', name: 's1', content: 'x' }, { id: 's2', name: 's2', content: 'y' }]]) {
    const value = { ...request, sources, contextVersion: JSON.stringify({ projectId: request.projectId, originalRequest: request.userRequest, sources }) }
    assert.equal((await trial.analyze(value)).externalAttempted, false)
  }
  assert.equal(calls, 0); assert.equal(ledger.state().requestCount, 1)
  fs.writeFileSync(file, '{}')
  assert.equal(trial.status().available, false)
  assert.equal((await trial.analyze(request)).externalAttempted, false)
})
for (const success of [true, false]) test('mock one-shot ' + (success ? 'success' : 'failure') + ': exact wire and persistent posterior block', async () => {
  const { file, ledger, request } = fixture()
  ledger.authorizeOneShot(ONE_SHOT_AUTHORIZATION)
  let calls = 0
  const requestImpl = (url, options, callback) => {
    calls++
    assert.equal(ledger.state().requestCount, 2)
    assert.equal(ledger.state().halted, true)
    const req = new EventEmitter()
    req.setTimeout = () => req; req.destroy = () => {}
    req.end = (payload) => {
      const wire = JSON.parse(payload)
      assert.equal(wire.model, TRIAL_MODEL); assert.equal(wire.max_tokens, 500); assert.equal(wire.stream, false)
      assert.deepEqual(Object.keys(wire).sort(), ['max_tokens', 'messages', 'model', 'stream'])
      assert.equal(JSON.parse(wire.messages[1].content).request, request.userRequest)
      assert.deepEqual(JSON.parse(wire.messages[2].content).sources, request.sources)
      queueMicrotask(() => {
        const res = new EventEmitter(); res.statusCode = success ? 200 : 403; res.destroy = () => {}
        callback(res)
        res.emit('data', Buffer.from(JSON.stringify({ model: TRIAL_MODEL, choices: [{ finish_reason: 'stop', message: { content: '{"proposals":[]}' } }], usage: { total_tokens: 15 } })))
        res.emit('end')
      })
    }
    return req
  }
  const trial = createOneShotTrial({ apiKey: 'fixture-only', accounting: ledger, requestImpl })
  const result = await trial.analyze(request)
  assert.equal(result.ok, success)
  assert.equal(calls, 1)
  assert.equal((await trial.analyze(request)).externalAttempted, false)
  const fresh = createOneShotTrial({ apiKey: 'fixture-only', accounting: createTrialLedger(file), requestImpl })
  assert.equal(fresh.status().available, false)
  assert.equal((await fresh.analyze(request)).externalAttempted, false)
  assert.equal(calls, 1); assert.equal(ledger.state().requestCount, 2)
  assert.equal(ledger.state().attempts[1].credits, null)
  assert.equal(ledger.state().halted, true)
  trial.close(); fresh.close()
})
for (const success of [true, false]) test('second grant ' + (success ? 'success' : 'rejection') + ': preserves first failure, 3/5, finish and diagnosis, restart closed', async () => {
  const { file, ledger, request } = fixture()
  ledger.authorizeOneShot(ONE_SHOT_AUTHORIZATION)
  const first = ledger.reserveOneShot(ONE_SHOT_AUTHORIZATION)
  ledger.record({ ...first, httpStatus: 200, code: null, externalAttempted: true, usage: null, modelReported: TRIAL_MODEL })
  ledger.finalize({ requestNumber: 2, ok: false, code: 'invalid' })
  const history = ledger.state().attempts
  ledger.authorizeSecondShot(SECOND_SHOT_AUTHORIZATION)
  assert.throws(() => ledger.authorizeSecondShot(SECOND_SHOT_AUTHORIZATION))
  assert.equal(ledger.state().halted, true)
  assert.equal(ledger.oneShotState().available, false)
  assert.equal(createAbacusTrial({ accounting: ledger }).status().available, false)
  let calls = 0
  const requestImpl = (url, options, callback) => {
    calls++
    assert.equal(ledger.state().requestCount, 3)
    assert.equal(ledger.state().halted, true)
    const req = new EventEmitter(); req.setTimeout = () => req; req.destroy = () => {}
    req.end = (payload) => {
      const wire = JSON.parse(payload)
      assert.equal(wire.max_tokens, 500)
      assert.equal(JSON.parse(wire.messages[2].content).sources.length, 1)
      queueMicrotask(() => {
        const res = new EventEmitter(); res.statusCode = 200; res.destroy = () => {}
        callback(res)
        res.emit('data', Buffer.from(JSON.stringify({ model: TRIAL_MODEL, choices: [{ finish_reason: 'stop', message: { content: success ? '{"proposals":[]}' : '{bad' } }], usage: { total_tokens: 15 } })))
        res.emit('end')
      })
    }
    return req
  }
  const trial = createOneShotTrial({ apiKey: 'fixture-only', accounting: ledger, requestImpl, authorization: SECOND_SHOT_AUTHORIZATION })
  const result = await trial.analyze(request)
  assert.equal(result.ok, success); assert.equal(result.finishReason, 'stop')
  const fresh = createTrialLedger(file)
  assert.deepEqual(fresh.state().attempts.slice(0, 2), history)
  assert.equal(fresh.state().requestCount, 3); assert.equal(fresh.state().usedCredits, null)
  assert.equal(fresh.oneShotState(SECOND_SHOT_AUTHORIZATION).available, false)
  assert.equal(fresh.state().attempts[2].responseMeta.finishReason, 'stop')
  assert.deepEqual(fresh.state().attempts[2].responseMeta.diagnostic, success ? null : { stage: 'json_parse', reason: 'invalid_json' })
  assert.throws(() => fresh.reserveSecondShot(SECOND_SHOT_AUTHORIZATION))
  assert.throws(() => fresh.authorizeSecondShot(SECOND_SHOT_AUTHORIZATION))
  assert.equal((await trial.analyze(request)).externalAttempted, false)
  const reopened = createOneShotTrial({ apiKey: 'fixture-only', accounting: fresh, requestImpl, authorization: SECOND_SHOT_AUTHORIZATION })
  assert.equal(reopened.status().available, false)
  assert.equal(calls, 1)
  trial.close(); reopened.close()
})
