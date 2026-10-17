// Only fixed codes cross the diagnostic boundary. Never provider text/content.
const reasons = {
  transport: ['exception', 'timeout', 'redirect', 'aborted', 'response_too_large'],
  provider_format: ['invalid_json', 'invalid_envelope', 'missing_choices', 'invalid_choice', 'missing_finish_reason'],
  content_extraction: ['non_text_content', 'content_too_large'],
  json_parse: ['invalid_json'],
  structure: ['invalid_proposals', 'output_too_large', 'invalid_fields', 'invalid_certainty', 'invalid_type', 'invalid_reference_list', 'not_serializable'],
  references: ['evidence_without_reference', 'invalid_reference', 'unknown_source', 'quote_not_found'],
  control: ['invalid_request', 'incomplete_response', 'model_mismatch', 'cancelled', 'http_error', 'accounting_error', 'adapter_exception'],
}
export function safeDiagnostic(value) {
  return value && reasons[value.stage]?.includes(value.reason) ? { stage: value.stage, reason: value.reason } : null
}
export const invalidResult = (stage, reason) => ({ ok: false, code: 'invalid', diagnostic: safeDiagnostic({ stage, reason }) })
export const safeFinishReason = (value) => value == null ? null : ['stop', 'length', 'content_filter', 'tool_calls', 'function_call', 'error', 'STOP', 'MAX_TOKENS', 'SAFETY', 'RECITATION', 'OTHER', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII', 'MALFORMED_FUNCTION_CALL', 'UNEXPECTED_TOOL_CALL'].includes(value) ? value : 'other'
