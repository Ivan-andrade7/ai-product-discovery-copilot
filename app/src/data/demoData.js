export const defaultProject = {
  name: 'Discovery v0.1',
  objective: 'Transformar información dispersa en decisiones trazables.',
  sources: 'Solicitud original preservada',
  originalRequest:
    'Necesito transformar información dispersa en evidencia, supuestos, preguntas y decisiones trazables, manteniendo control humano.',
}

export const projects = [
  {
    id: 'discovery-v01',
    name: 'Discovery v0.1',
    nextDecision: 'Evidencia suficiente para definir el problema.',
    summary: '2 decisiones abiertas · 4 fuentes',
    status: 'active',
  },
  {
    id: 'checkout-exploratorio',
    name: 'Checkout exploratorio',
    nextDecision: 'Pausado · sin siguiente acción definida.',
    status: 'paused',
  },
]

export const initialProposals = [
  {
    id: 'problem-statement',
    type: 'Problema supuesto',
    title: 'La información dispersa dificulta decisiones defendibles',
    content:
      'Los equipos de producto pierden tiempo y trazabilidad cuando las fuentes, los supuestos y las decisiones quedan repartidos entre herramientas y documentos.',
    source: 'Solicitud original preservada',
    evidence:
      'La solicitud pide transformar información dispersa en evidencia, supuestos, preguntas y decisiones trazables.',
    reasoning:
      'Se propone como punto de partida porque conecta el problema expresado con una consecuencia operativa. Sigue siendo un supuesto: no hay research primario que confirme frecuencia, impacto ni usuarios afectados.',
    status: 'pending',
  },
  {
    id: 'control-principle',
    type: 'Principio de producto',
    title: 'La decisión final debe permanecer bajo control humano',
    content:
      'La IA puede organizar y proponer, pero ninguna interpretación pasa al entregable sin una acción explícita de la persona responsable.',
    source: 'Solicitud original preservada',
    evidence: 'La entrada original incluye explícitamente “manteniendo control humano”.',
    reasoning:
      'Convertir esta condición en un principio visible ayuda a evaluar todas las funciones posteriores y evita presentar inferencias automáticas como hechos.',
    status: 'pending',
  },
  {
    id: 'next-question',
    type: 'Pregunta abierta',
    title: '¿Qué evidencia mínima vuelve defendible una decisión?',
    content:
      'Definir qué combinación de fuente, supuesto explícito y revisión humana necesita una propuesta antes de incorporarse a un entregable.',
    source: 'Lectura del objetivo del proyecto',
    evidence:
      'El objetivo menciona decisiones trazables, pero todavía no establece un umbral de suficiencia.',
    reasoning:
      'La pregunta expone una laguna real sin inventar una respuesta ni convertir una recomendación en requisito académico.',
    status: 'pending',
  },
]

export const initialSources = [
  {
    id: 'original-request',
    name: 'Solicitud original preservada',
    kind: 'Entrada original',
    status: 'Disponible',
    detail: 'Texto ingresado al crear el proyecto, conservado sin reescritura.',
  },
  {
    id: 'objective-reading',
    name: 'Lectura del objetivo del proyecto',
    kind: 'Interpretación',
    status: 'Revisar',
    detail: 'Lectura derivada del objetivo. No equivale a evidencia de usuarios.',
  },
  {
    id: 'method-reference',
    name: 'Método UX E1–E18',
    kind: 'Marco de trabajo',
    status: 'Referencia',
    detail: 'Referencia adaptable para ordenar decisiones; no es una secuencia obligatoria.',
  },
  {
    id: 'academic-brief',
    name: 'Consigna académica contrastada',
    kind: 'Requisito de entrega',
    status: 'Disponible',
    detail: 'Fuente de requisitos académicos; no valida el problema de producto.',
  },
]
