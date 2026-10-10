# Contexto vigente

## Fecha de corte

10 de octubre de 2026.

## Estado observado

- El tema y el problema del TP están definidos de manera provisional.
- La consigna fue contrastada con el PDF original local de cinco páginas.
- La fecha del 8 de noviembre de 2026 a las 23:59 aparece en esa copia; debe reconfirmarse si existe un aviso docente posterior.
- Existe un archivo Figma con wireframes consolidados y recorrido navegable.
- Se realizaron ensayos técnicos internos con Iván; no constituyen validación con usuarios.
- No hay research primario acreditado.
- El repositorio público está disponible en `https://github.com/Ivan-andrade7/ai-product-discovery-copilot`.
- La demo estática está publicada y verificada en `https://ivan-andrade7.github.io/ai-product-discovery-copilot/`.
- Los commits publicados usan el correo anónimo `Ivan-andrade7@users.noreply.github.com`.
- La base React + Vite fue inicializada dentro de `app/`; lint y build pasaron correctamente.
- El recorrido funcional base está completo: Projects → New Project → Overview → Work → Sources / Decisions / Deliverables / AI Activity.
- La creación conserva literalmente la solicitud original y guarda el estado localmente en el navegador.
- Work permite revisar propuestas simuladas con fuente, evidencia y razonamiento visibles.
- Aceptar, editar, rechazar y reabrir actualizan el estado; mantener pendiente conserva el elemento en la cola.
- Decisions registra cada acción una sola vez, conserva entradas previas y compara propuesta original con versión resultante.
- El historial usa una secuencia local explícita y no inventa fechas.
- Deliverables incluye sólo propuestas aceptadas o editadas y aceptadas; reabrir retira el bloque automáticamente.
- Sources diferencia entradas originales, interpretaciones, referencias metodológicas y requisitos académicos.
- AI Activity muestra hechos comprobables y no registra llamadas externas que no ocurrieron.
- Todas las secciones del recorrido base están habilitadas.
- El estado local vigente admite múltiples proyectos reales: crear uno no reemplaza los anteriores y cada proyecto conserva fuentes, propuestas, decisiones y entregables por separado.
- El almacenamiento local vigente usa el formato `v0.3`. Las claves predecesoras se conservan y las migraciones se validan antes de persistir.
- Las fuentes ingresadas por la persona se muestran como “Aportada · sin revisar”. Las propuestas preparadas para un proyecto nuevo se identifican como ficticias y no se atribuyen a esas fuentes.
- La interfaz bloquea escrituras desde una pestaña desactualizada, permite cargar el estado externo y ofrece exportación de respaldo. Esta protección no elimina por completo la carrera posible entre escrituras estrictamente simultáneas.
- Los datos incompatibles no se reinician silenciosamente. Se preservan para rescate; ante un fallo de guardado, la copia en memoria permanece exportable.
- La salida convertida desde formatos anteriores se valida antes de persistirse. Propuestas malformadas, JSON inválido y estructuras incompletas activan recuperación sin reemplazar el original.
- Los rótulos de pendientes y decisiones flexionan correctamente cero, uno y varios en los escenarios comprobados.
- La recuperación de un respaldo fue comprobada programáticamente. Todavía no existe una acción de importación desde la interfaz.
- Iván autorizó publicar la adaptación local el 10/10/2026. El commit de implementación `d758512658138cbe86b6e59c9fef1bb42975deb8` fue enviado a main junto con los dos commits anteriores pendientes, incluyendo preparación de IA con generaciones deshabilitadas.
- GitHub Pages y `https://ai-product-discovery-copilot.vercel.app/` respondieron HTTP 200 y cargaron los mismos assets JS/CSS del build local con la paleta vigente. Se verificaron Projects y Work con datos ficticios. Build PASS; 63 pruebas aprobadas y una opcional omitida; lint pendiente por archivos faltantes de Zod en las dependencias locales.
- Los proyectos nuevos empiezan sin propuestas; el contenido simulado permanece en un proyecto demo separado.
- El contrato incluye la solicitud vigente y sólo las fuentes seleccionadas. El adaptador separa instrucciones del sistema, solicitud y fuentes tratadas como contenido no confiable.
- Un cambio de solicitud o de una fuente seleccionada vuelve obsoleto el resultado en curso e impide incorporarlo silenciosamente.
- El transporte reemplazable y el registro económico duradero están preparados, pero las generaciones siguen deshabilitadas.
- El corpus de evaluación conserva cuatro casos ficticios no ejecutados. `inference` no existe como categoría estructurada del contrato vigente.
- No están implementados login, aislamiento multiusuario, adjuntos PDF/imágenes, persistencia remota, leads, portal ni monetización operativa.

