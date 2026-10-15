import test from 'node:test'
import assert from 'node:assert/strict'
import { createDefaultWorkspace, createLocalProject, migrateLegacyWorkspace } from '../src/data/demoData.js'
import { applyCreationAttempt, hasMeaningfulRequest, pendingDrafts, resolveReviewSelection, setReviewDraft } from '../src/workflow.js'
import { createBackup, loadWorkspace, persistWorkspace, recoverBackup, STORAGE_KEY } from '../src/storage.js'
import { decideProposal } from '../src/ai/contracts.js'

for (const value of ['', '   ', '\t\t', '\n\r\n', ' \t\n ']) {
  test('request rejects whitespace: ' + JSON.stringify(value), () => assert.equal(hasMeaningfulRequest(value), false))
}
for (const value of ['a', '  Texto breve \n', '¿Qué ocurrió? 日本語']) {
  test('request validates without rewriting: ' + JSON.stringify(value), () => {
    assert.equal(hasMeaningfulRequest(value), true)
    assert.equal(createLocalProject({ name: 'Ficticio', objective: value }).originalRequest, value)
  })
}

test('session drafts isolate project/proposal, discard only one and never change workspace or backup', () => {
  const workspace = createDefaultWorkspace()
  const before = JSON.stringify(workspace)
  let drafts = setReviewDraft({}, 'project-a', 'proposal-a', { text: ' Sin guardar \n', baseContent: 'Original A' })
  drafts = setReviewDraft(drafts, 'project-a', 'proposal-b', { text: 'Borrador B', baseContent: 'Original B' })
  drafts = setReviewDraft(drafts, 'project-b', 'proposal-a', { text: 'Otro proyecto', baseContent: 'Original' })
  assert.equal(pendingDrafts(drafts, 'project-a').length, 2)
  drafts = setReviewDraft(drafts, 'project-a', 'proposal-a', null)
  assert.equal(pendingDrafts(drafts, 'project-a').length, 1)
  assert.equal(drafts['project-b']['proposal-a'].text, 'Otro proyecto')
  assert.equal(JSON.stringify(workspace), before)
  assert.equal(JSON.stringify(createBackup(workspace)).includes('Borrador B'), false)
})

test('opening editor or restoring original text does not require exit warning; confirmation is one decision', () => {
  const workspace = createDefaultWorkspace()
  const project = workspace.projects[0], proposal = project.proposals[0]
  let drafts = setReviewDraft({}, project.id, proposal.id, { text: proposal.content, baseContent: proposal.content })
  assert.equal(pendingDrafts(drafts, project.id).length, 0)
  drafts = setReviewDraft(drafts, project.id, proposal.id, { text: 'Edición explícita', baseContent: proposal.content })
  assert.equal(pendingDrafts(drafts, project.id).length, 1)
  const decided = decideProposal(project, proposal.id, { content: drafts[project.id][proposal.id].text, status: 'edited' }, 'edited-and-accepted', 'pending')
  assert.equal(decided.decisions.length, 1)
  assert.equal(decideProposal(decided, proposal.id, { status: 'edited', content: 'Repetida' }, 'edited-and-accepted', 'pending'), decided)
  assert.equal(decided.proposals[0].originalContent, proposal.originalContent)
})

test('stable creation candidate survives write failure, retry, export and reload; identical intentional project is distinct', () => {
  const map = new Map(), storage = { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => { map.set(key, value) } }
  let workspace = persistWorkspace(createDefaultWorkspace(), 0, 'test-writer', storage).workspace
  const priorRaw = map.get(STORAGE_KEY)
  const input = { name: 'Iguales a propósito', objective: ' Original literal \n', sources: ' Fuente literal \n' }
  const created = createLocalProject(input)
  storage.setItem = () => { throw new Error('fictitious-write-failure') }
  workspace = applyCreationAttempt(workspace, created)
  assert.equal(persistWorkspace(workspace, workspace.revision, 'test-writer', storage).type, 'write-error')
  workspace = applyCreationAttempt(workspace, created)
  assert.equal(workspace.projects.length, 2)
  assert.equal(workspace.projects[1], created)
  assert.equal(map.get(STORAGE_KEY), priorRaw)
  assert.deepEqual(recoverBackup(JSON.stringify(createBackup(workspace))).workspace.projects[1], created)
  assert.equal(loadWorkspace({ createDefaultWorkspace, migrateLegacy: migrateLegacyWorkspace, storage }).workspace.projects.length, 1)
  storage.setItem = (key, value) => map.set(key, value)
  const saved = persistWorkspace(workspace, workspace.revision, 'test-writer', storage)
  assert.equal(saved.ok, true)
  assert.deepEqual(loadWorkspace({ createDefaultWorkspace, storage }).workspace.projects[1], created)
  const intentional = createLocalProject(input)
  assert.notEqual(intentional.id, created.id)
  assert.equal(applyCreationAttempt(saved.workspace, intentional).projects.length, 3)
})

test('retry remains blocked against a newer tab revision, preserving both copies', () => {
  const map = new Map(), storage = { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) }
  const initial = persistWorkspace(createDefaultWorkspace(), 0, 'a', storage).workspace
  const candidate = applyCreationAttempt(initial, createLocalProject({ name: 'Local', objective: 'Ficticia' }))
  const external = persistWorkspace({ ...initial, projects: [...initial.projects, createLocalProject({ name: 'Externo', objective: 'Ficticia' })] }, initial.revision, 'b', storage)
  const raw = map.get(STORAGE_KEY)
  assert.equal(persistWorkspace(candidate, candidate.revision, 'a', storage).type, 'conflict')
  assert.equal(map.get(STORAGE_KEY), raw)
  assert.equal(external.workspace.projects.length, 2)
  assert.equal(candidate.projects.length, 2)
})

test('exact review selection: first, second, resolved, pending; never fallback for foreign or missing IDs', () => {
  const project = createDefaultWorkspace().projects[0]
  project.proposals[1].status = 'accepted'
  for (const p of project.proposals) assert.equal(resolveReviewSelection(project, { projectId: project.id, proposalId: p.id }).proposal, p)
  for (const selection of [{ projectId: project.id, proposalId: 'missing' }, { projectId: 'foreign', proposalId: project.proposals[0].id }]) {
    assert.deepEqual(resolveReviewSelection(project, selection), { proposal: undefined, missing: true })
  }
  assert.equal(resolveReviewSelection({ ...project, proposals: [] }).proposal, undefined)
  assert.equal(resolveReviewSelection(project).proposal.id, project.proposals[0].id)
})
