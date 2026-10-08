import { useMemo, useState } from 'react'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'

const actionLabels = {
  accepted: 'Aceptada',
  'edited-and-accepted': 'Editada y aceptada',
  rejected: 'Rechazada',
  reopened: 'Reabierta',
}

const statusLabels = {
  accepted: 'Aceptada',
  edited: 'Editada y aceptada',
  rejected: 'Rechazada',
  pending: 'Pendiente',
}

export function DecisionsScreen({ project, proposals, decisions, onHome, onNavigate }) {
  const latestFirst = useMemo(() => [...decisions].reverse(), [decisions])
  const [selectedId, setSelectedId] = useState(latestFirst[0]?.id ?? null)
  const selected = decisions.find((decision) => decision.id === selectedId) ?? latestFirst[0]
  const resolved = proposals.filter((proposal) => proposal.status !== 'pending').length
  const actionSummary = `${decisions.length} ${decisions.length === 1 ? 'acción' : 'acciones'}`
  const resolvedSummary = `${resolved} ${resolved === 1 ? 'propuesta resuelta' : 'propuestas resueltas'} ahora`

  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome}>
        <span className="tag">Historial trazable</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar active="Decisions" onNavigate={onNavigate} projectName={project.name} />
        <main className="decisions-page">
          <header className="work-heading">
            <div>
              <h1>Decisions</h1>
              <p>Registro de acciones humanas. Las entradas anteriores no se sobrescriben.</p>
            </div>
            <div className="review-count">
              <strong>{actionSummary}</strong>
              <span>{resolvedSummary}</span>
            </div>
          </header>

          {decisions.length === 0 ? (
            <section className="empty-state">
              <span className="tag">Sin decisiones todavía</span>
              <h2>La historia comenzará cuando revises una propuesta</h2>
              <p>Aceptar, editar, rechazar o reabrir en Work creará una entrada verificable en el historial local.</p>
              <button className="button primary" type="button" onClick={() => onNavigate('work')}>Ir a Work</button>
            </section>
          ) : (
            <div className="decisions-grid">
              <section className="decision-log" aria-label="Historial de decisiones">
                <h2>Historial local</h2>
                {latestFirst.map((decision) => (
                  <button
                    aria-pressed={selected?.id === decision.id}
                    className={`decision-log-item ${selected?.id === decision.id ? 'selected' : ''}`}
                    key={decision.id}
                    onClick={() => setSelectedId(decision.id)}
                    type="button"
                  >
                    <span>Acción {decision.sequence}</span>
                    <strong>{decision.proposalTitle}</strong>
                    <small className={`status-pill ${decision.currentStatus}`}>{actionLabels[decision.action]}</small>
                  </button>
                ))}
              </section>

              <section className="decision-detail" aria-label="Detalle de la decisión">
                <div className="proposal-meta">
                  <span className="tag">{selected.proposalType}</span>
                  <span className={`status-pill ${selected.currentStatus}`}>{actionLabels[selected.action]}</span>
                </div>
                <p className="proposal-type">Acción humana {selected.sequence}</p>
                <h2>{selected.proposalTitle}</h2>

                <div className="decision-comparison">
                  <article>
                    <strong>Propuesta original de IA</strong>
                    <p>{selected.originalContent}</p>
                  </article>
                  <article>
                    <strong>Versión después de esta acción</strong>
                    <p>{selected.currentContent}</p>
                  </article>
                </div>

                <article className="decision-result">
                  <strong>Resultado registrado</strong>
                  <span>{statusLabels[selected.previousStatus]} → {statusLabels[selected.currentStatus]}</span>
                  <p>{selected.action === 'reopened'
                    ? 'La decisión anterior se conserva en el historial y la propuesta vuelve a la cola.'
                    : 'Esta acción modifica el estado vigente sin borrar la propuesta original.'}</p>
                </article>
                <p className="session-note">Secuencia local persistente en este navegador · sin fecha inventada.</p>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
