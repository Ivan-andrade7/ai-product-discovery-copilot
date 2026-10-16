// Provider-independent text contract. URLs are references, never fetched.
import { invalidResult, safeDiagnostic, safeFinishReason } from './diagnostics.js'
export const LIMITS = Object.freeze({ sources: 10, inputChars: 24000, outputChars: 32000, proposals: 12 })
export const PROPOSAL_TYPES = Object.freeze({ evidence: 'Afirmación', hypothesis: 'Hipótesis', question: 'Pregunta' })
export const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0
export const originLabel = (origin) => ({ simulation: 'Simulación E1 · no es IA real', demo: 'Simulación histórica · no es IA real', model: 'Propuesta de IA · requiere revisión', unknown: 'Procedencia histórica no comprobada' }[origin] ?? 'Procedencia no comprobada')
export const analysisMessages = Object.freeze({
  disconnected: 'Análisis no disponible. La conexión externa está deshabilitada en este lote.',
  cost_pending: 'Análisis no disponible. Falta confirmar el costo en créditos; las generaciones siguen deshabilitadas.',
  budget_blocked: 'Prueba detenida por presupuesto, límite de solicitudes o registro de consumo incompleto.',
  reconciliation_pending: 'Generación bloqueada hasta reconciliar el consumo de la solicitud anterior.',
  busy: 'Ya hay una solicitud en curso. La prueba sólo admite solicitudes secuenciales.',
  checking: 'Comprobando únicamente el servicio local.',
  ready: 'Conexión disponible. Revisá el contenido antes de enviarlo.',
  analyzing: 'Análisis en curso. Esperando una respuesta completa y válida.',
  complete: 'Respuesta completa incorporada a la cola. Requiere revisión humana.',
  quota: 'Cuota agotada según la respuesta recibida. No se reintentará ni se comprará saldo.',
  rate_limit: 'Límite de solicitudes. No se reintentará automáticamente.',
  permission: 'Acceso no autorizado. No se modificaron las fuentes.',
  error: 'No se pudo completar el análisis. Conservamos las entradas; el reintento es manual.',
  incomplete: 'Respuesta incompleta. No se incorporó a propuestas ni entregables.',
  invalid: 'Respuesta o referencias inválidas. No se incorporó contenido.',
  stale: 'El contexto cambió o existe un conflicto. El resultado no se aplicó.',
  cancelled: 'Operación cancelada. No se incorporó una respuesta.',
  interrupted: 'La sesión terminó antes de completar la operación. No se reanudó automáticamente.',
  uncertain: 'Resultado incierto. No se reenviará automáticamente; nuevos análisis bloqueados.',
})

export function selectedContext(project) {
  return project.sources.filter((source) => source.selected && nonEmpty(source.content)).map(({ id, name, content }) => ({ id, name, content }))
}

export function e1HumanContext(project) {
  const stage = project.stageWork?.E1
  const selected = new Set(selectedContext(project).map((s) => s.id))
  const contributions = (stage?.humanInputs ?? []).filter((i) => i.projectId === project.id && i.sourceIds.every((id) => selected.has(id))).map((i) => ({ ...i, sourceIds: [...i.sourceIds] }))
  const known = { objective: stage?.known.objective ?? '', constraints: stage?.known.constraints ?? '' }
  for (const input of contributions) if (['objective', 'constraints'].includes(input.field)) known[input.field] = input.content
  return { origin: 'human', certainty: 'declaration-not-independent-evidence', known, contributions }
}

export function contextVersion(project, stage) {
  return JSON.stringify({ projectId: project.id, originalRequest: project.originalRequest, sources: selectedContext(project), ...(stage === 'E1' ? { stage, instructionVersion: 'e1-intake-v1', humanContext: e1HumanContext(project) } : {}) })
}

// JSONB preserves values and array order, but not object property order.
// Keep historical snapshots intact; compare their structured content.
export function sameContext(left, right) {
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value
  try { return JSON.stringify(canonical(JSON.parse(left))) === JSON.stringify(canonical(JSON.parse(right))) }
  catch { return false }
}

