import { useState } from 'react'
import { ProjectSidebar } from '../components/ProjectSidebar'
import { TopBar } from '../components/TopBar'

export function SourcesScreen({ project, proposals, sources, onHome, onNavigate, onSelectSource, readOnly }) {
  const [selectedId, setSelectedId] = useState(sources[0]?.id)
  const selected = sources.find((source) => source.id === selectedId) ?? sources[0]
  const linked = proposals.filter((proposal) => proposal.sourceRefs.some((ref) => ref.sourceId === selected?.id))

  return (
    <div className="screen">
      <TopBar title={project.name} onHome={onHome}>
        <span className="tag">Contexto visible</span>
      </TopBar>
      <div className="project-layout">
        <ProjectSidebar active="Sources" onNavigate={onNavigate} projectName={project.name} />
        <main className="sources-page">
          <header className="work-heading">
            <div>
              <h1>Sources</h1>
              <p>Contenido aportado, referencias e interpretaciones permanecen diferenciados.</p>
            </div>
            <div className="review-count"><strong>{sources.length} fuentes</strong><span>{proposals.length} propuestas vinculables</span></div>
          </header>
          {!selected ? <section className="empty-state"><h2>Sin fuentes registradas</h2></section> : <div className="sources-grid">
            <section className="source-list" aria-label="Inventario de fuentes">
              {sources.map((source) => (
                <button aria-pressed={selected.id === source.id} className={`source-item ${selected.id === source.id ? 'selected' : ''}`} key={source.id} onClick={() => setSelectedId(source.id)} type="button">
                  <span>{source.kind}</span>
                  <strong>{source.name}</strong>
                  <small>{source.status}</small>
                </button>
              ))}
            </section>
            <section className="source-detail" aria-label="Detalle de la fuente">
              <div className="proposal-meta"><span className="tag">{selected.kind}</span><span className="tag">{selected.status}</span></div>
              <h2>{selected.name}</h2>
              <p>{selected.detail}</p>
              {selected.content && <blockquote className="analysis-text">{selected.content}</blockquote>}
              {selected.reference && <p>Referencia no consultada: {selected.reference}</p>}
              {project.mode === 'personal' && <label className="analysis-source"><input type="checkbox" checked={selected.selected} disabled={readOnly || !selected.content.trim()} onChange={(event) => onSelectSource(selected.id, event.target.checked)} /><span>Seleccionar este texto para el análisis</span></label>}
              <p>Aportada no significa procesada ni validada. Un vínculo comprueba procedencia, no calidad de la interpretación.</p>
              <div className="linked-proposals">
                <strong>Propuestas vinculadas directamente</strong>
                {linked.length ? linked.map((proposal) => <button key={proposal.id} type="button" onClick={() => onNavigate('work')}>{proposal.title}<span>{proposal.type}</span></button>) : <p>No hay vínculos por identificador comprobados. Los textos de referencia históricos se conservan en cada propuesta.</p>}
              </div>
            </section>
          </div>}
        </main>
      </div>
    </div>
  )
}
