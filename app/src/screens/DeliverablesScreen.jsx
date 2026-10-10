import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'
import { originLabel } from '../ai/contracts'

export function DeliverablesScreen({ project, proposals, onHome, onNavigate }) {
  const included = proposals.filter((proposal) => ['accepted', 'edited'].includes(proposal.status))
  const includedSummary = `${included.length} ${included.length === 1 ? 'bloque incluido' : 'bloques incluidos'}`

  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome}>
        <span className="tag">Borrador derivado</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar active="Deliverables" onNavigate={onNavigate} projectName={project.name} />
        <main className="deliverables-page">
          <header className="work-heading">
            <div>
              <h1>Deliverables</h1>
              <p>Sólo incorpora propuestas aceptadas mediante revisión humana.</p>
            </div>
            <div className="review-count">
              <strong>{includedSummary}</strong>
              <span>Derivado del estado local</span>
            </div>
          </header>

          {included.length === 0 ? (
            <section className="empty-state">
              <span className="tag">Borrador vacío</span>
              <h2>Todavía no hay decisiones aceptadas</h2>
              <p>Las propuestas pendientes y rechazadas no se incorporan automáticamente.</p>
              <button className="button primary" type="button" onClick={() => onNavigate('work')}>Revisar propuestas</button>
            </section>
          ) : (
            <div className="deliverable-layout">
              <aside className="inclusion-summary">
                <h2>Criterio de inclusión</h2>
                <p>Aceptada o editada y aceptada.</p>
                <p>Si una decisión se reabre, el bloque sale de esta versión.</p>
                <span className="tag">Borrador · no publicado</span>
              </aside>
              <article className="deliverable-document">
                <div className="document-heading">
                  <div>
                    <span>AI Product Discovery Copilot</span>
                    <h2>Problem framing · borrador</h2>
                  </div>
                  <span className="tag">Borrador local</span>
                </div>
                <section className="document-original">
                  <strong>Solicitud original</strong>
                  <p>{project.originalRequest}</p>
                </section>
                {included.map((proposal) => (
                  <section className="document-block" key={proposal.id}>
                    <div>
                      <span>{proposal.type}</span>
                      <span className={`status-pill ${proposal.status}`}>{proposal.status === 'edited' ? 'Editada y aceptada' : 'Aceptada'}</span>
                    </div>
                    <h3>{proposal.title}</h3>
                    <p>{proposal.content}</p>
                    <small>Origen: {proposal.source}</small>
                    <p>{originLabel(proposal.origin)}</p>
                    {proposal.sourceRefs.map((ref, index) => <blockquote key={index}>{project.sources.find((s) => s.id === ref.sourceId)?.name ?? ref.sourceId}: “{ref.quote}”</blockquote>)}
                  </section>
                ))}
                <footer>Derivado de decisiones humanas. La aceptación no acredita validación; la procedencia de cada bloque se conserva.</footer>
              </article>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
