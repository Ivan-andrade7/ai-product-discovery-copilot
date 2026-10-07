import { TopBar } from '../components/TopBar'
import { projects } from '../data/demoData'

export function ProjectsScreen({ onNewProject, onOpenProject }) {
  return (
    <div className="screen">
      <TopBar title="Projects" onHome={() => {}} />
      <main className="projects-page page-padding">
        <div className="page-heading-row">
          <div>
            <h1>Tus proyectos</h1>
            <p className="page-description">Retomá desde la próxima decisión.</p>
          </div>
          <button className="button primary" type="button" onClick={onNewProject}>
            Nuevo proyecto
          </button>
        </div>

        <section className="project-grid" aria-label="Proyectos demo">
          {projects.map((project) => {
            const content = (
              <>
                <strong>{project.name}</strong>
                <span>{project.nextDecision}</span>
                {project.summary && <span>{project.summary}</span>}
              </>
            )

            return project.status === 'active' ? (
              <button
                className="project-card interactive"
                key={project.id}
                type="button"
                onClick={onOpenProject}
              >
                {content}
              </button>
            ) : (
              <article className="project-card" key={project.id}>
                {content}
              </article>
            )
          })}
        </section>

        <p className="method-warning">
          Sin porcentajes de confianza hasta definir una regla verificable.
        </p>
      </main>
    </div>
  )
}
