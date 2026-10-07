export function TopBar({ title, onHome, children }) {
  return (
    <header className="topbar">
      <button className="brand-button" type="button" onClick={onHome}>
        AI Discovery Copilot
      </button>
      <strong className="topbar-title">{title}</strong>
      <div className="topbar-center">{children}</div>
      <span className="demo-label">Demo · no validado</span>
    </header>
  )
}
