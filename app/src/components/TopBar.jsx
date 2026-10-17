import brandLogo from '../assets/ivan-andrade-monogram-dark.svg'
import { ContextHelp, ProjectHelp } from './ContextHelp'
import { conceptHelp } from './help-content'

export function TopBar({ title, onHome, showBack, children }) {
  return (
    <header className="topbar">
      <div className="topbar-start">
        <button className="brand-button" type="button" onClick={onHome}>
          <img className="brand-mark" src={brandLogo} width="358" height="310" alt="" aria-hidden="true" />
          <span className="brand-copy">
            <span>AI Discovery Copilot</span>
            <small>por Ivan Andrade</small>
          </span>
        </button>
      </div>
      <div className="topbar-project">
        {showBack && (
          <button className="button topbar-back" type="button" onClick={onHome}>
            ← Volver a proyectos
          </button>
        )}
        <strong className="topbar-title">{title}</strong>
      </div>
      <div className="topbar-center">{children}</div>
      <div className="topbar-help">
        {showBack && <ProjectHelp />}
        <span className="demo-label">Demo · no validado</span>
        <ContextHelp title="Demo · no validado">{conceptHelp.demo}</ContextHelp>
      </div>
    </header>
  )
}
