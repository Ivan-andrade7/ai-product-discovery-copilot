import {createHash} from 'node:crypto'
import {makeRequest,PROPOSAL_TYPES} from '../src/ai/contracts.js'
import {proposalResponseFormat} from '../server/providers/structured-output.mjs'

// Planning only. No transport, credential, filesystem write or executable runner.
export const MODEL_CANDIDATES=Object.freeze([
  Object.freeze({provider:'gemini',id:'gemini-3.8-flash',role:'free-fictional-candidate',optional:false,verification:'documentary-only',executable:false}),
  Object.freeze({provider:'abacus',id:'gpt-6.1-sol',role:'paid-balanced-reference',optional:false,verification:'account-and-price-pending',executable:false}),
  Object.freeze({provider:'groq',id:'openai/gpt-oss-120b',role:'free-candidate-pending-verification',optional:true,verification:'provider-model-and-free-tier-unverified',executable:false}),
  Object.freeze({provider:'abacus',id:'claude-sonnet-5-5',role:'cross-model-competitor',optional:true,verification:'account-and-price-pending',executable:false}),
  Object.freeze({provider:'abacus',id:'gpt-6-astra',role:'exceptional-premium-escalation',optional:true,verification:'account-and-price-pending',executable:false}),
])
export const EVALUATION_DIMENSIONS=Object.freeze(['schemaValidity','literalCitationFidelity','factsHypothesesQuestions','gapsAndContradictions','embeddedInstructionResistance','utility','latency','reportedUsage'])

// Read only the Entrada block; evaluator guidance never becomes model input.
export function parseCanonicalCorpus(markdown) {
  const text=markdown.replace(/\r\n/g,'\n')
  const cases=[...text.matchAll(/^## Caso ([0-3]) — (.+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(match=>{
    const entry=match[3].split('### Entrada para el modelo\n')[1]?.split('### Guía del evaluador')[0]
    if(!entry)throw Error('missing-canonical-entry')
    const blocks=[...entry.matchAll(/^\*\*(Solicitud|Fuente seleccionada — ([^\n]+))\*\*\n\n((?:>[^\n]*(?:\n|$))+)/gm)]
    if(blocks[0]?.[1]!=='Solicitud' || blocks.length<2 || blocks.slice(1).some(block=>!block[2]))throw Error('incompatible-canonical-entry')
    const quoted=block=>block[3].replace(/\n$/,'').split('\n').map(line=>line.replace(/^> ?/,'')).join('\n')
    return {id:Number(match[1]),title:match[2],userRequest:quoted(blocks[0]),sources:blocks.slice(1).map((block,index)=>({id:`corpus-case-${match[1]}-source-${index+1}`,name:block[2],content:quoted(block)}))}
  })
  if(cases.length!==4 || new Set(cases.map(c=>c.id)).size!==4)throw Error('canonical-four-cases-required')
  return cases.sort((a,b)=>a.id-b.id)
}

export function prepareEvaluationPlan(markdown,{includeCrossProvider=false,includePendingGroq=false,includePremiumEscalation=false,maxOutputTokens,timeoutMs}={}) {
  if(!Number.isInteger(maxOutputTokens)||maxOutputTokens<1||maxOutputTokens>1800||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>25000)throw Error('explicit-compatible-limits-required')
  const cases=parseCanonicalCorpus(markdown)
  const models=MODEL_CANDIDATES.filter(model=>!model.optional || (includeCrossProvider && model.role==='cross-model-competitor') || (includePendingGroq && model.provider==='groq') || (includePremiumEscalation && model.role==='exceptional-premium-escalation'))
  const hash=value=>createHash('sha256').update(value).digest('hex')
  const jobs=cases.flatMap(c=>models.map(model=>{
    const project={id:`corpus-case-${c.id}`,originalRequest:c.userRequest,sources:c.sources.map(source=>({...source,selected:true})),stageWork:{E1:{known:{objective:'',constraints:''},humanInputs:[]}}}
    // A pending provider gets no transport-ready request. All jobs remain non-executable.
    const request=model.provider==='groq'?null:makeRequest(project,model.id,`corpus-${c.id}-${model.id}`,'E1',model.provider)
    const contextRequest=request??makeRequest(project,model.id,`corpus-${c.id}-pending`,'E1')
    return {caseId:c.id,provider:model.provider,model:model.id,status:'not-executed',executable:false,blockedReason:model.verification,maxAttempts:1,request,responseFormat:request?proposalResponseFormat(c.sources.map(source=>source.id)):null,
      inputFingerprint:hash(contextRequest.contextVersion),result:null,metrics:Object.fromEntries(EVALUATION_DIMENSIONS.map(key=>[key,null]))}
  }))
  return {version:2,status:'prepared-not-authorized',corpusSha256:hash(markdown),candidates:MODEL_CANDIDATES,models,jobs,maxGenerationAttempts:jobs.length,authorizedGenerationAttempts:0,sequential:true,automaticRetries:false,repairCalls:false,router:false,fallback:false,
    maxOutputTokens,timeoutMs,proposalTypes:PROPOSAL_TYPES,results:[],winner:null}
}
