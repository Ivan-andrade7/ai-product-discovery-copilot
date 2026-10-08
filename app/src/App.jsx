import { useEffect, useRef, useState } from 'react'
import { createDefaultWorkspace, createLocalProject, initialProposals, migrateLegacyWorkspace } from './data/demoData'
import { ActivityScreen } from './screens/ActivityScreen'
import { DecisionsScreen } from './screens/DecisionsScreen'
import { DeliverablesScreen } from './screens/DeliverablesScreen'
import { NewProjectScreen } from './screens/NewProjectScreen'
import { OverviewScreen } from './screens/OverviewScreen'
import { ProjectsScreen } from './screens/ProjectsScreen'
import { SourcesScreen } from './screens/SourcesScreen'
import { WorkScreen } from './screens/WorkScreen'
import { createBackup, LEGACY_STORAGE_KEY, loadWorkspace, parseWorkspace, persistWorkspace, STORAGE_KEY } from './storage'
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
  const legacyRawRef = useRef(initialLoad.legacyRaw ?? window.localStorage.getItem(LEGACY_STORAGE_KEY))

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
      if (event.key !== STORAGE_KEY || event.newValue === null) return
      const parsed = parseWorkspace(event.newValue)
      if (!parsed.ok) {
        setStorageState({ type: 'recovery-required', message: 'Otra pestaña guardó datos incompatibles. No se sobrescribirán.', external: null, raw: event.newValue })
        return
      }
      const external = parsed.workspace
      const current = workspaceRef.current
      if (external.revision !== current.revision || external.writerId !== current.writerId) {
        setStorageState({ type: 'conflict', message: 'Hay cambios de otra pestaña. Esta copia quedó bloqueada para evitar sobrescrituras.', external, raw: event.newValue })
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const project = workspace.projects.find((item) => item.id === workspace.activeProjectId) ?? workspace.projects[0]
  const isReadOnly = storageState.type === 'conflict' || storageState.type === 'recovery-required'

  function commitWorkspace(update) {
    if (storageStateRef.current.type === 'conflict' || storageStateRef.current.type === 'recovery-required') return false
    const current = workspaceRef.current
    const candidate = update(current)
    const result = persistWorkspace(candidate, current.revision, writerIdRef.current)
    if (result.ok) {
      workspaceRef.current = result.workspace
      setWorkspace(result.workspace)
      setStorageState({ type: 'ready', external: null, raw: null })
      return true
    }
    if (result.type === 'write-error') {
      workspaceRef.current = candidate
      setWorkspace(candidate)
      setStorageState({ type: 'write-error', message: 'No se pudo guardar. Los cambios siguen en esta pestaña y podés exportarlos.', external: null, raw: null })
      return false
    }
    setStorageState({ type: result.type, message: 'El almacenamiento cambió fuera de esta pestaña. No se sobrescribió.', external: result.workspace ?? null, raw: result.raw ?? null })
    return false
  }

  function updateActiveProject(transform) {
    return commitWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === current.activeProjectId ? transform(item) : item) }))
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
    return updateActiveProject((currentProject) => {
      const previous = currentProject.proposals.find((proposal) => proposal.id === id)
      if (!previous || previous.status !== expectedStatus) return currentProject
      const updated = { ...previous, ...changes }
      return {
        ...currentProject,
        proposals: currentProject.proposals.map((proposal) => proposal.id === id ? updated : proposal),
        decisions: [...currentProject.decisions, {
          id: `decision-${crypto.randomUUID()}`,
          sequence: currentProject.decisions.length + 1,
          proposalId: id,
          proposalType: previous.type,
          proposalTitle: previous.title,
          action,
          previousStatus: previous.status,
          currentStatus: updated.status,
          originalContent: initialProposals.find((proposal) => proposal.id === id)?.content ?? previous.content,
          previousContent: previous.content,
          currentContent: updated.content,
        }],
      }
    })
  }

  function exportCurrent() {
    downloadJson(`discovery-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`, createBackup(workspaceRef.current, legacyRawRef.current))
  }

  function loadExternal() {
    if (!storageState.external) return
    workspaceRef.current = storageState.external
    setWorkspace(storageState.external)
    setStorageState({ type: 'ready', external: null, raw: null })
    setScreen('projects')
  }

  const banner = storageState.type !== 'ready' ? (
    <div className={`storage-banner ${storageState.type}`} role="status">
      <span>{storageState.message ?? (storageState.type === 'migrated' ? 'Estado v0.1 migrado a v0.2. El original permanece intacto.' : 'Estado local preparado.')}</span>
      <div>
        <button className="button" type="button" onClick={exportCurrent}>Exportar respaldo</button>
        {storageState.type === 'conflict' && storageState.external && <button className="button primary" type="button" onClick={loadExternal}>Cargar cambios externos</button>}
        {storageState.raw && <button className="button" type="button" onClick={() => downloadJson('discovery-copilot-datos-originales.json', { raw: storageState.raw })}>Rescatar original</button>}
      </div>
    </div>
  ) : null

  const shared = { project, proposals: project.proposals, onHome: () => setScreen('projects'), onNavigate: setScreen }
  let content
  if (screen === 'new-project') content = <NewProjectScreen onCancel={() => setScreen('projects')} onCreate={createProject} disabled={isReadOnly} />
  else if (screen === 'overview') content = <OverviewScreen {...shared} />
  else if (screen === 'work') content = <WorkScreen {...shared} onUpdateProposal={updateProposal} readOnly={isReadOnly} />
  else if (screen === 'decisions') content = <DecisionsScreen {...shared} decisions={project.decisions} />
  else if (screen === 'sources') content = <SourcesScreen {...shared} sources={project.sources} />
  else if (screen === 'deliverables') content = <DeliverablesScreen {...shared} />
  else if (screen === 'activity') content = <ActivityScreen {...shared} decisions={project.decisions} />
  else content = <ProjectsScreen projects={workspace.projects} activeProjectId={workspace.activeProjectId} onNewProject={() => setScreen('new-project')} onOpenProject={openProject} disabled={isReadOnly} />

  return <>{banner}{content}</>
}

export default App
