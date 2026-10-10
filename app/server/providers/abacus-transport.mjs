import https from 'node:https'
import { ABACUS_ENDPOINT } from './abacus.mjs'
import { LIMITS } from '../../src/ai/contracts.js'

export const TRIAL_MODEL = 'claude-sonnet-4-6'
export const TRIAL_MAX_OUTPUT = 1800
const MAX_RESPONSE_BYTES = 262144

// An explicit, private process-memory credential and trial admission are required.
// No environment lookup, logs, redirects, retries, proxy or provider fallback.
export function createAbacusTransport({ apiKey, admission, requestImpl = https.request } = {}) {
  let credential = typeof apiKey === 'string' && apiKey.trim() === apiKey && !/\s/.test(apiKey) ? apiKey : null
  const transport = async ({ url, method, body, signal }) => {
    const blocked = (code) => ({ status: 0, code, externalAttempted: false })
    if (!admission || !admission.status().available) return blocked(admission?.status().code ?? 'cost_pending')
    if (!credential) return blocked('disconnected')
    if (signal?.aborted) return blocked('cancelled')
    if (url !== ABACUS_ENDPOINT || method !== 'POST' || body?.model !== TRIAL_MODEL || body.stream !== false || body.max_tokens !== TRIAL_MAX_OUTPUT) return blocked('invalid')
    if (Object.keys(body).some((key) => !['model', 'stream', 'max_tokens', 'messages'].includes(key))) return blocked('invalid')
    if (!Array.isArray(body.messages) || body.messages.length !== 3 || body.messages[0]?.role !== 'system' || body.messages[1]?.role !== 'user' || body.messages[2]?.role !== 'user' || body.messages.some((m) => typeof m.content !== 'string')) return blocked('invalid')
    let requestContext
    let sourceContext
    try { requestContext = JSON.parse(body.messages[1].content); sourceContext = JSON.parse(body.messages[2].content) } catch { return blocked('invalid') }
    if (!requestContext || Object.keys(requestContext).length !== 1 || typeof requestContext.request !== 'string' || !requestContext.request.trim()) return blocked('invalid')
    if (!sourceContext || Object.keys(sourceContext).length !== 1 || !Array.isArray(sourceContext.sources) || !sourceContext.sources.length) return blocked('invalid')
    if (sourceContext.sources.some((s) => !s || Object.keys(s).length !== 3 || ['id', 'name', 'content'].some((key) => typeof s[key] !== 'string' || !s[key].trim()))) return blocked('invalid')
    const sourceChars = sourceContext.sources.reduce((n, s) => n + s.content.length, 0)
    if (sourceChars > 6000 || requestContext.request.length + sourceChars > LIMITS.inputChars) return blocked('invalid')
    const payload = JSON.stringify(body)
    if (Buffer.byteLength(payload) > 40000) return blocked('invalid')
    // Admission receives sizes only. Request/source text is never handed to the
    // durable consumption ledger or its quote boundary.
    const ticket = await admission.reserve({ inputChars: requestContext.request.length + sourceChars, maxOutputTokens: body.max_tokens, bodyBytes: Buffer.byteLength(payload) })
    if (!ticket.ok) return blocked(ticket.code)
    if (!credential || signal?.aborted) {
      admission.complete(ticket, { status: 0, code: 'cancelled', externalAttempted: false })
      return blocked('cancelled')
    }
    // The reservation counts even if connection setup, TLS or timeout fails.
    const result = await new Promise((resolve) => {
      let settled = false
      let req
      let deadline
      const done = (value) => {
        if (settled) return
        settled = true
        clearTimeout(deadline)
        signal?.removeEventListener('abort', abort)
        if (req) req.setTimeout(0)
        resolve({ ...value, externalAttempted: true, trialRequestNumber: ticket.requestNumber })
      }
      const abort = () => { done({ status: 0, code: 'cancelled' }); req?.destroy() }
      try {
        if (signal?.aborted) { abort(); return }
        req = requestImpl(ABACUS_ENDPOINT, {
          method: 'POST', agent: false,
          headers: { Authorization: 'Bearer ' + credential, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
        }, (res) => {
          // Never follow a redirect or store arbitrary provider error messages.
          if (res.statusCode >= 300 && res.statusCode < 400) { done({ status: res.statusCode, code: 'error' }); res.destroy(); return }
          let bytes = 0
          const chunks = []
          res.on('data', (chunk) => {
            bytes += chunk.length
            if (bytes > MAX_RESPONSE_BYTES) { done({ status: res.statusCode, code: 'invalid' }); res.destroy(); return }
            chunks.push(chunk)
          })
          res.on('error', () => done({ status: 0, code: 'error' }))
          res.on('aborted', () => done({ status: 0, code: 'incomplete' }))
          res.on('end', () => {
            let parsed
            try { parsed = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { done({ status: res.statusCode, code: 'invalid' }); return }
            const value = {
              model: typeof parsed.model === 'string' && /^[a-zA-Z0-9_./:-]{1,120}$/.test(parsed.model) ? parsed.model : null,
              choices: Array.isArray(parsed.choices) ? parsed.choices.slice(0, 1).map((c) => ({ finish_reason: c?.finish_reason, message: { content: c?.message?.content } })) : [],
              usage: safeUsage(parsed.usage),
              error: { code: parsed.error?.code === 'insufficient_quota' ? 'insufficient_quota' : null },
            }
            done({ status: res.statusCode, body: value })
          })
        })
        req.on('error', () => done({ status: 0, code: signal?.aborted ? 'cancelled' : 'error' }))
        req.setTimeout(25000, () => { done({ status: 0, code: 'error' }); req.destroy() })
        deadline = setTimeout(() => { done({ status: 0, code: 'error' }); req.destroy() }, 25000)
        signal?.addEventListener('abort', abort, { once: true })
        if (signal?.aborted) { abort(); return }
        req.end(payload)
      } catch { done({ status: 0, code: 'error' }); req?.destroy() }
    })
    // A successful HTTP response does not prove its credit charge is reconciled.
    admission.complete(ticket, result)
    return result
  }
  transport.close = () => { credential = null; admission?.stop() }
  return transport
}

export function safeUsage(value) {
  if (!value || typeof value !== 'object') return null
  const result = {}
  for (const key of ['prompt_tokens', 'completion_tokens', 'total_tokens']) {
    if (Number.isSafeInteger(value[key]) && value[key] >= 0) result[key] = value[key]
  }
  return Object.keys(result).length ? result : null
}
