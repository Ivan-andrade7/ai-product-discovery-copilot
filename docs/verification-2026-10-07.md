# Registro de verificación interna

Este archivo es la autoridad detallada de verificación. Conserva la verificación histórica del 7 de octubre y los retests posteriores del candidato todavía no publicado. Un resultado histórico no demuestra por sí solo el comportamiento del árbol local vigente.

## Revisión vigente de la adaptación local — 10 de octubre de 2026

### Publicación autorizada posteriormente

Iván autorizó publicar después de revisar el resultado local. Commit de implementación: `d758512658138cbe86b6e59c9fef1bb42975deb8`; push a main completado junto con los commits pendientes `7ffb151` y `dd59478`. Retest previo al push: build PASS; 63 pruebas aprobadas y una opcional omitida. Lint volvió a fallar antes del análisis por un archivo faltante de Zod (`json-schema.cjs`), sin cambios de código para eludirlo.

Ambos sitios públicos respondieron HTTP 200 y cargaron `index-CwYs6X6k.css` e `index-D3Mgy49q.js`, iguales al build local. Fondo calculado #10191C y acción #93DEC9. Se recorrieron Projects y Work con datos ficticios en navegador aislado. URLs: `https://ivan-andrade7.github.io/ai-product-discovery-copilot/` y `https://ai-product-discovery-copilot.vercel.app/`. El registro local siguiente conserva la detención anterior para revisión como antecedente, ya superada por esta autorización. No se publicó el servicio auxiliar ni se habilitaron generaciones, credenciales, Metering o cambios económicos.

Al comenzar esta revisión ya existían cambios locales en ambos CSS, el registro visual siguiente y tres capturas. Se conservaron y se completó la adaptación consultando directamente las dos autoridades compartidas de Portfolio, sin copiarlas ni modificarlas. Este retest describe el árbol vigente; los PASS de lint del registro anterior no acreditan el entorno actual.

Correspondencia verificada: `--color-surface` es el fondo de página y cabecera; `--color-panel` corresponde al panel lateral; `--color-surface-elevated` a tarjetas, revisión, documentos y campos; `--color-subtle` a fondos suaves de marca. Navegación activa usa marca suave y conserva `aria-current`; selección conserva `aria-pressed` y la barra lateral de énfasis. Se corrigió el texto heredado de los botones de Sources. Los bordes de separación siguen en #3C5352; campos y botones secundarios usan el terciario #A7B9B4 como borde funcional (6,26:1 contra su superficie), porque el separador no alcanza 3:1. Éxito y error mantienen sus pares semánticos y sus rótulos textuales.

Se unificó `:focus-visible` para botones, campos, checkbox, summary y enlaces: #B9EEDF, 3 px y offset 3 px. Se eliminó la regla con `--color-primary` y fallback violeta. Los controles deshabilitados conservan su atributo funcional y muestran texto terciario sobre panel, sin atenuación del texto ni hover de acción. Checkbox usa el acento de marca. Se conservaron tipografía, geometría, contenido, responsive, navegación y lógica; sólo se editaron los dos CSS y este registro.

Verificación ejecutada en Chrome local con contextos de navegador aislados y datos ficticios:

