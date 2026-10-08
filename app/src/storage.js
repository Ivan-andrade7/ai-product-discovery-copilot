export const LEGACY_STORAGE_KEY = 'ai-product-discovery-copilot:v0.1'
export const STORAGE_KEY = 'ai-product-discovery-copilot:v0.2'
export const SCHEMA_VERSION = 2

const proposalStatuses = new Set(['pending', 'accepted', 'edited', 'rejected'])
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const isSource = (source) => source && isNonEmptyString(source.id) && isNonEmptyString(source.name) && isNonEmptyString(source.kind) && isNonEmptyString(source.status) && typeof source.detail === 'string'
const isProposal = (proposal) => proposal && isNonEmptyString(proposal.id) && isNonEmptyString(proposal.type) && isNonEmptyString(proposal.title) && typeof proposal.content === 'string' && typeof proposal.source === 'string' && typeof proposal.evidence === 'string' && typeof proposal.reasoning === 'string' && proposalStatuses.has(proposal.status)
const isDecision = (decision) => decision && isNonEmptyString(decision.id) && isNonEmptyString(decision.proposalId) && Number.isInteger(decision.sequence) && decision.sequence > 0

export function isProject(project) {
  return project && isNonEmptyString(project.id) && isNonEmptyString(project.name) && typeof project.objective === 'string' && typeof project.originalRequest === 'string' && Array.isArray(project.sources) && project.sources.every(isSource) && Array.isArray(project.proposals) && project.proposals.every(isProposal) && Array.isArray(project.decisions) && project.decisions.every(isDecision)
}

export function isWorkspace(workspace) {
  if (!workspace || workspace.schemaVersion !== SCHEMA_VERSION || !Number.isInteger(workspace.revision) || workspace.revision < 0 || !isNonEmptyString(workspace.writerId) || !isNonEmptyString(workspace.activeProjectId) || !Array.isArray(workspace.projects) || workspace.projects.length === 0 || !workspace.projects.every(isProject)) return false
  const ids = workspace.projects.map((project) => project.id)
  return new Set(ids).size === ids.length && ids.includes(workspace.activeProjectId)
}

export function parseWorkspace(raw) {
  if (!isNonEmptyString(raw)) return { ok: false, reason: 'empty' }
  try {
    const workspace = JSON.parse(raw)
    return isWorkspace(workspace) ? { ok: true, workspace } : { ok: false, reason: 'incompatible', raw }
  } catch {
    return { ok: false, reason: 'invalid-json', raw }
  }
}

function parseLegacy(raw, migrateLegacy) {
  if (!isNonEmptyString(raw)) return { ok: false, reason: 'empty', raw }
  let legacy
  try {
    legacy = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'invalid-json', raw }
  }
  if (!legacy?.project || !Array.isArray(legacy.proposals) || !Array.isArray(legacy.decisions)) return { ok: false, reason: 'incompatible', raw }
  try {
    const workspace = migrateLegacy(legacy)
    return isWorkspace(workspace) ? { ok: true, workspace } : { ok: false, reason: 'incompatible', raw }
  } catch {
    return { ok: false, reason: 'incompatible', raw }
  }
}

export function loadWorkspace({ createDefaultWorkspace, migrateLegacy }) {
  const currentRaw = window.localStorage.getItem(STORAGE_KEY)
  if (currentRaw !== null) {
    const parsed = parseWorkspace(currentRaw)
    if (parsed.ok) return { workspace: parsed.workspace, status: 'ready' }
    return { workspace: createDefaultWorkspace(), status: 'recovery-required', recoveryRaw: currentRaw, error: 'El estado v0.2 existe, pero no tiene un formato compatible.' }
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
  if (legacyRaw !== null) {
    const migrated = parseLegacy(legacyRaw, migrateLegacy)
    if (migrated.ok) return { workspace: migrated.workspace, status: 'migration-pending', legacyRaw }
    return {
      workspace: createDefaultWorkspace(),
      status: 'recovery-required',
      recoveryRaw: legacyRaw,
      legacyRaw,
      error: migrated.reason === 'invalid-json'
        ? 'El estado v0.1 no contiene JSON válido. No se creó v0.2; el original puede rescatarse.'
        : 'El estado v0.1 no tiene un formato compatible. No se creó v0.2; el original puede rescatarse.',
    }
  }
  return { workspace: createDefaultWorkspace(), status: 'new' }
}

export function persistWorkspace(candidate, expectedRevision, writerId) {
  const storedRaw = window.localStorage.getItem(STORAGE_KEY)
  if (storedRaw !== null) {
    const parsed = parseWorkspace(storedRaw)
    if (!parsed.ok) return { ok: false, type: 'recovery-required', raw: storedRaw }
    const stored = parsed.workspace
    if (stored.revision !== expectedRevision || stored.writerId !== candidate.writerId) return { ok: false, type: 'conflict', workspace: stored, raw: storedRaw }
  } else if (expectedRevision !== 0) {
    return { ok: false, type: 'conflict', workspace: null, raw: null }
  }

  const workspace = { ...candidate, revision: expectedRevision + 1, writerId }
  if (!isWorkspace(workspace)) return { ok: false, type: 'validation-error' }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
    return { ok: true, workspace }
  } catch (error) {
    return { ok: false, type: 'write-error', error }
  }
}

export function createBackup(workspace, legacyRaw = null) {
  return { backupFormat: 'ai-product-discovery-copilot-backup', exportedAt: new Date().toISOString(), workspace, legacyV01: legacyRaw }
}

export function recoverBackup(raw) {
  try {
    const backup = JSON.parse(raw)
    if (backup?.backupFormat !== 'ai-product-discovery-copilot-backup' || !isWorkspace(backup.workspace)) return { ok: false }
    return { ok: true, workspace: backup.workspace, legacyV01: backup.legacyV01 ?? null }
  } catch {
    return { ok: false }
  }
}
