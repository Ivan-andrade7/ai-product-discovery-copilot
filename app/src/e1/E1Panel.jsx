import { useState } from 'react'
import './e1.css'
import { analysisMessages, e1HumanContext } from '../ai/contracts'
import { deriveBrief, closeInterruptedSimulation } from './service'
import { ContextHelp } from '../components/ContextHelp'
import { conceptHelp } from '../components/help-content'

export function E1Panel({ project, busy, disabled, operation, onAnalyze, onReview, onSave, onStart, onContribute, onNext, remote = false, draft = {}, onDraftChange }) {
  const [message, setMessage] = useState('')
  const stage = project.stageWork?.E1
  if (!stage) return <section className="e1-panel card"><h2>Trabajo de etapa</h2><div className="action-group"><button className="button" disabled={disabled} onClick={onStart}>Trabajar E1 en este proyecto</button></div></section>
  const brief = deriveBrief(project), context = e1HumanContext(project)
  const questions = project.proposals.filter(p => p.stage === 'E1' && p.certainty === 'question')
  const selected = project.sources.filter(s => s.selected && s.content.trim())
  async function save(task) {
    try { const ok = await task(); setMessage(ok ? 'Guardado confirmado en el repositorio de prueba del proyecto.' : 'No se confirmó el guardado. Conservá el formulario y recuperá el estado antes de reintentar.'); return ok }
    catch { setMessage('No se pudo guardar. Comprobá el contenido y el contexto seleccionado.'); return false }
  }
  return <section className="e1-panel card" aria-label="Trabajo E1">
    <header className="e1-heading">
    <h2>Aclarar el pedido y preparar el brief</h2>
    <div className="help-label"><p>{remote ? 'PRUEBA PRIVADA · datos remotos e IA SIMULADA.' : 'SIMULACIÓN LOCAL · proveedor ficticio.'} Recuperar lo conocido → revisar en Revisión → decidir → continuar.</p><ContextHelp title="Simulación e IA real">{conceptHelp.analysis}</ContextHelp></div>
    </header>
    <div className="e1-context">
    <p>Resultado esperado: {context.known.objective || 'No registrado'}</p><p>Restricciones: {context.known.constraints || 'No registradas'}</p>
    </div>
    <p role="status">{message || (operation ? analysisMessages[operation.code] : 'Los cambios confirmados quedan en este proyecto de prueba.')}</p>
    {project.runs.some(r=>r.provider==='simulation' && r.externalAttempted===false && ['interrupted','uncertain'].includes(r.status)) && <div className="e1-notice">
      <p>Hay un intento simulado sin resultado confirmado. Podés cerrarlo conservando su solicitud e historial. Esto no lo reenvía ni incorpora propuestas.</p>
      <button className="button" disabled={busy || disabled} onClick={()=>save(()=>onSave(closeInterruptedSimulation))}>Cerrar intento simulado sin reenviar</button>
    </div>}
    <div className="e1-section">
    <h3>Fuentes de este proyecto</h3>
    <p>La selección se comparte con Revisión y Fuentes. El pedido original no se convierte en una fuente nueva.</p>
    <form onSubmit={async event => {
      event.preventDefault(); const form = event.currentTarget, data = new FormData(form)
      const source = { id: crypto.randomUUID(), name: data.get('sourceName'), content: data.get('sourceContent'), kind: 'Fuente aportada', status: 'Aportada · sin revisar', detail: 'Contenido ficticio aportado por la persona', reference: '', selected: true }
      if (!source.name.trim() || !source.content.trim()) { setMessage('Completá una fuente con nombre y texto.'); return }
      if (await save(() => onSave(p => ({ ...p, sources: [...p.sources, source], stageWork: { ...p.stageWork, E1: { ...p.stageWork.E1, closed: false } } })))) { form.reset(); onDraftChange({sourceName:'',sourceContent:''}) }
    }}>
      <label>Nombre de fuente<input name="sourceName" value={draft.sourceName ?? ''} onChange={e=>onDraftChange({sourceName:e.target.value})} required disabled={busy || disabled} /></label>
      <label>Contenido de fuente<textarea aria-label="Contenido de fuente" name="sourceContent" value={draft.sourceContent ?? ''} onChange={e=>onDraftChange({sourceContent:e.target.value})} required disabled={busy || disabled} /></label>
      <div className="action-group"><button className="button" disabled={busy || disabled}>Guardar fuente</button></div>
    </form>
    </div>
    <div className="e1-section">
    <p>{selected.length} fuentes seleccionadas. Sin fuente podés guardar y continuar manualmente, pero no ejecutar el simulador.</p>
    <div className="action-group">
    <button className="button primary" disabled={busy || disabled || !selected.length} onClick={() => { setMessage(''); onAnalyze() }}>Obtener orientación simulada</button>
    <button className="button" onClick={onReview}>Revisar propuestas</button>
    </div>
    </div>
    <div className="e1-section">
    <h3>Aportes humanos · declaraciones, no evidencia independiente</h3>
    <form onSubmit={async event => {
      event.preventDefault(); const form = event.currentTarget, data = new FormData(form), proposalId = data.get('question') || null
      const question = questions.find(q => q.id === proposalId)
      const sourceIds = question ? project.runs.find(r => r.id === question.runId).request.sources.map(s => s.id) : data.get('scope') ? selected.map(s => s.id) : []
      if (await save(() => onContribute({ content: data.get('human'), proposalId, sourceIds }))) { form.reset(); onDraftChange({human:'',question:'',scope:false}) }
    }}>
      <label>Aporte humano<textarea aria-label="Aporte humano" name="human" value={draft.human ?? ''} onChange={e=>onDraftChange({human:e.target.value})} required disabled={busy || disabled} /></label>
      <label>Responde a una pregunta<select name="question" value={draft.question ?? ''} onChange={e=>onDraftChange({question:e.target.value})} disabled={busy || disabled}><option value="">Aporte general del proyecto</option>{questions.map(q => <option value={q.id} key={q.id}>{q.content}</option>)}</select></label>
      <label className="e1-checkbox"><input type="checkbox" name="scope" checked={draft.scope ?? false} onChange={e=>onDraftChange({scope:e.target.checked})} disabled={busy || disabled} /> Limitar el aporte general a las fuentes actualmente seleccionadas</label>
      <div className="action-group"><button className="button" disabled={busy || disabled}>Guardar aporte humano</button></div>
    </form>
    {stage.humanInputs.map(i => <p key={i.id}>Aporte humano: {i.content} · {i.sourceIds.length ? 'vinculado a fuentes' : 'general de este proyecto'}</p>)}
    </div>
    <div className="e1-section">
    <h3>Pendientes</h3><ul>{brief.pending.map(p => <li key={p.id}>{p.content}</li>)}</ul>
    <form key={project.id + ':' + stage.nextAction} onSubmit={async event => {
      event.preventDefault(); const next = new FormData(event.currentTarget).get('nextAction')
      if (await save(() => onNext(next, event.nativeEvent.submitter?.value === 'close'))) onDraftChange({nextAction:undefined})
    }}>
      <label>Próxima acción humana<textarea aria-label="Próxima acción humana" name="nextAction" value={draft.nextAction ?? stage.nextAction} onChange={e=>onDraftChange({nextAction:e.target.value})} disabled={busy || disabled} /></label>
      <div className="action-group">
      <button className="button" disabled={busy || disabled}>Guardar próxima acción y pausar</button>
      <button className="button primary" value="close" disabled={busy || disabled || !brief.blocks.length}>Cerrar E1 con pendientes visibles</button>
      </div>
    </form>
    <p>{stage.closed ? 'E1 cerrado con pendientes visibles' : 'E1 en trabajo'}. El brief se consulta en Entregables y deriva de decisiones aceptadas en Revisión. Abrir o continuar no ejecuta IA.</p>
    </div>
  </section>
}