- Projects, New Project, Overview, Work, Sources, Decisions, Deliverables y AI Activity: comprobación de ancho de página a 320, 390 y 1280 px, sin desbordamiento. La navegación móvil conserva su scroll horizontal interno previsto.
- Decisions y Deliverables con contenido aceptado, y Work en edición: los tres anchos sin desbordamiento. Aceptar, rechazar, reabrir y mantener pendiente se ejercitaron sobre el demo ficticio.
- Los 18 mensajes de `analysisMessages` se representaron usando el componente Work existente y props simuladas, sin invocar análisis, proveedor ni servicio económico. Cada mensaje se comprobó a los tres anchos. Son simulaciones de presentación, no ejecuciones de IA ni de sus controles económicos.
- Recuperación por JSON incompatible, lectura fallida, guardado fallido y conflicto entre pestañas: avisos reales del frontend provocados con almacenamiento aislado o eventos ficticios; los tres anchos sin desbordamiento. `validation-error` comparte el estilo crítico, pero su disparador funcional no se ejercitó en este retest.
- Tab en Work recorrió navegación, cola y acciones con foco menta visible; Enter activó Mantener pendiente, Space cambió el checkbox y Enter abrió un detalle. Los deshabilitados quedaron fuera de la secuencia. Inspección acotada, sin lector de pantalla.
- Contraste sRGB: texto principal/superficie elevada 11,34:1; secundario/elevada 8,11:1; placeholder y borde funcional/elevada 6,26:1; secundario/fondo suave 7,25:1; texto oscuro/acción 11,49:1; foco/elevada 10,00:1 y foco/fondo suave 8,93:1; deshabilitado/panel 7,50:1; éxito 9,94:1; error 8,27:1; texto del aviso crítico 13,82:1. Foco separado por offset sobre el entorno oscuro de los botones de acción. Se revisaron reglas de enlaces y selección; no hay enlaces visibles en el recorrido actual para probarlos por teclado.
- Build final: PASS. Lint: **PENDIENTE / BLOQUEADO POR ENTORNO**, dos intentos terminaron antes de analizar código con `UNKNOWN: unknown error, read` al cargar `zod/v4/locales/index.cjs:52` (dependencias locales sincronizadas). El arranque había requerido restaurar enlaces locales faltantes y dos metadatos CommonJS dentro de `node_modules`; no se descargaron paquetes ni se cambiaron manifiesto, lockfile o versiones. La instalación offline por sí sola no había reparado los enlaces.
- Tráfico externo bloqueado en navegador; cero solicitudes externas observadas. No se inició el servicio auxiliar, no se habilitaron generaciones ni se modificaron credenciales, Metering, presupuesto o registro económico.

Evidencia nueva en `evidencia/paleta-local-2026-10-10/`: Projects 1280, Work 1280 y 390, Work personal ficticio, recuperación requerida 1280 y aviso de presupuesto simulado 1280; JSON de contrastes, teclado, avisos y comprobaciones con contenido. Se inspeccionaron visualmente Projects, Work desktop/móvil y recuperación. La etiqueta Proyecto activo usa marca suave y acento (7,39:1), reservando el verde semántico para las decisiones aceptadas. Vista previa local en `http://127.0.0.1:5173/`, pendiente de revisión visual de Iván. No hubo staging, commit, push, publicación ni cambios en Figma/Notion.

Pendientes: resolver la lectura de dependencias para repetir lint, revisión visual humana, zoom, lector de pantalla, otros motores y auditoría integral de accesibilidad. Los resultados no declaran conformidad integral. Las verificaciones previas se conservan abajo como antecedentes, no como sustituto de este retest.

## Registro visual anterior conservado — 10 de octubre de 2026

Se aplicó la paleta oscura vigente definida por `../Portfolio/SISTEMA-VISUAL-MARCA.md` y `../Portfolio/SISTEMA-VISUAL-TOKENS.json`, sin copiar ni modificar esas autoridades. El cambio se limitó a tokens y reglas de color: fondo petróleo, panel estructural, superficies elevadas, textos, acento, hover, fondo suave, bordes, placeholders, foco y la sombra turquesa escrita directamente. Se conservaron estructura, tipografía, tamaños, contenido y comportamiento.

Comprobaciones realizadas:

- contraste calculado sobre pares planos reales: texto principal/página 15,76:1; secundario/página 11,27:1; terciario/página 8,70:1; secundario/superficie elevada 8,11:1; terciario/superficie elevada 6,26:1; acción/página 11,49:1; texto oscuro/acción 11,49:1; foco/superficie elevada 10,00:1;
- éxito y error conservaron sus colores semánticos: 9,94:1 y 8,27:1 respectivamente;
- recorrido aislado de navegador: 21/21 PASS, 90 comprobaciones de layout, anchos 320, 360, 390, 430 y 1280 px, siete respuestas simuladas, cero solicitudes externas y cero errores o advertencias de consola;
- navegación por teclado y foco visible: PASS en el recorrido acotado existente;
- comando estándar: 63 pruebas aprobadas y una opcional omitida; lint y build: PASS.

