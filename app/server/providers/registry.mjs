import {createAbacusAdapter} from './abacus.mjs'
import {createAbacusTransport} from './abacus-transport.mjs'
import {createGeminiAdapter} from './gemini.mjs'
import {createGeminiTransport} from './gemini-transport.mjs'
import {createSimulatedProvider} from '../../src/e1/test-adapters.js'

const providers=Object.freeze({abacus:{adapter:createAbacusAdapter,transport:createAbacusTransport},gemini:{adapter:createGeminiAdapter,transport:createGeminiTransport}})
export const providerOf = ai => ai.mode === 'simulation' ? 'simulation' : ai.provider ?? (ai.mode === 'abacus' ? 'abacus' : null)
export const realMode = ai => ai.mode === 'real' || ai.mode === 'abacus'
export function matchesServerSelection(ai,request) {
  const provider=providerOf(ai)
  // Provider absence belongs only to the pre-boundary Abacus/simulation contract.
  return request?.model === ai.model && (request.provider === undefined ? ['abacus','simulation'].includes(provider) : request.provider === provider) &&
    !['endpoint','url','apiKey','credential','mode'].some(key=>Object.hasOwn(request,key))
}
export function createConfiguredProvider(ai,{admission,transportFactory,simulationProvider}={}) {
  if(ai.mode === 'simulation')return {adapter:simulationProvider ?? createSimulatedProvider(),close(){}}
  const entry=realMode(ai) && providers[providerOf(ai)]
  if(!entry)throw Error('invalid-ai-config')
  const transport=(transportFactory ?? entry.transport)({apiKey:ai.key,admission,model:ai.model,maxOutputTokens:ai.maxOutputTokens,timeoutMs:ai.timeoutMs,maxSourceChars:ai.maxSourceChars,maxInputChars:ai.maxInputChars,maxSources:ai.maxSources})
  return {adapter:entry.adapter(transport,{maxOutputTokens:ai.maxOutputTokens}),close:()=>transport.close?.()}
}
