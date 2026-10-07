# Registro de prompts e intervenciones representativas

Fecha de revisión: 7 de octubre de 2026.

## Criterio

Este registro conserva ejemplos que influyeron efectivamente en el proyecto. Distingue el prompt de exploración visual de las intervenciones humanas realizadas durante la prueba. No presenta reconstrucciones como transcripciones exactas ni atribuye a una herramienta decisiones tomadas por Iván.

## 1. Prompt maestro de exploración visual v0.1

**Estado:** texto exacto conservado en la página Notion del proyecto; a continuación se incluye una transcripción fiel abreviada.  
**Uso observado:** base común para explorar variantes en Figma Make, UXPilot y Abacus.AI.  
**Resultado:** alternativas visuales utilizadas como insumo; no constituyen validación ni selección automática.

```text
Actuá como Senior Product Designer, UX Architect y prototipador de productos digitales. Diseñá una propuesta de aplicación web responsive llamada provisionalmente “AI Product Discovery Copilot”. No diseñes una landing de marketing: diseñá el producto autenticado y su experiencia de trabajo.

CONTEXTO
La aplicación ayuda a una persona que trabaja en UX/UI y Product Design a conducir proyectos con apoyo de IA. Parte de una idea o solicitud que puede estar incompleta y ayuda a organizar información, distinguir evidencia de supuestos, detectar preguntas abiertas, preparar entregables y avanzar por un proceso de diseño proporcional.

La visión futura puede cubrir E1–E18, pero la primera versión debe demostrar un recorrido coherente desde la solicitud inicial hasta arquitectura, flujo y wireframes. Las etapas no son un checklist obligatorio: el sistema puede recomendar capacidades, y la persona puede avanzar, volver, omitir una capacidad con motivo, pausar o cerrar una versión.

PRINCIPIO RECTOR
“AI proposes → Human decides → Evidence remains visible.”
La IA propone; la persona decide; la evidencia permanece visible.

USUARIO INICIAL
Un Product/UX Designer individual que trabaja en proyectos propios, formativos o profesionales. En esta versión no diseñes colaboración multiusuario, portal de clientes ni roles empresariales.

OBJETIVO DEL PRODUCTO
Reducir el trabajo manual entre decisiones sin sustituir el criterio profesional. La aplicación debe ayudar a responder:
- ¿Qué llegó?
- ¿Qué sabemos?
- ¿Qué estamos suponiendo?
- ¿Qué falta comprender?
- ¿Qué capacidad del proceso corresponde ahora?
- ¿Qué decisión debe tomar la persona?
- ¿De dónde proviene cada entregable?
- ¿Qué cambió entre versiones?

REGLAS NO NEGOCIABLES
1. Conservar siempre la solicitud o fuente original.
2. Separar fuente original y resumen generado.
3. No inventar evidencia, usuarios, entrevistas, citas, métricas ni decisiones.
4. Marcar explícitamente lo desconocido o pendiente.
5. Una propuesta de IA nunca aparece como decisión confirmada.
6. Aceptar una propuesta no significa que fue investigada, validada, implementada o medida.
7. Cada entregable debe enlazar sus fuentes y decisiones.
8. Si cambia una fuente o una decisión, señalar los entregables potencialmente afectados.
9. La interfaz debe permitir aceptar, editar, rechazar o mantener pendiente.
10. No convertir E1–E18 en dieciocho pasos obligatorios.
11. Usar nombres comprensibles en la navegación. Mostrar E1–E18 sólo como referencia metodológica secundaria.
12. No incluir acciones externas automáticas como contactar personas, publicar, grabar, desplegar o modificar servicios.
13. No agregar CRM, presupuestos, contratos, facturación, leads ni portal de clientes.
14. No incorporar login, pagos, equipos, integraciones reales ni configuración empresarial en esta exploración.
15. Ante una ambigüedad, elegir la opción más pequeña y marcar el supuesto.

PANTALLAS MÍNIMAS
1. Proyectos: lista, estado, próximo gate y acción “Nuevo proyecto”.
2. Nuevo proyecto: nombre provisional y solicitud original conservada.
3. Resumen: propósito, alcance, bloqueos, entregables y próximo gate.
4. Espacio de trabajo: propuesta, fuentes, razonamiento y acciones humanas.
5. Fuentes y conocimiento: procedencia, evidencia, supuestos y preguntas.
6. Decisiones: estado, fundamento, alcance, reemplazos e impacto.
7. Entregables: versiones, procedencia y relación con decisiones.
8. Actividad y uso de IA: prompts, herramienta, propuesta, cambios humanos, errores y correcciones.

FLUJO PRINCIPAL
1. La persona crea un proyecto.
2. Ingresa una solicitud original.
3. La IA propone resumen, evidencia, supuestos, preguntas y restricciones.
4. La persona revisa cada elemento.
5. Resuelve el gate de intake.
6. El sistema propone capacidades pertinentes.
7. La persona acepta u omite capacidades con motivo.
8. Incorpora fuentes disponibles.
9. La IA prepara framing y alternativas.
10. La persona decide el alcance.
11. El sistema propone estructura y recorrido.
12. La persona resuelve reglas, estados y excepciones.
13. El sistema genera wireframes de baja fidelidad o una representación equivalente.
14. La persona cierra una versión entregable o habilita capacidades posteriores.

CASOS DE RECUPERACIÓN
- Fallo de IA: conservar entrada, mostrar error claro y permitir reintentar o continuar manualmente.
- Información insuficiente: bloquear únicamente la salida dependiente y convertir el faltante en pregunta.
- Fuente contradictoria: mostrar tensión; no elegir silenciosamente.
- Propuesta rechazada: conservar registro y permitir alternativa.
- Decisión reemplazada: advertir qué entregables pueden quedar desactualizados.
- Fuente modificada: no actualizar derivados sin revisión.
- Tiempo insuficiente: permitir cerrar una versión estable V0 o V1.
- Proyecto vacío: explicar cómo comenzar sin mostrar dashboards ficticios llenos.

DIRECCIÓN VISUAL
- Producto profesional, sobrio, claro y contemporáneo.
- Priorizar legibilidad, jerarquía y densidad controlada.
- Evitar estética de landing promocional y dashboards sin función.
- Diferenciar fuente, evidencia, supuesto, pregunta, propuesta y decisión sin depender sólo del color.
- Mostrar trazabilidad sin saturar.
- Preparar una propuesta propia y no copiar literalmente otros productos.

RESPONSIVE Y ACCESIBILIDAD PREVENTIVA
Diseñar escritorio de 1440 px y un contexto estrecho aproximado de 390 px. No depender de hover; mantener foco visible, labels persistentes, contraste suficiente y controles con nombre claro. Considerar textos largos, ausencia de datos, carga, error y contenido reemplazado.

ALCANCE DEL RESULTADO
Generá una propuesta de arquitectura y wireframes low/mid fidelity suficientemente detallada para evaluar el recorrido, no una identidad visual final. Si la herramienta genera código, crear sólo un prototipo frontend con datos demo locales, sin APIs, claves, autenticación, base de datos, tracking, emails ni servicios pagos. No presentar simulaciones como funcionalidad real.

No agregues funcionalidades para impresionar. Priorizá coherencia, trazabilidad, revisión humana y un recorrido entendible.
```

