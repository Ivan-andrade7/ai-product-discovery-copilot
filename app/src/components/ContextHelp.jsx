import { useId, useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { helpPosition } from './help-content'

export function ContextHelp({ title, children }) {
  const id = useId()
  const trigger = useRef(null)
  const panel = useRef(null)
  const [open, setOpen] = useState(false)

  function close() {
    panel.current?.hidePopover()
    trigger.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    function position() {
      const element = panel.current
      const control = trigger.current
      if (!element || !control) return
      const bounds = element.getBoundingClientRect()
      const point = helpPosition(control.getBoundingClientRect(), bounds.width, bounds.height, document.documentElement.clientWidth, window.innerHeight)
      element.style.left = `${point.left}px`
      element.style.top = `${point.top}px`
    }
    position()
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, true)
    return () => {
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
    }
  }, [open])

  return <>
    <button ref={trigger} className="help-trigger" type="button" aria-label={`Ayuda: ${title}`} aria-expanded={open} aria-controls={id} popoverTarget={id}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="6.25" />
        <path d="M6.3 6.1a1.7 1.7 0 0 1 3.4 0c0 1.2-1.7 1.4-1.7 2.7" strokeLinecap="round" />
        <circle cx="8" cy="11" r=".65" fill="currentColor" stroke="none" />
      </svg>
    </button>
    {createPortal(<section ref={panel} id={id} className="context-help" popover="auto" aria-labelledby={`${id}-title`}
      onToggle={(event) => {
        setOpen(event.newState === 'open')
        if (event.newState === 'closed' && panel.current?.contains(document.activeElement)) trigger.current?.focus()
      }}
      onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() } }}>
      <h2 id={`${id}-title`}>{title}</h2>
      <p>{children}</p>
      <button className="button" type="button" onClick={close}>Cerrar ayuda</button>
    </section>, document.body)}
  </>
}

export function ProjectHelp() {
  const dialog = useRef(null)
  const trigger = useRef(null)
  const id = useId()
  const [open, setOpen] = useState(false)
  return <>
    <button ref={trigger} className="button" type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={() => {
      document.querySelectorAll('.context-help:popover-open').forEach((element) => element.hidePopover())
      dialog.current.showModal()
      setOpen(true)
    }}>Ayuda</button>
    {createPortal(<dialog ref={dialog} id={id} className="project-help-dialog" aria-labelledby={`${id}-title`}
      onKeyDown={(event) => {
        // This short guide has one interactive control; keep Tab and Shift+Tab inside it.
        if (event.key === 'Tab') { event.preventDefault(); dialog.current.querySelector('button').focus() }
      }}
      onClose={() => { setOpen(false); trigger.current?.focus() }}>
      <h2 id={`${id}-title`}>Cómo usar la plataforma</h2>
      <ol>
        <li>Conservá el pedido y las fuentes.</li>
        <li>Revisá las propuestas.</li>
        <li>Decidí: aceptar, editar, rechazar o dejar pendiente.</li>
        <li>Consultá las decisiones y el entregable.</li>
      </ol>
      <p>La IA propone; la persona decide. Las fuentes permanecen visibles. La IA pública está deshabilitada.</p>
      <p>El proceso E1–E18 es una referencia adaptable: usá sólo las etapas necesarias, no una secuencia obligatoria.</p>
      <button className="button" type="button" autoFocus onClick={() => dialog.current.close()}>Cerrar guía</button>
    </dialog>, document.body)}
  </>
}