Un primer intento del recorrido quedó invalidado porque el servicio auxiliar local no estaba iniciado y registró `ERR_CONNECTION_REFUSED`. Se repitió con el servicio limitado a `127.0.0.1`, sin credenciales y con salida externa deshabilitada; sólo este segundo resultado se considera válido.

Capturas locales con datos ficticios, no producción:

- `evidencia/screenshots/14-projects-marca-local.png` — Projects, 1280 px;
- `evidencia/screenshots/15-work-marca-mobile-local.png` — Work, 390 px;
- `evidencia/screenshots/16-recuperacion-marca-local.png` — aviso crítico de recuperación, 1280 px.

La verificación combina inspección visual, cálculo de contraste, navegador controlado y comprobaciones automatizadas. No incluye lector de pantalla, zoom, otros motores de navegador, todos los estados perceptuales posibles ni una auditoría integral de accesibilidad.

## Resumen vigente — 10 de octubre de 2026

- Comando estándar: **63 pruebas aprobadas y una prueba opcional omitida**. La omisión corresponde a una ruta que requiere habilitación explícita y no representa una llamada real ejecutada.
- Recorrido separado de navegador: **21/21 comprobaciones funcionales** y **90 comprobaciones de layout**, con transporte simulado y salida externa bloqueada.
- Estas cifras pertenecen a capas diferentes y no se suman como si fueran pruebas equivalentes.
- Generaciones reales: deshabilitadas. Corpus: cuatro casos preparados, ninguno ejecutado.
- Contador económico real: 1/5 solicitudes por la consulta de catálogo. Su consumo es desconocido y pendiente de reconciliación; el presupuesto de 140 créditos sigue condicionado a conversión oficial y cálculo conservador.
- Persistencia local vigente: `v0.3`. Las menciones a `v0.2` en secciones posteriores describen el estado histórico de esos lotes, no el esquema actual.
- El candidato local incluye transmisión de solicitud, separación de fuentes no confiables y bloqueo de resultados obsoletos. No prueba calidad de modelo, resistencia real a prompt injection ni costo máximo.

## Transmisión local de la solicitud — 9 de octubre de 2026

Se corrigió el recorrido preparado para IA sin habilitar generaciones ni usar credenciales. La causa era que la solicitud original formaba parte de la huella de contexto, pero no del objeto enviado por el adaptador al proveedor.

El contrato local ahora incluye `userRequest`, comprueba que coincida con la solicitud contenida en la versión del contexto y cuenta sus caracteres junto con las fuentes seleccionadas. El adaptador prepara tres mensajes separados: instrucciones del sistema, solicitud del usuario y fuentes seleccionadas. Las fuentes están declaradas como contenido no confiable; esta separación no demuestra que un modelo real resista instrucciones adversariales.

Verificación focalizada con transporte simulado y bloqueo de salida externa:

- solicitud presente en su mensaje de usuario: PASS;
- fuentes no seleccionadas ausentes: PASS;
- solicitud y fuentes separadas de las instrucciones del sistema: PASS;
- instrucción adversarial ficticia conservada únicamente dentro del mensaje de fuentes: PASS de preparación, no de resistencia del modelo;
- cambio de solicitud o contenido seleccionado antes de incorporar la respuesta: resultado `stale`, sin propuestas incorporadas;
- máximo de diez fuentes y límites de entrada activos;
- bloqueos por costo, reconciliación, presupuesto de 140 créditos y cinco solicitudes conservados;
- admisión económica limitada a tamaños numéricos; solicitud y contenido de fuentes ausentes del registro duradero;
- ejecuciones v0.3 anteriores sin `userRequest` normalizadas desde su huella existente, sin escribir al leer ni perder el historial;
- 43 pruebas focalizadas aprobadas; cero intentos de red externa observados por los bloqueos de prueba.

