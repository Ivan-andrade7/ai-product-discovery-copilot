import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

async function mount() {
  let Screen = App
  if (import.meta.env.DEV && window.location.hostname === '127.0.0.1' && window.location.port === '5182' && window.location.pathname === '/private') {
    Screen = (await import('./remote/PrivateWorkspace.jsx')).default
  }
  // Compile-time DEV guard removes the isolated test entry and its adapters
  // from production. No environment flag can enable a simulated remote login.
  else if (import.meta.env.DEV && window.location.port !== '5182' && ['127.0.0.1', 'localhost'].includes(window.location.hostname) && new URLSearchParams(window.location.search).has('e1')) {
    Screen = (await import('./e1/E1Development.jsx')).default
  }
  createRoot(document.getElementById('root')).render(<StrictMode><Screen /></StrictMode>)
}
mount()
