import {createWorkspaceRepository} from '../repository.js'
import {E1_INSTRUCTION} from './service.js'
export const TEST_PREFIX='copilot-e1-integrated-test:'
export function createTestAuth(){let allowed=false;return {signIn(identity){allowed=identity==='ivan';return allowed},signOut(){allowed=false},authorized:()=>allowed}}
export function createSimulatedProvider(){return {async analyze(request){
 const source=request.sources[0],known=request.humanContext.known
 const field=!known.constraints.trim()?'constraints':!known.objective.trim()?'objective':null
 return {ok:true,simulated:true,externalAttempted:false,modelReported:'simulation-e1',value:{proposals:[
 {type:'Afirmación',title:'Síntesis del contexto aportado',content:'La fuente seleccionada aporta: «'+source.content.slice(0,300)+'»',reasoning:'Extracción literal simulada; interpretación por revisar.',certainty:'evidence',references:[{sourceId:source.id,quote:source.content.slice(0,300)}]},
 {type:'Hipótesis',title:'Hipótesis para revisar',content:'Aclarar los límites podría ayudar a preparar el brief. Sugerencia simulada, no validada.',reasoning:'Ejemplo fijo, no conclusión de un modelo.',certainty:'hypothesis',references:[]},
 ...(field?[{type:'Pregunta',title:'Pregunta prioritaria',content:field==='constraints'?'¿Qué restricción cambia el próximo paso?':'¿Qué resultado esperás conseguir?',reasoning:'Dato estructurado no registrado.',certainty:'question',e1Field:field,references:[]}]:[])
 ]}}
}}}
export function createTestEnvironment(storage,{provider=createSimulatedProvider()}={}){
 const auth=createTestAuth(),keyFor=key=>TEST_PREFIX+key
 const isolated={getItem:key=>storage.getItem(keyFor(key)),setItem:(key,value)=>storage.setItem(keyFor(key),value)}
 return {auth,instruction:E1_INSTRUCTION,simulated:true,repository:createWorkspaceRepository({storage:isolated,keyFor,authorize:auth.authorized}),
 checkConnection:async()=>({available:auth.authorized(),model:'simulation-e1',code:'ready',simulated:true}),
 async analyze(request,signal){if(signal?.aborted)return {ok:false,code:'cancelled',externalAttempted:false};if(!auth.authorized())return {ok:false,code:'permission',externalAttempted:false};try{const result=await provider.analyze(request,E1_INSTRUCTION);return signal?.aborted ? {ok:false,code:'cancelled',externalAttempted:false}:auth.authorized()?result:{ok:false,code:'permission',externalAttempted:false}}catch{return {ok:false,code:'uncertain',externalAttempted:false}}}}
}
