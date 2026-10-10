import { useEffect, useRef, useState } from 'react'
import { createDefaultWorkspace, createLocalProject, migrateLegacyWorkspace } from './data/demoData'
import { analyze, checkConnection } from './ai/client'
import { decideProposal, finishAnalysis, makeRequest, startAnalysis } from './ai/contracts'
import { ActivityScreen } from './screens/ActivityScreen'
import { DecisionsScreen } from './screens/DecisionsScreen'
import { DeliverablesScreen } from './screens/DeliverablesScreen'
import { NewProjectScreen } from './screens/NewProjectScreen'
import { OverviewScreen } from './screens/OverviewScreen'
import { ProjectsScreen } from './screens/ProjectsScreen'
import { SourcesScreen } from './screens/SourcesScreen'
import { WorkScreen } from './screens/WorkScreen'
import { createBackup, LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY, loadWorkspace, parseWorkspace, persistWorkspace, STORAGE_KEY } from './storage'
import './App.css'

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [initialLoad] = useState(() => loadWorkspace({ createDefaultWorkspace, migrateLegacy: migrateLegacyWorkspace }))
  const [workspace, setWorkspace] = useState(initialLoad.workspace)
  const [screen, setScreen] = useState('projects')
  const [storageState, setStorageState] = useState({ type: initialLoad.status, message: initialLoad.error, external: null, raw: initialLoad.recoveryRaw ?? null })
  const workspaceRef = useRef(initialLoad.workspace)
  const storageStateRef = useRef(storageState)
  const writerIdRef = useRef(crypto.randomUUID())
  const initialPersistAttempted = useRef(false)
  const [connection, setConnection] = useState({ available: false, code: 'disconnected' })
  const [operation, setOperation] = useState(null)
  const inFlight = useRef(null)

  useEffect(() => { storageStateRef.current = storageState }, [storageState])

  useEffect(() => {
    if (initialLoad.status !== 'migration-pending' && initialLoad.status !== 'new') return
    if (initialPersistAttempted.current) return
    initialPersistAttempted.current = true
    const result = persistWorkspace(workspaceRef.current, 0, writerIdRef.current)
    if (result.ok) {
      workspaceRef.current = result.workspace
      setWorkspace(result.workspace)
      setStorageState({ type: initialLoad.status === 'migration-pending' ? 'migrated' : 'ready', external: null, raw: null })
    } else {
      setStorageState({ type: result.type, message: 'No se pudo crear el nuevo almacenamiento. La copia en memoria sigue disponible.', external: result.workspace ?? null, raw: result.raw ?? null })
    }
  }, [initialLoad.status])

  useEffect(() => {
    function handleStorage(event) {
      if ([LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY].includes(event.key) || event.key === null) {
        const next = { type: 'recovery-required', message: 'Cambió una versión anterior o se vació el almacenamiento. Exportá esta copia antes de reintentar la lectura.', external: null, raw: event.newValue }
        storageStateRef.current = next
        setStorageState(next)
        return
      }
      if (event.key !== STORAGE_KEY) return
      const parsed = parseWorkspace(event.newValue)
      if (!parsed.ok) {
        const next = { type: 'recovery-required', message: 'Otra pestaña eliminó o guardó datos incompatibles. No se sobrescribirán.', external: null, raw: event.newValue }
        storageStateRef.current = next
        setStorageState(next)
        return
      }
      const external = parsed.workspace
      const current = workspaceRef.current
      if (external.revision !== current.revision || external.writerId !== current.writerId) {
        const next = { type: 'conflict', message: 'Hay cambios de otra pestaña. Esta copia quedó bloqueada para evitar sobrescrituras.', external, raw: event.newValue }
        storageStateRef.current = next
        setStorageState(next)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const project = workspace.projects.find((item) => item.id === workspace.activeProjectId) ?? workspace.projects[0]
  const isReadOnly = ['conflict', 'recovery-required', 'read-error', 'validation-error'].includes(storageState.type)

  function commitWorkspace(update) {
    if (['conflict', 'recovery-required', 'read-error', 'validation-error'].includes(storageStateRef.current.type)) return false
    const current = workspaceRef.current
    const candidate = update(current)
    if (candidate === current) return false
    const result = persistWorkspace(candidate, current.revision, writerIdRef.current)
    if (result.ok) {
      workspaceRef.current = result.workspace
      setWorkspace(result.workspace)
      storageStateRef.current = { type: 'ready', external: null, raw: null }
      setStorageState(storageStateRef.current)
      return true
    }
    if (result.type === 'write-error') {
      workspaceRef.current = candidate
      setWorkspace(candidate)
      storageStateRef.current = { type: 'write-error', message: 'No se pudo guardar. Los cambios siguen en esta pestaña y podés exportarlos.', external: null, raw: null }
      setStorageState(storageStateRef.current)
      return false
    }
    storageStateRef.current = { type: result.type, message: result.message ?? 'No se pudo validar o leer el almacenamiento. No se sobrescribió.', external: result.workspace ?? null, raw: result.raw ?? null }
    setStorageState(storageStateRef.current)
    return false
  }

  function updateActiveProject(transform) {
    return updateProject(workspaceRef.current.activeProjectId, transform)
  }

  function updateProject(projectId, transform) {
    return commitWorkspace((current) => {
      const existing = current.projects.find((item) => item.id === projectId)
      if (!existing) return current
      const updated = transform(existing)
      if (updated === existing) return current
      return { ...current, projects: current.projects.map((item) => item.id === projectId ? updated : item) }
    })
  }

  function createProject(input) {
    const created = createLocalProject(input)
    const saved = commitWorkspace((current) => ({ ...current, activeProjectId: created.id, projects: [...current.projects, created] }))
    if (saved) setScreen('overview')
    return saved
  }

  function openProject(id) {
    if (id === workspaceRef.current.activeProjectId) { setScreen('overview'); return true }
    const saved = commitWorkspace((current) => ({ ...current, activeProjectId: id }))
    if (saved) setScreen('overview')
    return saved
  }

  function updateProposal(id, changes, action, expectedStatus) {
    return updateActiveProject((currentProject) => decideProposal(currentProject, id, changes, action, expectedStatus))
  }

  function selectSource(id, selected) {
    updateActiveProject((current) => ({ ...current, sources: current.sources.map((source) => source.id === id ? { ...source, selected } : source) }))
  }

  async function inspectConnection() {
    setConnection({ available: false, code: 'checking' })
    setConnection(await checkConnection())
  }

  async function runAnalysis() {
    if (inFlight.current || !connection.available || isReadOnly || storageState.type === 'write-error') return
    const current = workspaceRef.current.projects.find((item) => item.id === workspaceRef.current.activeProjectId)
    let request
    try { request = makeRequest(current, connection.model) } catch { setOperation({ projectId: current.id, code: 'invalid' }); return }
    const started = startAnalysis(current, request)
    if (!started.ok) { setOperation({ projectId: current.id, code: 'stale' }); return }
    const controller = new AbortController()
    inFlight.current = { request, controller }
    if (!updateProject(current.id, () => started.project)) { inFlight.current = null; return }
    setOperation({ projectId: current.id, code: 'analyzing' })
    const result = await analyze(request, connection, controller.signal)
    const stale = inFlight.current?.invalidated || ['conflict', 'recovery-required', 'read-error', 'validation-error'].includes(storageStateRef.current.type)
    const target = workspaceRef.current.projects.find((item) => item.id === request.projectId)
    const finished = target && finishAnalysis(target, request, result, { stale })
    let code = finished?.runs.find((run) => run.id === request.requestId)?.status ?? 'stale'
    if (!stale && target) updateProject(request.projectId, () => finished)
    if (['conflict', 'recovery-required', 'read-error', 'validation-error'].includes(storageStateRef.current.type)) code = 'stale'
    setOperation({ projectId: request.projectId, code })
    inFlight.current = null
  }

  function cancelAnalysis() {
    inFlight.current?.controller.abort()
  }

  function exportCurrent() {
    downloadJson(`discovery-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`, createBackup(workspaceRef.current))
  }

  function loadExternal() {
    if (!storageState.external) return
    if (inFlight.current) {
      inFlight.current.invalidated = true
      inFlight.current.controller.abort()
    }
    workspaceRef.current = storageState.external
    setWorkspace(storageState.external)
    storageStateRef.current = { type: 'ready', external: null, raw: null }
    setStorageState(storageStateRef.current)
    setScreen('projects')
  }

  const banner = storageState.type !== 'ready' ? (
    <div className={`storage-banner ${storageState.type}`} role="status">
      <span>{storageState.message ?? (storageState.type === 'migrated' ? 'Estado migrado a v0.3. Las claves anteriores permanecen intactas.' : 'Estado local preparado.')}</span>
      <div>
        {initialLoad.status !== 'recovery-required' && <button className="button" type="button" onClick={exportCurrent}>Exportar respaldo</button>}
        {['recovery-required', 'read-error'].includes(storageState.type) && <button className="button" type="button" onClick={() => window.location.reload()}>Reintentar lectura (exportá antes)</button>}
        {storageState.type === 'conflict' && storageState.external && <button className="button primary" type="button" onClick={loadExternal}>Cargar cambios externos</button>}
        {storageState.raw && <button className="button" type="button" onClick={() => downloadJson('discovery-copilot-datos-originales.json', { raw: storageState.raw })}>Rescatar original</button>}
      </div>
    </div>
  ) : null

  const shared = { project, proposals: project.proposals, onHome: () => setScreen('projects'), onNavigate: setScreen }
  let content
  if (screen === 'new-project') content = <NewProjectScreen onCancel={() => setScreen('projects')} onCreate={createProject} disabled={isReadOnly} />
  else if (screen === 'overview') content = <OverviewScreen {...shared} />
  else if (screen === 'work') content = <WorkScreen key={project.id} {...shared} onUpdateProposal={updateProposal} readOnly={isReadOnly} connection={connection} operation={operation?.projectId === project.id ? operation : null} onCheckConnection={inspectConnection} onAnalyze={runAnalysis} onCancelAnalysis={cancelAnalysis} onSelectSource={selectSource} canSave={storageState.type !== 'write-error'} />
  else if (screen === 'decisions') content = <DecisionsScreen {...shared} decisions={project.decisions} />
  else if (screen === 'sources') content = <SourcesScreen key={project.id} {...shared} sources={project.sources} onSelectSource={selectSource} readOnly={isReadOnly} />
  else if (screen === 'deliverables') content = <DeliverablesScreen {...shared} />
  else if (screen === 'activity') content = <ActivityScreen {...shared} decisions={project.decisions} />
  else content = <ProjectsScreen projects={workspace.projects} activeProjectId={workspace.activeProjectId} onNewProject={() => setScreen('new-project')} onOpenProject={openProject} disabled={isReadOnly} />

  return <>{banner}{initialLoad.status === 'recovery-required' && storageState.type === 'recovery-required' ? <main className="form-page"><h1>Recuperación requerida</h1><p>Los datos originales no se reemplazaron por un demo. Rescatá el original disponible o reintentá la lectura. No hay importación por interfaz en este lote.</p></main> : content}</>
}

export default App
