# Contexto vigente

## Fecha de corte

17 de octubre de 2026.

## Adaptación visual local y próximo gate — 17/10/2026

Rama `codex/visual-system-layout`, HEAD `2a601d1e4bcfcf6e59459b80b440b7d2d77a5d6d`, cierre documental posterior al candidato protegido `9001b12`. La referencia local origin/main permanece en `71dd149`: dos commits por delante, sin consulta nueva del remoto en este cierre. Versión pública funcional documentada `3835117`, sin publicación de esta adaptación ni reemplazo del Preview anterior.

Estado local posterior: foundations, composición, regreso y monograma conservados; navegación visible en español, nombre de proyecto sin duplicación, detalles técnicos secundarios desplegables y formulario agrupado. Ayuda global y contextual sin hover obligatorio, con teclado, cierre y retorno de foco; íconos finales de 16 px sin caja, conservando objetivos interactivos de 44 px. Sin cambios de contratos, persistencia ni habilitación de IA. Suite completa 165/165 antes del ajuste final del ícono; después, tres pruebas focalizadas de ayuda, lint y ambos builds aprobados. No se acredita suite completa repetida después de ese ajuste. Detalle único e incidentes en [el registro canónico](docs/verification-2026-10-07.md#claridad-y-ayuda-contextual--cierre-documental-17102026). Este cierre documental no ejecuta pruebas ni consulta servicios.

Correctivo posterior autorizado: Volver a proyectos se separa de la marca, se coloca encima del título y comparte la receta de botón secundario con hover, pulsación y foco. Ya era un button conectado a onHome; se corrigen presentación/ubicación sin sustituir su handler ni la protección de borradores. Nueve archivos de UI acumulados por la incorporación de TopBar.jsx; retest final posterior 162/162, lint y ambos builds aprobados. 42 comprobaciones adicionales de cabecera sin overflow/superposición, separadas de las 59 del corte anterior; detalle y capturas nuevas en el registro.

Identidad autorizada posteriormente: logo vigente de Marca personal, cuya autoridad visual remite a Portfolio, aplicado sin redibujar en cabecera y favicon público/privado. Dos SVG idénticos a la fuente; favicon con variantes por tema. Retest posterior 162/162, lint/builds aprobados y fixture privado actualizado para servir SVG sin 404; fuentes, hashes y límites en el registro.

Los conteos de nueve archivos UI/19 acumulados y las cifras 162 de los párrafos anteriores corresponden al corte previo a claridad/ayudas, no a la selección actual ampliada. Todo el candidato sigue sin staging/commit/push. Próximo gate: revisión visual de los íconos minimalistas y del diff/selección; un commit requiere autorización separada. Pendientes académicos: seleccionar evidencia y verificar PDF final. Pendientes de producto separados: IA real operativa en el recorrido objetivo, Preview exacto y continuidad/conflicto entre computadoras. IA pública deshabilitada, E1 simulado, contador conocido 3/5, halted y permisos consumidos; no se leyó el registro económico ni se autorizan generaciones nuevas. La IA operativa sigue siendo un bloqueante de la entrega objetivo del producto por decisión de Iván, no una exigencia docente adicional inferida.

Los apartados siguientes conservan cortes anteriores: sus estados de rama/HEAD, cifras y gates describen esos momentos, no reemplazan este corte vigente.

## Candidato local correctivo — 16/10/2026

Estado conciliado: `main`/HEAD `9001b1239ae69456b6872d390b340947081e5ba5`, candidato protegido versionado; `origin/main` comprobado mediante fetch en `71dd149`, un commit por detrás y sin divergencia. Producción funcional documentada `3835117`, Lotes 1/2 cerrados; `71dd149` es cierre documental, no otra versión funcional. La rama remota de prueba conserva `9001b12`, sin push a main ni promoción. El Preview anterior sigue separado del candidato. Este cierre sólo documental no aporta nuevas pruebas ni cambios de servicios.

Evidencia recibida de GuIA: primer ingreso con la identidad carp desde escritorio; segundo con `ivanandradeuxui@gmail.com` desde notebook. La segunda recuperó el mismo espacio y `Ensayo Preview E1 · identidad corregida`, solicitud, fuente, decisión, brief, dos pendientes y próxima acción; persistencia tras recarga, sin otra ejecución ni modificación. No se repitió aquí el ingreso. Continuidad y conflicto entre dos computadoras pendientes por falta del escritorio, no fallidos ni sustituidos por pestañas.

Correcciones conservadas en `9001b12`: salida protegida para Work/E1, formularios E1 de sesión fuera de persistencia/respaldo, estilos privados incluidos, recuperación de edición sólo con confirmación del mismo guardado, selección coherente de aportes y validación de procedencia frente al run. El recorrido protegido continúa con orientación simulada; no acredita IA real nueva. El fallo posterior de doble activación se diagnosticó y corrigió con autorización específica: selección implícita avanzaba al siguiente pendiente; ahora se fija el ID revisado y se rechaza el clic repetido del gesto, sin temporizador. Suite completa registrada con navegador 162/162, lint y ambos builds aprobados; incidentes conservados en el registro único. No se repiten pruebas en este cierre documental.

El Preview previo `dpl_A2wdpitMC4npEZj6anPmFxSqrDVc` permanece separado. El intento de desplegar el commit exacto, `dpl_CCtDTRaAtpbzzvYpVWKiN39cuFmM`, falló con `BUILD_UTILS_SPAWN_1`/`private-build-disabled`; faltaba `TP_BUILD_TARGET` en su configuración. No se movió el alias ni se cambió producción. La configuración privada necesaria no quedó localizada; no se reconstruye ni se activa por inferencia.

Próximo gate académico: seleccionar evidencia representativa, cerrar el relato y verificar el PDF final conforme a la consigna. Próximos gates de producto separados: resolver el Preview exacto y comprobar continuidad/conflicto entre dos computadoras, con autorización aplicable. El ensayo histórico de IA real no demuestra IA operativa en el E1 protegido. Contador conocido 3/5, halted y permisos consumidos; ninguna generación nueva autorizada.

Los apartados fechados que siguen son antecedentes del corte anterior, no el estado vigente de las dos identidades ni de este lote local.

## Antecedente: Preview corregido — ingreso inicial y segunda identidad pendiente, 15/10/2026

Corrección mínima autorizada aplicada al contrato JSON de identidad: identities[].id contiene el subject Google; user.id e identity_id son UUID distintos. API conserva comprobaciones exactas de usuario/proveedor/subject, sin fallback. Dobles oficiales saneados y regresiones: 23 pruebas focalizadas aprobadas, lint y ambos builds correctos. Intento fallido anterior conservado, no PASS.

Alias https://ai-discovery-copilot-private-test-ivan-andrade.vercel.app/private actualizado exclusivamente al Preview Ready dpl_A2wdpitMC4npEZj6anPmFxSqrDVc. Vercel Authentication y configuración sólo del despliegue conservados; sin variables compartidas, callbacks/SQL/permisos nuevos, IA real ni cambios de Production/Pages (assets/hashes públicos intactos). Respaldo previo no modificado.

Iván completó un ingreso Google real: Tus proyectos y APIs 200 confirmados. E1 ficticio nuevo completado hasta decisión/brief/próxima acción y recuperado tras recarga sin otro análisis; conflicto de copia obsoleta bloqueado sin sobrescritura. Logout y rechazo posterior de datos observados. Pendiente distinguir el correo del primer ingreso y completar segunda cuenta; no se acredita todavía ambas identidades ni dos computadoras. Controles negativos completos de cookies/CSRF/renovación/expiración e idempotencia incierta conservan evidencia local con dobles, no PASS remoto. Chrome no respondió al control; se usó navegador integrado. Detalle de contrato, pruebas, despliegue y límites en registro canónico. Sin staging/commit/push; main/HEAD71dd149, índice vacío; metodología/candidato previo preservados y Lotes 1/2 cerrados. Los cortes siguientes son antecedentes.

## Preview protegido — desplegado con bloqueo, 15/10/2026

Origen de prueba: https://ai-discovery-copilot-private-test-ivan-andrade.vercel.app/private. Preview Ready dpl_2xfeBMeAAuugvss7pL7fG3KSR4bX, Vercel Authentication conservado, variables sólo del despliegue (ninguna variable compartida de proyecto). SQL protegido aplicado en Supabase dedicado lkzgydnglkrcmztviqsf y UUID/identificadores Google fijados para ambas cuentas confirmadas de Iván. Datos e historial idénticos al respaldo privado; RPC antiguas revocadas, runner loopback anterior ya no accede a datos. Callback HTTPS exacto agregado, retorno local conservado y callback Google intacto. Cero IA real.

Primer ingreso Google real con carp regresó denegado. Defecto del candidato: API y doble buscan provider_id en el objeto JSON de identidad, donde Supabase entrega id. Reproducción aislada confirma rechazo del formato oficial. No se modificó código ni se repitió ingreso: Preview queda bloqueado, no listo. Pruebas autenticadas remotas y dos computadoras pendientes, no PASS; pruebas locales previas no las sustituyen.

Respaldo y recuperación documentados en el localizador privado lógico `AI-Discovery-Copilot/backups/pre-protected-preview-2026-10-15`, fuera de Git y OneDrive, sin secretos Auth. Restauración no ensayada; datos sólo en destino vacío y revisión de permisos antes de restaurar funciones anteriores. Detalle de recursos/configuración, hashes públicos sin cambios, pruebas y límites en docs/verification-2026-10-07.md, sección Preview protegido. Production y Pages no reemplazados. Sin staging/commit/push, sin cambios de código, metodología previa preservada y Lotes 1/2 cerrados.

Gate: autorizar corrección mínima del contrato de identidad/fixture, pruebas focalizadas y reemplazo exclusivamente Preview, luego verificaciones reales y prueba guiada desde dos computadoras. Los cortes siguientes son antecedentes anteriores a este despliegue parcial.

## Preparación HTTPS/Vercel — candidato local, 15/10/2026

Autorizada la preparación, no el despliegue ni cambios remotos. Se conservan ambas identidades de Iván (ivanandradeuxui@gmail.com e ivanandradecarp@gmail.com) y el mismo espacio personal; la API preparada exige además fijar UUID de Supabase y subject Google de cada una. Esos identificadores todavía no se consultaron para esta configuración: sin ellos el nuevo entorno no se habilita.

Entradas Vercel Node y build privado independientes del build habitual. Sesiones/PKCE/revocación/renovación e idempotencia de análisis pasan a almacenamiento duradero preparado en remote/protected-schema.sql, sin memoria compartida entre funciones. Cookies Secure/HttpOnly/Lax, CSRF ligado a sesión, expiración propia, tokens cifrados y dos secretos técnicos de alcance acotado por configurar en otro gate; no claves administrativas ni de IA. E1/v0.3/revisión e historial se reutilizan. El logout incierto no anuncia éxito y permite reintento explícito, sin revelar trabajo.

Comprobación local: 23 pruebas focalizadas de dominio/API/dobles/TLS y dos de navegador aprobadas, lint sin errores/advertencias y ambos builds correctos. TLS real local con CA ficticia confiada sólo por el cliente de prueba; no acredita cookies del navegador en Vercel. SQL nuevo revisado pero no ejecutado: no hay motor PostgreSQL local ni se autorizó aplicarlo remotamente en este tramo. Ingreso Google ajeno sigue sin probarse. Artefactos públicos idénticos al candidato anterior, privado separado; no producción modificada. Sin instalaciones, configuración externa, nuevas llamadas Auth/Supabase/IA, staging, commits, push ni deploy. Detalle, incidentes y límites en el registro canónico.

Destino propuesto: Preview exclusivo del proyecto Vercel existente, sin promoción ni cambios de alias públicos. Alias HTTPS exacto pendiente de verificar; callbacks/variables y secretos sin valores en app/README.md. El SQL revoca RPC antiguas y retiraría el acceso del runner loopback anterior al aplicarse, sin borrar datos; preparar y verificar el reemplazo forma parte del gate externo. Lotes 1 y 2 cerrados y actualización metodológica previa conservada. Detener para revisión del candidato antes de autorizar recursos/configuración y despliegue de prueba con dos computadoras.

## Conexión privada local — infraestructura autorizada, 15/10/2026

Tramo en curso posterior a la revisión E1 cerrada: Supabase dedicado ai-product-discovery-copilot (lkzgydnglkrcmztviqsf, Free) y Google Cloud AI Discovery Copilot TP (ai-discovery-copilot-tp) creados sin facturación/pruebas de pago. Iván confirmó uso académico/personal no comercial, límites Free y dos identidades Google para el mismo espacio: ivanandradeuxui@gmail.com e ivanandradecarp@gmail.com. Proyectos anteriores intactos.

API local protegida en loopback 5182, PKCE/sesión HttpOnly, datos remotos vía JWT de usuario, RLS sin acceso directo y funciones con lista autorizada/revisión/idempotencia. Proveedor exclusivamente simulado. Configuración técnica fuera de OneDrive/Git, sin clave administrativa ni clave de IA. Google habilitado, email/anónimo deshabilitados, hook de altas restrictivo y callbacks locales exactos. Sin lectura/migración de proyectos personales.

Google real y Supabase comprobados desde dos sesiones independientes (Chrome e in-app browser) en esta computadora: proyecto ficticio, selección de fuente, aporte humano, orientación simulada, revisión/decisión, brief, pendientes, próxima acción y cierre E1 recuperados tras recarga. Ambas identidades autorizadas recuperaron el mismo espacio. Conflicto real bloqueado sin sobrescritura; logout rechaza lectura posterior y conserva la otra sesión; sesiones usadas cerradas al finalizar. No se acredita todavía continuidad entre dos computadoras. Rechazo de identidad ajena verificado con dobles y eventos SQL ficticios, sin iniciar sesión con una cuenta ajena.

La prueba real detectó y corrigió comparación sensible al orden de campos JSONB: comparación estructural sin alterar instantáneas y conservando rechazo de contenido obsoleto. Cierre humano explícito de intentos simulados interrumpidos/inciertos conserva solicitud/historial, sin reenvío ni propuestas; no resuelve intentos reales. Resultados, incidentes y límites en docs/verification-2026-10-07.md. El servidor de desarrollo no está listo para publicarse; HTTPS y sesiones aptas para Vercel requieren preparación y otro gate. Sin staging/commit/push/despliegue, cero IA real. Lotes 1 y 2 cerrados; bloque metodológico previo conservado.

## E1 integrado en el proyecto — correcciones locales, 15/10/2026

Implementación local autorizada: E1 usa el mismo App, Projects, New Project, Overview, Work, Sources, Decisions, Deliverables, constructor de proyectos y repositorio. El workspace paralelo se retiró; el wrapper sólo simula identidad y usa claves de prueba prefijadas, sin leer/migrar/borrar proyectos personales ni el sandbox anterior. Extensión explícita opcional stageWork.E1.version=1 dentro de v0.3; propuestas/referencias/ejecuciones/decisiones canónicas, con procedencia simulation separada de modelo e históricos. Lectura de fixtures v0.3 previos sin escritura; no se promete lectura de E1 nuevo por binarios antiguos.

Corregidos: identidad de creación estable ante confirmación perdida, reenvío exacto sin duplicación y nueva identidad para otra intención; aportes humanos pertinentes en humanContext, separados de instrucciones/fuentes, con procedencia declarativa y filtro de proyecto/fuentes seleccionadas. Revisión e historial se comparten, brief y próxima acción se recuperan sin generaciones al abrir/continuar.

Verificación final: lint cero errores/advertencias y build correcto; 14 pruebas E1 aprobadas (13 de dominio y una de navegador), 60 regresiones afectadas aprobadas y una opcional histórica omitida, ejecutadas por grupos sin sumar repeticiones. Panel E1 y Deliverables a 320/390/1280 sin desbordamiento; exclusión de wrapper/dobles en producción y rutas directas comprobada. Iteraciones y límites reales en el registro canónico. Sin lector de pantalla ni accesibilidad integral; fallos históricos de separadores separados.

Sólo integración local con dobles: no Google, autorización remota, continuidad entre equipos, IA real ni controles económicos operativos. Repositorio local síncrono; API real requiere orquestación asíncrona y transacciones/autorización de servidor. Pendientes: confirmar plan/rol/uso elegible en Vercel, plan/cupo de Supabase y administración/recuperación de identidad Google antes de autorizar recursos externos. Custodia de clave, consumo y publicación son gates separados. Main/HEAD 71dd149; sin staging ni commit. Lotes 1 y 2 cerrados.

Los cortes siguientes documentan el candidato previo: sus modelos y cifras no sustituyen este estado integrado.


## Antecedente del primer tramo E1 — implementación local simulada autorizada

Dirección confirmada por Iván: espacio personal privado remoto, Google exclusivo, E1 pedido → brief revisado → próxima acción; evaluar Supabase Free sin contratar. Elegibilidad de Vercel Hobby, planes/cupos, aceptación final de pausas/recuperación y custodia de secretos todavía no comprobados/autorizados. Portal posterior; Lotes 1 y 2 cerrados.

Recorte autorizado: recorrido E1 en desarrollo local con identidad, persistencia y proveedor simulados, separados del workspace v0.3 existente y sin migraciones. Criterio de cierre: acceso autorizado/denegado representado, pedido/fuentes conservados, ausencia de envío sin fuente, síntesis/hipótesis/preguntas simuladas, revisión y aportes humanos separados, brief derivado y recuperación con adaptador de prueba. La entrada de prueba debe quedar fuera del build de producción. No demuestra Google, continuidad remota, seguridad real ni calidad de un modelo. Resultados y límites del tramo se registran en docs/verification-2026-10-07.md.

Implementado y comprobado localmente: entrada loopback de desarrollo `?e1`, contratos asíncronos y dobles sin red, fuentes explícitas, salida determinista rotulada como simulada, revisión, respuestas humanas separadas, brief/pendientes/próxima acción y recuperación desde la clave exclusiva de prueba. Objetivo/restricciones conocidos o respondidos no se vuelven a preguntar; no hay comprensión semántica real. La entrada y adaptadores no se incluyen en producción. Lint sin errores/advertencias, build correcto; E1 12 pruebas aprobadas, regresiones afectadas 34 aprobadas y una opcional histórica omitida. Sin lector de pantalla; fallos históricos de separadores conservados aparte.

Tramo local listo para revisión, sin staging/commit/publicación. Siguiente paso: confirmar elegibilidad, planes/cupos y límites de Free antes de autorizar configuración externa de Google/API/persistencia. Custodia y uso de la clave, consumo real y publicación siguen separados. Las menciones siguientes a “próximo incremento pendiente de definición/autorización” corresponden a los cortes previos: la dirección y este tramo simulado ya están autorizados; no lo están los servicios reales ni su publicación. Los prompts de método consultados por el agente no se atribuyen al historial previo del producto. La instrucción E1 de esta prueba es una integración local nueva y limitada, no E1–E18 completo.

## Estado publicado — Lote 2 UX, 15/10/2026

Versión funcional publicada: `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, commit `fix: improve project navigation and focus recovery`, con exactamente los 16 archivos autorizados. Push normal y fast-forward de main desde `06045764f397a330d980f3e9e71fb827d629b962`, sin cambios concurrentes. Main, origin/main local y main remoto se comprobaron en 3835117. GitHub Actions 38755371460 completed/success; despliegue Vercel Production 7095993122 success y asociado al mismo SHA.

Ambos alias públicos sirvieron HTTP 200 y los mismos assets del build probado: index-DVPkSybh.js e index-TIaxFCsK.css, con SHA-256 idénticos. Retest público independiente por alojamiento: F01/F11/F12, borradores, reintentos sin duplicación, F08 mínimo, F09, recuperación y conflicto con datos ficticios aislados. En cada sitio: 36 casos con nombres largos a 320/390/901/1024/1025/1280 px sin superposición/desbordamiento, foco/contorno/scroll del Sidebar conservados. Recuperación, conflicto y fallo de escritura se distinguieron como instrumentación; no se generó IA ni se accedió al registro económico. Sin errores/advertencias de consola ni intentos ajenos al origen en los recorridos monitorizados. No hubo lector de pantalla ni declaración de accesibilidad integral.

El registro detallado, estados, enlaces, hashes y límites están en docs/verification-2026-10-07.md, sección "Publicación y retest público del Lote 2". El cierre documental posterior concilia AGENTS.md, README.md, app/README.md, contexto.md y el registro canónico, sin representar otra versión funcional ni aportar nuevas pruebas. Su commit local está autorizado; su push requiere autorización separada. El siguiente incremento funcional está pendiente de definición y autorización de Iván. IA pública permanece deshabilitada.

## Referencia metodológica vigente y aplicación al TP — 15/10/2026

Iván pidió actualizar el contexto del TP porque se apoya parcialmente en su proceso UX/UI y Product Design. Este ajuste incorpora referencias e instrucciones de trabajo; no modifica la consigna, el alcance integral confirmado el 14/10, la aplicación ni su versión publicada. E1–E18 sirve como método proporcional, no como recorrido obligatorio ni lista de funcionalidades a implementar.

### Referencias canónicas y qué cambia al trabajar

- [Manual E1–E18](../UX%20UI%20y%20Product%20Design/PROCESO-END-TO-END-UX-UI-PRODUCT-DESIGN.md): aplicar el contrato de trabajo con IA, autonomía dentro del pedido autorizado y comprobaciones proporcionales. Precisar objetivo, estado, fuentes, alcance y criterio de cierre usando el registro existente; no crear fichas duplicadas. Cerrar el alcance comprobado y reabrir sólo ante un problema concreto, evidencia nueva o cambio solicitado. Esto no sustituye los permisos específicos del TP para consumo, infraestructura o publicación.
- [Guía de prompts por etapa](../UX%20UI%20y%20Product%20Design/PROMPTS-POR-ETAPA-UX-UI-PRODUCT-DESIGN.md): al ejecutar una tarea autorizada del TP, consultar y adaptar la instrucción base y el bloque pertinente a su pregunta/etapa. No exigir que Iván copie los prompts, recorrer las 18 etapas ni generar todos sus entregables. Estos prompts son una referencia disponible desde el 15/10; no se presentan como prompts ya usados históricamente en el TP.
- [Catálogo T00–T34](../UX%20UI%20y%20Product%20Design/PLANTILLAS-END-TO-END-UX-UI-PRODUCT-DESIGN.md): T01 permite aclarar quién usa, paga o financia y qué capacidad operativa sostiene el servicio, sólo cuando cambie una decisión. T12 ofrece un service blueprint opcional si hace falta conectar experiencia y operación interna. Son preguntas y métodos disponibles; no acreditan un modelo comercial, blueprint, portal o investigación ejecutados ni obligan a producirlos.
- [SOP Figma, §13](../UX%20UI%20y%20Product%20Design/SOP-FIGMA-END-TO-END-GOBERNANZA-DESIGNOPS.md#13-handoff-técnico-proporcional), E16 y T30: para un handoff autorizado, identificar consumidor —incluida implementación propia—, fuentes, reglas, criterios comprobables y pendientes. Distinguir acceso comprobado, informado o no comprobado; el acceso de diseño no demuestra el del destinatario. El ejemplo ficticio de §13.2 ayuda a convertir una anotación ambigua en comportamiento verificable. Propiedades, variables y Auto Layout no definen por sí solos el contrato en código. No exigir Dev Mode, nuevos asientos, reuniones ni otra checklist maestra.

Las fuentes se enlazan aquí, sin copiar sus prompts, plantillas o reglas completas al TP. Ante diferencias, prevalecen la consigna original para requisitos académicos y las decisiones, autorizaciones y evidencias vigentes del TP para su ejecución.

### Lo documentado realmente y lo que no se puede atribuir

El TP ya documenta la separación entre solicitud/fuentes, propuesta de IA, decisión humana y entregable trazable; conserva un demo simulado identificado, historial de decisiones y límites de pruebas. Su estado funcional y el ensayo real mínimo están registrados arriba y en [verificación canónica](docs/verification-2026-10-07.md). Esta actualización no añade pruebas, uso de prompts, handoff comprobado ni validación con usuarios.

Antecedente de desalineación: en el corte anterior, el inventario (pendiente 3) y la matriz académica (riesgo 10) aún describían el Lote 2 como no implementado. La conciliación documental del 16/10 corrige esas referencias sin borrar el historial: Lote 2 cerrado, público 3835117 y candidato protegido 9001b12 separado. Las autoridades siguen siendo el contexto y el registro canónico; no reactivar gates históricos.

El [registro académico de prompts](docs/prompt-log.md) conserva sólo intervenciones realmente utilizadas, con su procedencia y límites. No incorporar retroactivamente la guía E1–E18 como uso histórico ni completar el informe con actividades inexistentes. Para usos futuros efectivos, registrar las intervenciones representativas según ese criterio y mantener visible fuente → propuesta → decisión → entregable; aceptar una propuesta no convierte su contenido en evidencia.

Que el método inspire al producto no significa que su automatización esté implementada: integrar prompts por etapa, agregar nuevas categorías o convertir estas referencias en comportamiento del sistema son posibles propuestas futuras, no cambios ejecutados, requisitos docentes ni un nuevo lote autorizado. La automatización completa de E1–E18 sigue excluida de la base. El contrato conserva Afirmación/evidence, Hipótesis/hypothesis y Pregunta/question; no incorpora `inference`.

### Límites de esta actualización

Sólo se actualiza documentación local de contexto e instrucciones. Se conserva la versión funcional `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, el alcance integral del 14/10 y el próximo incremento pendiente de definición y autorización. No se modifica código, informe académico, matriz de cobertura, registro histórico de prompts, Notion, Figma ni producción; tampoco se crean tareas o roadmap adicionales.

La IA pública permanece deshabilitada. Se conserva el estado conocido 3/5, `halted: true` y permisos consumidos, sin consultar registros privados ni autorizar o ejecutar nuevas generaciones, consumo, costos, infraestructura, commit o push.

## Antecedente publicado — Lote 1 UX

El Lote 1 fue implementado desde `c4efe0a` en `fix/workflow-integrity`, versionado en `e2befd6a9d1e7046a5af73d7b80d6427e05aa841`, integrado por fast-forward y publicado mediante push normal. Main y origin/main quedaron en `e2befd6` al publicar el lote; su rama se conserva. GitHub Pages y Vercel sirvieron los mismos assets verificados. El cierre exclusivamente documental posterior no constituye una nueva versión funcional.

Se corrigieron F02 (borradores por proyecto/propuesta durante la sesión, aviso antes de salir), F03 (candidato único por intento de creación/reintento), F09 (destino exacto Sources → Work, con recuperación explícita si no existe) y F08 mínimo (rechazo de solicitud sólo en blanco, conservando literalmente una solicitud válida). No cambia `v0.3`: los borradores no se guardan ni exportan; recargar/cerrar los pierde y el navegador puede advertir. Ante escritura fallida, el candidato sigue en memoria/exportable y el reintento usa su identidad original.

F02, F03, F09 y F08 mínimo pasaron en ambos alojamientos, por separado de las pruebas locales. Cobertura, enlaces, assets y límites en [`docs/verification-2026-10-07.md`](docs/verification-2026-10-07.md). Sin llamadas de IA, credenciales ni acceso al registro económico. No se implementaron otros hallazgos de la auditoría ni cambios generales de navegación, copy o visuales.

## Estado de la base pública y antecedentes observados

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
- Las fuentes aportadas quedan sin revisar; proyectos nuevos vacíos y demo separado. Una ejecución real válida conserva citas hacia las fuentes seleccionadas, sin validarlas por aceptación.
- La interfaz bloquea escrituras desde una pestaña desactualizada, permite cargar el estado externo y ofrece exportación de respaldo. Esta protección no elimina por completo la carrera posible entre escrituras estrictamente simultáneas.
- Los datos incompatibles no se reinician silenciosamente. Se preservan para rescate; ante un fallo de guardado, la copia en memoria permanece exportable.
- La salida convertida desde formatos anteriores se valida antes de persistirse. Propuestas malformadas, JSON inválido y estructuras incompletas activan recuperación sin reemplazar el original.
- Los rótulos de pendientes y decisiones flexionan correctamente cero, uno y varios en los escenarios comprobados.
- La recuperación de un respaldo fue comprobada programáticamente. Todavía no existe una acción de importación desde la interfaz.
- Iván autorizó publicar la adaptación local el 10/10/2026. El commit de implementación `d758512658138cbe86b6e59c9fef1bb42975deb8` fue enviado a main junto con los dos commits anteriores pendientes, incluyendo preparación de IA con generaciones deshabilitadas.
- Antecedentes: b56d9e6, 61704e7, 73df887, hotfix 08853c5 y Lote 1 e2befd6. La versión funcional vigente es 3835117 (Lote 2), publicada por push normal y comprobada en ambos alojamientos. Ramas conservadas. Los fallos y retests anteriores permanecen como históricos. Los cambios documentales posteriores no representan otra versión funcional.
- Los proyectos nuevos empiezan sin propuestas; el contenido simulado permanece en un proyecto demo separado.
- El contrato incluye la solicitud vigente y sólo las fuentes seleccionadas. El adaptador separa instrucciones del sistema, solicitud y fuentes tratadas como contenido no confiable.
- Un cambio de solicitud o de una fuente seleccionada vuelve obsoleto el resultado en curso e impide incorporarlo silenciosamente.
- El segundo intento real completó el recorrido mínimo en un caso ficticio: HTTP 200, claude-sonnet-4-6, stop, cita e incertidumbre, aceptación de prueba por el asistente, decisión, entregable y persistencia. El primero permanece fallido. Generaciones nuevamente deshabilitadas.
- Contador 3/5, ambos permisos consumidos y halted: true. Tokens no disponibles; saldo 13.897 → 13.889 y 21,3 créditos API diarios son agregados sin atribución individual.
- Nuevas respuestas exigen type Afirmación/evidence, Hipótesis/hypothesis o Pregunta/question. La respuesta histórica con string permanece intacta, sin normalización.
- El corpus de evaluación conserva cuatro casos ficticios no ejecutados. `inference` no existe como categoría estructurada del contrato vigente.
- No están implementados login, aislamiento multiusuario, adjuntos PDF/imágenes, persistencia remota, leads, portal ni monetización operativa.

## Decisión vigente

### Alcance integral confirmado por Iván — 14 de octubre de 2026

El TP final se concibe como una plataforma integral para Iván y sus clientes. El alcance conceptual puede reunir, por fases, el brief, discovery asistido por IA, portal de cliente, hitos, cambios de alcance, aprobaciones, entregables y trazabilidad. Estos elementos no deben convertirse en productos o Projects separados: la implementación real de cada módulo sigue dependiendo de tiempo, fuentes, pruebas y autorización explícita. Esta decisión de alcance no demuestra que todos los módulos estén implementados.

Las nuevas ideas de portfolio deben excluir cualquier producto que replique un portal de clientes, brief, gestor de cambios, flujo de aprobaciones o sistema de trabajo para proyectos web.

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

Se conserva la base v0.3 y los estados históricos. El único caso real mínimo exitoso no valida calidad general ni seguridad integral; las generaciones siguen bloqueadas. La exposición pública de IA requiere otro alcance y autorización.

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

## Antecedente: cierre y gate del Lote 2, 15/10/2026

### Lote 2 — orientación y accesibilidad básica

Alcance: F01 (regreso explícito desde un proyecto al listado de Projects), F11 (idioma correcto del documento y título identificable) y F12 (orientación predecible del foco al cambiar de pantalla).

Antecedente anterior a versionar: implementación local por Abacus y revisión de Codex el 15/10/2026 desde 06045764, inicialmente con 14 archivos modificados. Los elementos no seguidos fuera de alcance permanecieron sin leer/modificar. Las correcciones, pruebas y documentación completaron los 16 archivos del commit 3835117, posteriormente autorizado y publicado.

Estado actualizado tras autorización de Iván: **Lote 2 publicado y verificado**, commit 3835117. Las tres correcciones de cabecera, navegación lateral y carga externa están verificadas. Se cerró la advertencia del efecto de recuperación de Work, perteneciente a F12: se comprueba selected?.id en lugar del objeto selected, manteniendo la dependencia y el permiso de foco de un solo uso. No se modificó selección/F09 ni se desactivaron reglas. Los retests locales y públicos distinguen sus fixtures y límites. No se modificaron IA, backend, persistencia ni pruebas de separadores.

Resultados finales del cierre de lint: **lint PASS, cero errores y cero advertencias; build PASS; suite con navegador habilitado: 114 aprobadas, cero fallidas y una omitida**. La omitida sigue siendo el opt-in histórico UI_TESTS de storage.test.mjs; no equivale a una prueba fallida. Los dos fallos de separadores reproducidos en base/candidato se conservan como antecedente separado; no se repitieron ni alteraron esas pruebas. Sin instalaciones adicionales ni cambios de manifiesto, lockfile o configuración.

Reparación acotada autorizada: README y lockfile confirman pnpm como gestor canónico. El intento pnpm install con lockfile congelado no restauró el faltante; se descargó sólo zod@4.6.5, se verificó SHA-512 contra el lock y se restituyó íntegro en su directorio ya instalado. Manifiesto, lockfile, versiones y configuración permanecen idénticos. Sin limpieza global ni borrado de carpetas del proyecto.

Los retests locales anteriores se conservan en "Cierre de la advertencia de lint del Lote 2"; el smoke público posterior está separado en "Publicación y retest público del Lote 2". Sin lector de pantalla ni auditoría integral. El gate de commit/push funcional del Lote 2 fue autorizado y completado. El cierre documental abarca los cinco archivos autorizados, con commit exclusivamente local y push sujeto a otra autorización. El siguiente incremento funcional está pendiente de definición y autorización de Iván. No hubo nuevas generaciones ni acceso al registro económico privado.

El responsive y foco están publicados y cerrados en la cobertura probada; no volver a pedir su versionado como gate vigente. La plataforma pública sigue siendo estática, con IA pública deshabilitada. Antes de exponer IA a Iván o clientes debe definirse un incremento protegido con autenticación, backend, secretos, persistencia y controles de uso/costo; todavía no está implementado ni autorizado. El único recorrido real mínimo no demuestra calidad general. Contador conocido 3/5, halted: true y permisos consumidos, sin autorización para nuevas generaciones; sin acceso ni modificación del registro económico durante este cierre. Conversión oficial, reconciliación y presupuesto condicionado de 140 créditos siguen pendientes para futuras pruebas. Todo incremento funcional, llamada de IA, infraestructura o publicación futura requiere alcance y autorización propios.

Antecedente: el retest de cabecera encontró después un desbordamiento distinto de Work a 901 px. El lote adicional lo corrigió mediante apilado hasta 1024 px; los 72 casos focalizados pasaron. Ambos fallos y sus retests se conservan en el registro; no son bloqueantes vigentes. No se extrapola a todos los entornos ni a accesibilidad integral.

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

## Verificación vigente y antecedentes locales

La autoridad detallada es [`docs/verification-2026-10-07.md`](docs/verification-2026-10-07.md). Distingue pruebas locales simuladas, navegador/layout y un caso real mínimo exitoso; las cifras históricas no se suman ni sustituyen el retest vigente. No acreditan calidad general, resistencia adversarial ni costo máximo.

La comprobación pública vigente corresponde a `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, Lote 2, y pasó en ambos alojamientos con Edge headless y datos ficticios aislados: F01/F11/F12, regresiones acotadas de borradores, reintentos, F08 mínimo y F09, y pruebas focalizadas de layout/foco. El registro separa acciones directas, instrumentación ficticia e intentos inválidos del arnés; sus resultados no se suman a la suite local. Los smokes de Lote 1 e2befd6 y 08853c5 se conservan como antecedentes; el de 08853c5 cubrió ocho vistas, creación/apertura, persistencia, 112 mediciones de layout y 96 de foco por alojamiento. Los puntos siguientes resumen lotes anteriores; no acreditan otros motores, lector de pantalla o accesibilidad integral.

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
- Antecedente: el retest local anterior no reconsultó los sitios; el primer smoke de 73df887 se detuvo por Sources a 901 px. Después, el smoke público completo de 08853c5 pasó en ambos alojamientos; evidencia separada en el registro canónico.

## Autoridades y localizadores

- Notion TP: https://app.notion.com/p/3e3fd0da0de5810597f7c8340688197e
- Notion consigna: https://app.notion.com/p/3eafd0da0de5812fa931d85f4cf7f8b1
- Figma: https://www.figma.com/design/zX5zJeg5WeE1q4E3zDkQv2/AI-Product-Discovery-Copilot-%E2%80%94-Wireframes-consolidados
- GitHub: https://github.com/Ivan-andrade7/ai-product-discovery-copilot
- PDF original local: `C:\Users\ivana\Downloads\Trabajo Final Integrador.pdf`
