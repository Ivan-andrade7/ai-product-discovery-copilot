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
    ...project.runs.map((run) => ({ id: run.id, actor: run.externalAttempted ? 'Ejecución registrada' : 'Operación local · sin envío externo registrado', title: analysisMessages[run.status], detail: `Proveedor: ${run.provider}. Modelo solicitado: ${run.modelRequested}. Modelo informado: ${run.modelReported ?? 'no disponible'}. Ejecución: ${run.id}. ${run.usage ? `Tokens informados: entrada ${run.usage.prompt_tokens ?? 'no disponible'}, salida ${run.usage.completion_tokens ?? 'no disponible'}, total ${run.usage.total_tokens ?? 'no disponible'}.` : 'Consumo de tokens no disponible.'} Los tokens no equivalen a créditos; su conciliación es independiente.` })),
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
            <div><h1>AI Activity</h1><p>Operaciones registradas y decisiones humanas de este proyecto.</p></div>
            <div className="review-count"><strong>{activitySummary}</strong><span>Sin fechas inventadas</span></div>
          </header>
          <section className="activity-notice"><strong>Conexión externa deshabilitada</strong><p>Este lote no realiza llamadas a modelos. Comprobar el servicio local no se registra como análisis de IA. La procedencia histórica se conserva sin atribuir ejecuciones no acreditadas.</p></section>
          {!activity.length && <p>No hay operaciones ni decisiones registradas.</p>}
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
