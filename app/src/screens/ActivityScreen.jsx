import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'

const actionLabels = {
  accepted: 'Propuesta aceptada',
  'edited-and-accepted': 'Propuesta editada y aceptada',
  rejected: 'Propuesta rechazada',
  reopened: 'Decisión reabierta',
}

export function ActivityScreen({ project, proposals, decisions, onHome, onNavigate }) {
  const activity = [
    { id: 'fixture', actor: 'Sistema local', title: 'Datos demo cargados', detail: `${proposals.length} propuestas disponibles para revisión.` },
    ...decisions.map((decision) => ({ id: decision.id, actor: 'Acción humana', title: actionLabels[decision.action], detail: decision.proposalTitle })),
  ]
  const activitySummary = `${activity.length} ${activity.length === 1 ? 'evento' : 'eventos'}`

  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome}>
        <span className="tag">Actividad verificable</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar active="AI Activity" onNavigate={onNavigate} projectName={project.name} />
        <main className="activity-page">
          <header className="work-heading">
            <div><h1>AI Activity</h1><p>Eventos observables del estado local; no representa una IA ejecutándose.</p></div>
            <div className="review-count"><strong>{activitySummary}</strong><span>Sin fechas inventadas</span></div>
          </header>
          <section className="activity-notice"><strong>Límite de la demo</strong><p>Las propuestas provienen de datos locales preparados. Esta vista registra carga y decisiones, no llamadas a un modelo.</p></section>
          <ol className="activity-list">
            {activity.map((item, index) => (
              <li key={item.id}>
                <span>{index + 1}</span>
                <div><small>{item.actor}</small><strong>{item.title}</strong><p>{item.detail}</p></div>
              </li>
            ))}
          </ol>
        </main>
      </div>
    </div>
  )
}
