import { isAnalysisRequest } from './contracts.js'

const LOCAL = 'http://127.0.0.1:4010'
const localPage = () => typeof window !== 'undefined' && ['127.0.0.1', 'localhost'].includes(window.location.hostname) && window.location.port === '5173'
const blocked = () => ({ ok: false, available: false, code: 'disconnected', externalAttempted: false })
export async function checkConnection() {
  if (!localPage()) return blocked()
  try {
    const response = await fetch(LOCAL + '/session', { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(3000) })
    if (!response.ok) return blocked()
    const value = await response.json()
    return { ...value, available: value.available === true && value.externalEnabled === true && typeof value.model === 'string' }
  } catch { return blocked() }
}
export async function analyze(request, connection, signal) {
  if (!localPage() || !connection?.available || !isAnalysisRequest(request)) return blocked()
  try {
    const response = await fetch(LOCAL + '/analysis', {
      method: 'POST', credentials: 'omit', signal: AbortSignal.any([signal, AbortSignal.timeout(30000)].filter(Boolean)),
      headers: { 'Content-Type': 'application/json', 'X-Local-Session': connection.session },
      body: JSON.stringify(request),
    })
    return await response.json()
  } catch { return { ok: false, code: signal?.aborted ? 'cancelled' : 'error', externalAttempted: false } }
}
