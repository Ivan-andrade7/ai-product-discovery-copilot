import test from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import { createDefaultWorkspace, createLocalProject } from '../src/data/demoData.js'
import { makeRequest, validateResult, PROPOSAL_TYPES, startAnalysis, finishAnalysis, decideProposal } from '../src/ai/contracts.js'
import { parseWorkspace, createBackup, recoverBackup, persistWorkspace, STORAGE_KEY } from '../src/storage.js'
import { createAbacusAdapter } from '../server/providers/abacus.mjs'
const connect = net.Socket.prototype.connect
const fetch = globalThis.fetch
let external = 0
net.Socket.prototype.connect = () => { external++; throw new Error('No network') }
globalThis.fetch = () => { external++; throw new Error('No network') }
test.after(() => { net.Socket.prototype.connect = connect; globalThis.fetch = fetch; assert.equal(external, 0) })
const project = createLocalProject({ name: 'Ficticio', objective: 'Diez consultas, sin ventas registradas.' })
const request = makeRequest(project, 'claude-sonnet-4-6')
const proposal = { type: 'Afirmación', certainty: 'evidence', title: 'Consultas', content: 'Diez consultas.', reasoning: 'No hay datos de ventas.', references: [{ sourceId: request.sources[0].id, quote: 'Diez consultas' }] }
for (const [certainty, type] of Object.entries(PROPOSAL_TYPES)) test('semantic type accepted: ' + type, () => {
  assert.equal(validateResult({ proposals: [{ ...proposal, type, certainty }] }, request).ok, true)
})
for (const type of ['string', 'Propuesta', '', undefined, 'Desconocido', 'Pregunta', 'afirmación']) test('ambiguous/missing/mismatched type rejected: ' + String(type), () => {
  assert.equal(validateResult({ proposals: [{ ...proposal, type }] }, request).ok, false)
})
test('prompt semantic types; generic output rejected without rewriting', async () => {
  const value = { proposals: [{ ...proposal, type: 'string' }] }
  const original = JSON.stringify(value)
  const result = await createAbacusAdapter(async ({ body }) => {
    assert.equal(body.messages[0].content.includes('"type":"string"'), false)
    for (const type of Object.values(PROPOSAL_TYPES)) assert.ok(body.messages[0].content.includes(type))
    return { status: 200, body: { model: request.model, choices: [{ finish_reason: 'stop', message: { content: original } }] }, externalAttempted: false }
  }).analyze(request)
  assert.deepEqual(result.diagnostic, { stage: 'structure', reason: 'invalid_type' })
  assert.equal(JSON.stringify(value), original)
  assert.equal(finishAnalysis(startAnalysis(project, request).project, request, result).proposals.length, 0)
})
test('saved v3 historical generic type unchanged through read, backup, decision and save', () => {
  const completed = finishAnalysis(startAnalysis(project, request).project, request, { ok: true, value: { proposals: [proposal] }, externalAttempted: true, modelReported: request.model })
  completed.proposals[0].type = 'string'
  const w = createDefaultWorkspace(); w.projects.push(completed); w.activeProjectId = completed.id
  const raw = JSON.stringify(w)
  const loaded = parseWorkspace(raw)
  assert.equal(loaded.ok, true); assert.equal(loaded.workspace.projects[1].proposals[0].type, 'string')
  assert.equal(raw, JSON.stringify(w))
  const restored = recoverBackup(JSON.stringify(createBackup(loaded.workspace)))
  assert.equal(restored.ok, true); assert.equal(restored.workspace.projects[1].proposals[0].type, 'string')
  const p = restored.workspace.projects[1]
  const accepted = decideProposal(p, p.proposals[0].id, { status: 'accepted' }, 'accepted', 'pending')
  assert.equal(accepted.proposals[0].type, 'string'); assert.equal(accepted.decisions[0].proposalType, 'string')
  assert.equal(accepted.proposals[0].originalContent, p.proposals[0].originalContent)
  const map = new Map([[STORAGE_KEY, raw]])
  const saved = persistWorkspace({ ...restored.workspace, projects: [restored.workspace.projects[0], accepted] }, 0, 'fixture', { getItem: k => map.get(k) ?? null, setItem: (k,v) => map.set(k,v) })
  assert.equal(saved.ok, true); assert.equal(parseWorkspace(map.get(STORAGE_KEY)).workspace.projects[1].proposals[0].type, 'string')
})
