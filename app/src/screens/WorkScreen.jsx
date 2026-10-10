import { useEffect, useRef, useState } from 'react'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'
import { analysisMessages, originLabel, selectedContext } from '../ai/contracts'

const decisionLabels = {
  accepted: 'Aceptada',
  edited: 'Editada y aceptada',
  rejected: 'Rechazada',
  pending: 'Pendiente',
}

export function WorkScreen({ project, proposals, onHome, onNavigate, onUpdateProposal, readOnly, connection, operation, onCheckConnection, onAnalyze, onCancelAnalysis, onSelectSource, canSave }) {
  const [selectedId, setSelectedId] = useState(proposals.find((proposal) => proposal.status === 'pending')?.id ?? proposals[0]?.id)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const actionLock = useRef(false)
  const selected = proposals.find((proposal) => proposal.id === selectedId) ?? proposals[0]
  const selectedIndex = proposals.findIndex((proposal) => proposal.id === selected?.id)
  const analysisStatus = operation?.code ?? connection.code
  const selectedSources = selectedContext(project)
  const pendingCount = proposals.filter((proposal) => proposal.status === 'pending').length
  const reviewedCount = proposals.length - pendingCount

  useEffect(() => {
    actionLock.current = false
  }, [selected?.id, selected?.status])

  function nextPendingIndex() {
    for (let step = 1; step <= proposals.length; step += 1) {
      const index = (selectedIndex + step) % proposals.length
      if (proposals[index].status === 'pending') return index
    }
    return selectedIndex
  }

  function selectProposal(index) {
    actionLock.current = false
    setSelectedId(proposals[index]?.id)
    setIsEditing(false)
  }

  function resolve(status, content) {
    if (readOnly || actionLock.current || !selected || selected.status !== 'pending') return
    actionLock.current = true
    const action = status === 'edited' ? 'edited-and-accepted' : status
    const saved = onUpdateProposal(selected.id, { status, ...(content ? { content } : {}) }, action, 'pending')
    if (!saved) actionLock.current = false
    setIsEditing(false)
  }

  function reopen() {
    if (readOnly || actionLock.current || !selected || selected.status === 'pending') return
    actionLock.current = true
    const saved = onUpdateProposal(selected.id, { status: 'pending' }, 'reopened', selected.status)
    if (!saved) actionLock.current = false
  }

  function beginEdit() {
    setDraft(selected.content)
    setIsEditing(true)
  }

  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome}>
        <span className="tag">Revisión humana</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar active="Work" onNavigate={onNavigate} projectName={project.name} />
        <main className="work-page">
          <header className="work-heading">
            <div>
              <h1>Work</h1>
              <p>Revisá cada propuesta. La IA no decide por vos.</p>
            </div>
            <div className="review-count" aria-live="polite">
              <strong>{pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}</strong>
              <span>{reviewedCount} de {proposals.length} revisadas</span>
            </div>
          </header>

          <section className="activity-notice" aria-label="Preparación del análisis">
            <h2>{project.mode === 'personal' ? 'Análisis del proyecto' : 'Proyecto demo o histórico preservado'}</h2>
            <p role="status" aria-live="polite">{analysisMessages[analysisStatus] ?? analysisMessages.disconnected}</p>
            <p>Abacus opcional · modelo pendiente · sin credenciales ni salida externa. No se envían documentos al comprobar el servicio local.</p>
            {project.mode === 'personal' ? <>
              <fieldset>
                <legend>Contenido seleccionado para un futuro análisis</legend>
                {project.sources.map((source) => <label key={source.id} className="analysis-source">
                  <input type="checkbox" checked={source.selected} disabled={readOnly || !source.content.trim() || analysisStatus === 'analyzing'} onChange={(event) => onSelectSource(source.id, event.target.checked)} />
                  <span>{source.name}{!source.content.trim() ? ' · sin texto disponible' : ''}</span>
                </label>)}
              </fieldset>
              <p>{selectedSources.length} fuentes seleccionadas. Sólo su texto sería enviado; los enlaces no se consultan.</p>
              {selectedSources.map((source) => <details key={source.id}><summary>{source.name} · ver texto seleccionado</summary><p className="analysis-text">{source.content}</p></details>)}
              <div className="decision-actions">
                <button className="button" type="button" onClick={onCheckConnection} disabled={connection.code === 'checking' || analysisStatus === 'analyzing'}>Comprobar servicio local</button>
                <button className="button primary" type="button" onClick={onAnalyze} disabled={!connection.available || readOnly || !canSave || !selectedSources.length || analysisStatus === 'analyzing'}>Analizar contenido seleccionado</button>
                {analysisStatus === 'analyzing' && <button className="button" type="button" onClick={onCancelAnalysis}>Cancelar análisis</button>}
              </div>
            </> : <p>Este contenido no se enviará a un proveedor ni se reclasificará como IA real. Para preparar un análisis, creá un proyecto nuevo.</p>}
          </section>

          {!selected ? <section className="empty-state"><h2>Sin propuestas todavía</h2><p>Este proyecto no contiene propuestas precargadas. El análisis requiere una conexión real habilitada en un lote posterior.</p></section> :
          <div className="work-grid">
            <section className="proposal-queue" aria-label="Cola de propuestas">
              <h2>Cola de revisión</h2>
              {proposals.map((proposal, index) => (
                <button
                  aria-pressed={index === selectedIndex}
                  className={`queue-item ${index === selectedIndex ? 'selected' : ''}`}
                  key={proposal.id}
                  onClick={() => selectProposal(index)}
                  type="button"
                >
                  <span>{proposal.type}</span>
                  <strong>{proposal.title}</strong>
                  <small className={`status-pill ${proposal.status}`}>{decisionLabels[proposal.status]}</small>
                </button>
              ))}
            </section>

            <section className="proposal-review" aria-label="Propuesta seleccionada">
              <div className="proposal-meta">
                <span className="tag">{originLabel(selected.origin)}</span>
                <span className={`status-pill ${selected.status}`}>{decisionLabels[selected.status]}</span>
              </div>
              <p className="proposal-type">{selected.type}</p>
              <h2>{selected.title}</h2>

              {isEditing ? (
                <label className="edit-field">
                  Editar propuesta antes de aceptar
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
                </label>
              ) : (
                <p className="proposal-content">{selected.content}</p>
              )}

              <article className="trace-block">
                <strong>Fuente o contexto</strong>
                <span>{selected.source}</span>
                <p>{selected.evidence}</p>
                {selected.sourceRefs.map((ref, index) => <p key={index}><strong>{project.sources.find((s) => s.id === ref.sourceId)?.name ?? ref.sourceId}</strong>: “{ref.quote}”</p>)}
                {selected.certainty && <p>Clasificación: {({ evidence: 'evidencia citada · interpretación por revisar', hypothesis: 'hipótesis', question: 'pregunta abierta' })[selected.certainty]}</p>}
              </article>
              <article className="trace-block reasoning-block">
                <strong>Por qué se propone</strong>
                <p>{selected.reasoning}</p>
              </article>

              {selected.status === 'pending' ? (
                <div className="decision-actions" onKeyDown={(event) => { if (event.repeat && ['Enter', ' '].includes(event.key)) event.preventDefault() }}>
                  {isEditing ? (
                    <>
                      <button className="button primary" type="button" onClick={() => resolve('edited', draft.trim())} disabled={!draft.trim() || readOnly}>
                        Guardar y aceptar
                      </button>
                      <button className="button" type="button" onClick={() => setIsEditing(false)}>Cancelar edición</button>
                    </>
                  ) : (
                    <>
                      <button className="button primary" type="button" onClick={() => resolve('accepted')} disabled={readOnly}>Aceptar</button>
                      <button className="button" type="button" onClick={beginEdit} disabled={readOnly}>Editar</button>
                      <button className="button" type="button" onClick={() => resolve('rejected')} disabled={readOnly}>Rechazar</button>
                      <button className="button subtle-action" type="button" onClick={() => selectProposal(nextPendingIndex())}>Mantener pendiente</button>
                    </>
                  )}
                </div>
              ) : (
                <div className="resolved-panel">
                  <span>Decisión local registrada. Aceptar no valida la evidencia ni cambia su procedencia.</span>
                  <button className="button" type="button" onKeyDown={(event) => { if (event.repeat) event.preventDefault() }} onClick={reopen} disabled={readOnly}>
                    Reabrir decisión
                  </button>
                </div>
              )}
            </section>
          </div>}
        </main>
      </div>
    </div>
  )
}