export function makeRequest(project, model, requestId = crypto.randomUUID(), stage) {
  const request = { requestId, projectId: project.id, contextVersion: contextVersion(project, stage), userRequest: project.originalRequest, sources: selectedContext(project), model, ...(stage === 'E1' ? { stage, instructionVersion: 'e1-intake-v1', humanContext: e1HumanContext(project) } : {}) }
  if (!isAnalysisRequest(request)) throw new Error('invalid-request')
  return request
}

export function isAnalysisRequest(value) {
  if (!value || !['requestId', 'projectId', 'contextVersion', 'userRequest', 'model'].every((key) => nonEmpty(value[key]))) return false
  if (value.requestId.length > 100 || value.projectId.length > 100 || value.model.length > 100 || value.model === 'route-llm') return false
  if (!Array.isArray(value.sources) || !value.sources.length || value.sources.length > LIMITS.sources) return false
  if (!value.sources.every((source) => source && Object.keys(source).length === 3 && ['id', 'name', 'content'].every((key) => nonEmpty(source[key])))) return false
  if (new Set(value.sources.map((source) => source.id)).size !== value.sources.length) return false
  const sourceChars = value.sources.reduce((n, source) => n + source.content.length, 0)
  if (value.userRequest.length + sourceChars > LIMITS.inputChars || JSON.stringify(value).length > LIMITS.inputChars * 3) return false
  if (value.stage !== undefined) {
    const h = value.humanContext
    if (value.stage !== 'E1' || value.instructionVersion !== 'e1-intake-v1' || h?.origin !== 'human' || h.certainty !== 'declaration-not-independent-evidence' || !['objective', 'constraints'].every((k) => typeof h.known?.[k] === 'string') || !Array.isArray(h.contributions)) return false
    if (!h.contributions.every((i) => i && nonEmpty(i.id) && nonEmpty(i.content) && i.origin === 'human' && i.projectId === value.projectId && [null, 'objective', 'constraints'].includes(i.field) && Array.isArray(i.sourceIds) && i.sourceIds.every((id) => value.sources.some((s) => s.id === id)))) return false
    if (value.userRequest.length + sourceChars + JSON.stringify(h).length > LIMITS.inputChars) return false
  }
  return sameContext(value.contextVersion, JSON.stringify({ projectId: value.projectId, originalRequest: value.userRequest, sources: value.sources, ...(value.stage === 'E1' ? { stage: value.stage, instructionVersion: value.instructionVersion, humanContext: value.humanContext } : {}) }))
}

export function validateResult(value, request) {
  if (!isAnalysisRequest(request)) return invalidResult('control', 'invalid_request')
  if (!value || !Array.isArray(value.proposals) || value.proposals.length > LIMITS.proposals) return invalidResult('structure', 'invalid_proposals')
  try { if (JSON.stringify(value).length > LIMITS.outputChars) return invalidResult('structure', 'output_too_large') }
  catch { return invalidResult('structure', 'not_serializable') }
  for (const proposal of value.proposals) {
    if (!proposal || !['type', 'title', 'content', 'reasoning'].every((key) => nonEmpty(proposal[key]))) return invalidResult('structure', 'invalid_fields')
    if (!['evidence', 'hypothesis', 'question'].includes(proposal.certainty)) return invalidResult('structure', 'invalid_certainty')
    if (proposal.type !== PROPOSAL_TYPES[proposal.certainty]) return invalidResult('structure', 'invalid_type')
    if (!Array.isArray(proposal.references)) return invalidResult('structure', 'invalid_reference_list')
    if (proposal.certainty === 'evidence' && !proposal.references.length) return invalidResult('references', 'evidence_without_reference')
    for (const ref of proposal.references) {
      if (!ref || !nonEmpty(ref.sourceId) || !nonEmpty(ref.quote)) return invalidResult('references', 'invalid_reference')
      const source = request.sources.find((item) => item.id === ref.sourceId)
      if (!source) return invalidResult('references', 'unknown_source')
      if (!source.content.includes(ref.quote)) return invalidResult('references', 'quote_not_found')
    }
  }
  return { ok: true }
}

