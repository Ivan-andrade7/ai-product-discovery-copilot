import test from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import { EventEmitter } from 'node:events'
import { createAbacusAdapter } from '../server/providers/abacus.mjs'
import { createAbacusTransport, TRIAL_MODEL } from '../server/providers/abacus-transport.mjs'
import { createLocalProject } from '../src/data/demoData.js'
import { makeRequest, startAnalysis, finishAnalysis, validateResult } from '../src/ai/contracts.js'
import { safeDiagnostic } from '../src/ai/diagnostics.js'

const connect = net.Socket.prototype.connect
const fetch = globalThis.fetch
let network = 0
net.Socket.prototype.connect = () => { network++; throw new Error('Network forbidden') }
globalThis.fetch = () => { network++; throw new Error('Network forbidden') }
test.after(() => { net.Socket.prototype.connect = connect; globalThis.fetch = fetch; assert.equal(network, 0) })
const project = createLocalProject({ name: 'Ficticio', objective: 'Se recibieron diez consultas. No hay datos de ventas.' })
const request = makeRequest(project, TRIAL_MODEL)
const proposal = { type: 'Afirmación', title: 'Consultas', content: 'Se recibieron diez consultas.', reasoning: 'El registro lo dice; no informa ventas.', certainty: 'evidence', references: [{ sourceId: request.sources[0].id, quote: 'diez consultas' }] }
const usage = { prompt_tokens: 20, completion_tokens: 30, total_tokens: 50 }
const envelope = (content) => ({ model: TRIAL_MODEL, usage: { ...usage, private_field: 'NEVER-PERSIST' }, choices: [{ finish_reason: 'stop', message: { content } }] })
async function throughTransport(value, raw) {
  let calls = 0
  const admission = { status: () => ({ available: true }), reserve: async () => ({ ok: true, id: 'fictitious', requestNumber: 2 }), complete: () => {}, stop: () => {} }
  const requestImpl = (url, options, callback) => {
    calls++
    const req = new EventEmitter()
    req.setTimeout = () => req; req.destroy = () => {}
    req.end = (payload) => {
      const wire = JSON.parse(payload)
      assert.equal(wire.model, TRIAL_MODEL)
      assert.match(wire.messages[0].content, /without Markdown fences/)
      queueMicrotask(() => {
        const res = new EventEmitter(); res.statusCode = 200; res.destroy = () => {}
        callback(res); res.emit('data', Buffer.from(raw ?? JSON.stringify(value))); res.emit('end')
      })
    }
    return req
  }
  const transport = createAbacusTransport({ apiKey: 'fixture-only', admission, requestImpl })
  const result = await createAbacusAdapter(transport).analyze(request)
  transport.close()
  assert.equal(calls, 1)
  return result
}
const cases = [
  ['external JSON invalid', null, '{bad', 'provider_format', 'invalid_json', false],
  ['external null', null, undefined, 'provider_format', 'invalid_envelope', false],
  ['external array', [], undefined, 'provider_format', 'invalid_envelope', false],
  ['missing choices', { model: TRIAL_MODEL, usage }, undefined, 'provider_format', 'missing_choices', true],
  ['choice null', { model: TRIAL_MODEL, usage, choices: [null] }, undefined, 'provider_format', 'missing_finish_reason', true],
  ['content array', envelope([{ type: 'text', text: 'not accepted as a string' }]), undefined, 'content_extraction', 'non_text_content', true],
  ['content null', envelope(null), undefined, 'content_extraction', 'non_text_content', true],
  ['internal JSON invalid', envelope('{bad'), undefined, 'json_parse', 'invalid_json', true],
  ['Markdown fenced JSON rejected', envelope('```json\n{"proposals":[]}\n```'), undefined, 'json_parse', 'invalid_json', true],
  ['wrong root', envelope('{"items":[]}'), undefined, 'structure', 'invalid_proposals', true],
  ['required field missing', envelope(JSON.stringify({ proposals: [{ ...proposal, reasoning: undefined }] })), undefined, 'structure', 'invalid_fields', true],
  ['certainty pipe literal', envelope(JSON.stringify({ proposals: [{ ...proposal, certainty: 'evidence|hypothesis|question' }] })), undefined, 'structure', 'invalid_certainty', true],
  ['references not array', envelope(JSON.stringify({ proposals: [{ ...proposal, references: null }] })), undefined, 'structure', 'invalid_reference_list', true],
  ['evidence without quote', envelope(JSON.stringify({ proposals: [{ ...proposal, references: [] }] })), undefined, 'references', 'evidence_without_reference', true],
  ['unknown source', envelope(JSON.stringify({ proposals: [{ ...proposal, references: [{ sourceId: 'unselected', quote: 'diez consultas' }] }] })), undefined, 'references', 'unknown_source', true],
  ['invented quote', envelope(JSON.stringify({ proposals: [{ ...proposal, references: [{ sourceId: request.sources[0].id, quote: 'ventas confirmadas' }] }] })), undefined, 'references', 'quote_not_found', true],
]
for (const [name, value, raw, stage, reason, hasMetadata] of cases) test('diagnostic: ' + name, async () => {
  const result = await throughTransport(value, raw)
  assert.equal(result.ok, false); assert.equal(result.code, 'invalid')
  assert.deepEqual(result.diagnostic, { stage, reason })
  assert.equal(result.externalAttempted, true); assert.equal(result.httpStatus, 200); assert.equal(result.trialRequestNumber, 2)
  if (hasMetadata) { assert.equal(result.modelReported, TRIAL_MODEL); assert.deepEqual(result.usage, usage) }
  if (value?.choices?.[0]?.finish_reason === 'stop') assert.equal(result.finishReason, 'stop')
  const finished = finishAnalysis(startAnalysis(project, request).project, request, result)
  assert.equal(finished.proposals.length, 0)
  assert.deepEqual(finished.runs[0].diagnostic, result.diagnostic)
  assert.deepEqual(finished.runs[0].usage, result.usage)
  assert.equal(finished.runs[0].modelReported, result.modelReported)
  assert.equal(finished.runs[0].httpStatus, 200)
  assert.equal(JSON.stringify(result.diagnostic).includes('diez consultas'), false)
  assert.equal(JSON.stringify(result).includes('NEVER-PERSIST'), false)
})
test('valid provider envelope remains valid; incomplete response preserves metadata', async () => {
  const valid = await throughTransport(envelope(JSON.stringify({ proposals: [proposal] })))
  assert.equal(valid.ok, true); assert.deepEqual(valid.usage, usage)
  const response = envelope('{unfinished'); response.choices[0].finish_reason = 'length'
  const result = await throughTransport(response)
  assert.equal(result.code, 'incomplete'); assert.deepEqual(result.diagnostic, { stage: 'control', reason: 'incomplete_response' })
  assert.equal(result.finishReason, 'length')
  assert.deepEqual(result.usage, usage); assert.equal(result.modelReported, TRIAL_MODEL)
})
test('contract rejects circular values and does not preserve arbitrary diagnostic payloads', () => {
  const value = { proposals: [proposal] }; value.cycle = value
  assert.deepEqual(validateResult(value, request).diagnostic, { stage: 'structure', reason: 'not_serializable' })
  assert.equal(safeDiagnostic({ stage: 'references', reason: 'SOURCE-CONTENT' }), null)
  assert.deepEqual(safeDiagnostic({ stage: 'json_parse', reason: 'invalid_json', secret: 'NEVER-PERSIST' }), { stage: 'json_parse', reason: 'invalid_json' })
})
test('exception after response does not erase known attempt/model/usage metadata', async () => {
  const body = { model: TRIAL_MODEL, usage, get choices() { throw new Error('NEVER-PERSIST') } }
  const adapter = createAbacusAdapter(async () => ({ status: 200, externalAttempted: true, trialRequestNumber: 2, body }))
  const result = await adapter.analyze(request)
  assert.equal(result.ok, false); assert.equal(result.externalAttempted, true)
  assert.equal(result.modelReported, TRIAL_MODEL); assert.deepEqual(result.usage, usage)
  assert.equal(result.httpStatus, 200); assert.equal(result.trialRequestNumber, 2)
  assert.deepEqual(result.diagnostic, { stage: 'control', reason: 'adapter_exception' })
  assert.equal(JSON.stringify(result).includes('NEVER-PERSIST'), false)
})
