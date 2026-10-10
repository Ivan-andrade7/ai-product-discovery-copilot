import http from 'node:http'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { isAnalysisRequest } from '../src/ai/contracts.js'
import { createAbacusTrial } from './trial.mjs'
import { createTrialLedger, defaultLedgerPath } from './trial-ledger.mjs'

// Normal startup supplies no connection. No environment credential, activation
// switch or fake provider mode. A later private runner may inject a gated trial.
const origins = new Set(['http://127.0.0.1:5173', 'http://localhost:5173'])
const MAX_BYTES = 100000
export function createLocalService({ connection = null } = {}) {
  const session = randomBytes(32).toString('hex')
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    const allowedHost = '127.0.0.1:' + server.address().port
    const origin = req.headers.origin
    const send = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)) }
    if (req.headers.host !== allowedHost || !origins.has(origin)) { send(403, { code: 'permission' }); req.resume(); return }
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Local-Session')
      send(204, null); return
    }
    if (req.method === 'GET' && req.url === '/session') {
      const state = connection?.status() ?? { available: false, externalEnabled: false, model: null, code: 'cost_pending' }
      send(200, { session, available: state.available === true && state.externalEnabled === true, provider: 'abacus', model: state.model, code: state.code, externalEnabled: state.externalEnabled === true }); return
    }
    if (req.method !== 'POST' || req.url !== '/analysis') { send(404, { code: 'not-found' }); req.resume(); return }
    const candidate = req.headers['x-local-session']
    if (typeof candidate !== 'string' || Buffer.byteLength(candidate) !== Buffer.byteLength(session) || !timingSafeEqual(Buffer.from(candidate), Buffer.from(session))) {
      send(403, { code: 'permission' }); req.resume(); return
    }
    if (req.headers['content-type'] !== 'application/json') { send(415, { code: 'invalid' }); req.resume(); return }
    let bytes = 0
    const chunks = []
    try {
      for await (const chunk of req) {
        bytes += chunk.length
        if (bytes > MAX_BYTES) { send(413, { code: 'invalid' }); return }
        chunks.push(chunk)
      }
      let input
      try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { send(400, { code: 'invalid' }); return }
      if (!isAnalysisRequest(input)) { send(400, { code: 'invalid' }); return }
      if (!connection?.status().available) { send(503, { ok: false, code: connection?.status().code ?? 'cost_pending', externalAttempted: false }); return }
      const controller = new AbortController()
      res.once('close', () => { if (!res.writableEnded) controller.abort() })
      const result = await connection.analyze(input, { signal: controller.signal })
      if (!res.destroyed) send(result.ok ? 200 : 503, result)
    } catch { if (!res.headersSent) send(400, { code: 'invalid' }) }
  })
  server.requestTimeout = 5000
  server.headersTimeout = 5000
  return {
    server,
    listen: (port = 4010) => new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolve(server.address()) })
    }),
    close: () => new Promise((resolve, reject) => { connection?.close(); server.closeAllConnections(); server.close((error) => error ? reject(error) : resolve()) }),
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Reading the ledger never initializes it, supplies a quote, or enables IA.
  const service = createLocalService({ connection: createAbacusTrial({ accounting: createTrialLedger(defaultLedgerPath()) }) })
  service.listen().then(() => console.log('Servicio local 127.0.0.1:4010. Salida externa deshabilitada.'))
    .catch(() => { console.error('No se pudo abrir el servicio local.'); process.exitCode = 1 })
}