export function startAnalysis(project, request) {
  if (project.mode !== 'personal' || !isAnalysisRequest(request) || request.projectId !== project.id || !sameContext(request.contextVersion, contextVersion(project, request.stage))) return { ok: false, code: 'stale' }
  if (project.runs.some((run) => run.status === 'analyzing' || run.id === request.requestId)) return { ok: false, code: 'busy' }
  const run = { id: request.requestId, status: 'analyzing', provider: request.model === 'simulation-e1' && request.stage === 'E1' ? 'simulation' : 'abacus', modelRequested: request.model, request, startedAt: new Date().toISOString(), externalAttempted: false }
  return { ok: true, project: { ...project, ...(request.stage === 'E1' ? { stageWork: { ...project.stageWork, E1: { ...project.stageWork.E1, closed: false } } } : {}), runs: [...project.runs, run] } }
}

export function finishAnalysis(project, request, result, { stale = false } = {}) {
  const run = project.runs.find((item) => item.id === request.requestId)
  if (!run || run.status !== 'analyzing') return project
  let status = result.code ?? 'error'
  if (!result.ok && status === 'complete') status = 'invalid'
  if (stale || !sameContext(request.contextVersion, contextVersion(project, request.stage))) status = 'stale'
  else if (result.ok) status = run.provider === 'simulation' && (result.simulated !== true || result.externalAttempted !== false || result.modelReported !== 'simulation-e1') ? 'invalid' : validateResult(result.value, request).ok ? 'complete' : 'invalid'
  if (!Object.hasOwn(analysisMessages, status)) status = 'error'
  const proposals = status === 'complete' ? result.value.proposals.map((proposal, index) => ({
    id: `${request.requestId}:${index}`, type: proposal.type, title: proposal.title,
    content: proposal.content, originalContent: proposal.content, origin: run.provider === 'simulation' && result.simulated === true ? 'simulation' : 'model', runId: request.requestId,
    ...(request.stage === 'E1' ? { stage: 'E1', ...(proposal.certainty === 'question' && ['objective', 'constraints'].includes(proposal.e1Field) ? { e1Field: proposal.e1Field } : {}) } : {}),
    certainty: proposal.certainty, sourceRefs: proposal.references.map((ref) => ({ ...ref })),
    source: proposal.references.length ? 'Contenido seleccionado para este análisis' : 'Sin respaldo documental directo',
    evidence: proposal.references.map((ref) => ref.quote).join('\n'), reasoning: proposal.reasoning, status: 'pending',
  })) : []
  return { ...project, proposals: [...project.proposals, ...proposals], runs: project.runs.map((item) => item.id !== run.id ? item : {
    ...item, status, endedAt: new Date().toISOString(), externalAttempted: result.externalAttempted === true,
    modelReported: typeof result.modelReported === 'string' ? result.modelReported : null,
    usage: result.usage ?? null,
    trialRequestNumber: result.trialRequestNumber ?? null,
    ...(safeDiagnostic(result.diagnostic) ? { diagnostic: safeDiagnostic(result.diagnostic) } : {}),
    ...(Number.isInteger(result.httpStatus) ? { httpStatus: result.httpStatus } : {}),
    finishReason: safeFinishReason(result.finishReason),
  }) }
}

export function decideProposal(project, id, changes, action, expectedStatus) {
  const previous = project.proposals.find((proposal) => proposal.id === id)
  if (!previous || previous.status !== expectedStatus) return project
  const allowed = { accepted: 'accepted', 'edited-and-accepted': 'edited', rejected: 'rejected', reopened: 'pending' }
  if (allowed[action] !== changes.status || (action === 'reopened' ? previous.status === 'pending' : previous.status !== 'pending')) return project
  if (changes.status === 'edited' && !nonEmpty(changes.content)) return project
  const updated = { ...previous, status: changes.status, content: changes.status === 'edited' ? changes.content : previous.content }
  return { ...project, ...(previous.stage === 'E1' && project.stageWork?.E1 ? { stageWork: { ...project.stageWork, E1: { ...project.stageWork.E1, closed: false } } } : {}), proposals: project.proposals.map((proposal) => proposal.id === id ? updated : proposal), decisions: [...project.decisions, {
    id: `decision-${crypto.randomUUID()}`, sequence: Math.max(0, ...project.decisions.map((decision) => decision.sequence)) + 1,
    proposalId: id, proposalType: previous.type, proposalTitle: previous.title, action,
    previousStatus: previous.status, currentStatus: updated.status, originalContent: previous.originalContent,
    origin: previous.origin, previousContent: previous.content, currentContent: updated.content,
  }] }
}
