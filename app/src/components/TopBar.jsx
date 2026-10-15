export function TopBar({ title, onHome, showBack, children }) {
  return (
    <header className="topbar">
      <div className="topbar-start">
        <button className="brand-button" type="button" onClick={onHome}>
          <span className="brand-mark" aria-hidden="true">IA</span>
          <span className="brand-copy">
            <span>AI Discovery Copilot</span>
            <small>por Ivan Andrade</small>
          </span>
        </button>
        {showBack && (
          <button className="topbar-back" type="button" onClick={onHome}>
            ← Volver a proyectos
          </button>
        )}
      </div>
      <strong className="topbar-title">{title}</strong>
      <div className="topbar-center">{children}</div>
      <span className="demo-label">Demo · no validado</span>
    </header>
  )
}
