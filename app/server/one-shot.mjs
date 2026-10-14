import { createAbacusAdapter } from './providers/abacus.mjs'
import { createAbacusTransport, TRIAL_MODEL } from './providers/abacus-transport.mjs'
import { ONE_SHOT_AUTHORIZATION, SECOND_SHOT_AUTHORIZATION } from './trial-ledger.mjs'

// Only a private runner supplies credentials and the explicitly armed ledger.
// Default startup remains unchanged. No quotes or reconciliation are fabricated.
export function createOneShotTrial({ apiKey, accounting, requestImpl, authorization = ONE_SHOT_AUTHORIZATION } = {}) {
  let closed = false
  const admission = {
    status() {
      try { return !closed && accounting.oneShotState(authorization).available ? { available: true, code: 'ready' } : { available: false, code: 'budget_blocked' } }
      catch { return { available: false, code: 'budget_blocked' } }
    },
    async reserve(input) {
      if (!this.status().available || input.maxOutputTokens !== 500 || input.inputChars > 2000) return { ok: false, code: 'budget_blocked' }
      try { return { ...(authorization === SECOND_SHOT_AUTHORIZATION ? accounting.reserveSecondShot(authorization) : accounting.reserveOneShot(authorization)), ok: true } }
      catch { closed = true; return { ok: false, code: 'budget_blocked' } }
    },
    complete(ticket, result) {
      closed = true
      try { accounting.record({ ...ticket, httpStatus: result.status, code: result.code ?? null, externalAttempted: result.externalAttempted === true, usage: result.body?.usage ?? null, modelReported: result.body?.model ?? null }) }
      catch { /* Reservation remains halted and pending; never retry. */ }
    },
    stop() { closed = true },
  }
  const transport = createAbacusTransport({ apiKey, admission, requestImpl, singleUse: true })
  const adapter = createAbacusAdapter(transport, { maxOutputTokens: 500 })
  return {
    status() {
      const state = admission.status()
      return { ...state, available: state.available && !!apiKey, externalEnabled: state.available && !!apiKey, model: TRIAL_MODEL }
    },
    async analyze(request, options) {
      const result = await adapter.analyze(request, options)
      if (result.externalAttempted) {
        const ok = result.ok && result.modelReported === TRIAL_MODEL
        try { accounting.finalize({ requestNumber: result.trialRequestNumber, ok, code: result.code ?? (ok ? null : 'invalid'), finishReason: result.finishReason, diagnostic: result.diagnostic }) }
        catch { return { ...result, ok: false, code: 'budget_blocked', value: undefined, diagnostic: { stage: 'control', reason: 'accounting_error' } } }
        if (!ok) return { ...result, ok: false, code: result.code ?? 'invalid', value: undefined, diagnostic: result.diagnostic ?? { stage: 'control', reason: 'model_mismatch' } }
      }
      return result
    },
    close() { apiKey = null; transport.close() },
  }
}