El recorrido aislado de navegador se repitió con Vite y el servicio local cerrado a consumo iniciados en `127.0.0.1`. Verificó desde el formulario que `userRequest`, las fuentes seleccionadas y la huella del contexto llegaran juntos al endpoint local; el proveedor permaneció interceptado. Resultado final válido: 21/21 pruebas, 90 comprobaciones de layout, siete respuestas simuladas, cero solicitudes externas y cero errores o advertencias de consola. Una ejecución previa del mismo recorrido quedó invalidada porque el servicio local no estaba iniciado y produjo `ERR_CONNECTION_REFUSED`; no constituye un fallo del producto ni evidencia de proveedor.

Las generaciones continúan deshabilitadas. El contador real permanece en 1/5 y el consumo de catálogo sigue pendiente de reconciliación. Estas comprobaciones no ejecutaron el corpus, no evaluaron un modelo real y no acreditan calidad, resistencia a prompt injection ni un costo máximo en créditos.

## Corrección responsive local — 8 de octubre de 2026

Esta sección es el estado vigente del árbol local para el hallazgo responsive. No reemplaza ni borra los resultados anteriores: distingue el PASS histórico, el fallo observado después de publicar el commit `cd1f8b71211604cddd7ccc2cccb4c78bb957866a` y el retest de la corrección todavía no versionada ni publicada.

### Secuencia de evidencia

1. **PASS local anterior, de alcance insuficiente.** El lote multiproyecto se inspeccionó en un contexto estrecho de 666 × 668 px. La captura histórica a 390 × 844 px correspondía a una versión anterior. La inspección fue visual y no registró la relación entre `documentElement.scrollWidth` y el ancho del viewport.
2. **Fallo público observado.** Después de publicar el commit autorizado, GitHub Pages y Vercel mostraron desbordamiento horizontal alrededor de 390 px. La medición posterior confirmó que el documento llegaba aproximadamente a 577 px en un viewport útil de 375 px.
3. **Reproducción local focalizada.** Antes de corregir, la automatización aislada reprodujo anchos de documento de 579–580 px entre 320 y 430 px en las vistas internas. La navegación horizontal medía aproximadamente 540 px y, por el mínimo intrínseco de la columna grid, ensanchaba la sidebar, el contenido principal y la página completa.
4. **Corrección local.** La columna responsive pasó a `minmax(0, 1fr)`; la sidebar puede contraerse con `min-width: 0`; la navegación queda limitada al ancho disponible y conserva su desplazamiento horizontal interno; los textos potencialmente largos pueden cortar cadenas sin recortar contenido. No se aplicó `overflow-x: hidden` global.

### Retest responsive del árbol local corregido

| Ancho | Projects | Nuevo proyecto y textos largos | Overview | Work | Sources | Decisions | Deliverables | AI Activity | Avisos de conflicto, recuperación y guardado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 320 px | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 360 px | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 390 px | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 430 px | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 1280 px | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

En cada caso, el ancho medido del documento fue igual al viewport. Los campos de una sola línea conservan su desplazamiento de texto interno propio y la navegación del proyecto conserva desplazamiento horizontal dentro de `.project-nav`; ninguno amplió la página.

### Interacción y acceso comprobados

- Las seis opciones de navegación se recorrieron con Tab a 390 px; el navegador desplazó el contenedor para mantener cada control enfocado dentro del área visible. El foco generado por teclado conservó contorno sólido de 3 px.
- A 390 px se aceptó una propuesta ficticia y se abrió la entrada creada en Decisions: una decisión registrada y ancho del documento conservado en 390 px.
- La prueba automatizada recorrió todas las vistas principales, formulario con nombre, objetivo y URL ficticios extensos, y representaciones de los tres avisos de almacenamiento.
- Esta cobertura combina navegador real controlado y mediciones del DOM. No incluye lector de pantalla, zoom, orientación, todos los motores de navegador ni una auditoría integral de accesibilidad.
- GitHub Pages y Vercel continúan mostrando el commit publicado anterior hasta que exista una autorización separada de versionado y publicación.

