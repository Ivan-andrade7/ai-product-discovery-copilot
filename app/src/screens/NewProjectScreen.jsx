import { useState } from 'react'
import { TopBar } from '../components/TopBar'

export function NewProjectScreen({ onCancel, onCreate, disabled }) {
  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [sources, setSources] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [reference, setReference] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onCreate({
      name: name.trim() || 'Proyecto sin título',
      objective,
      sources,
      sourceName,
      reference,
    })
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
              placeholder="Ej. Discovery v0.1"
            />
          </label>

          <label>
            <span>Solicitud original</span>
            <textarea
              required
              maxLength={12000}
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="¿Qué decisión o entregable necesitás producir?"
              rows="2"
            />
          </label>

          <label>
            <span>Texto de la fuente aportada (opcional)</span>
            <textarea
              maxLength={12000}
              value={sources}
              onChange={(event) => setSources(event.target.value)}
              placeholder="Pegá el contenido textual que querés poder seleccionar para el análisis"
            />
          </label>
          <label><span>Nombre de la fuente</span><input maxLength={200} value={sourceName} onChange={(event) => setSourceName(event.target.value)} /></label>
          <label><span>Referencia o URL (no se consulta automáticamente)</span><input maxLength={2000} value={reference} onChange={(event) => setReference(event.target.value)} /></label>
          <p>PDFs e imágenes todavía no admitidos. La fuente quedará aportada y sin revisar; podés seleccionarla en Work o Sources.</p>

          <p className="method-warning">No hace falta elegir todas las etapas E1–E18.</p>

          <div className="form-actions">
            <button className="button secondary" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button className="button primary" type="submit" disabled={disabled}>
              Crear y continuar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
