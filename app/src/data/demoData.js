export const defaultProject = {
  id: 'discovery-v01',
  name: 'Discovery v0.1',
  objective: 'Transformar información dispersa en decisiones trazables.',
  originalRequest: 'Necesito transformar información dispersa en evidencia, supuestos, preguntas y decisiones trazables, manteniendo control humano.',
}

export const initialProposals = [
  { id: 'problem-statement', type: 'Problema supuesto', title: 'La información dispersa dificulta decisiones defendibles', content: 'Los equipos de producto pierden tiempo y trazabilidad cuando las fuentes, los supuestos y las decisiones quedan repartidos entre herramientas y documentos.', source: 'Solicitud original preservada', evidence: 'La solicitud pide transformar información dispersa en evidencia, supuestos, preguntas y decisiones trazables.', reasoning: 'Se propone como punto de partida porque conecta el problema expresado con una consecuencia operativa. Sigue siendo un supuesto: no hay research primario que confirme frecuencia, impacto ni usuarios afectados.', status: 'pending' },
  { id: 'control-principle', type: 'Principio de producto', title: 'La decisión final debe permanecer bajo control humano', content: 'La IA puede organizar y proponer, pero ninguna interpretación pasa al entregable sin una acción explícita de la persona responsable.', source: 'Solicitud original preservada', evidence: 'La entrada original incluye explícitamente “manteniendo control humano”.', reasoning: 'Convertir esta condición en un principio visible ayuda a evaluar todas las funciones posteriores y evita presentar inferencias automáticas como hechos.', status: 'pending' },
  { id: 'next-question', type: 'Pregunta abierta', title: '¿Qué evidencia mínima vuelve defendible una decisión?', content: 'Definir qué combinación de fuente, supuesto explícito y revisión humana necesita una propuesta antes de incorporarse a un entregable.', source: 'Lectura del objetivo del proyecto', evidence: 'El objetivo menciona decisiones trazables, pero todavía no establece un umbral de suficiencia.', reasoning: 'La pregunta expone una laguna real sin inventar una respuesta ni convertir una recomendación en requisito académico.', status: 'pending' },
]

export const initialSources = [
  { id: 'original-request', name: 'Solicitud original preservada', kind: 'Entrada original', status: 'Disponible', detail: 'Texto ingresado al crear el proyecto, conservado sin reescritura.' },
  { id: 'objective-reading', name: 'Lectura del objetivo del proyecto', kind: 'Interpretación', status: 'Revisar', detail: 'Lectura derivada del objetivo. No equivale a evidencia de usuarios.' },
  { id: 'method-reference', name: 'Método UX E1–E18', kind: 'Marco de trabajo', status: 'Referencia', detail: 'Referencia adaptable para ordenar decisiones; no es una secuencia obligatoria.' },
  { id: 'academic-brief', name: 'Consigna académica contrastada', kind: 'Requisito de entrega', status: 'Disponible', detail: 'Fuente de requisitos académicos; no valida el problema de producto.' },
]

const clone = (value) => JSON.parse(JSON.stringify(value))

export function createDefaultWorkspace() {
  return { schemaVersion: 2, revision: 0, writerId: 'unpersisted', activeProjectId: defaultProject.id, projects: [{ ...defaultProject, sources: clone(initialSources), proposals: clone(initialProposals), decisions: [] }] }
}

export function migrateLegacyWorkspace(legacy) {
  const project = {
    id: legacy.project.id || defaultProject.id,
    name: legacy.project.name || defaultProject.name,
    objective: typeof legacy.project.objective === 'string' ? legacy.project.objective : '',
    originalRequest: typeof legacy.project.originalRequest === 'string' ? legacy.project.originalRequest : legacy.project.objective || '',
    sources: clone(initialSources),
    proposals: clone(legacy.proposals),
    decisions: clone(legacy.decisions),
  }
  const contributed = typeof legacy.project.sources === 'string' ? legacy.project.sources.trim() : ''
  if (contributed && contributed !== 'Solicitud original preservada' && contributed !== 'Sin fuentes agregadas.') {
    project.sources.push({ id: `legacy-contributed-${project.id}`, name: 'Fuente aportada en v0.1', kind: 'Fuente aportada', status: 'Aportada · sin revisar', detail: contributed })
  }
  return { schemaVersion: 2, revision: 0, writerId: 'unpersisted', activeProjectId: project.id, projects: [project] }
}

export function createLocalProject(input) {
  const id = `project-${crypto.randomUUID()}`
  const sources = [{ id: `original-${id}`, name: 'Solicitud original preservada', kind: 'Entrada original', status: 'Disponible', detail: 'Objetivo ingresado al crear el proyecto, conservado sin reescritura.' }]
  if (input.sources.trim()) sources.push({ id: `contributed-${id}`, name: 'Fuente aportada al crear el proyecto', kind: 'Fuente aportada', status: 'Aportada · sin revisar', detail: input.sources.trim() })
  sources.push({ id: `demo-${id}`, name: 'Contenido simulado del producto', kind: 'Contenido demo', status: 'No validado', detail: 'Material ficticio incluido sólo para demostrar el flujo de revisión.' })
  const proposals = clone(initialProposals).map((proposal) => ({ ...proposal, source: 'Contenido simulado del producto', evidence: 'Contenido ficticio para probar la interacción. No deriva de las fuentes aportadas a este proyecto.' }))
  return { id, name: input.name, objective: input.objective, originalRequest: input.objective, sources, proposals, decisions: [] }
}