## Retest histórico del candidato `v0.2` — corrección verificada

El retest se ejecutó sobre el árbol local exacto previo a versionar, con datos ficticios y sin instalar dependencias. Los dos fallos del lote correctivo quedaron resueltos en los escenarios definidos; el candidato queda listo para decidir su versionado, no su publicación.

### Fallos corregidos

1. **Migración inválida desde `v0.1`.** Causa confirmada: `parseLegacy` sólo comprobaba la forma superior y la salida de `migrateLegacyWorkspace` no se validaba antes de persistir. Corrección: la lectura heredada clasifica JSON inválido e incompatibilidad, valida el workspace convertido completo y entra en recuperación sin escribir si falla; `persistWorkspace` aplica además una última validación al candidato final. La clave `v0.1` queda intacta y un `v0.2` existente no se sobrescribe.
2. **Singular/plural visible.** Los textos de pendientes y decisiones ahora dependen del contador. Se comprobaron cero, uno y varios en Work y Projects.

### Pruebas reales en navegador

- Creación, apertura, recarga y persistencia independiente de varios proyectos: PASS.
- Fuente aportada como “Aportada · sin revisar” y propuestas demo sin vínculo falso: PASS.
- Aceptar, editar y aceptar, rechazar, mantener pendiente y reabrir: PASS.
- Contadores, decisiones, entregable y actividad actualizados a partir del estado: PASS funcional, con el defecto gramatical indicado.
- Doble clic y repetición de Enter: una acción sobre el elemento revisado; la propuesta siguiente no se resolvió: PASS.
- Dos pestañas con cambio casi simultáneo: una guardó y la otra quedó bloqueada hasta cargar el estado externo: PASS para el escenario observado.
- Exportación desde la interfaz: la descarga se activó sin error visible. La recuperación del contenido se comprobó por simulación programática, no mediante importación gráfica.
- Contexto amplio 1536 × 695 y estrecho 666 × 668, incluidos nombres, objetivos y URLs ficticios extensos: sin pérdida ni superposición observada en las vistas inspeccionadas.
- Teclado: orden del formulario y acciones principales mediante Enter, PASS en el recorrido acotado. El foco visible calculado fue un contorno de 2.4 px con separación de 1.6 px.
- Etiquetas y estados: roles, nombres accesibles y mensajes visibles estuvieron presentes en los controles recorridos. No se usó lector de pantalla ni se declara conformidad WCAG.
- Consola: el registro de la pestaña del retest no mostró errores ni advertencias. La comprobación se limita a esa sesión y no constituye una afirmación global.

### Simulación aislada de almacenamiento

- `v0.1` válido preservado literalmente: PASS.
- Migración válida guardada una vez y sin duplicación: PASS.
- Respaldo exportado y recuperado programáticamente: PASS.
- Escritura obsoleta bloqueada: PASS.
- Excepción de guardado reportada: PASS.
- `v0.2` incompatible preservado: PASS.
- `v0.1` con propuesta malformada, JSON inválido o estructura incompleta: PASS; modo de recuperación, original idéntico y ausencia de `v0.2`.
- Repetición de inicialización, incluido el segundo intento equivalente al modo de desarrollo: PASS; no duplicó ni sobrescribió el estado.
- Candidato inválido enviado directamente a persistencia: PASS; `validation-error` y ninguna escritura.

### Resultados focalizados por caso

