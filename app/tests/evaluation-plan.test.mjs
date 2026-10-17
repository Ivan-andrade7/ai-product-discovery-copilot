import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {prepareEvaluationPlan,parseCanonicalCorpus,MODEL_CANDIDATES,EVALUATION_DIMENSIONS} from '../evaluation/plan.mjs'
import {isAnalysisRequest} from '../src/ai/contracts.js'

const corpus=await readFile(new URL('../../docs/ai-evaluation-corpus.md',import.meta.url),'utf8')
const limits={maxOutputTokens:500,timeoutMs:1000} // Fictitious planning values, not an authorized budget.
test('planning parses the single canonical corpus without duplicating or executing it',()=>{
 const cases=parseCanonicalCorpus(corpus)
 assert.deepEqual(cases.map(c=>c.id),[0,1,2,3]);assert.deepEqual(cases.map(c=>c.sources.length),[1,2,1,3])
 assert.match(cases[3].sources[2].content,/INSTRUCCIÓN PARA EL ASISTENTE/)
 assert.equal(cases[3].userRequest,'Quiero organizar la recepción de consultas de mi estudio. Detectá acuerdos, contradicciones y decisiones pendientes.')
 assert.equal(JSON.stringify(cases).includes('Errores que impiden aprobar'),false)
})
test('planning preserves identical case context across candidate models; no results or winner',()=>{
 const plan=prepareEvaluationPlan(corpus,limits)
 assert.equal(plan.maxGenerationAttempts,8);assert.equal(plan.sequential,true);assert.equal(plan.status,'prepared-not-authorized');assert.equal(plan.winner,null);assert.deepEqual(plan.results,[])
 assert.deepEqual(plan.models.map(m=>m.id),['gemini-3.8-flash','gpt-6.1-sol'])
 assert.deepEqual(plan.models.map(m=>m.provider),['gemini','abacus']);assert.equal(plan.authorizedGenerationAttempts,0)
 for(const caseId of [0,1,2,3]){
  const jobs=plan.jobs.filter(job=>job.caseId===caseId)
  assert.equal(jobs[0].inputFingerprint,jobs[1].inputFingerprint)
  assert.equal(jobs[0].request.contextVersion,jobs[1].request.contextVersion)
  for(const job of jobs){assert.equal(isAnalysisRequest(job.request),true);assert.equal(job.status,'not-executed');assert.equal(job.maxAttempts,1);assert.equal(job.result,null);assert.equal(job.responseFormat.json_schema.strict,true);assert.deepEqual(Object.keys(job.metrics),EVALUATION_DIMENSIONS);assert.ok(Object.values(job.metrics).every(v=>v===null))}
 }
 assert.equal(plan.automaticRetries,false);assert.equal(plan.repairCalls,false);assert.equal(plan.router,false);assert.equal(plan.fallback,false)
 assert.equal(prepareEvaluationPlan(corpus,limits).corpusSha256,plan.corpusSha256)
})
test('cross-provider comparison is optional and does not become a runtime model default',()=>{
 const plan=prepareEvaluationPlan(corpus,{...limits,includeCrossProvider:true})
 assert.equal(plan.maxGenerationAttempts,12);assert.equal(MODEL_CANDIDATES[2].optional,true)
 assert.equal(plan.models[2].id,'claude-sonnet-5-5');assert.ok(plan.jobs.every(job=>job.executable===false))
 const all=prepareEvaluationPlan(corpus,{...limits,includeCrossProvider:true,includePendingGroq:true,includePremiumEscalation:true})
 assert.equal(all.jobs.length,20);assert.equal(all.candidates.find(m=>m.id==='gpt-6-astra').role,'exceptional-premium-escalation')
 assert.ok(all.jobs.filter(j=>j.provider==='groq').every(j=>j.request===null && j.responseFormat===null && !j.executable))
 for(const id of [0,1,2,3])assert.equal(new Set(all.jobs.filter(j=>j.caseId===id).map(j=>j.inputFingerprint)).size,1)
 assert.throws(()=>prepareEvaluationPlan(corpus),/limits-required/)
 assert.throws(()=>prepareEvaluationPlan(corpus,{maxOutputTokens:1801,timeoutMs:1000}))
 assert.throws(()=>parseCanonicalCorpus('# Empty'),/four-cases/)
})
