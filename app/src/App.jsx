import {createWorkspaceRepository} from './repository'
import {addHumanInput,deriveBrief,newE1Stage,saveE1Next,e1FormPending,confirmedReview} from './e1/service'
import {E1Panel} from './e1/E1Panel'
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
import { createBackup, LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY, parseWorkspace, STORAGE_KEY } from './storage'
import './App.css'
import { applyCreationAttempt, hasMeaningfulRequest, pendingDrafts, setReviewDraft } from './workflow'

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function App({ environment, onLogout }) {
  const [repository] = useState(() => environment?.repository ?? createWorkspaceRepository())
  const [initialLoad] = useState(() => repository.load({ createDefaultWorkspace, migrateLegacy: migrateLegacyWorkspace }))
  const [workspace, setWorkspace] = useState(initialLoad.workspace)
  const [screen, setScreen] = useState('projects')
  const [storageState, setStorageState] = useState({ type: initialLoad.status, message: initialLoad.error, external: null, raw: initialLoad.recoveryRaw ?? null })
  const workspaceRef = useRef(initialLoad.workspace)
  const storageStateRef = useRef(storageState)
  const writerIdRef = useRef(crypto.randomUUID())
  const initialPersistAttempted = useRef(false)
  const [connection, setConnection] = useState(() => environment?.connection ?? (environment?.simulated ? {available:true,model:'simulation-e1',simulated:true,code:'ready'} : {available:false,code:'disconnected'}))
  const [operation, setOperation] = useState(null)
  const inFlight = useRef(null)
  const [drafts, setDrafts] = useState({})
  const draftsRef = useRef({})
  const [e1Drafts, setE1Drafts] = useState({})
  const e1DraftsRef = useRef({})
  const pendingReview = useRef(null)
  const [selections, setSelections] = useState({})
  const [pendingExit, setPendingExit] = useState(null)
  const creationAttempt = useRef(null)
  const pendingFocusRef = useRef(null)
  const exitTriggerRef = useRef(null)
  const [focusToken, setFocusToken] = useState(0)

  function requestFocus(action) {
    pendingFocusRef.current = action
    setFocusToken((token) => token + 1)
  }

  useEffect(() => {
    const action = pendingFocusRef.current
    pendingFocusRef.current = null
    if (!action) return
    if (action.type === 'navigation') {
      const nav = document.querySelector('.project-nav')
      if (nav) {
        nav.scrollLeft = action.scrollLeft
        nav.querySelector('[aria-current="page"]')?.focus({ preventScroll: true })
      }
      return
    }
    if (action.type === 'selector') {
      document.querySelector(action.selector)?.focus()
      return
    }
    if (action.type === 'restore') {
      const el = action.element
      if (el && document.body.contains(el) && !el.disabled && el.offsetParent !== null) el.focus()
      else document.querySelector('main h1[tabindex="-1"]')?.focus()
      return
    }
    document.querySelector('main h1[tabindex="-1"]')?.focus()
  }, [focusToken])

  useEffect(() => {
    function warnBeforeUnload(event) {
      if (!workspaceRef.current.projects.some(p => pendingDrafts(draftsRef.current,p.id).length || e1FormPending(e1DraftsRef.current[p.id],p))) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [drafts, e1Drafts])

  useEffect(() => { storageStateRef.current = storageState }, [storageState])

  useEffect(() => {
    if (initialLoad.status !== 'migration-pending' && initialLoad.status !== 'new') return
    if (initialPersistAttempted.current) return
    initialPersistAttempted.current = true
    const saved = repository.save(workspaceRef.current, 0, writerIdRef.current)
    const apply = (result) => {
    if (result.ok) {
      workspaceRef.current = result.workspace
      setWorkspace(result.workspace)
      setStorageState({ type: initialLoad.status === 'migration-pending' ? 'migrated' : 'ready', external: null, raw: null })
    } else {
      setStorageState({ type: result.type, message: 'No se pudo crear el nuevo almacenamiento. La copia en memoria sigue disponible.', external: result.workspace ?? null, raw: result.raw ?? null })
    }
    }
    if (saved?.then) saved.then(apply)
    else apply(saved)
  }, [initialLoad.status, repository])

  useEffect(() => {
    if (repository.remote) return
    function handleStorage(event) {
      if ([LEGACY_STORAGE_KEY, PREVIOUS_STORAGE_KEY].map(repository.keyFor).includes(event.key) || event.key === null) {
        const next = { type: 'recovery-required', message: 'Cambió una versión anterior o se vació el almacenamiento. Exportá esta copia antes de reintentar la lectura.', external: null, raw: event.newValue }
        storageStateRef.current = next
        setStorageState(next)
        return
      }
      if (event.key !== repository.keyFor(STORAGE_KEY)) return
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
  }, [repository])

  const project = workspace.projects.find((item) => item.id === workspace.activeProjectId) ?? workspace.projects[0]
  const isReadOnly = ['conflict', 'recovery-required', 'read-error', 'validation-error', 'saving', 'uncertain', 'permission'].includes(storageState.type) || (repository.remote && storageState.type === 'new')

  function commitWorkspace(update) {
    if (['conflict', 'recovery-required', 'read-error', 'validation-error', 'saving', 'uncertain', 'permission'].includes(storageStateRef.current.type)) return false
    const current = workspaceRef.current
    const candidate = update(current)
    if (candidate === current) return false
    const result = repository.save(candidate, current.revision, writerIdRef.current)
    if (result?.then) {
      storageStateRef.current = {type:'saving',message:'Confirmando guardado remoto…'}
      setStorageState(storageStateRef.current)
      return result.then(applySaveResult)
    }
    return applySaveResult(result, candidate)
  }

  function applySaveResult(result, candidate) {
    if (result.ok) {
      workspaceRef.current = result.workspace
      setWorkspace(result.workspace)
      storageStateRef.current = { type: 'ready', external: null, raw: null }
      setStorageState(storageStateRef.current)
      return true
    }
    if (result.type === 'write-error' && !repository.remote) {
      workspaceRef.current = candidate
      setWorkspace(candidate)
      storageStateRef.current = { type: 'write-error', message: 'No se pudo guardar. Los cambios siguen en esta pestaña y podés exportarlos.', external: null, raw: null }
      setStorageState(storageStateRef.current)
      return false
    }
    storageStateRef.current = { type: result.type, message: result.message ?? (result.type==='uncertain' ? 'Confirmación incierta. No se reenvió automáticamente. Resolvé el mismo intento antes de continuar.' : result.type==='permission' ? 'Sesión rechazada. Cerrá sesión e ingresá nuevamente.' : 'No se pudo validar o leer el almacenamiento. No se sobrescribió.'), external: result.workspace ?? null, raw: result.raw ?? null }
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

  const afterSave = (saved, action) => saved?.then ? saved.then(action) : action(saved)

  function createProject(input, attemptId) {
    if (!hasMeaningfulRequest(input.objective)) return false
    if (creationAttempt.current?.id !== attemptId) {
 const created=createLocalProject(input, { e1: !!environment })
 creationAttempt.current={id:attemptId,created,completed:false}
 }
    const attempt = creationAttempt.current
    if (attempt.completed) return true
    const saved = commitWorkspace((current) => applyCreationAttempt(current, attempt.created))
    return afterSave(saved, (ok) => {
      attempt.completed = ok
      if (ok) { requestFocus({ type: 'heading' }); setScreen('overview') }
      return ok
    })
  }

  function openProject(id) {
    if (id === workspaceRef.current.activeProjectId) { requestFocus({ type: 'heading' }); setScreen('overview'); return true }
    const saved = commitWorkspace((current) => ({ ...current, activeProjectId: id }))
    return afterSave(saved, (ok) => {
      if (ok) { requestFocus({ type: 'heading' }); setScreen('overview') }
      return ok
    })
  }

  function updateProposal(id, changes, action, expectedStatus) {
    const projectId = workspaceRef.current.activeProjectId
    const before = workspaceRef.current.projects.find((p) => p.id === projectId)
    const saved = updateActiveProject((currentProject) => {
      const updated = decideProposal(currentProject, id, changes, action, expectedStatus)
      if (updated !== currentProject) pendingReview.current = {projectId, proposal: updated.proposals.find(p=>p.id===id), decision: updated.decisions.at(-1), draft: draftsRef.current[projectId]?.[id]}
      return updated
    })
    return afterSave(saved, (ok) => {
      const after = workspaceRef.current.projects.find((p) => p.id === projectId)
      if (ok && before !== after) reconcileReview(workspaceRef.current)
      return ok
    })
  }

  function reconcileReview(confirmed) {
    const expected=pendingReview.current
    if (!expected || !confirmedReview(confirmed,expected)) return
    if (draftsRef.current[expected.projectId]?.[expected.proposal.id] === expected.draft) changeDraft(expected.projectId, expected.proposal.id, null)
    pendingReview.current=null
  }

  function changeE1Draft(projectId, patch) {
    e1DraftsRef.current={...e1DraftsRef.current,[projectId]:{...e1DraftsRef.current[projectId],...patch}}
    setE1Drafts(e1DraftsRef.current)
  }

  function changeDraft(projectId, proposalId, draft) {
    draftsRef.current = setReviewDraft(draftsRef.current, projectId, proposalId, draft)
    setDrafts(draftsRef.current)
  }

  function navigate(destination, selection, focusAction, confirmed = false) {
    const projectId = workspaceRef.current.activeProjectId
    if (!confirmed && e1FormPending(e1DraftsRef.current[projectId], workspaceRef.current.projects.find(p=>p.id===projectId))) {
      requestExit({kind:'navigate',destination,selection,focusAction}); return
    }
    if (destination === 'work') {
      const currentProject = workspaceRef.current.projects.find((item) => item.id === projectId)
      const first = currentProject.proposals.find((item) => item.status === 'pending') ?? currentProject.proposals[0]
      setSelections((current) => ({ ...current, [projectId]: selection ?? current[projectId] ?? (first ? { projectId, proposalId: first.id } : undefined) }))
    }
    setPendingExit(null)
    if (focusAction) requestFocus(focusAction)
    setScreen(destination)
  }

  function requestExit(action) {
    const projects=workspaceRef.current.projects
    const activeId=workspaceRef.current.activeProjectId
    const projectId = action.kind==='logout' ? (projects.find(p=>pendingDrafts(draftsRef.current,p.id).length || e1FormPending(e1DraftsRef.current[p.id],p))?.id ?? activeId) : activeId
    if (pendingDrafts(draftsRef.current, projectId).length || e1FormPending(e1DraftsRef.current[projectId],projects.find(p=>p.id===projectId))) {
      exitTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      setPendingExit({ ...action, projectId })
    } else performExit(action)
  }

  function performExit(action) {
    if (action.kind === 'logout') onLogout?.()
    else if (action.kind === 'navigate') navigate(action.destination,action.selection,action.focusAction,true)
    else if (action.kind === 'external') loadExternal()
    else if (action.kind === 'reload') window.location.reload()
    else if (action.kind === 'open') openProject(action.id)
    else { requestFocus({ type: 'heading' }); setScreen('projects') }
  }

  function continueEditing() {
    const editingE1=e1FormPending(e1DraftsRef.current[pendingExit.projectId],workspaceRef.current.projects.find(p=>p.id===pendingExit.projectId))
    const proposalId = pendingDrafts(draftsRef.current, pendingExit.projectId)[0]?.[0]
    if (proposalId) setSelections((current) => ({ ...current, [pendingExit.projectId]: { projectId: pendingExit.projectId, proposalId } }))
    setPendingExit(null)
    setScreen(editingE1 ? 'overview' : 'work')
    const trigger = exitTriggerRef.current
    exitTriggerRef.current = null
    requestFocus({ type: 'restore', element: trigger })
  }

  function discardAndExit() {
    const action = pendingExit
    draftsRef.current = { ...draftsRef.current, [action.projectId]: {} }
    setDrafts(draftsRef.current)
    e1DraftsRef.current={...e1DraftsRef.current,[action.projectId]:{}}
    setE1Drafts(e1DraftsRef.current)
    setPendingExit(null)
    exitTriggerRef.current = null
    if(action.kind==='logout') requestExit(action)
    else performExit(action)
  }

  function selectSource(id, selected) {
    updateActiveProject((current) => ({ ...current, ...(current.stageWork?.E1 ? {stageWork:{...current.stageWork,E1:{...current.stageWork.E1,closed:false}}}:{}), sources: current.sources.map((source) => source.id === id ? { ...source, selected } : source) }))
  }

  async function inspectConnection() {
    setConnection({ available: false, code: 'checking' })
    try { setConnection(await (environment ? environment.checkConnection() : checkConnection())) }
    catch (error) { setConnection({available:false,code:error.message==='permission'?'permission':'disconnected'}) }
  }

  async function runAnalysis() {
    if (inFlight.current || !connection.available || isReadOnly || storageState.type === 'write-error') return
 if(environment && workspaceRef.current.projects.some(p=>p.runs.some(r=>['analyzing','uncertain','interrupted'].includes(r.status)))){setOperation({projectId:workspaceRef.current.activeProjectId,code:'uncertain'});return}
    const current = workspaceRef.current.projects.find((item) => item.id === workspaceRef.current.activeProjectId)
    let request
    try { request = makeRequest(current, connection.model, crypto.randomUUID(), environment && current.stageWork?.E1 ? 'E1' : undefined, connection.provider) } catch { setOperation({ projectId: current.id, code: 'invalid' }); return }
    const started = startAnalysis(current, request)
    if (!started.ok) { setOperation({ projectId: current.id, code: 'stale' }); return }
    const controller = new AbortController()
    inFlight.current = { request, controller }
    if (!await updateProject(current.id, () => started.project)) { inFlight.current = null; return }
    setOperation({ projectId: current.id, code: 'analyzing' })
    const result = await (environment ? environment.analyze(request, controller.signal) : analyze(request, connection, controller.signal))
    if (environment && !environment.auth.authorized()) { inFlight.current = null; return }
    const stale = inFlight.current?.invalidated || ['conflict', 'recovery-required', 'read-error', 'validation-error'].includes(storageStateRef.current.type)
    const target = workspaceRef.current.projects.find((item) => item.id === request.projectId)
    const finished = target && finishAnalysis(target, request, result, { stale })
    let code = finished?.runs.find((run) => run.id === request.requestId)?.status ?? 'stale'
    if (!stale && target) {
      const saved = await updateProject(request.projectId, () => finished)
      if (!saved) code = 'uncertain'
    }
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
    // requestExit protects modified drafts before replacing the confirmed copy.
    draftsRef.current = {}
    setDrafts({})
    e1DraftsRef.current={}
    setE1Drafts({})
    creationAttempt.current = null
    setWorkspace(storageState.external)
    storageStateRef.current = { type: 'ready', external: null, raw: null }
    setStorageState(storageStateRef.current)
    requestFocus({ type: 'heading' })
    setScreen('projects')
  }

  const banner = storageState.type !== 'ready' ? (
    <div className={`storage-banner ${storageState.type}`} role="status">
      <span>{storageState.message ?? (storageState.type === 'migrated' ? 'Estado migrado a v0.3. Las claves anteriores permanecen intactas.' : 'Estado local preparado.')}</span>
      <div>
        {initialLoad.status !== 'recovery-required' && <button className="button" type="button" onClick={exportCurrent}>Exportar respaldo</button>}
        {['recovery-required', 'read-error'].includes(storageState.type) && <button className="button" type="button" onClick={() => requestExit({ kind: 'reload' })}>Reintentar lectura (exportá antes)</button>}
        {storageState.type === 'conflict' && storageState.external && <button className="button primary" type="button" onClick={() => requestExit({ kind: 'external' })}>Cargar cambios externos</button>}
        {repository.remote && storageState.type === 'uncertain' && <button className="button" onClick={async () => {
          const result = await repository.retry()
          applySaveResult(result)
          if (result.ok) reconcileReview(result.workspace)
          if (result.ok && creationAttempt.current && !creationAttempt.current.completed && result.workspace.projects.some(p=>p.id===creationAttempt.current.created.id)) { creationAttempt.current.completed=true; requestFocus({type:'heading'}); setScreen('overview') }
        }}>Resolver el mismo guardado</button>}
        {storageState.raw && <button className="button" type="button" onClick={() => downloadJson('discovery-copilot-datos-originales.json', { raw: storageState.raw })}>Rescatar original</button>}
      </div>
    </div>
  ) : null

  const shared = { project, proposals: project.proposals, onHome: () => requestExit({ kind: 'home' }), onNavigate: navigate }
  let content
  if (screen === 'new-project') content = <NewProjectScreen e1Enabled={!!environment} onCancel={() => { requestFocus({ type: 'selector', selector: '[data-autofocus="new-project"]' }); setScreen('projects') }} onCreate={createProject} disabled={isReadOnly} />
  else if (screen === 'overview') content = <OverviewScreen {...shared} stagePanel={environment && project.mode==='personal' ? <E1Panel simulated={!!environment.simulated} available={connection.available} onCheckConnection={inspectConnection} key={project.id} draft={e1Drafts[project.id] ?? {}} onDraftChange={patch=>changeE1Draft(project.id,patch)} remote={!!environment.remote} project={project} busy={operation?.projectId===project.id && operation?.code==='analyzing'} disabled={isReadOnly || storageState.type==='write-error'} operation={operation?.projectId===project.id?operation:null} onAnalyze={runAnalysis} onReview={()=>navigate('work')} onSave={transform=>updateActiveProject(transform)} onStart={()=>updateActiveProject(p=>({...p,stageWork:{E1:newE1Stage()}}))} onContribute={input=>updateActiveProject(p=>addHumanInput(p,input))} onNext={(text,closed)=>updateActiveProject(p=>saveE1Next(p,text,closed))}/> : null}/>
  else if (screen === 'work') content = <WorkScreen remote={!!environment?.remote} simulated={!!environment?.simulated} key={project.id} {...shared} selection={selections[project.id]} onSelectProposal={(proposalId) => setSelections((current) => ({ ...current, [project.id]: { projectId: project.id, proposalId } }))} drafts={drafts[project.id] ?? {}} onDraftChange={(proposalId, draft) => changeDraft(project.id, proposalId, draft)} onUpdateProposal={updateProposal} readOnly={isReadOnly} connection={connection} operation={operation?.projectId === project.id ? operation : null} onCheckConnection={inspectConnection} onAnalyze={runAnalysis} onCancelAnalysis={cancelAnalysis} onSelectSource={selectSource} canSave={storageState.type !== 'write-error'} />
  else if (screen === 'decisions') content = <DecisionsScreen {...shared} remote={!!environment?.remote} decisions={project.decisions} />
  else if (screen === 'sources') content = <SourcesScreen key={project.id} {...shared} sources={project.sources} onSelectSource={selectSource} readOnly={isReadOnly} />
  else if (screen === 'deliverables') content = <DeliverablesScreen {...shared} remote={!!environment?.remote} e1Brief={deriveBrief(project)} />
  else if (screen === 'activity') content = <ActivityScreen {...shared} decisions={project.decisions} />
  else content = <ProjectsScreen remote={!!environment?.remote} projects={workspace.projects} activeProjectId={workspace.activeProjectId} onNewProject={() => { creationAttempt.current = null; setScreen('new-project') }} onOpenProject={(id) => requestExit({ kind: 'open', id })} disabled={isReadOnly} />

  return <>{onLogout && <aside className="storage-banner"><button className="button" onClick={()=>requestExit({kind:'logout'})}>Cerrar sesión</button></aside>}{banner}{pendingExit && <section className="storage-banner" aria-label="Borradores pendientes">
    <span role="alert">Hay contenido sin confirmar. No es una decisión ni forma parte del respaldo. Continuá editando o descartá explícitamente antes de salir. Los borradores de sesión se pierden al recargar o cerrar; el navegador puede mostrar su propia advertencia.</span>
    <div><button className="button primary" type="button" onClick={continueEditing}>Continuar editando</button><button className="button" type="button" onClick={discardAndExit}>Descartar y salir</button></div>
  </section>}{initialLoad.status === 'recovery-required' && storageState.type === 'recovery-required' ? <main className="form-page"><h1>Recuperación requerida</h1><p>Los datos originales no se reemplazaron por un demo. Rescatá el original disponible o reintentá la lectura. No hay importación por interfaz en este lote.</p></main> : content}</>
}

export default App
