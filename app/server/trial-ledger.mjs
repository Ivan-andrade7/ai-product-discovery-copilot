import * as fs from 'node:fs'
import path from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import { TRIAL_MODEL, safeUsage } from './providers/abacus-transport.mjs'

export const TRIAL_LIMITS = Object.freeze({ maximumTotal: 5, budgetCredits: 140 })
const credit = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0
const identifier = (s) => typeof s === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(s)
const codes = new Set([null, 'cancelled', 'error', 'invalid', 'incomplete', 'permission', 'quota', 'rate_limit'])
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && keys.every((k) => Object.hasOwn(value, k))
const fail = () => { throw new Error('Trial accounting unavailable; consumption blocked') }

function validate(value) {
  if (!exact(value, ['version', 'trialId', 'revision', 'maximumTotal', 'budgetCredits', 'halted', 'attempts']) || value.version !== 1 || !identifier(value.trialId) || !Number.isSafeInteger(value.revision) || value.revision < 0 || value.maximumTotal !== 5 || value.budgetCredits !== 140 || typeof value.halted !== 'boolean' || !Array.isArray(value.attempts) || value.attempts.length < 1 || value.attempts.length > 5) fail()
  const ids = new Set()
  for (const [index, attempt] of value.attempts.entries()) {
    if (!exact(attempt, ['id', 'requestNumber', 'kind', 'modelRequested', 'status', 'maximumCredits', 'externalAttempted', 'httpStatus', 'code', 'usage', 'modelReported', 'credits', 'reconciliationRef']) || !identifier(attempt.id) || ids.has(attempt.id) || attempt.requestNumber !== index + 1 || attempt.kind !== (index === 0 ? 'catalog' : 'generation') || attempt.modelRequested !== (index === 0 ? null : TRIAL_MODEL) || !['reserved', 'http_completed', 'completed', 'failed'].includes(attempt.status) || !(attempt.maximumCredits === null && index === 0 || credit(attempt.maximumCredits) && index > 0) || ![null, true, false].includes(attempt.externalAttempted) || !(attempt.httpStatus === null || Number.isInteger(attempt.httpStatus) && attempt.httpStatus >= 0 && attempt.httpStatus <= 599) || !codes.has(attempt.code) || !(attempt.modelReported === null || attempt.modelReported === TRIAL_MODEL || attempt.modelReported === 'other') || !(attempt.credits === null || credit(attempt.credits)) || !(attempt.reconciliationRef === null || identifier(attempt.reconciliationRef))) fail()
    if (attempt.usage !== null && (!exact(attempt.usage, Object.keys(safeUsage(attempt.usage) ?? {})) || JSON.stringify(attempt.usage) !== JSON.stringify(safeUsage(attempt.usage)))) fail()
    if ((attempt.credits === null) !== (attempt.reconciliationRef === null) || attempt.status === 'reserved' && (attempt.externalAttempted !== null || attempt.httpStatus !== null || attempt.code !== null || attempt.usage !== null || attempt.modelReported !== null) || index === 0 && (attempt.status !== 'completed' || attempt.externalAttempted !== true) || index > 0 && attempt.status !== 'reserved' && (attempt.externalAttempted === null || attempt.httpStatus === null)) fail()
    ids.add(attempt.id)
  }
  return value
}

// The path must be private local storage, not project/browser/OneDrive storage.
// No startup auto-initialization or automatic repair. A leftover lock blocks.
export function defaultLedgerPath() {
  if (!process.env.LOCALAPPDATA) fail()
  return path.join(process.env.LOCALAPPDATA, 'Codex', 'AbacusCatalog-01a11360-b7f2-7362-bd48-6cc208037c8d', 'trial-ledger.json')
}

