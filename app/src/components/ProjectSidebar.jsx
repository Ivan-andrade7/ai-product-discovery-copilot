const items = [
  { label: 'Overview', screen: 'overview' },
  { label: 'Work', screen: 'work' },
  { label: 'Sources', screen: 'sources' },
  { label: 'Decisions', screen: 'decisions' },
  { label: 'Deliverables', screen: 'deliverables' },
  { label: 'AI Activity', screen: 'activity' },
]

export function ProjectSidebar({ active = 'Overview', onNavigate }) {
  return (
    <aside className="project-sidebar" aria-label="Navegación del proyecto">
      <p className="eyebrow">PROYECTO</p>
      <p className="project-name">Discovery v0.1</p>
      <nav className="project-nav">
        {items.map((item) => (
          <button
            aria-current={item.label === active ? 'page' : undefined}
            className={item.label === active ? 'nav-item active' : 'nav-item'}
            key={item.screen}
            onClick={() => onNavigate?.(item.screen)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="method-note">
        <strong>Método E1–E18</strong>
        <span>Referencia adaptable, no secuencia obligatoria.</span>
      </div>
    </aside>
  )
}
