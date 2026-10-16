import {isWorkspace} from '../src/storage.js'

// Public/publishable project key + the signed-in user's token. Never service_role.
export function createRemoteStore({url, publicKey, fetcher = fetch}) {
  async function rpc(token, name, body) {
    const response = await fetcher(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: {apikey: publicKey, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
      body: JSON.stringify(body), signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'permission' : 'remote-error')
    return response.json()
  }
  return {
    async load(token) {
      const workspace = await rpc(token, 'tp_read_workspace', {})
      if (workspace !== null && !isWorkspace(workspace)) throw new Error('incompatible')
      return workspace
    },
    async save(token, command) {
      if (!isWorkspace(command.candidate) || !Number.isInteger(command.revision) || command.revision < 0 ||
          typeof command.writerId !== 'string' || !/^[\da-f-]{36}$/i.test(command.operationId ?? '')) return {ok:false,type:'validation-error'}
      return rpc(token, 'tp_save_workspace', {p_candidate:command.candidate,p_revision:command.revision,p_writer:command.writerId,p_operation:command.operationId})
    },
  }
}