| Caso | Interfaz observada | Contenido almacenado |
| --- | --- | --- |
| `v0.1` válido | Aviso de migración completada y exportación disponible | `v0.1` idéntico; `v0.2` válido con revisión 1 |
| `v0.1` con propuesta malformada | Recuperación requerida, Exportar respaldo y Rescatar original | `v0.1` idéntico; no se creó `v0.2` |
| JSON inválido en `v0.1` | Mensaje específico de JSON inválido y rescate disponible | Raw idéntico; no se creó `v0.2` |
| Estructura `v0.1` incompleta | Mensaje de formato incompatible y rescate disponible | Original idéntico; no se creó `v0.2` |
| `v0.2` válido ya existente | Inicio normal, sin aviso de migración | `v0.2` idéntico; un `v0.1` presente no lo reemplazó |
| `v0.2` incompatible | Recuperación requerida, exportación y rescate | Raw `v0.2` idéntico; no fue eliminado ni reemplazado |
| Fallo simulado de escritura | “No se pudo guardar”; cambios en memoria exportables | El proyecto nuevo no apareció en `localStorage`; el respaldo descargado sí contenía la copia ficticia en memoria |
| Inicialización repetida | Tras la primera escritura, el inicio siguiente cargó `v0.2` existente | Segundo intento bloqueado como conflicto; claves sin cambios ni duplicados |

El archivo de rescate descargado para el `v0.2` inválido contenía exactamente el raw original. Estas descargas ficticias se eliminaron tras verificarlas. La recuperación de un respaldo sigue siendo programática: no existe importación por interfaz.

### Comprobación estática

- La ruta de migración carece de validación final previa a persistir.
- Las cadenas `pendientes` y `decisiones` están fijadas en plural en las vistas afectadas.
- El workflow `.github/workflows/deploy-pages.yml` se activa con un push a `main` y despliega GitHub Pages. Un push a esa rama también sería una publicación y requiere autorización expresa.
- No se repitió ninguna prueba contra la URL pública: GitHub Pages conserva deliberadamente la versión anterior.

## Lote multiproyecto `v0.2` — verificación previa conservada

### Navegador local con datos ficticios

- Creación de un segundo proyecto sin reemplazar el anterior: PASS.
- Lista derivada del estado real y apertura de la tarjeta correcta: PASS.
- Estado independiente entre dos proyectos: PASS.
- Nombre del proyecto activo en la sidebar: PASS.
- Fuente ingresada visible como “Aportada · sin revisar”: PASS.
- Propuestas del proyecto nuevo rotuladas como ficticias y no derivadas de la fuente aportada: PASS.
- Aceptar, editar y aceptar, rechazar, mantener pendiente y reabrir: PASS.
- Contadores, historial, entregable y actividad derivados del estado del proyecto: PASS.
- Doble clic sobre Aceptar: una sola propuesta resuelta, PASS.
- Activación por teclado repetida: la propuesta siguiente no fue resuelta, PASS.
- Dos pestañas con acciones casi simultáneas: una guardó; la otra mostró conflicto, bloqueó las acciones y pudo cargar la versión externa, PASS para el escenario observado.

### Comprobación estática

- El formato nuevo usa la clave `ai-product-discovery-copilot:v0.2` y valida su estructura antes de leerla.
- La migración lee `ai-product-discovery-copilot:v0.1` sin escribir ni borrar esa clave.
- Si ya existe un `v0.2`, no se repite la migración desde `v0.1`.
- Los datos `v0.2` incompatibles activan recuperación en lugar de reinicio silencioso. Esta comprobación no cubre por sí sola la validez de la salida de una migración heredada.
- Las mutaciones verifican el proyecto activo, la propuesta y su estado esperado.
- Git muestra el lote como cambios locales sin commit; no se hizo push ni deploy.

### Almacenamiento simulado en entorno aislado

- Contenido `v0.1` idéntico antes y después de migrar: PASS.
- Migración ejecutada una sola vez y sin duplicar proyectos: PASS.
- Fuente heredada marcada como “Aportada · sin revisar”: PASS.
- Respaldo exportable validado y recuperado programáticamente: PASS.
- Escritura desde una revisión obsoleta bloqueada: PASS.
- Excepción simulada al guardar devuelta como fallo de escritura: PASS.
- Contenido `v0.2` incompatible preservado sin sobrescritura: PASS.

