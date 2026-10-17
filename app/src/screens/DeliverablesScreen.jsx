import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'
import { originLabel } from '../ai/contracts'

export function DeliverablesScreen({ project, proposals, onHome, onNavigate, e1Brief, remote = false }) {
  const included = e1Brief ? e1Brief.blocks : proposals.filter((proposal) => ['accepted', 'edited'].includes(proposal.status))
  const includedSummary = `${included.length} ${included.length === 1 ? 'bloque incluido' : 'bloques incluidos'}`

  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome} showBack>
        <span className="tag">Borrador derivado</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar active="Entregables" onNavigate={onNavigate} projectName={project.name} />
        <main className="deliverables-page">
          <header className="work-heading">
            <div>
              <h1>Entregables</h1>
              <p>Sólo incorpora propuestas aceptadas mediante revisión humana.</p>
            </div>
            <div className="review-count">
              <strong>{includedSummary}</strong>
              <span>{remote ? 'Derivado del espacio privado remoto' : 'Derivado del estado local'}</span>
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
                    <h2>{e1Brief ? 'Brief E1 · revisado' : 'Problem framing · borrador'}</h2>
                  </div>
                  <span className="tag">{remote ? 'Borrador privado' : 'Borrador local'}</span>
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
                {e1Brief && <section><h3>Aportes humanos · no son evidencia independiente</h3>{e1Brief.humanInputs.map(i => <p key={i.id}>{i.content}</p>)}<h3>Pendientes</h3><ul>{e1Brief.pending.map(p => <li key={p.id}>{p.content}</li>)}</ul><h3>Próxima acción</h3><p>{e1Brief.nextAction || 'Pendiente de definir por Iván'}</p><p>{e1Brief.closed ? 'E1 cerrado con pendientes visibles' : 'E1 en trabajo'}</p></section>}
                <footer>Derivado de decisiones humanas. La aceptación no acredita validación; la procedencia de cada bloque se conserva.</footer>
              </article>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