## Decisión vigente

Por decisión explícita de Iván, la IA integrada real es obligatoria para la versión que quiere entregar y utilizar. La compatibilidad académica con Nivel 2 no sustituye este requisito del producto ni permite atribuirlo a la consigna docente.

Continuidad comprobada el 10/10/2026: main recibió el commit de implementación `d758512`, y se comprobó la paleta publicada en ambos alojamientos. Los detalles y límites del retest están en `docs/verification-2026-10-07.md`. La publicación estática no habilita IA real ni cambia el gate económico.

Si existe tiempo adicional, la expansión seguirá este orden:

1. IA real y recorrido completo (obligatorio);
2. recuperación/importación, persistencia y acceso adecuados al uso;
3. captación y gestión inicial de leads;
4. portal de clientes e integraciones justificadas;
5. monetización sólo con oferta y controles definidos.

Las capacidades adicionales dependen de tiempo, pruebas y decisiones explícitas. Costos y publicación requieren autorizaciones independientes.

## Alcance base

La versión objetivo conservará solicitud original y fuentes autorizadas por proyecto; realizará análisis real y generará propuestas contextualizadas. El contrato vigente distingue evidencia, hipótesis y pregunta; la inferencia puede expresarse semánticamente, pero todavía no posee una categoría estructurada propia. La revisión humana conserva aceptar, editar, rechazar, pendiente y reabrir, con entregable trazable.

Los proyectos nuevos empezarán vacíos o pendientes de análisis. La simulación permanecerá exclusivamente en un proyecto demo separado. Una URL no equivale a contenido consultado; las referencias deberán apuntar a contenido realmente disponible. Los errores conservarán entradas y permitirán reintento o trabajo manual, nunca contenido demo automático. Cada operación registrará modelo, fuentes y versión del contexto; un resultado obsoleto no se aplicará silenciosamente.

Se reutilizará la base `v0.3` sin perder estados anteriores; claves fuera del frontend/repositorio, endpoint protegido y límites de gasto antes de exposición pública. El transporte y esos controles están preparados localmente, pero no hubo generación real.

## Criterio de cierre

- recorrido HTML completo y navegable;
- recorrido real de IA comprobado con fuentes autorizadas, referencias válidas, recuperación y revisión humana;
- estados críticos representados y sin callejones sin salida;
- solicitud, propuesta, decisión y versión distinguibles;
- README claro;
- evolución verificable en Git;
- herramientas y modelos identificados;
- capturas suficientes para el informe;
- simulaciones y limitaciones declaradas;
- material suficiente para redactar honestamente metodología, resultados y análisis AIBPS.

## Próximo gate

Resolver la conversión oficial de créditos, reconciliar el consumo desconocido de la consulta de catálogo y calcular conservadoramente el lote completo frente al presupuesto condicionado de 140 créditos. El contador real permanece en 1/5 solicitudes. Sólo después corresponde una autorización separada para ejecutar la prueba real de IA. Un push a `main` puede actualizar ambos alojamientos y requiere autorización de publicación independiente.

## Verificación técnica histórica