export function createTrialLedger(file, { io = fs } = {}) {
  const lock = file + '.lock'
  function read() {
    let envelope
    try { envelope = JSON.parse(io.readFileSync(file, 'utf8')) } catch { fail() }
    if (!exact(envelope, ['data', 'checksum']) || envelope.checksum !== digest(envelope.data)) fail()
    return validate(envelope.data)
  }
  function locked(operation) {
    let fd
    try { fd = io.openSync(lock, 'wx', 0o600) } catch { fail() }
    try { return operation() } finally { io.closeSync(fd); io.unlinkSync(lock) }
  }
  function encode(value) { validate(value); return JSON.stringify({ data: value, checksum: digest(value) }) }
  function mutate(change) {
    return locked(() => {
      const value = read()
      const result = change(value)
      value.revision++
      const temporary = file + '.' + randomUUID() + '.pending'
      let fd
      try {
        fd = io.openSync(temporary, 'wx', 0o600)
        io.writeFileSync(fd, encode(value), 'utf8')
        io.fsyncSync(fd)
        io.closeSync(fd); fd = undefined
        // A ticket is returned ONLY after this replacement succeeds.
        io.renameSync(temporary, file)
      } catch { fail() } finally { if (fd !== undefined) io.closeSync(fd) }
      return result
    })
  }
  return {
    // Explicit one-time import of the already executed catalog. Never called
    // during service startup, never overwrites any existing file.
    initializeFromCatalog({ marker, result }) {
      if (marker?.requestCount !== 1 || marker.kind !== 'catalog' || marker.maximumTotal !== 5 || result?.requestCount !== 1 || result.outcome !== 'catalog-read' || result.modelId !== TRIAL_MODEL) fail()
      const value = { version: 1, trialId: randomUUID(), revision: 0, ...TRIAL_LIMITS, halted: false, attempts: [{ id: randomUUID(), requestNumber: 1, kind: 'catalog', modelRequested: null, status: 'completed', maximumCredits: null, externalAttempted: true, httpStatus: null, code: null, usage: null, modelReported: TRIAL_MODEL, credits: null, reconciliationRef: null }] }
      return locked(() => {
        const fd = io.openSync(file, 'wx', 0o600)
        try { io.writeFileSync(fd, encode(value), 'utf8'); io.fsyncSync(fd) } finally { io.closeSync(fd) }
      })
    },
    state() {
      if (io.existsSync(lock)) fail()
      const value = read()
      const pending = value.attempts.filter((a) => a.credits === null || ['reserved', 'http_completed'].includes(a.status))
      const reconciledCredits = value.attempts.reduce((n, a) => n + (a.credits ?? 0), 0)
      let through = 0
      for (const a of value.attempts) { if (a.credits === null || ['reserved', 'http_completed'].includes(a.status)) break; through++ }
      return { trialId: value.trialId, ...TRIAL_LIMITS, requestCount: value.attempts.length, halted: value.halted, reconciledCredits, usedCredits: pending.length ? null : reconciledCredits, reconciled: pending.length === 0, reconciledThroughRequest: through, pending: pending.map((a) => ({ id: a.id, requestNumber: a.requestNumber, status: a.status, credits: a.credits })), attempts: structuredClone(value.attempts) }
    },
    reserve({ expectedCount, maximumCredits, maximumTotal, budgetCredits }) {
      return mutate((value) => {
        const used = value.attempts.reduce((n, a) => n + (a.credits ?? 0), 0)
        if (value.halted || maximumTotal !== 5 || budgetCredits !== 140 || !credit(maximumCredits) || expectedCount !== value.attempts.length || expectedCount >= 5 || used + maximumCredits > 140 || value.attempts.some((a) => a.credits === null || ['reserved', 'http_completed'].includes(a.status))) fail()
        const attempt = { id: randomUUID(), requestNumber: expectedCount + 1, kind: 'generation', modelRequested: TRIAL_MODEL, status: 'reserved', maximumCredits, externalAttempted: null, httpStatus: null, code: null, usage: null, modelReported: null, credits: null, reconciliationRef: null }
        value.attempts.push(attempt)
        return { id: attempt.id, requestNumber: attempt.requestNumber }
      })
    },
    record(input) {
      return mutate((value) => {
        const attempt = value.attempts.find((a) => a.id === input.id && a.requestNumber === input.requestNumber)
        if (!attempt || attempt.status !== 'reserved' || typeof input.externalAttempted !== 'boolean' || !Number.isInteger(input.httpStatus) || input.httpStatus < 0 || input.httpStatus > 599 || !codes.has(input.code)) fail()
        const failed = input.httpStatus !== 200 || input.code !== null
        Object.assign(attempt, { status: failed ? 'failed' : 'http_completed', httpStatus: input.httpStatus, code: input.code, externalAttempted: input.externalAttempted, usage: safeUsage(input.usage), modelReported: input.modelReported === TRIAL_MODEL ? TRIAL_MODEL : input.modelReported == null ? null : 'other' })
        if (failed) value.halted = true
      })
    },
    finalize({ requestNumber, ok, code = null }) {
      return mutate((value) => {
        const attempt = value.attempts.find((a) => a.requestNumber === requestNumber)
        if (!attempt || !['http_completed', 'failed'].includes(attempt.status) || typeof ok !== 'boolean' || !codes.has(code)) fail()
        if (attempt.status === 'http_completed') attempt.status = ok ? 'completed' : 'failed'
        if (!ok && code !== null) attempt.code = code
        if (!ok) value.halted = true
      })
    },
    // Offline runner operation only: no HTTP/browser endpoint. A verified
    // charge and opaque evidence reference must be supplied explicitly.
    reconcile({ id, credits, evidenceRef }) {
      return mutate((value) => {
        const attempt = value.attempts.find((a) => a.id === id)
        if (!attempt || attempt.credits !== null || !credit(credits) || !identifier(evidenceRef)) fail()
        attempt.credits = credits; attempt.reconciliationRef = evidenceRef
        if (attempt.status === 'reserved' || credits > (attempt.maximumCredits ?? 140) || value.attempts.reduce((n, a) => n + (a.credits ?? 0), 0) > 140) value.halted = true
      })
    },
  }
}
