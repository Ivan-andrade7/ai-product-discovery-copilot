import { isAnalysisRequest, nonEmpty } from './ai/contracts.js'

export const LEGACY_STORAGE_KEY = 'ai-product-discovery-copilot:v0.1'
export const PREVIOUS_STORAGE_KEY = 'ai-product-discovery-copilot:v0.2'
export const STORAGE_KEY = 'ai-product-discovery-copilot:v0.3'
export const SCHEMA_VERSION = 3
const statuses = new Set(['pending', 'accepted', 'edited', 'rejected'])
const origins = new Set(['demo', 'unknown', 'model'])
const runStatuses = new Set(['analyzing', 'complete', 'quota', 'rate_limit', 'permission', 'error', 'incomplete', 'invalid', 'stale', 'cancelled', 'disconnected', 'interrupted', 'cost_pending', 'budget_blocked', 'reconciliation_pending', 'busy'])
const unique = (items) => new Set(items.map((item) => item.id)).size === items.length
const sourceV2 = (s) => s && ['id', 'name', 'kind', 'status'].every((key) => nonEmpty(s[key])) && typeof s.detail === 'string'
const proposalV2 = (p) => p && ['id', 'type', 'title'].every((key) => nonEmpty(p[key])) && ['content', 'source', 'evidence', 'reasoning'].every((key) => typeof p[key] === 'string') && statuses.has(p.status)
const decisionV2 = (d) => d && nonEmpty(d.id) && nonEmpty(d.proposalId) && Number.isInteger(d.sequence) && d.sequence > 0
const projectV2 = (p) => p && nonEmpty(p.id) && nonEmpty(p.name) && typeof p.objective === 'string' && typeof p.originalRequest === 'string' && Array.isArray(p.sources) && p.sources.every(sourceV2) && Array.isArray(p.proposals) && p.proposals.every(proposalV2) && Array.isArray(p.decisions) && p.decisions.every(decisionV2)
function workspaceShape(w, version, checkProject) {
  return !!(w && w.schemaVersion === version && Number.isInteger(w.revision) && w.revision >= 0 && nonEmpty(w.writerId) && nonEmpty(w.activeProjectId) && Array.isArray(w.projects) && w.projects.length && w.projects.every(checkProject) && unique(w.projects) && w.projects.some((p) => p.id === w.activeProjectId))
}
function normalizedStoredRequest(request) {
  if (isAnalysisRequest(request)) return request
  if (!request || Object.hasOwn(request, 'userRequest') || typeof request.contextVersion !== 'string') return null
  try {
    const context = JSON.parse(request.contextVersion)
    const normalized = { ...request, userRequest: context.originalRequest }
    return isAnalysisRequest(normalized) ? normalized : null
  } catch { return null }
}
const isRun = (r) => r && nonEmpty(r.id) && runStatuses.has(r.status) && r.provider === 'abacus' && nonEmpty(r.modelRequested) && normalizedStoredRequest(r.request) && r.id === r.request.requestId && typeof r.externalAttempted === 'boolean'
const normalizeWorkspaceRequests = (workspace) => ({ ...workspace, projects: workspace.projects.map((project) => ({ ...project, runs: project.runs.map((run) => ({ ...run, request: normalizedStoredRequest(run.request) })) })) })
export function isProject(project) {
  if (!projectV2(project) || !['demo', 'personal', 'historical'].includes(project.mode) || !Array.isArray(project.runs) || !project.runs.every(isRun) || !unique(project.runs)) return false
  if (!unique(project.sources) || !unique(project.proposals) || !unique(project.decisions)) return false
  if (!project.sources.every((s) => typeof s.content === 'string' && typeof s.selected === 'boolean' && typeof s.reference === 'string')) return false
  if (!project.runs.every((r) => r.request.projectId === project.id)) return false
  return project.proposals.every((p) => origins.has(p.origin) && (typeof p.originalContent === 'string' || p.originalContent === null) && Array.isArray(p.sourceRefs) && p.sourceRefs.every((ref) => ref && nonEmpty(ref.sourceId) && nonEmpty(ref.quote) && project.sources.some((s) => s.id === ref.sourceId)) && (p.origin !== 'model' || (typeof p.originalContent === 'string' && project.runs.some((r) => r.id === p.runId && r.status === 'complete'))))
}
export function isWorkspace(workspace) {
  return workspaceShape(workspace, 3, isProject) && workspace.predecessors && [LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY].every((key) => workspace.predecessors[key] === null || typeof workspace.predecessors[key] === 'string')
}
export function parseWorkspace(raw) {
  if (!nonEmpty(raw)) return { ok: false, reason: 'empty', raw }
  try { const workspace = JSON.parse(raw); return isWorkspace(workspace) ? { ok: true, workspace: normalizeWorkspaceRequests(workspace) } : { ok: false, reason: 'incompatible', raw } }
  catch { return { ok: false, reason: 'invalid-json', raw } }
}
// Unknown origin remains unknown. Name/ID similarity is not evidence of an AI call.
export function upgradeV2(workspace, predecessors) {
  if (!workspaceShape(workspace, 2, projectV2)) throw new Error('incompatible-v2')
  const projects = workspace.projects.map((p) => {
    if ('mode' in p || 'runs' in p) throw new Error('reserved-field')
    return { ...p, mode: 'historical', runs: [], sources: p.sources.map((s) => {
      if (['content', 'selected', 'reference'].some((key) => key in s)) throw new Error('reserved-field')
      return { ...s, content: '', reference: '', selected: false }
    }), proposals: p.proposals.map((proposal) => {
      if (['origin', 'originalContent', 'sourceRefs', 'runId'].some((key) => key in proposal)) throw new Error('reserved-field')
      const history = [...p.decisions].sort((a, b) => a.sequence - b.sequence).find((d) => d.proposalId === proposal.id && typeof d.originalContent === 'string')
      const explicitlyDemo = proposal.source === 'Contenido simulado del producto' && proposal.evidence === 'Contenido ficticio para probar la interacción. No deriva de las fuentes aportadas a este proyecto.'
      return { ...proposal, origin: explicitlyDemo ? 'demo' : 'unknown', originalContent: history?.originalContent ?? (proposal.status === 'pending' && !p.decisions.some((d) => d.proposalId === proposal.id) ? proposal.content : null), sourceRefs: [] }
    }) }
  })
  if ('predecessors' in workspace) throw new Error('reserved-field')
  return { ...workspace, schemaVersion: 3, revision: 0, writerId: 'unpersisted', projects, predecessors }
}
export function loadWorkspace({ createDefaultWorkspace, migrateLegacy, storage } = {}) {
  let currentRaw = null
  let predecessors
  try {
    storage ??= window.localStorage
    currentRaw = storage.getItem(STORAGE_KEY)
    // Current version has precedence. Older raw keys are never parsed or modified.
    if (currentRaw !== null) {
      const result = parseWorkspace(currentRaw)
      if (!result.ok) return { workspace: createDefaultWorkspace(), status: 'recovery-required', recoveryRaw: currentRaw, error: 'El estado v0.3 es incompatible. Se conserva el original; no se reinició el almacenamiento.' }
      const workspace = { ...result.workspace, projects: result.workspace.projects.map((p) => ({ ...p, runs: p.runs.map((r) => r.status === 'analyzing' ? { ...r, status: 'interrupted' } : r) })) }
      return { workspace, status: 'ready' }
    }
    predecessors = { [LEGACY_STORAGE_KEY]: storage.getItem(LEGACY_STORAGE_KEY), [PREVIOUS_STORAGE_KEY]: storage.getItem(PREVIOUS_STORAGE_KEY) }
    const previousRaw = predecessors[PREVIOUS_STORAGE_KEY] ?? predecessors[LEGACY_STORAGE_KEY]
    if (previousRaw !== null) {
      currentRaw = previousRaw
      const previous = JSON.parse(previousRaw)
      let workspace
      if (predecessors[PREVIOUS_STORAGE_KEY] !== null) workspace = upgradeV2(previous, predecessors)
      else {
        if (!previous?.project || !Array.isArray(previous.proposals) || !Array.isArray(previous.decisions)) throw new Error('incompatible-v1')
        if (['id', 'name', 'objective', 'originalRequest', 'sources'].some((key) => key in previous.project && typeof previous.project[key] !== 'string')) throw new Error('incompatible-v1-project')
        // Raw v0.1 is retained exactly in predecessors, including unrecognized fields.
        workspace = upgradeV2(migrateLegacy(previous), predecessors)
      }
      if (!isWorkspace(workspace)) throw new Error('incompatible-migration')
      return { workspace, status: 'migration-pending' }
    }
    return { workspace: { ...createDefaultWorkspace(), predecessors }, status: 'new' }
  } catch {
    return { workspace: createDefaultWorkspace(), status: 'recovery-required', recoveryRaw: currentRaw, error: 'No se pudo leer o convertir el almacenamiento. No se escribió ni eliminó ningún dato. Podés rescatar el original disponible y reintentar la lectura.' }
  }
}
export function persistWorkspace(candidate, expectedRevision, writerId, storage) {
  if (!isWorkspace(candidate)) return { ok: false, type: 'validation-error' }
  try {
    storage ??= window.localStorage
    const raw = storage.getItem(STORAGE_KEY)
    if (raw !== null) {
      const parsed = parseWorkspace(raw)
      if (!parsed.ok) return { ok: false, type: 'recovery-required', raw }
      if (parsed.workspace.revision !== expectedRevision || parsed.workspace.writerId !== candidate.writerId) return { ok: false, type: 'conflict', workspace: parsed.workspace, raw }
    } else if (expectedRevision !== 0) return { ok: false, type: 'conflict', raw: null }
    for (const key of [LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY]) {
      if (storage.getItem(key) !== candidate.predecessors[key]) return { ok: false, type: 'recovery-required', raw: storage.getItem(key), message: 'Una versión anterior cambió sus datos. Exportá ambas copias; no se fusionarán automáticamente.' }
    }
  } catch { return { ok: false, type: 'read-error' } }
  const workspace = { ...normalizeWorkspaceRequests(candidate), revision: expectedRevision + 1, writerId }
  try { storage.setItem(STORAGE_KEY, JSON.stringify(workspace)); return { ok: true, workspace } }
  catch { return { ok: false, type: 'write-error' } }
}
export function createBackup(workspace) {
  return { backupFormat: 'ai-product-discovery-copilot-backup', exportedAt: new Date().toISOString(), workspace, originals: workspace.predecessors }
}
export function recoverBackup(raw) {
  try {
    const backup = JSON.parse(raw)
    if (backup?.backupFormat !== 'ai-product-discovery-copilot-backup') return { ok: false }
    if (isWorkspace(backup.workspace)) return { ok: true, workspace: normalizeWorkspaceRequests(backup.workspace) }
    // Programmatic recovery only. Do not write to the browser automatically.
    const predecessors = { [LEGACY_STORAGE_KEY]: backup.legacyV01 ?? null, [PREVIOUS_STORAGE_KEY]: JSON.stringify(backup.workspace) }
    const workspace = upgradeV2(backup.workspace, predecessors)
    return isWorkspace(workspace) ? { ok: true, workspace } : { ok: false }
  } catch { return { ok: false } }
}
