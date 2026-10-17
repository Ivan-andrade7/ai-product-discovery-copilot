export const sectionHelp = {
  Resumen: 'Ubicá el pedido original y el estado del proyecto. Elegí qué información revisar antes de continuar.',
  Fuentes: 'Consultá el contenido aportado y elegí qué fuentes usar en el análisis. Aportar una fuente no significa que esté revisada ni validada.',
  Revisión: 'Compará cada propuesta con sus fuentes. Pendiente: todavía sin resolver. Aceptada: decidiste incorporarla, no validarla. Editada y aceptada: incorporaste tu versión. Rechazada: no se incorpora. Podés reabrir una decisión.',
  Decisiones: 'Consultá qué aceptaste, editaste o rechazaste y por qué. Una decisión humana no convierte un supuesto en evidencia.',
  Entregables: 'Consultá el documento derivado de las propuestas aceptadas y revisá sus referencias. No es una validación automática ni una entrega académica terminada.',
  'Actividad de IA': 'Consultá los intentos y su procedencia. Abrí los detalles para ver los metadatos disponibles. Un intento registrado no implica una respuesta válida.',
}

export const conceptHelp = {
  demo: 'Este rótulo indica una experiencia de prueba, no un producto validado. Los ejemplos y las simulaciones no acreditan research ni calidad general de IA.',
  process: 'E1–E18 es una referencia de trabajo adaptable. Elegí sólo las etapas necesarias para tu próxima decisión; no es una secuencia obligatoria ni una automatización completa.',
  analysis: 'Una simulación usa respuestas de prueba, no un modelo real. Una ejecución real debe conservar su procedencia. La IA pública sigue deshabilitada; abrir o revisar no ejecuta análisis.',
  creation: 'Crear conserva el pedido y la fuente que aportes. No ejecuta IA ni genera propuestas automáticamente. Después podés revisar y seleccionar las fuentes.',
}

export function helpPosition(rect, width, height, viewportWidth, viewportHeight) {
  const gap = 16
  const left = Math.max(gap, Math.min(rect.left, viewportWidth - width - gap))
  const below = rect.bottom + 8
  const top = below + height <= viewportHeight - gap ? below : Math.max(gap, rect.top - height - 8)
  return { left, top }
}