La versión canónica completa permanece en la página Notion “TP Final Integrador — AI Product Discovery Copilot”. Este registro conserva los bloques que gobernaron las variantes y omite enumeraciones de detalle que no cambiaron la ejecución.

## 2. Contador de pendientes

**Intervención exacta de Iván:**

> “Lo único, dice ‘3 pendientes’, no sé si debería decir 4, ya que hasta que no elija una acción con este seguiría pendiente.”

**Decisión humana:** la tarjeta actual continúa pendiente hasta que recibe una acción resolutiva.  
**Corrección comprobada:** el contador pasó a derivarse del estado real de todas las propuestas pendientes.

## 3. Reapertura de una decisión

**Intervención exacta de Iván:**

> “Al aceptar y marcarse como resuelto, ¿debería poder volver y editar ese problema supuesto?”

**Decisión humana:** una aceptación no debía convertirse en un estado irreversible.  
**Corrección comprobada:** se incorporó reapertura; el historial conserva la aceptación anterior y el entregable retira el bloque reabierto.

## 4. Navegación de regreso

**Intervención exacta de Iván:**

> “El botón de volver debe ser arriba.”

**Decisión humana:** la recuperación de navegación debía ser visible en la zona superior.  
**Resultado:** la navegación consolidada mantiene una salida clara desde las vistas internas.

## 5. Recorte y extensión condicionada

**Intervención exacta de Iván:**

> “Opción B sí, con posible extensión, pero tené en cuenta que si hay más tiempo seguimos abarcando más con respecto al tema leads y demás.”

**Decisión humana:** asegurar primero la maqueta navegable y conservar leads como extensión futura.  
**Efecto:** se implementó el recorrido central y se pospusieron CRM, portal de clientes, automatizaciones e integraciones.

## Límites

- Estos ejemplos no equivalen a una transcripción de toda la conversación.
- El prompt maestro produjo exploraciones; Iván seleccionó y corrigió la dirección.
- Las pruebas descritas fueron internas, no estudios con usuarios.
- Los modelos exactos de Figma Make, UXPilot y Abacus.AI no fueron visibles para Iván.