### Herramientas de verificación ejecutadas

- Script de revisión estática: PASS.
- Script de build: PASS.
- Comprobación de formato del diff: PASS; sólo se informaron avisos de normalización futura de finales de línea.
- No se instalaron dependencias nuevas.

### Límites del resultado vigente

- La detección entre pestañas no es una transacción ni garantiza exclusión mutua completa. Persiste una ventana de carrera entre lectura y escritura ante simultaneidad extrema.
- La exportación existe y la recuperación fue comprobada programáticamente; no hay importación desde la interfaz.
- El fallo de guardado se probó con almacenamiento simulado, no agotando el almacenamiento real del navegador.
- En el retest final sí se repitieron responsive y teclado de forma acotada. La captura completa de consola, las tecnologías de asistencia y la URL pública no se repitieron.
- No hay backend, autenticación, IA real ni sincronización remota.
- GitHub Pages conserva la versión publicada anterior. Vercel sigue preparado y preferido, pero no contiene este lote.

## Verificación histórica — 7 de octubre de 2026

## Objeto y cobertura

Build local de la maqueta HTML navegable del AI Product Discovery Copilot. Cobertura: recorrido base, sincronización de estados, reflow móvil y una inspección técnica acotada de accesibilidad.

## Resultados observados

- Projects → New Project → Overview: creación local y preservación literal de la solicitud, PASS.
- Work: aceptar, editar y aceptar, rechazar, mantener pendiente y reabrir, PASS.
- Overview: contadores derivados del estado vigente, PASS.
- Decisions: una entrada por acción y conservación del historial al reabrir, PASS.
- Deliverables: inclusión sólo de aceptadas y retiro al reabrir, PASS.
- Sources: clasificación visible y vínculos con propuestas, PASS.
- AI Activity: datos demo y acciones humanas identificados sin afirmar llamadas a un modelo, PASS.
- Consola del navegador: sin errores ni advertencias en el recorrido probado.
- ESLint y build de Vite: PASS.
- Persistencia local: una propuesta aceptada, su entrada de historial y el bloque derivado permanecieron después de recargar y reabrir el proyecto, PASS.
- Revisión de contenido posterior a persistencia: se reemplazaron referencias obsoletas a “sin persistencia” y “sesión actual”, PASS.
- GitHub Pages: primer intento fallido por fuente no habilitada; configuración cambiada a GitHub Actions y repetición completada, PASS.
- Demo pública: carga de la pantalla Projects y recursos estáticos en la URL definitiva, PASS.

## Responsive y accesibilidad

- Inspección visual a 390 × 844 px: contenido en una columna, acciones apiladas y navegación disponible.
- Navegación activa expuesta con `aria-current`.
- Selecciones de cola, fuentes e historial expuestas con `aria-pressed`.
- Foco visible unificado para botones, campos y áreas de texto.
- Altura mínima de navegación elevada a 44 px.

## Límites

- Inspección interna, no prueba con usuarios.
- Sin lector de pantalla, checker automatizado ni matriz completa de WCAG.
- Persistencia limitada a `localStorage`: no sincroniza dispositivos, no ofrece cuentas y puede borrarse junto con los datos del navegador.
- Sin backend, autenticación, IA real ni servicios externos. El despliegue histórico fue únicamente estático.
- El despliegue es únicamente estático; no agrega backend, autenticación, IA real ni servicios de datos.
- Datos y propuestas ficticios, identificados como demo.

## Próximo hito

Resolver la conversión oficial de créditos, reconciliar la consulta de catálogo y calcular conservadoramente el lote frente al presupuesto condicionado de 140 créditos. Sólo después corresponde autorizar y ejecutar la prueba real de IA. Versionar o publicar el candidato local requiere una autorización separada; la cobertura accesible completa y las tecnologías de asistencia siguen pendientes.
