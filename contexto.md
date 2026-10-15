# Contexto vigente

## Fecha de corte

15 de octubre de 2026.

## Estado publicado — Lote 2 UX, 15/10/2026

Versión funcional publicada: `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, commit `fix: improve project navigation and focus recovery`, con exactamente los 16 archivos autorizados. Push normal y fast-forward de main desde `06045764f397a330d980f3e9e71fb827d629b962`, sin cambios concurrentes. Main, origin/main local y main remoto se comprobaron en 3835117. GitHub Actions 38755371460 completed/success; despliegue Vercel Production 7095993122 success y asociado al mismo SHA.

Ambos alias públicos sirvieron HTTP 200 y los mismos assets del build probado: index-DVPkSybh.js e index-TIaxFCsK.css, con SHA-256 idénticos. Retest público independiente por alojamiento: F01/F11/F12, borradores, reintentos sin duplicación, F08 mínimo, F09, recuperación y conflicto con datos ficticios aislados. En cada sitio: 36 casos con nombres largos a 320/390/901/1024/1025/1280 px sin superposición/desbordamiento, foco/contorno/scroll del Sidebar conservados. Recuperación, conflicto y fallo de escritura se distinguieron como instrumentación; no se generó IA ni se accedió al registro económico. Sin errores/advertencias de consola ni intentos ajenos al origen en los recorridos monitorizados. No hubo lector de pantalla ni declaración de accesibilidad integral.

El registro detallado, estados, enlaces, hashes y límites están en docs/verification-2026-10-07.md, sección "Publicación y retest público del Lote 2". El cierre documental posterior concilia AGENTS.md, README.md, app/README.md, contexto.md y el registro canónico, sin representar otra versión funcional ni aportar nuevas pruebas. Su commit local está autorizado; su push requiere autorización separada. El siguiente incremento funcional está pendiente de definición y autorización de Iván. IA pública permanece deshabilitada.

## Antecedente publicado — Lote 1 UX

El Lote 1 fue implementado desde `c4efe0a` en `fix/workflow-integrity`, versionado en `e2befd6a9d1e7046a5af73d7b80d6427e05aa841`, integrado por fast-forward y publicado mediante push normal. Main y origin/main quedaron en `e2befd6` al publicar el lote; su rama se conserva. GitHub Pages y Vercel sirvieron los mismos assets verificados. El cierre exclusivamente documental posterior no constituye una nueva versión funcional.

Se corrigieron F02 (borradores por proyecto/propuesta durante la sesión, aviso antes de salir), F03 (candidato único por intento de creación/reintento), F09 (destino exacto Sources → Work, con recuperación explícita si no existe) y F08 mínimo (rechazo de solicitud sólo en blanco, conservando literalmente una solicitud válida). No cambia `v0.3`: los borradores no se guardan ni exportan; recargar/cerrar los pierde y el navegador puede advertir. Ante escritura fallida, el candidato sigue en memoria/exportable y el reintento usa su identidad original.

F02, F03, F09 y F08 mínimo pasaron en ambos alojamientos, por separado de las pruebas locales. Cobertura, enlaces, assets y límites en [`docs/verification-2026-10-07.md`](docs/verification-2026-10-07.md). Sin llamadas de IA, credenciales ni acceso al registro económico. No se implementaron otros hallazgos de la auditoría ni cambios generales de navegación, copy o visuales.

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

## Estado del cierre y próximo gate

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
