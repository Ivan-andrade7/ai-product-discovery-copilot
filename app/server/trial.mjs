import { createAbacusAdapter } from './providers/abacus.mjs'
import { createAbacusTransport, TRIAL_MODEL } from './providers/abacus-transport.mjs'

const finiteCredit = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0

// No defaults can authorize consumption. Quotes must already be verified in
// credits; token-rate numbers or dollar estimates alone cannot open this gate.
// Accounting is supplied by the later private runner, never by a browser request.
export function createTrialAdmission({ enabled = false, quoteCredits, accounting } = {}) {
  let stopped = false
  let busy = false
  let awaitingReconciliation = false
  let lastRequestNumber = null
  const seen = new Set()
  function status() {
    // Inspect supplied durable accounting even while generation is disabled.
    // Missing/corrupt/locked records are not treated as a fresh trial.
    if (accounting) {
      try { if (accounting.state().halted === true) return { available: false, code: 'budget_blocked' } }
      catch { return { available: false, code: 'budget_blocked' } }
    }
    if (stopped || !enabled) return { available: false, code: 'cost_pending' }
    if (typeof quoteCredits !== 'function') return { available: false, code: 'cost_pending' }
    if (!accounting || typeof accounting.state !== 'function' || typeof accounting.reserve !== 'function' || typeof accounting.record !== 'function') return { available: false, code: 'budget_blocked' }
    let state
    try { state = accounting.state() } catch { return { available: false, code: 'budget_blocked' } }
    if (state.halted === true) return { available: false, code: 'budget_blocked' }
    if (!Number.isInteger(state?.requestCount) || state.requestCount < 1 || state.requestCount > 5 || !finiteCredit(state.usedCredits) || state.reconciled !== true || state.reconciledThroughRequest !== state.requestCount) return { available: false, code: 'cost_pending' }
    if (state.requestCount === 5 || state.usedCredits >= 140) return { available: false, code: 'budget_blocked' }
    if (busy) return { available: false, code: 'busy' }
    if (awaitingReconciliation) return { available: false, code: 'reconciliation_pending' }
    return { available: true, code: 'ready' }
  }
  async function reserve(input) {
    const initial = status()
    if (!initial.available) return { ok: false, code: initial.code }
    busy = true
    let reserved = false
    try {
      const quote = await quoteCredits(input)
      if (stopped) return { ok: false, code: 'cost_pending' }
      if (quote?.unit !== 'credits' || quote.boundVerified !== true || !finiteCredit(quote.maximumCredits) || typeof quote.evidence !== 'string' || !quote.evidence.trim()) return { ok: false, code: 'cost_pending' }
      const state = accounting.state()
      if (state.reconciled !== true || state.requestCount >= 5 || !finiteCredit(state.usedCredits) || state.usedCredits + quote.maximumCredits > 140) return { ok: false, code: 'budget_blocked' }
      // The durable ledger rechecks count, reconciliation and budget under its
      // exclusive lock. No ticket is returned before persistence succeeds.
      const ticket = await accounting.reserve({ expectedCount: state.requestCount, maximumCredits: quote.maximumCredits, maximumTotal: 5, budgetCredits: 140 })
      if (!ticket || ticket.requestNumber !== state.requestCount + 1 || typeof ticket.id !== 'string' || seen.has(ticket.id)) return { ok: false, code: 'budget_blocked' }
      seen.add(ticket.id)
      reserved = true
      lastRequestNumber = ticket.requestNumber
      return { ...ticket, ok: true }
    } catch { return { ok: false, code: 'budget_blocked' } }
    finally { if (!reserved) busy = false }
  }
  function complete(ticket, result) {
    busy = false
    awaitingReconciliation = true
    if (result.status !== 200 || result.code) stopped = true
    try { accounting.record({ id: ticket.id, requestNumber: ticket.requestNumber, httpStatus: result.status, code: result.code ?? null, externalAttempted: result.externalAttempted === true, usage: result.body?.usage ?? null, modelReported: result.body?.model ?? null }) }
    catch { stopped = true }
  }
  function reconcile() {
    // The runner must supply independently reconciled accounting, not a token
    // estimate or a field invented from a successful provider response.
    try {
      const state = accounting?.state()
      if (!busy && state?.reconciled === true && state.reconciledThroughRequest === lastRequestNumber && state.requestCount === lastRequestNumber) awaitingReconciliation = false
    } catch { stopped = true }
  }
  return { status, reserve, complete, reconcile, stop: () => { stopped = true } }
}

export function createAbacusTrial({ apiKey, ...setup } = {}) {
  let hasCredential = typeof apiKey === 'string' && !!apiKey && apiKey.trim() === apiKey && !/\s/.test(apiKey)
  const admission = createTrialAdmission(setup)
  const transport = createAbacusTransport({ apiKey, admission, requestImpl: setup.requestImpl })
  const adapter = createAbacusAdapter(transport)
  return {
    status: () => {
      const state = admission.status()
      if (state.available && !hasCredential) return { available: false, externalEnabled: false, model: TRIAL_MODEL, code: 'disconnected' }
      return { ...state, externalEnabled: state.available, model: TRIAL_MODEL }
    },
    async analyze(request, { signal } = {}) {
      if (request.model !== TRIAL_MODEL) return { ok: false, code: 'invalid', externalAttempted: false }
      const result = await adapter.analyze(request, { signal })
      if (result.externalAttempted && setup.accounting?.finalize) {
        try { setup.accounting.finalize({ requestNumber: result.trialRequestNumber, ok: result.ok && result.modelReported === TRIAL_MODEL, code: result.code ?? (result.modelReported !== TRIAL_MODEL ? 'invalid' : null) }) }
        catch { admission.stop(); return { ok: false, code: 'budget_blocked', externalAttempted: true, trialRequestNumber: result.trialRequestNumber } }
      }
      if (result.externalAttempted && (!result.ok || result.modelReported !== TRIAL_MODEL)) admission.stop()
      if (result.ok && result.modelReported !== TRIAL_MODEL) return { ...result, ok: false, code: 'invalid', value: undefined }
      return result
    },
    reconcile: admission.reconcile,
    close: () => { hasCredential = false; transport.close() },
  }
}
