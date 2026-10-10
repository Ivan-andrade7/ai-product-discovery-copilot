import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import net from 'node:net'
import http from 'node:http'
import { createHash } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { createTrialLedger } from '../server/trial-ledger.mjs'
import { createAbacusTrial, createTrialAdmission } from '../server/trial.mjs'
import { createLocalService } from '../server/index.mjs'
import { TRIAL_MODEL } from '../server/providers/abacus-transport.mjs'
import { createLocalProject } from '../src/data/demoData.js'
import { makeRequest } from '../src/ai/contracts.js'

const dirs = []
const connect = net.Socket.prototype.connect
const fetch = globalThis.fetch
let external = 0
net.Socket.prototype.connect = function (...args) {
  const options = args[0]?.[0] ?? args[0]
  if (options?.host !== '127.0.0.1') { external++; throw new Error('External traffic forbidden') }
  return connect.apply(this, args)
}
globalThis.fetch = () => { external++; throw new Error('External traffic forbidden') }
test.after(() => {
  net.Socket.prototype.connect = connect; globalThis.fetch = fetch
  assert.equal(external, 0)
  for (const dir of dirs) {
    assert.equal(path.dirname(dir), os.tmpdir())
    assert.ok(path.basename(dir).startsWith('copilot-ledger-test-'))
    fs.rmSync(dir, { recursive: true })
  }
})
const marker = { requestCount: 1, kind: 'catalog', maximumTotal: 5 }
const result = { requestCount: 1, outcome: 'catalog-read', modelId: TRIAL_MODEL }
const quoteCredits = () => ({ unit: 'credits', maximumCredits: 30, boundVerified: true, evidence: 'ISOLATED-FICTITIOUS-QUOTE' })
function fixture({ reconciled = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-ledger-test-')); dirs.push(dir)
  const file = path.join(dir, 'ledger.json')
  const ledger = createTrialLedger(file)
  ledger.initializeFromCatalog({ marker, result })
  if (reconciled) ledger.reconcile({ id: ledger.state().attempts[0].id, credits: 2, evidenceRef: 'fixture-catalog-charge' })
  return { dir, file, ledger }
}
const reserve = (ledger) => ledger.reserve({ expectedCount: ledger.state().requestCount, maximumCredits: 30, maximumTotal: 5, budgetCredits: 140 })
function complete(ledger, ticket, { status = 200, code = null, ok = true } = {}) {
  ledger.record({ ...ticket, httpStatus: status, code, externalAttempted: true, usage: { total_tokens: 150, apiKey: 'SECRET-SENTINEL' }, modelReported: TRIAL_MODEL })
  ledger.finalize({ requestNumber: ticket.requestNumber, ok })
}
function admission(ledger) { return createTrialAdmission({ enabled: true, accounting: ledger, quoteCredits }) }
function rewrite(file, change) {
  const envelope = JSON.parse(fs.readFileSync(file, 'utf8'))
  change(envelope.data)
  envelope.checksum = createHash('sha256').update(JSON.stringify(envelope.data)).digest('hex')
  fs.writeFileSync(file, JSON.stringify(envelope))
}

test('explicit import retains real catalog count 1/5 with UNKNOWN charge; no overwrite or startup reset', () => {
  const { file, ledger } = fixture()
  const before = fs.readFileSync(file, 'utf8')
  const state = createTrialLedger(file).state()
  assert.equal(state.requestCount, 1); assert.equal(state.maximumTotal, 5); assert.equal(state.budgetCredits, 140)
  assert.equal(state.usedCredits, null); assert.equal(state.reconciledCredits, 0); assert.equal(state.pending.length, 1)
  assert.equal(state.pending[0].status, 'completed'); assert.equal(admission(ledger).status().available, false)
  assert.throws(() => ledger.initializeFromCatalog({ marker, result }))
  assert.equal(fs.readFileSync(file, 'utf8'), before)
})
test('reservation/outcome/reconciliation survives fresh processes and includes failed attempts', () => {
  const { file, ledger } = fixture({ reconciled: true })
  const ticket = reserve(ledger)
  complete(ledger, ticket)
  let state = createTrialLedger(file).state()
  assert.equal(state.requestCount, 2); assert.equal(state.pending[0].id, ticket.id)
  assert.equal(state.pending[0].status, 'completed'); assert.equal(state.usedCredits, null)
  ledger.reconcile({ id: ticket.id, credits: 12, evidenceRef: 'fixture-generation-charge' })
  state = createTrialLedger(file).state()
  assert.equal(state.usedCredits, 14); assert.equal(state.reconciledThroughRequest, 2)
  const next = reserve(ledger)
  complete(ledger, next, { status: 429, code: 'rate_limit', ok: false })
  ledger.reconcile({ id: next.id, credits: 0, evidenceRef: 'fixture-failure-charge' })
  assert.equal(createTrialLedger(file).state().requestCount, 3)
  assert.equal(admission(createTrialLedger(file)).status().code, 'budget_blocked')
  assert.throws(() => reserve(createTrialLedger(file)))
})
test('abrupt process exit after durable reservation never silently repeats or decrements', () => {
  const { file } = fixture({ reconciled: true })
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', `import { createTrialLedger } from ${JSON.stringify(new URL('../server/trial-ledger.mjs', import.meta.url).href)}; const book=createTrialLedger(process.argv[1]); book.reserve({expectedCount:1,maximumCredits:30,maximumTotal:5,budgetCredits:140}); process.exit(17)`, file], { encoding: 'utf8' })
  assert.equal(child.status, 17)
  const ledger = createTrialLedger(file)
  assert.equal(ledger.state().requestCount, 2); assert.equal(ledger.state().pending[0].status, 'reserved')
  assert.equal(ledger.state().attempts[1].externalAttempted, null)
  assert.equal(admission(ledger).status().available, false); assert.throws(() => reserve(ledger))
  // Even independent charge reconciliation cannot turn unknown execution into success.
  ledger.reconcile({ id: ledger.state().attempts[1].id, credits: 0, evidenceRef: 'fixture-interrupted-charge' })
  assert.equal(admission(createTrialLedger(file)).status().available, false)
})
test('missing, invalid JSON, incompatible, invalid schema, checksum and unreadable records all block without repair', () => {
  for (const variant of ['missing', 'json', 'version', 'schema', 'checksum', 'unreadable']) {
    const { file } = fixture({ reconciled: true })
    if (variant === 'missing') fs.unlinkSync(file)
    if (variant === 'json') fs.writeFileSync(file, '{')
    if (variant === 'version') rewrite(file, (v) => { v.version = 99 })
    if (variant === 'schema') rewrite(file, (v) => { v.attempts[0].requestNumber = 4 })
    if (variant === 'checksum') fs.appendFileSync(file, 'broken')
    const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
    const io = variant === 'unreadable' ? { ...fs, readFileSync() { throw new Error('EACCES fixture') } } : fs
    const ledger = createTrialLedger(file, { io })
    assert.equal(admission(ledger).status().code, 'budget_blocked')
    assert.equal(createAbacusTrial({ accounting: ledger }).status().code, 'budget_blocked')
    assert.throws(() => ledger.state()); assert.throws(() => reserve(ledger))
    assert.equal(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null, before)
  }
})
test('exclusive/stale lock blocks; competing independent instances reserve at most once', () => {
  const { file, ledger } = fixture({ reconciled: true })
  fs.writeFileSync(file + '.lock', '')
  assert.equal(admission(createTrialLedger(file)).status().available, false)
  assert.throws(() => ledger.reserve({ expectedCount: 1, maximumCredits: 30, maximumTotal: 5, budgetCredits: 140 }))
  assert.equal(fs.existsSync(file + '.lock'), true)
  fs.unlinkSync(file + '.lock') // Isolated fixture only, never runtime auto-repair.
  const other = createTrialLedger(file)
  const ticket = reserve(ledger)
  assert.throws(() => other.reserve({ expectedCount: 1, maximumCredits: 30, maximumTotal: 5, budgetCredits: 140 }))
  assert.equal(other.state().requestCount, 2); assert.equal(other.state().pending[0].id, ticket.id)
})
test('write/flush/replacement failures return no ticket; interrupted outcome remains reserved', () => {
  for (const operation of ['writeFileSync', 'fsyncSync', 'renameSync']) {
    const { file } = fixture({ reconciled: true })
    const before = fs.readFileSync(file, 'utf8')
    const faulty = createTrialLedger(file, { io: { ...fs, [operation]() { throw new Error('Fictitious disk failure') } } })
    assert.throws(() => reserve(faulty)); assert.equal(fs.readFileSync(file, 'utf8'), before)
    assert.equal(createTrialLedger(file).state().requestCount, 1)
  }
  const { file, ledger } = fixture({ reconciled: true })
  const ticket = reserve(ledger)
  const faulty = createTrialLedger(file, { io: { ...fs, renameSync() { throw new Error('Fictitious disk failure') } } })
  assert.throws(() => complete(faulty, ticket))
  assert.equal(createTrialLedger(file).state().pending[0].status, 'reserved')
  assert.equal(admission(createTrialLedger(file)).status().available, false)
})
test('two simultaneously started processes cannot reserve the same next request', async () => {
  const { file } = fixture({ reconciled: true })
  const code = `import { createTrialLedger } from ${JSON.stringify(new URL('../server/trial-ledger.mjs', import.meta.url).href)}; try {createTrialLedger(process.argv[1]).reserve({expectedCount:1,maximumCredits:30,maximumTotal:5,budgetCredits:140}); process.exit(0)} catch {process.exit(2)}`
  const run = () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', code, file], { stdio: 'ignore' })
    child.on('error', reject); child.on('exit', resolve)
  })
  assert.deepEqual((await Promise.all([run(), run()])).sort(), [0, 2])
  assert.equal(createTrialLedger(file).state().requestCount, 2)
  assert.equal(createTrialLedger(file).state().pending.length, 1)
})
test('five-request and 140-credit caps persist; caller cannot change limits or double-reconcile', () => {
  const { file, ledger } = fixture({ reconciled: true })
  for (let n = 2; n <= 5; n++) {
    const ticket = reserve(ledger); complete(ledger, ticket)
    ledger.reconcile({ id: ticket.id, credits: 30, evidenceRef: 'fixture-charge-' + n })
    assert.throws(() => ledger.reconcile({ id: ticket.id, credits: 0, evidenceRef: 'duplicate' }))
  }
  assert.equal(createTrialLedger(file).state().usedCredits, 122)
  assert.equal(admission(createTrialLedger(file)).status().code, 'budget_blocked')
  assert.throws(() => reserve(ledger))
  const limited = fixture({ reconciled: true }).ledger
  const ticket = reserve(limited); complete(limited, ticket)
  limited.reconcile({ id: ticket.id, credits: 109, evidenceRef: 'fixture-over-bound' })
  assert.equal(limited.state().halted, true)
  assert.throws(() => reserve(limited))
  assert.throws(() => limited.reserve({ expectedCount: 2, maximumCredits: 1, maximumTotal: 500, budgetCredits: 14000 }))
})
test('only whitelisted metadata persisted: no credentials, source content, messages or arbitrary model strings', () => {
  const { file, ledger } = fixture({ reconciled: true })
  const ticket = reserve(ledger)
  ledger.record({ ...ticket, httpStatus: 200, code: null, externalAttempted: true, usage: { total_tokens: 10, key: 'SECRET-SENTINEL' }, modelReported: 'SECRET-SENTINEL', apiKey: 'SECRET-SENTINEL', sources: 'SOURCE-SENTINEL', messages: 'SOURCE-SENTINEL' })
  ledger.finalize({ requestNumber: 2, ok: false })
  const text = fs.readFileSync(file, 'utf8')
  assert.equal(text.includes('SECRET-SENTINEL'), false); assert.equal(text.includes('SOURCE-SENTINEL'), false)
  assert.equal(ledger.state().attempts[1].modelReported, 'other')
})
test('credit budget independently blocks before reservation and at the exact 140-credit boundary', () => {
  const { file, ledger } = fixture()
  ledger.reconcile({ id: ledger.state().attempts[0].id, credits: 120, evidenceRef: 'fixture-catalog-charge' })
  assert.throws(() => reserve(ledger))
  assert.equal(ledger.state().requestCount, 1)
  const ticket = ledger.reserve({ expectedCount: 1, maximumCredits: 20, maximumTotal: 5, budgetCredits: 140 })
  complete(ledger, ticket)
  ledger.reconcile({ id: ticket.id, credits: 20, evidenceRef: 'fixture-exact-bound' })
  assert.equal(createTrialLedger(file).state().usedCredits, 140)
  assert.equal(admission(createTrialLedger(file)).status().code, 'budget_blocked')
})
test('interruption after HTTP but before semantic completion remains blocked even with known charge', () => {
  const { file, ledger } = fixture({ reconciled: true })
  const ticket = reserve(ledger)
  ledger.record({ ...ticket, httpStatus: 200, code: null, externalAttempted: true, usage: { total_tokens: 100 }, modelReported: TRIAL_MODEL })
  ledger.reconcile({ id: ticket.id, credits: 3, evidenceRef: 'fixture-charge' })
  const reopened = createTrialLedger(file)
  assert.equal(reopened.state().attempts[1].status, 'http_completed')
  assert.equal(reopened.state().pending.length, 1)
  assert.equal(admission(reopened).status().available, false)
  assert.throws(() => reserve(reopened))
  assert.throws(() => reopened.record({ ...ticket, httpStatus: 200, code: null, externalAttempted: true }))
})
function session(port) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path: '/session', headers: { Origin: 'http://localhost:5173' } }, (res) => {
      let text = ''; res.on('data', (c) => { text += c }); res.on('end', () => resolve(JSON.parse(text)))
    }).on('error', reject)
  })
}
test('actual localhost server restart keeps count/attempt IDs/pending charge and generation closed', async () => {
  const { file } = fixture()
  const before = fs.readFileSync(file, 'utf8')
  for (let n = 0; n < 2; n++) {
    const connection = createAbacusTrial({ accounting: createTrialLedger(file) })
    const service = createLocalService({ connection })
    try {
      const { port } = await service.listen(0)
      const state = await session(port)
      assert.equal(state.available, false); assert.equal(state.externalEnabled, false)
      assert.equal(createTrialLedger(file).state().requestCount, 1)
    } finally { await service.close() }
  }
  assert.equal(fs.readFileSync(file, 'utf8'), before)
})
test('mock transport connected to durable admission: HTTP success needs semantic completion AND reconciliation after restart', async () => {
  const { file, ledger } = fixture({ reconciled: true })
  let calls = 0
  const project = createLocalProject({ name: 'Ficticio', objective: 'Demoras ficticias', sources: '' })
  const request = makeRequest(project, TRIAL_MODEL, 'ledger-fixture')
  const requestImpl = (_url, _options, callback) => {
    calls++
    const req = new EventEmitter(); req.setTimeout = () => req; req.destroy = () => {}
    req.end = () => queueMicrotask(() => {
      const res = new EventEmitter(); res.statusCode = 200; res.destroy = () => {}; callback(res)
      res.emit('data', Buffer.from(JSON.stringify({ model: TRIAL_MODEL, choices: [{ finish_reason: 'stop', message: { content: '{"proposals":[{"invalid":true}]}' } }], usage: { total_tokens: 10 } }))); res.emit('end')
    })
    return req
  }
  const trial = createAbacusTrial({ enabled: true, accounting: ledger, quoteCredits, apiKey: 'test-only-not-a-credential', requestImpl })
  const outcome = await trial.analyze(request)
  assert.equal(outcome.ok, false) // Invalid semantic response, no proposals.
  assert.equal(calls, 1); assert.equal(ledger.state().requestCount, 2)
  assert.equal(ledger.state().attempts[1].status, 'failed'); assert.equal(ledger.state().halted, true)
  const reopened = createAbacusTrial({ enabled: true, accounting: createTrialLedger(file), quoteCredits, apiKey: 'test-only-not-a-credential', requestImpl })
  assert.equal(reopened.status().code, 'budget_blocked')
  await reopened.analyze(request); assert.equal(calls, 1)
  trial.close(); reopened.close()
})
