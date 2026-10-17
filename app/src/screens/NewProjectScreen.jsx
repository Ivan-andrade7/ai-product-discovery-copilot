import { useEffect, useRef, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { hasMeaningfulRequest } from '../workflow'
import { ContextHelp } from '../components/ContextHelp'
import { conceptHelp } from '../components/help-content'

export function NewProjectScreen({ onCancel, onCreate, disabled, e1Enabled = false }) {
  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [sources, setSources] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [reference, setReference] = useState('')
  const [requestError, setRequestError] = useState('')
  const [attemptStarted, setAttemptStarted] = useState(false)
  const attempt = useRef(null)
  const nameRef = useRef(null)
  const [stageObjective, setStageObjective] = useState('')
  const [constraints, setConstraints] = useState('')

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!hasMeaningfulRequest(objective)) {
      setRequestError('Escribí qué necesitás resolver; la solicitud no puede contener sólo espacios.')
      return
    }
    if (attempt.current?.completed) return
    attempt.current ??= { id: crypto.randomUUID(), completed: false }
    setAttemptStarted(true)
    const saved = await onCreate({
      name: name.trim() || 'Proyecto sin título',
      objective,
      sources,
      sourceName,
      reference,
      ...(e1Enabled ? { stageObjective, constraints } : {}),
    }, attempt.current.id)
    attempt.current.completed = saved
  }

  return (
    <div className="screen">
      <TopBar title="Nuevo proyecto" onHome={onCancel} />
      <main className="form-page">
        <form className="project-form" onSubmit={handleSubmit}>
          <div>
            <h1>Crear proyecto</h1>
            <p className="page-description">
              Empezá con texto ficticio. No se generarán propuestas ni se enviará contenido al crear el proyecto.
            </p>
          </div>

          <div className="form-section">
              <div className="help-label"><h2>Datos del proyecto</h2><ContextHelp title="Crear proyecto">{conceptHelp.creation}</ContextHelp></div>
          <label>
            <span>Nombre</span>
            <input
              ref={nameRef}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={attemptStarted}
              placeholder="Ej. Discovery v0.1"
            />
          </label>

          <label>
            <span id="request-label">Solicitud original</span>
            <textarea
              required
              maxLength={12000}
              value={objective}
              disabled={attemptStarted}
              aria-labelledby="request-label"
              aria-invalid={!!requestError}
              aria-describedby={requestError ? 'request-error' : undefined}
              onChange={(event) => { setObjective(event.target.value); setRequestError('') }}
              placeholder="¿Qué decisión o entregable necesitás producir?"
              rows="2"
            />
            {requestError && <span id="request-error" role="alert">{requestError}</span>}
          </label>
          </div>

          <div className="form-section">
          <h2>Fuente inicial (opcional)</h2>
          <label>
            <span>Texto de la fuente aportada (opcional)</span>
            <textarea
              maxLength={12000}
              value={sources}
              disabled={attemptStarted}
              onChange={(event) => setSources(event.target.value)}
              placeholder="Pegá el contenido textual que querés poder seleccionar para el análisis"
            />
          </label>
          <div className="form-section-fields">
          <label><span>Nombre de la fuente</span><input disabled={attemptStarted} maxLength={200} value={sourceName} onChange={(event) => setSourceName(event.target.value)} /></label>
          <label><span>Referencia o URL (no se consulta automáticamente)</span><input disabled={attemptStarted} maxLength={2000} value={reference} onChange={(event) => setReference(event.target.value)} /></label>
          </div>
          <p>PDFs e imágenes todavía no admitidos. La fuente quedará aportada y sin revisar; podés seleccionarla en Revisión o Fuentes.</p>
          </div>

          {e1Enabled && <div className="form-section"><h2>Contexto adicional (opcional)</h2><label>Resultado esperado, si ya lo conocés<input value={stageObjective} disabled={attemptStarted} onChange={(e) => setStageObjective(e.target.value)} /></label><label>Restricciones conocidas, si existen<input value={constraints} disabled={attemptStarted} onChange={(e) => setConstraints(e.target.value)} /></label></div>}
          <p className="method-warning">No hace falta elegir todas las etapas E1–E18.</p>
          {attemptStarted && <p role="status">El candidato conserva los campos originales en esta pestaña. Reintentar guarda el mismo proyecto; no crea otro. Si recargás antes de guardarlo o exportarlo, la copia en memoria se pierde.</p>}

          <div className="form-actions">
            <button className="button secondary" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button className="button primary" type="submit" disabled={disabled}>
              {attemptStarted ? 'Reintentar guardado' : 'Crear y continuar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
