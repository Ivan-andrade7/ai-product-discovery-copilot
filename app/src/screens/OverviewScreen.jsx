import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'

export function OverviewScreen({ project, proposals, onHome, onNavigate }) {
  const pendingCount = proposals.filter((proposal) => proposal.status === 'pending').length
  const acceptedCount = proposals.filter((proposal) => ['accepted', 'edited'].includes(proposal.status)).length
  const decidedCount = proposals.filter((proposal) => ['accepted', 'edited', 'rejected'].includes(proposal.status)).length
  const decisionSummary = `${decidedCount} ${decidedCount === 1 ? 'resuelta' : 'resueltas'} · ${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`
  const statusCards = [
    ['Fuentes', `${project.sources.length} registradas`],
    ['Decisiones', decisionSummary],
    ['Entregables', acceptedCount ? 'Problem framing · actualizado' : 'Problem framing · borrador'],
    ['Validación', 'No realizada'],
  ]
  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome}>
        <span className="tag">Estado del proyecto</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar onNavigate={onNavigate} projectName={project.name} />
        <main className="overview-page">
          <section>
            <h1>Overview</h1>
            <span className="tag">En exploración</span>
          </section>

          <section className="overview-feature-grid">
            <article className="card decision-card">
              <strong>Próxima decisión</strong>
              <span>¿Hay evidencia suficiente para formular un problema defendible?</span>
            </article>
            <article className="card pending-card">
              <strong>Pendientes</strong>
              <span>{pendingCount} {pendingCount === 1 ? 'propuesta requiere' : 'propuestas requieren'} revisión humana</span>
              <button className="button primary compact" type="button" onClick={() => onNavigate('work')}>
                Abrir Work
              </button>
            </article>
          </section>

          <section className="overview-content-grid">
            <div>
              <h2>Estado verificable</h2>
              <div className="status-grid">
                {statusCards.map(([title, detail]) => (
                  <article className="card small-card" key={title}>
                    <strong>{title}</strong>
                    <span>{detail}</span>
                  </article>
                ))}
              </div>
            </div>
            <article className="card route-card">
              <strong>Ruta sugerida — editable</strong>
              <span>Revisar síntesis → resolver lagunas → actualizar entregable.</span>
              <span>La sugerencia no obliga ni acredita avance.</span>
            </article>
          </section>

          <section className="original-section">
            <h2>Solicitud original preservada</h2>
            <article className="original-request">
              <div className="original-heading">
                <strong>Entrada original · sin reescritura</strong>
                <span className="tag">Original</span>
              </div>
              <blockquote>“{project.originalRequest}”</blockquote>
              <p>Las síntesis e interpretaciones se muestran por separado.</p>
            </article>
          </section>
        </main>
      </div>
    </div>
  )
}
