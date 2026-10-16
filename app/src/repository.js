import {loadWorkspace,persistWorkspace} from './storage.js'
// Shared synchronous local boundary. A remote adapter needs async orchestration
// and server transactions; this port does not assert remote security.
export function createWorkspaceRepository({storage,keyFor=(key)=>key,authorize=()=>true}={}) {
 const check=()=>{if(!authorize())throw new Error('access-denied')}
 return {keyFor,load(options){check();return loadWorkspace({...options,storage})},save(candidate,revision,writerId){check();return persistWorkspace(candidate,revision,writerId,storage)}}
}
