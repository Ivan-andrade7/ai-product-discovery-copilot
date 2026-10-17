import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'
import { analysisMessages } from '../ai/contracts'

const actionLabels = {
  accepted: 'Propuesta aceptada',
  'edited-and-accepted': 'Propuesta editada y aceptada',
  rejected: 'Propuesta rechazada',
  reopened: 'Decisión reabierta',
}

export function ActivityScreen({ project, proposals, decisions, onHome, onNavigate }) {
  const activity = [
    ...(project.mode === 'demo' ? [{ id: 'fixture', actor: 'Sistema local', title: 'Datos demo cargados', detail: `${proposals.length} propuestas simuladas disponibles para revisión.` }] : []),
    ...project.runs.map((run) => ({ id: run.id, technical: true, actor: run.externalAttempted ? 'Ejecución registrada' : 'Operación local · sin envío externo registrado', title: analysisMessages[run.status], detail: `Proveedor: ${run.provider}. Modelo solicitado: ${run.modelRequested}. Modelo informado: ${run.modelReported ?? 'no disponible'}. Ejecución: ${run.id}. ${run.usage ? `Tokens informados: entrada ${run.usage.prompt_tokens ?? 'no disponible'}, salida ${run.usage.completion_tokens ?? 'no disponible'}, total ${run.usage.total_tokens ?? 'no disponible'}.` : 'Consumo de tokens no disponible.'} Los tokens no equivalen a créditos; su conciliación es independiente.` })),
    ...decisions.map((decision) => ({ id: decision.id, actor: 'Acción humana', title: actionLabels[decision.action], detail: decision.proposalTitle })),
  ]
  const activitySummary = `${activity.length} ${activity.length === 1 ? 'evento' : 'eventos'}`

  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome} showBack>
        <span className="tag">Actividad verificable</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar active="Actividad de IA" onNavigate={onNavigate} projectName={project.name} />
        <main className="activity-page">
          <header className="work-heading">
            <div><h1>Actividad de IA</h1><p>Operaciones registradas y decisiones humanas de este proyecto.</p></div>
            <div className="review-count"><strong>{activitySummary}</strong><span>Sin fechas inventadas</span></div>
          </header>
          <section className="activity-notice history-notice">
            <p>La IA pública está deshabilitada. Consultar este historial no ejecuta análisis.</p>
            <details className="notice-details"><summary>Sobre la procedencia y el consumo</summary><p>Las generaciones están deshabilitadas en la versión pública y en el arranque local normal. El historial puede conservar ensayos reales anteriores y operaciones locales: cada evento indica su procedencia. Comprobar el servicio local no se registra como análisis de IA; un ensayo anterior no habilita nuevas llamadas.</p></details>
          </section>
          {!activity.length && <p>No hay operaciones ni decisiones registradas.</p>}
          <ol className="activity-list">
            {activity.map((item, index) => (
              <li key={item.id}>
                <span>{index + 1}</span>
                <div><small>{item.actor}</small><strong>{item.title}</strong>{item.technical ? <details className="notice-details"><summary>Ver detalles de la ejecución</summary><p>{item.detail}</p></details> : <p>{item.detail}</p>}</div>
              </li>
            ))}
          </ol>
        </main>
      </div>
    </div>
  )
}
