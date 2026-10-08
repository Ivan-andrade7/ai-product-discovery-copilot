import { useState } from 'react'
import { TopBar } from '../components/TopBar'

export function NewProjectScreen({ onCancel, onCreate, disabled }) {
  const [name, setName] = useState('')
  const [objective, setObjective] = useState('')
  const [sources, setSources] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onCreate({
      name: name.trim() || 'Proyecto sin título',
      objective: objective.trim() || 'Objetivo todavía no definido.',
      sources: sources.trim(),
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
              Sólo lo necesario para empezar; se puede corregir luego.
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
            <span>Objetivo inicial</span>
            <textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="¿Qué decisión o entregable necesitás producir?"
              rows="2"
            />
          </label>

          <label>
            <span>Fuentes disponibles</span>
            <input
              value={sources}
              onChange={(event) => setSources(event.target.value)}
              placeholder="Pegá enlaces o agregalas después"
            />
          </label>

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
