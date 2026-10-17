import { isAnalysisRequest, LIMITS, validateResult } from '../../src/ai/contracts.js'
import { invalidResult, safeDiagnostic, safeFinishReason } from '../../src/ai/diagnostics.js'
import {proposalResponseFormat,matchesProposalSchema} from './structured-output.mjs'
import {analysisMessages} from './messages.mjs'

// Contract source: https://api.abacus.ai/help/route-llm/chat-completions
// Credentials and sockets belong only to the private server transport.
// Live compatibility/model eligibility and billing remain UNVERIFIED.
// Normal startup still has no enabled transport; local tests inject one.
export const ABACUS_ENDPOINT = 'https://routellm.abacus.ai/v1/chat/completions'
export function createAbacusAdapter(transport, { maxOutputTokens = 1800 } = {}) {
  return {
    async analyze(request, { signal } = {}) {
      if (typeof transport !== 'function') return { ok: false, code: 'disconnected', externalAttempted: false }
      if (!isAnalysisRequest(request)) return { ...invalidResult('control', 'invalid_request'), externalAttempted: false }
      if (signal?.aborted) return { ok: false, code: 'cancelled', externalAttempted: false }
      const body = {
        model: request.model, stream: false, max_tokens: maxOutputTokens,
        response_format: proposalResponseFormat(request.sources.map(source=>source.id)),
        messages: analysisMessages(request),
      }
      let metadata = { externalAttempted: false, usage: null, trialRequestNumber: null, modelReported: null, httpStatus: null, finishReason: null }
      const rejected = (stage, reason) => ({ ...invalidResult(stage, reason), ...metadata })
      try {
        const response = await transport({ url: ABACUS_ENDPOINT, method: 'POST', body, signal })
        if (!response || typeof response !== 'object' || Array.isArray(response)) return rejected('provider_format', 'invalid_envelope')
        const attempted = response.externalAttempted === true
        const usage = {}
        for (const key of ['prompt_tokens', 'completion_tokens', 'total_tokens']) {
          if (Number.isSafeInteger(response.body?.usage?.[key]) && response.body.usage[key] >= 0) usage[key] = response.body.usage[key]
        }
        metadata = { externalAttempted: attempted, usage: Object.keys(usage).length ? usage : null, trialRequestNumber: Number.isInteger(response.trialRequestNumber) ? response.trialRequestNumber : null, modelReported: typeof response.body?.model === 'string' && /^[a-zA-Z0-9_./:-]{1,120}$/.test(response.body.model) ? response.body.model : null, httpStatus: Number.isInteger(response.status) ? response.status : null }
        if (signal?.aborted) return { ok: false, code: 'cancelled', ...metadata }
        if (response.status === 0) return { ok: false, code: ['cost_pending', 'budget_blocked', 'reconciliation_pending', 'busy', 'cancelled', 'invalid', 'incomplete'].includes(response.code) ? response.code : 'error', ...metadata, diagnostic: safeDiagnostic(response.diagnostic) }
        if (response.status === 401 || response.status === 403) return { ok: false, code: 'permission', ...metadata }
        if (response.status === 402 || response.body?.error?.code === 'insufficient_quota') return { ok: false, code: 'quota', ...metadata }
        // 429 alone does NOT prove exhausted credits.
        if (response.status === 429) return { ok: false, code: 'rate_limit', ...metadata }
        if (response.status !== 200) return { ok: false, code: 'error', ...metadata }
        if (response.code) return { ok: false, code: ['invalid', 'incomplete'].includes(response.code) ? response.code : 'error', ...metadata, diagnostic: safeDiagnostic(response.diagnostic) }
        if (!response.body || typeof response.body !== 'object' || Array.isArray(response.body)) return rejected('provider_format', 'invalid_envelope')
        if (!Array.isArray(response.body.choices) || !response.body.choices.length) return rejected('provider_format', 'missing_choices')
        const choice = response.body?.choices?.[0]
        metadata.finishReason = safeFinishReason(choice?.finish_reason)
        if (!choice || typeof choice !== 'object' || Array.isArray(choice)) return rejected('provider_format', 'invalid_choice')
        if (typeof choice.finish_reason !== 'string') return rejected('provider_format', 'missing_finish_reason')
        if (choice.finish_reason !== 'stop') return { ok: false, code: 'incomplete', diagnostic: { stage: 'control', reason: 'incomplete_response' }, ...metadata }
        if (typeof choice.message?.content !== 'string') return rejected('content_extraction', 'non_text_content')
        if (choice.message.content.length > LIMITS.outputChars) return rejected('content_extraction', 'content_too_large')
        let value
        try { value = JSON.parse(choice.message.content) } catch { return rejected('json_parse', 'invalid_json') }
        const valid = validateResult(value, request)
        if (valid.ok && !matchesProposalSchema(value,request.sources.map(source=>source.id))) return rejected('structure','invalid_fields')
        return valid.ok ? { ok: true, value, ...metadata } : { ...valid, ...metadata }
      } catch {
        return { ok: false, code: signal?.aborted ? 'cancelled' : 'error', diagnostic: { stage: signal?.aborted || metadata.httpStatus !== null ? 'control' : 'transport', reason: signal?.aborted ? 'cancelled' : metadata.httpStatus !== null ? 'adapter_exception' : 'exception' }, ...metadata }
      }
    },
  }
}
