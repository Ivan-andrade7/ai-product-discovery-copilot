import { TopBar } from '../components/TopBar'

export function ProjectsScreen({ projects, activeProjectId, onNewProject, onOpenProject, disabled }) {
  return (
    <div className="screen">
      <TopBar title="Projects" onHome={() => {}} />
      <main className="projects-page page-padding">
        <div className="page-heading-row">
          <div><h1>Tus proyectos</h1><p className="page-description">Retomá cada proyecto desde su estado local real.</p></div>
          <button className="button primary" type="button" onClick={onNewProject} disabled={disabled}>Nuevo proyecto</button>
        </div>
        <section className="project-grid" aria-label="Proyectos locales">
          {projects.map((project) => {
            const pending = project.proposals.filter((proposal) => proposal.status === 'pending').length
            return (
              <button className="project-card interactive" key={project.id} type="button" onClick={() => onOpenProject(project.id)} disabled={disabled}>
                <strong>{project.name}</strong>
                <span>{project.objective}</span>
                <span>{pending} {pending === 1 ? 'pendiente' : 'pendientes'} · {project.sources.length} fuentes · {project.decisions.length} {project.decisions.length === 1 ? 'decisión' : 'decisiones'}</span>
                {project.id === activeProjectId && <small className="status-pill accepted">Proyecto activo</small>}
              </button>
            )
          })}
        </section>
        <p className="method-warning">Los proyectos se conservan por separado en este navegador.</p>
      </main>
    </div>
  )
}