- Base React + Vite según el manifiesto del proyecto. Las versiones exactas de esta sección histórica no se vuelven a afirmar sin una verificación específica del entorno instalado.
- Revisión estática: ESLint, PASS el 7 de octubre de 2026.
- Build de producción: Vite, PASS el 7 de octubre de 2026.
- Prueba manual en navegador: PASS para crear proyecto, preservar solicitud, volver a Projects y reabrir el demo.
- Flujo Work: PASS para aceptar, editar y aceptar, mantener pendiente, avanzar la cola y reabrir una decisión.
- Sincronización con Overview: PASS para pendientes, decisiones resueltas y estado del entregable.
- Historial Decisions: PASS para una entrada por acción, conservación de acciones anteriores y reapertura trazable.
- Deliverables: PASS para inclusión de aceptadas y retiro automático al reabrir.
- Sources: PASS para inventario, clasificación y vínculos con propuestas demo.
- AI Activity: PASS para carga local y acciones humanas sin afirmar ejecución de IA.
- Responsive 390 × 844 px: PASS de inspección visual para reflow y acceso a controles.
- Accesibilidad inspeccionada: navegación semántica, `aria-current`, selección mediante `aria-pressed`, foco visible y objetivos mínimos de 44 px. No constituye conformidad integral.
- Consola del navegador: sin errores ni advertencias durante la prueba.
- Persistencia local: implementada mediante `localStorage`; no transmite información fuera del navegador.
- Despliegue estático en GitHub Pages: PASS; build y deploy del workflow completados correctamente después de habilitar Pages con GitHub Actions.
- Backend, persistencia remota, IA real y servicios externos: no implementados.

## Verificación vigente del candidato local

La autoridad detallada es [`docs/verification-2026-10-07.md`](docs/verification-2026-10-07.md). El comando estándar registró 63 pruebas aprobadas y una opcional omitida. En una capa separada, el recorrido de navegador registró 21/21 comprobaciones y 90 comprobaciones de layout. No se suman porque no representan unidades equivalentes. Las respuestas simuladas no acreditan calidad del modelo, resistencia real a instrucciones engañosas ni un costo máximo.

- Navegador local con datos ficticios: PASS para crear dos proyectos, abrir cada tarjeta, conservar estados independientes, mostrar el nombre activo y representar una fuente aportada como “Aportada · sin revisar”.
- Navegador local: PASS para aceptar, editar y aceptar, rechazar, mantener pendiente, reabrir, actualizar contadores, conservar historial, derivar entregables y registrar actividad.
- Navegador local: PASS para doble clic y repetición por teclado sin resolver la propuesta siguiente.
- Dos pestañas locales: PASS observado para un cambio casi simultáneo; una pestaña guardó y la otra quedó bloqueada hasta cargar los cambios externos. Esto demuestra detección en el escenario probado, no exclusión mutua completa.
- Comprobación estática: el código valida el esquema `v0.3`, conserva las claves predecesoras y separa contenido ficticio de fuentes aportadas.
- Almacenamiento simulado y aislado: PASS para preservación de datos heredados, migración válida única, rechazo de entradas malformadas o incompatibles, bloqueo de escritura obsoleta, fallo de escritura y recuperación programática del respaldo.
- Verificación técnica ejecutada en el lote: `lint` y build, PASS. No se instalaron dependencias nuevas.
- Responsive: inspección visual local en 1536 × 695 y 666 × 668, con textos ficticios extensos, sin pérdida de contenido observada.
- Teclado y foco: recorrido manual acotado con orden de controles, foco visible y acciones mediante Enter, PASS en el escenario probado. No hubo lector de pantalla ni auditoría WCAG integral.
- Consola: no aparecieron fallos visibles durante el recorrido, pero la herramienta disponible no permitió capturar exhaustivamente el registro; la comprobación de consola queda limitada.
- La URL pública no se retesteó porque corresponde deliberadamente a la versión anterior.

## Autoridades y localizadores

- Notion TP: https://app.notion.com/p/3e3fd0da0de5810597f7c8340688197e
- Notion consigna: https://app.notion.com/p/3eafd0da0de5812fa931d85f4cf7f8b1
- Figma: https://www.figma.com/design/zX5zJeg5WeE1q4E3zDkQv2/AI-Product-Discovery-Copilot-%E2%80%94-Wireframes-consolidados
- GitHub: https://github.com/Ivan-andrade7/ai-product-discovery-copilot
- PDF original local: `C:\Users\ivana\Downloads\Trabajo Final Integrador.pdf`
