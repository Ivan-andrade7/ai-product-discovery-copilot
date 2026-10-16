import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import '../index.css'
import PrivateWorkspace from './PrivateWorkspace.jsx'

// This entry never mounts the public app or a fictitious authentication wrapper.
const allowed=import.meta.env.MODE==='private-test' && location.protocol==='https:'
createRoot(document.getElementById('root')).render(allowed ? <StrictMode><PrivateWorkspace/></StrictMode> : <main><h1>Entorno privado no habilitado</h1></main>)
