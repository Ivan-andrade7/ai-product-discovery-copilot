import { useMemo, useState } from 'react'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'

const decisionLabels = {
  accepted: 'Aceptada',
  edited: 'Editada y aceptada',
  rejected: 'Rechazada',
  pending: 'Pendiente',
}

export function WorkScreen({ project, proposals, onHome, onNavigate, onUpdateProposal }) {
  const firstPending = Math.max(0, proposals.findIndex((proposal) => proposal.status === 'pending'))
  const [selectedIndex, setSelectedIndex] = useState(firstPending)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const selected = proposals[selectedIndex]
  const pendingCount = proposals.filter((proposal) => proposal.status === 'pending').length
  const reviewedCount = proposals.length - pendingCount

  const nextPendingIndex = useMemo(() => {
    for (let step = 1; step <= proposals.length; step += 1) {
      const index = (selectedIndex + step) % proposals.length
      if (proposals[index].status === 'pending') return index
    }
    return selectedIndex
  }, [proposals, selectedIndex])

  function selectProposal(index) {
    setSelectedIndex(index)
    setIsEditing(false)
  }

  function resolve(status, content) {
    const action = status === 'edited' ? 'edited-and-accepted' : status
    onUpdateProposal(selected.id, { status, ...(content ? { content } : {}) }, action)
    setIsEditing(false)
    if (nextPendingIndex !== selectedIndex) setSelectedIndex(nextPendingIndex)
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
        <ProjectSidebar active="Work" onNavigate={onNavigate} />
        <main className="work-page">
          <header className="work-heading">
            <div>
              <h1>Work</h1>
              <p>Revisá cada propuesta. La IA no decide por vos.</p>
            </div>
            <div className="review-count" aria-live="polite">
              <strong>{pendingCount} pendientes</strong>
              <span>{reviewedCount} de {proposals.length} revisadas</span>
            </div>
          </header>

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
                <span className="tag">Propuesta simulada de IA</span>
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
              </article>
              <article className="trace-block reasoning-block">
                <strong>Por qué se propone</strong>
                <p>{selected.reasoning}</p>
              </article>

              {selected.status === 'pending' ? (
                <div className="decision-actions">
                  {isEditing ? (
                    <>
                      <button className="button primary" type="button" onClick={() => resolve('edited', draft.trim())} disabled={!draft.trim()}>
                        Guardar y aceptar
                      </button>
                      <button className="button" type="button" onClick={() => setIsEditing(false)}>Cancelar edición</button>
                    </>
                  ) : (
                    <>
                      <button className="button primary" type="button" onClick={() => resolve('accepted')}>Aceptar</button>
                      <button className="button" type="button" onClick={beginEdit}>Editar</button>
                      <button className="button" type="button" onClick={() => resolve('rejected')}>Rechazar</button>
                      <button className="button subtle-action" type="button" onClick={() => setSelectedIndex(nextPendingIndex)}>Mantener pendiente</button>
                    </>
                  )}
                </div>
              ) : (
                <div className="resolved-panel">
                  <span>Esta decisión queda registrada en el estado local de la demo.</span>
                  <button className="button" type="button" onClick={() => onUpdateProposal(selected.id, { status: 'pending' }, 'reopened')}>
                    Reabrir decisión
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
