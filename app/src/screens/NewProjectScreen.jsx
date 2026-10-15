import { useRef, useState } from 'react'
import { TopBar } from '../components/TopBar'
import { hasMeaningfulRequest } from '../workflow'

export function NewProjectScreen({ onCancel, onCreate, disabled }) {
  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [sources, setSources] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [reference, setReference] = useState('')
  const [requestError, setRequestError] = useState('')
  const [attemptStarted, setAttemptStarted] = useState(false)
  const attempt = useRef(null)

  function handleSubmit(event) {
    event.preventDefault()
    if (!hasMeaningfulRequest(objective)) {
      setRequestError('Escribí qué necesitás resolver; la solicitud no puede contener sólo espacios.')
      return
    }
    if (attempt.current?.completed) return
    attempt.current ??= { id: crypto.randomUUID(), completed: false }
    setAttemptStarted(true)
    const saved = onCreate({
      name: name.trim() || 'Proyecto sin título',
      objective,
      sources,
      sourceName,
      reference,
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

          <label>
            <span>Nombre</span>
            <input
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
          <label><span>Nombre de la fuente</span><input disabled={attemptStarted} maxLength={200} value={sourceName} onChange={(event) => setSourceName(event.target.value)} /></label>
          <label><span>Referencia o URL (no se consulta automáticamente)</span><input disabled={attemptStarted} maxLength={2000} value={reference} onChange={(event) => setReference(event.target.value)} /></label>
          <p>PDFs e imágenes todavía no admitidos. La fuente quedará aportada y sin revisar; podés seleccionarla en Work o Sources.</p>

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
