import { useEffect, useRef } from 'react'
import { ContextHelp } from './ContextHelp'
import { conceptHelp, sectionHelp } from './help-content'

const items = [
  { label: 'Resumen', screen: 'overview' },
  { label: 'Revisión', screen: 'work' },
  { label: 'Fuentes', screen: 'sources' },
  { label: 'Decisiones', screen: 'decisions' },
  { label: 'Entregables', screen: 'deliverables' },
  { label: 'Actividad de IA', screen: 'activity' },
]

export function ProjectSidebar({ active = 'Resumen', onNavigate, projectName }) {
  const navigation = useRef(null)

  function revealControl(control) {
    const nav = navigation.current
    if (!nav || nav.scrollWidth <= nav.clientWidth) return
    // Keep the existing 3 px outline and 3 px offset inside this scroller.
    const clearance = 6
    const viewport = nav.getBoundingClientRect()
    const bounds = control.getBoundingClientRect()
    const left = viewport.left + nav.clientLeft + clearance
    const right = viewport.left + nav.clientLeft + nav.clientWidth - clearance
    const delta = bounds.left < left ? bounds.left - left : bounds.right > right ? bounds.right - right : 0
    if (delta) nav.scrollBy({ left: delta, behavior: 'instant' })
  }

  useEffect(() => {
    const control = navigation.current?.querySelector('[aria-current="page"]')
    if (control) revealControl(control)
  }, [active])

  return (
    <aside className="project-sidebar" aria-label="Navegación del proyecto">
      <p className="eyebrow">SECCIONES</p>
      <nav className="project-nav" ref={navigation} aria-label={`Secciones de ${projectName}`}>
        {items.map((item) => (
          <button
            aria-current={item.label === active ? 'page' : undefined}
            className={item.label === active ? 'nav-item active' : 'nav-item'}
            key={item.screen}
            onFocus={(event) => revealControl(event.currentTarget)}
            onClick={() => onNavigate?.(item.screen, undefined, {
              type: 'navigation',
              scrollLeft: navigation.current?.scrollLeft ?? 0,
            })}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="section-help"><span>Sobre {active}</span><ContextHelp title={active}>{sectionHelp[active]}</ContextHelp></div>
      <div className="method-note">
        <div className="help-label"><strong>Proceso de trabajo</strong><ContextHelp title="Proceso de trabajo E1–E18">{conceptHelp.process}</ContextHelp></div>
        <span>Referencia adaptable, no secuencia obligatoria.</span>
      </div>
    </aside>
  )
}
