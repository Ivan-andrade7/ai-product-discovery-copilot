# Registro de verificación interna

## Corrección de activación repetida — retest final local, 16/10/2026

Autorización posterior específica al fallo del apartado siguiente. Mismo candidato sobre main/HEAD `71dd149`; cambios previos preservados. Sin IA real, credenciales, registro económico, servicios/cuentas/datos remotos, staging, commit ni publicación. El Preview previo no contiene este hotfix local.

**Causa demostrada:** la instrumentación del caso original registró dos acciones accepted con IDs de propuestas diferentes (:0 y :1), no dos escrituras de la misma propuesta. Work usaba selección implícita cuando no existía una selección explícita después del análisis. `resolveReviewSelection()` elegía la primera pendiente; al aceptar la primera, el siguiente render elegía la segunda y el segundo clic activaba su botón. El lock se reiniciaba al cambiar ID/estado. La validación por ID/estado del dominio no podía impedir una acción válida sobre ese segundo ID: el defecto estaba en la identidad del elemento revisado en UI, no en una duplicación demostrada del recibo de persistencia.

**Corrección mínima:** Work fija el ID revisado mediante el contrato de selección antes de resolver/reabrir. El segundo clic del mismo gesto (detail > 1) se detiene en captura, también en el panel resuelto, sin demora arbitraria. Se conservan lock reentrante, bloqueo de teclas repetidas y validación vigente ID/estado antes de mutar. No se cambia persistencia, esquema, contrato de IA, paleta ni otros recorridos. Seleccionar intencionalmente otra propuesta y reabrir con una acción nueva siguen disponibles.

**Pruebas:** storage.test conserva la aserción original y registra sólo IDs/acciones ficticios para distinguir propuestas; workflow-browser agrega doble clic, clic repetido dirigido al nuevo control, Enter sostenido/repetido, reapertura intencional y selección/aceptación posterior de otra propuesta; private-browser usa doble clic para aceptar y guardar una edición en persistencia asíncrona con confirmación perdida y reintento exacto. No se debilitan las expectativas de una decisión por acción.

Incidente de arnés separado: tras corregir el producto, storage-browser alcanzó su comprobación final de consola y falló por ERR_CONNECTION_REFUSED. `requestfailed` identificó GET http://127.0.0.1:4010/session: el caso inicial de servicio no disponible dependía de un puerto sin servicio y exigía luego cero errores. Se sustituyó esa dependencia por respuesta explícita ficticia available=false/externalEnabled=false/code=disconnected, antes de la respuesta habilitada posterior del mismo test. No se ocultan errores de consola ni se inicia el servicio privado. Es una prueba de servicio desconectado mediante doble, no una nueva prueba de ausencia física de backend.

Retest focal storage: **21/21**, incluido navegador, doble clic = una aceptación del primer ID, segundo ID pendiente; 90 mediciones de layout, siete respuestas ficticias de análisis, cero solicitudes externas y cero errores de consola. Después: lint sin errores/advertencias, build público y privado PASS, suite completa con UI_TESTS/WORKFLOW_UI_TESTS/PRIVATE_UI_TESTS y PRIVATE_BUILD_TESTS habilitados: **162/162 aprobadas, cero fallos, cero omisiones**. Conteo de Node incluye subcasos de identidad; no sumar la pasada focal ni mediciones como pruebas nuevas. Los antiguos fallos/omisiones se conservan en sus cortes históricos.

Build público index-BSt-z53Y.js y privado protected-x18hTSPH.js; CSS index/protected-Bv8MFx6H.css. QA privado usa dist-private y API interceptada, no login real. Diez mediciones privadas E1/Work en 320/390/901/1024/1280 sin desbordamiento. Workflow: 60 mediciones en 320/390/901/1024/1025/1280, 36 comprobaciones de foco, cero intentos externos y cero errores de consola; almacenamiento: 90 mediciones en 320/360/390/430/1280. No se suman como casos funcionales equivalentes. La consola privada conserva los cuatro errores provocados esperados de abortos/503/403 ya documentados, sin pageerror ni otros avisos detectados.

**Dictamen vigente:** bloqueo de doble activación resuelto en la cobertura local ejecutada; candidato preparado para revisión final de selección y posible commit local con autorización separada, no para publicar/promover por inferencia. Continuidad/conflicto entre dos computadoras y correspondencia exacta con el Preview siguen pendientes; no bloquean conservar un checkpoint local debidamente rotulado. Sin lector de pantalla ni conformidad/seguridad integral. Registro económico real no leído: estado conocido 3/5/halted y permisos consumidos preservado como antecedente; ninguna generación autorizada nueva.

Archivos de este tramo: WorkScreen.jsx, storage.test.mjs, workflow-browser.test.mjs, private-browser.test.mjs y los cuatro documentos ya afectados (AGENTS, app/README, contexto, este registro). El universo candidato queda en 19 archivos seguidos modificados y 34 nuevos de app, 53 en total; índice vacío. Fuera: contexto-Ivan.md, .abacusai/, credenciales/configuración runtime, registros privados, respaldos, builds, dependencias y temporales. Correos fijos y rutas históricas documentales conservan la advertencia de privacidad del corte anterior.

## Lote correctivo local E1 — 16/10/2026

Base main/HEAD y referencia local origin/main `71dd149e29f8488c6cf02bc6654dbe18b364e775`, índice vacío; 17 modificaciones seguidas y 34 archivos nuevos de app existentes preservados. Sin fetch, staging, commit, despliegue ni modificación de servicios/datos remotos. No se leyeron contexto-Ivan.md, .abacusai/, configuración runtime, credenciales, respaldos ni registro económico. Producción documentada `3835117` y Preview corregido anterior no fueron modificados ni equiparados al build local.

### Correcciones y contrato comprobado

- App/PrivateWorkspace: cierre de sesión pasa por la advertencia de borradores antes de desactivar el entorno. Continuar conserva texto; descartar es explícito. Los formularios E1 son borradores de sesión por proyecto, fuera del workspace/decisiones/respaldo. Vacío y próxima acción idéntica no advierten; texto real o borrado de una acción confirmada sí. Navegación, salida y beforeunload los consideran. No se agrega persistencia durable.
- E1Panel importa sus estilos; etiquetas explícitas estables para los tres textarea. El build privado recibe las reglas E1 sin depender del wrapper de desarrollo; no se modifica CSS, paleta ni estructura general.
- Guardado incierto: cliente conserva la operación mientras la confirmación no corresponda exactamente al candidato/revisión/writer esperados, comparando contenido estructurado sin depender del orden JSONB. La edición sólo limpia su mismo borrador cuando propuesta y decisión confirmadas coinciden; no elimina un borrador posterior. Recuperar una edición no redirige como si fuera una creación ya completada.
- Brief y análisis usan los mismos aportes humanos pertinentes: selección de fuentes para aportes acotados; generales conservados. Regresiones seleccionar/deseleccionar/reseleccionar y aporte general.
- Persistencia comprueba `model` con run abacus y `simulation` con run simulation completos. Datos incompatibles se rechazan, no se normalizan/reclasifican ni descartan. Compatibilidad histórica de demo/unknown, tipos históricos y v0.3 anterior comprobada con fixtures, no con datos personales.

### Pruebas y resultado real

Focalizadas iniciales: 44 aprobadas con permisos locales adecuados. El primer intento de sandbox produjo dos fallos de infraestructura (EACCES en loopback y OpenSSL), no PASS; repetición satisfactoria. Cuatro regresiones puras nuevas en e1.test y una de confirmación remota en private-remote.test.

Retest final sobre código corregido: lint sin errores/advertencias; build público y privado correctos, sin instalar dependencias. Público index-RNkMVUdS.js, privado protected-Xera_7Is.js; CSS de ambos Bv8MFx6H. Suite completa con las cuatro opciones de navegador habilitadas: **162 pruebas, 161 aprobadas, 1 fallida, 0 omitidas** (incluye subcasos de identidad; no sumar repeticiones ni mediciones). La ejecución estándar anterior había omitido cuatro recorridos de navegador; no sustituye este resultado ampliado.

PASS de navegador: E1 integrado, workflow y build privado. Privado servido desde dist-private mediante interceptación completa de recursos y API ficticia en origen HTTPS de prueba, sin DNS/servidor remoto ni credenciales; no acredita cookies/Google/PostgreSQL reales. Prueba de crear/reintentar, fuentes/aportes/próxima acción, advertencias/cancelación/logout explícito, edición con confirmación perdida y resolución sin borrador residual, conflicto entre contextos, persistencia y recuperación sin nuevo análisis. Una orientación determinista ficticia, cero solicitudes externas y cero pageerror. Teclado Tab/Enter y foco visible en campos/controles afectados. Consola privada conserva cuatro errores esperados del arnés: dos acknowledgements abortados, 503 de logout y 403 posterior a logout; no se declaran cero errores de consola. Sin otras advertencias/errores detectados en ese recorrido.

Mediciones privadas reales (documentElement.scrollWidth/clientWidth): E1 formulario con URL/cadena larga y Work editando, en 320/390/901/1024/1280: igualdad viewport/documento en los diez casos. Workflow separado: 60 mediciones en 320/390/901/1024/1025/1280, sin desbordamiento, 36 comprobaciones de foco, una advertencia beforeunload, cero intentos externos y cero errores de consola en su recorrido. No son 70 pruebas funcionales equivalentes ni una auditoría integral de responsive/accesibilidad.

**Fallo abierto y dictamen bloqueado para aprobación final:** tests/storage.test.mjs:273, después de doble activación de Aceptar en el recorrido local público con proveedor interceptado, hay dos decisiones en vez de una. Repetición aislada: 20 aprobadas y el mismo caso de navegador fallido (2 !== 1). No se modificó ese test ni se flexibilizó su expectativa. No atribuirlo todavía a regresión de este lote, fallo histórico o arnés: la causa y las acciones concretas requieren diagnóstico. El resto de ese recorrido, posterior a la aserción, no se ejecutó. No se reetiqueta como omisión opcional ni como el fallo histórico de separadores. Corrección fuera de los seis hallazgos no implementada por inferencia.

Incidentes de iteración preservados: el primer navegador no encontró el textarea tras restaurar formulario; etiquetas explícitas estabilizaron su nombre accesible. Luego el reintento de edición redirigió a Overview por una creación previa ya completada; se corrigió la condición y los retests privados pasaron. No representan pérdida de respuesta real ni llamadas de proveedor.

### Evidencia externa recibida y límites

GuIA informó el 16/10: primer acceso carp desde escritorio y segundo `ivanandradeuxui@gmail.com` desde notebook, mismo espacio y proyecto Ensayo Preview E1 · identidad corregida; solicitud, fuente, decisión, brief, dos pendientes y próxima acción recuperados, persistencia tras recarga y ninguna nueva ejecución/cambio. No se repitió aquí. Continuidad/conflicto entre dos computadoras pendiente por falta del escritorio, no fallida ni reemplazada por pestañas. El Preview anterior no contiene este lote local; correspondencia exacta requiere manifiesto saneado, no basta el commit base de un despliegue con código sin versionar.

Registro económico no leído ni modificado: se conserva el estado conocido 3/5, halted y permisos consumidos como antecedente, no nueva lectura del saldo. Cero IA real. Búsqueda de firmas sensibles limitada a la selección candidata y builds locales; correos de la lista fija y rutas históricas documentales se informan para revisión, no equivalen a claves. No demuestra seguridad integral, recuperación remota ensayada, accesibilidad integral ni soporte entre equipos.

Próximo gate: diagnóstico/corrección autorizada de doble activación y retest del caso abierto antes de aprobar el candidato para commit local. Sin staging ni publicación; conservar los antecedentes siguientes como históricos.

## Corrección mínima de identidad — Preview reemplazado, 15/10/2026

Autorización específica posterior al intento fallido: corregir contrato de identidad y dobles, pruebas focalizadas y reemplazo exclusivo del Preview. Verificado main/HEAD 71dd149e29f8488c6cf02bc6654dbe18b364e775, índice vacío y mismo conjunto de cambios previos; metodología y archivos ajenos preservados. Sólo se editan código server/protected/api.mjs, tests/serverless-private.test.mjs y documentación pertinente en este tramo. Sin SQL, callback, permisos, datos ni respaldo privado modificados.

Contrato comprobado en fuente oficial de Supabase Auth: https://raw.githubusercontent.com/supabase/auth/master/internal/models/identity.go. /auth/v1/user devuelve user.id (UUID de usuario), identities[].identity_id (UUID interno de identidad) e identities[].id (identificador externo de Google, almacenado como provider_id en SQL). El campo JSON user_id relaciona identidad y usuario; no es el subject Google. No se utilizan nombres visibles/dominio ni campos alternativos como autorización.

Corrección de una comparación: permitted usa identities[].id===googleSubject, conservando proveedor Google, user.id exacto, cuenta configurada y correo confirmado. Sin fallback provider_id/identity_data.sub ni aceptación de cualquier sesión. Dobles actualizados al formato oficial con valores ficticios. Regresiones: dos identidades fijadas válidas; rechazo de usuario Supabase ajeno, subject ajeno, proveedor de usuario/identidad incorrecto, ID ausente/numérico/vacío/nulo, campo SQL como falso fallback, UUID de identidad como falso subject, identities ausentes/inválidas y confirmación ausente. No tokens reales ni contenido personal en fixtures.

Resultados locales: node --test tests/serverless-private.test.mjs, 23 pruebas aprobadas (incluye subcasos, cero fallos/omisiones); contratos HTTPS/CSRF/logout/renovación/CAS/idempotencia/E1 con dobles y TLS aislado. Lint cero errores/advertencias; build público y privado correctos. No se repitieron auditorías ni suites completas. Estas pruebas no acreditan login ajeno ni sesiones del Preview.

Preview nuevo Ready: dpl_A2wdpitMC4npEZj6anPmFxSqrDVc, https://ai-product-discovery-copilot-17esy7i2r-ivan-andrade.vercel.app. Alias existente actualizado: https://ai-discovery-copilot-private-test-ivan-andrade.vercel.app/private. Copia curada comprobada contra el candidato anterior: único cambio subido en app/server/protected/api.mjs; sin dependencias ni archivos privados adicionales. Vercel Authentication conservado; variables limitadas a este despliegue, vercel env ls sigue sin variables compartidas de proyecto. Sin ampliación de callbacks ni permisos, sin push/promoción, proveedor real no agregado ni clave IA.

Comprobación externa sin sesión a API/workspace: redirección a protección Vercel, sin acceso a datos; no confundir con status de autorización interna de la app. No se creó bypass. Build privado local y salida de logs examinada sin secretos técnicos conocidos/códigos OAuth visibles; no inspección exhaustiva de bytes remotos ni de todos los logs. Assets privados del build sin cambios: protected-DBMtES1B.js y protected-TIaxFCsK.css.

Production dpl_2MTJtJhTvi2zmgpLVC4ckrCR3fep sigue Ready. Production y Pages devolvieron 200 y conservaron referencias/hashes index-DVPkSybh.js e index-TIaxFCsK.css del corte anterior; sin smoke funcional completo. Sin IA real ni análisis en este corte.

Comprobación real del Preview corregido: Iván realizó directamente un ingreso Google y comunicó Tus proyectos; confirmado en UI y logs session/workspace 200. Correo de esa primera cuenta pendiente de informar para distinguir los dos ingresos. Se creó sólo Ensayo Preview E1 · identidad corregida: pedido y una fuente ficticios conservados, selección explícita, aporte humano separado, una orientación simulada solicitada, tres propuestas rotuladas, aceptación de una, una decisión y brief derivado con dos pendientes, próxima acción y cierre E1. Recarga y reapertura recuperaron el mismo contenido; no se incorporó otra propuesta. Una segunda pestaña (misma sesión, no otro equipo) intentó guardar próxima acción obsoleta y quedó bloqueada por conflicto. Recarga de la copia confirmada conservó la próxima acción original: sin sobrescritura. Logs examinados hasta ese punto: un POST analysis 200, sin otro análisis al abrir/recuperar.

Logout ejecutado desde UI; anunció Sesión cerrada. Petición posterior a /api/workspace desde la otra pestaña devolvió permission; logs confirmaron POST logout 200 y lectura posterior workspace 403. El total observado siguió en un POST analysis 200 después de recuperar y cerrar. Se pidió a Iván ingreso directo con la otra cuenta y correos usados en orden. No se considera probada aún la segunda identidad ni dos sesiones independientes por usar dos pestañas de la misma sesión. Cookies/CSRF/renovación/expiración, revocación frente a reutilización de cookie antigua e idempotencia exacta con confirmación incierta siguen acreditadas sólo por dobles/TLS local, no por prueba remota negativa completa; no se extrajeron cookies/tokens ni creó bypass. No se probó Google ajeno. Producción y Pages intactos; cero IA real. Sin lector de pantalla ni conformidad integral; omisión opcional y separadores históricos separados.

Pasos posteriores entre equipos: A ingresa en el alias y guarda proyecto/fuente ficticios, revisión E1 y próxima acción; B ingresa con la otra identidad y verifica el mismo proyecto/decisión/brief; editar desde copia obsoleta debe bloquear sin sobrescribir; logout A rechaza sus operaciones sin cerrar B. No realizar ni acreditar antes de completar ingreso real y pruebas focalizadas. No requiere nueva autorización de alcance para estas verificaciones ya autorizadas, sí intervención directa de Iván para login.

Los cortes siguientes conservan el antecedente previo a esta corrección.


## Preview protegido — despliegue parcial bloqueado, 15/10/2026

**Dictamen: desplegado, pero no aprobado ni utilizable por fallo de identidad; detener antes de modificar código.** Autorización limitada a Preview con IA simulada. Main/HEAD 71dd149e29f8488c6cf02bc6654dbe18b364e775, índice vacío y cambios previos preservados. Sin staging, commit, push ni promoción.

### Recursos y configuración aplicados

- Supabase dedicado ai-product-discovery-copilot, lkzgydnglkrcmztviqsf, Free, Ivan-andrade7’s Org; no se tocaron proyectos pausados. Consultados y fijados UUID y subject Google exactos de ivanandradeuxui@gmail.com e ivanandradecarp@gmail.com, ambas confirmadas de Iván y del mismo espacio. No autorización por dominio/correo solamente.
- Revisado y aplicado app/remote/protected-schema.sql: seis tablas con RLS, sin lectura directa autenticada de workspace, funciones de datos protegidas, configuración administrativa inaccesible y RPC antiguas revocadas para authenticated. Transporte limitado de sesiones exige secreto backend dedicado; no service_role. Se verificó configuración de dos identidades. No eliminación de datos: workspace y diez recibos de comandos idénticos al respaldo, dos proyectos ficticios y una decisión conservados. Runner loopback anterior queda sin acceso por la revocación aceptada; no se reactivó.
- Vercel existente prj_TuJDUl2i18jwFUFDr3cad1x8Wsyt, equipo ivan-andrade, Hobby. CLI oficial 64.3.1 obtenida mediante npm exec en caché local fuera del repositorio; sin dependencias/manifiestos/lockfile del proyecto modificados. Autenticación CLI normal, sin leer su archivo de credenciales.
- Subida curada desde AppData/Local/AI-Discovery-Copilot/deploy-source-preview-20261015: 48 archivos de app, sin Git, archivos privados excluidos, configuración local, respaldos ni proveedor real. Manifest de huellas privado fuera de OneDrive. Configuración vercel.private.json seleccionada como vercel.json sólo en esa copia de despliegue, nunca en el repositorio.
- Checkpoint sin configuración runtime: dpl_9zW9GySe5VgesZpMmtZj2wBpbk5b, Ready, Preview; interfaz sin conexión ni datos. No se acredita un status API específico para ese checkpoint.
- Candidato configurado: dpl_2xfeBMeAAuugvss7pL7fG3KSR4bX, Ready, Preview, sin Production URL. URL inmutable https://ai-product-discovery-copilot-4kf2zumm4-ivan-andrade.vercel.app; alias exacto https://ai-discovery-copilot-private-test-ivan-andrade.vercel.app/private. Vercel Authentication retenido, sin bypass: un equipo nuevo requiere también acceso Vercel de Iván antes del login Google del producto.
- Variables de sesión/Supabase/identidades limitadas a ese despliegue por entorno del proceso CLI, sin valores en argumentos. vercel env ls comprobó ausencia de variables compartidas de proyecto: otros previews no las heredan. TP_BUILD_TARGET y TP_DEPLOYMENT_TARGET protected-test, VERCEL_ENV preview, TP_ORIGIN igual al alias exacto. Dos secretos técnicos aleatorios distintos fuera de Git/OneDrive y sólo hash de store en SQL. No clave administrativa ni de IA.
- Supabase Site URL: https://ai-discovery-copilot-private-test-ivan-andrade.vercel.app/private. Retornos exactamente http://127.0.0.1:5182/api/auth/callback y https://ai-discovery-copilot-private-test-ivan-andrade.vercel.app/api/auth/callback. Sin comodines. Callback Google conservado: https://lkzgydnglkrcmztviqsf.supabase.co/auth/v1/callback. OAuth sigue en pruebas; no publicación Google ni cambios de scopes.

### Respaldo y recuperación

Copia lógica previa con ACL restringida al usuario Windows, localizador privado lógico `AI-Discovery-Copilot/backups/pre-protected-preview-2026-10-15`, fuera de OneDrive y Git. data-and-structure.json (SHA256 406c26a6eea6e5b8c66cb31c6c5bfb3dd86f4eb216f283dd1225751ec0e60eb3), structure-before.sql, functions-before.sql, restore-empty-data.sql, RECUPERACION.md y verificación posterior. Incluye workspace, historial, recibos, identidades fijadas y estructura/permisos previos; no tablas Auth, contraseñas, tokens, sesiones Auth ni secretos OAuth. Workspace validado contra esquema canónico. Restauración no ejecutada ni ensayada en otro recurso.

Procedimiento: detener Preview, confirmar proyecto y punto de recuperación, autorizar restauración; aplicar estructura/funciones previas y datos sólo en destino vacío. restore-empty-data.sql aborta si workspace/comandos no están vacíos, sin borrar ni sobrescribir. En destino no vacío debe acordarse recuperación explícita. Verificar dos proyectos, diez recibos, originales/decisiones/fuentes. Restaurar funciones previas restituye permisos antiguos y requiere revisión de seguridad; no hacerlo automáticamente. Auth/OAuth no se reconstruyen con esta copia; antes de reabrir Preview, reinstalar controles protegidos y fijaciones. No acredita recuperación ante pérdida total del proyecto/Auth.

### Resultados reales y bloqueo

- Sin sesión: /api/session 403 observado en Preview tras la protección Vercel; HTTP anónimo externo recibe protección Vercel antes de la app. RPC antiguas/nuevas sin permisos se comprobaron rechazadas. No se amplió protección para probar.
- Un ingreso Google real con carp recorrió login/callback (303) y volvió denegado; session 403. No se completó sesión de producto, no se probaron ambas identidades ni Google ajeno.
- Defecto concreto en app/server/protected/api.mjs, permitted(): busca identities[].provider_id; el JSON de Supabase Auth usa identities[].id para el ID del proveedor y identity_id para la identidad interna. SQL usa correctamente provider_id. Fuente oficial: https://raw.githubusercontent.com/supabase/auth/master/internal/models/identity.go. El doble de app/tests/serverless-private.test.mjs también usaba el campo incorrecto. Reproducción aislada de la expresión vigente, sin tokens ni llamadas: objeto con formato oficial rechazado y doble anterior aceptado. Esto explica un rechazo seguro y suficiente para bloquear, sin afirmar que se hayan descartado todos los problemas posteriores. No hubo corrección ni reintento automático de Google.
- Assets privados observados por navegador: protected-DBMtES1B.js y protected-TIaxFCsK.css. Sin secretos técnicos conocidos en build privado local ni salida examinada de logs de requests/runtime; sin códigos OAuth en queries de las once líneas de request log examinadas. No acredita examen exhaustivo de bytes del bundle remoto o de todos los logs.
- Bloqueados, NO PASS: sesión exitosa de ambas identidades, permisos autenticados de proyecto, cookies de sesión de producto/CSRF/expiración/renovación/revocación/logout en Preview, E1 completo/persistencia/concurrencia/conflicto/idempotencia y ausencia de análisis al recuperar dentro de una sesión válida. Las 23 pruebas locales y dos de navegador previas siguen como evidencia con dobles/TLS local, no resultados remotos.
- Cero análisis/generaciones en Preview y cero IA real. Proveedor real no subido ni configurado; no clave de IA. Sin lector de pantalla ni declaración de accesibilidad integral. Fallos históricos de separadores, omisión opcional e intentos inválidos del arnés continúan separados; no se repitieron suites completas.
- Production sigue Ready en dpl_2MTJtJhTvi2zmgpLVC4ckrCR3fep. Production https://ai-product-discovery-copilot.vercel.app/ y Pages https://ivan-andrade7.github.io/ai-product-discovery-copilot/ devolvieron 200 antes/después y conservaron referencias y SHA256: index-DVPkSybh.js e60cc1d4650343b730296b248e45bfad1ab0450318d3127ff8cf4c519ecbc6a2; index-TIaxFCsK.css 9e9285f0f208a107349a9754a3f297546ba616eeb09b4c4d6426f914d3b531e3. No smoke funcional repetido. Lotes 1/2 cerrados.

### Gate y comprobación desde dos computadoras

Solicitar autorización acotada para corregir campo JSON en API y fixture, probar contrato fiel/identidad ajena con dobles y reemplazar sólo Preview; después completar verificaciones reales pendientes sin IA real ni push/Production. No quitar controles ni autorizar por correo como alternativa. El alias permanece en el candidato que rechaza el ingreso.

Después de corregir y verificar ambas cuentas: equipo A abre el alias, supera Vercel Authentication e ingresa con una cuenta Google permitida; crea proyecto/fuente ficticios, revisa E1 simulado y guarda decisión/próxima acción. Equipo B abre el mismo alias e ingresa con la otra cuenta, verifica originales/historial/brief y continúa el mismo proyecto. Con edición obsoleta en A comprobar conflicto sin sobrescritura; al cerrar sesión A, sus operaciones deben rechazarse y B conservar su sesión. Registrar equipos, resultado y límites, sin enviar tokens/códigos. Pendiente, no iniciar ni acreditar ahora. Dos sesiones en una computadora no satisfacen este criterio.

Incidentes no acreditados como PASS: spinner SQL permaneció en Running tras aplicar; no se repitió la migración y se comprobó con consulta separada/igualdad de datos. Un intento de parche documental falló por contexto inexistente sin modificar archivos; se corrigió sólo la edición documental. No cambios de código durante este despliegue ni acceso a archivos privados excluidos/registro económico.

Los cortes siguientes son antecedentes y no sustituyen este estado parcial.


## Preparación HTTPS/Vercel — sin despliegue, 15/10/2026

Estado inicial: main/HEAD 71dd149e29f8488c6cf02bc6654dbe18b364e775, índice vacío, cambios metodológicos/E1/conexión local existentes conservados. Ambas direcciones fueron provistas por Iván y confirmadas para el mismo espacio personal; no se amplió la lista. Revisión proporcional de los contratos, API, persistencia, entradas/builds y diff pertinente; no se reabren Lotes 1/2. Aplicada la instrucción base y bloques E16/E17 de la guía metodológica a este tramo, sin atribución histórica ni nuevos requisitos académicos.

### Implementación preparada

- api/{login,session,logout,workspace,analysis}.mjs y api/auth/callback.mjs: entradas Node que construyen el handler por invocación. server/protected/{entry,config,crypto,store,api}.mjs: estado duradero, no Map ni memoria común para sesiones/refresh/PKCE/análisis. Configuración incompleta, Production o destino distinto a protected-test: 404; host exacto y x-forwarded-proto=https obligatorios.
- Cookies __Host- sin Domain, Secure/HttpOnly/SameSite=Lax/Path=/; Lax permite retorno OAuth GET. PKCE de uso único/10 minutos; sesión máxima ocho horas y treinta minutos de inactividad, renovación con lease/CAS y revocación duradera. Si se abandona o pierde la confirmación de renovación no se repite automáticamente: exige reingreso. Cambio de sesión en el mismo navegador revoca la anterior. POST exige Origin exacto y token CSRF de la sesión; no CORS como protección única.
- Identidad: getUser verificado por servidor en cada operación y vínculo exacto email verificado + UUID Supabase + Google subject. Las dos direcciones son fijas; sin UUID/sub no se habilita. La política SQL vuelve a verificar identidad/sesión de Auth y de producto. No alta abierta ni autorización por dominio/correo solamente.
- remote/protected-schema.sql preparado **no aplicado**: tablas privadas RLS de configuración/sesiones/intentos; tokens cifrados AES-GCM, clave de cifrado sólo del servidor, credencial backend de alcance limitado al almacén de sesiones con hash en base. No service_role ni clave administrativa como credencial de operaciones. La RPC de transporte del almacén admite rol anon pero exige esa credencial dedicada de 256 bits; no permite leer/escribir proyectos. RPC de datos usa JWT del usuario y sesión activa dentro de la transacción. Se revocan las RPC antiguas a authenticated para evitar saltarse la revocación nueva; esto retira el acceso del runner local anterior al aplicar el script y se declara en el gate. No reinicia/migra/borra workspace ni historial v0.3.
- Análisis exclusivamente determinista simulation-e1/E1, tras autenticación y existencia de proyecto/run/request/contexto vigente. Claim durable antes de ejecutar, resultado registrado y repetición exacta recuperable entre instancias; ocupado/incierto/interrumpido no ejecuta de nuevo. Lease vencido se registra interrumpido al leer o consultar el intento; recuperación no genera. No se añade proveedor real ni se toca registro económico.
- protected.html + src/remote/private-main.jsx y scripts/build-private.mjs: build privado explícito dist-private, sin wrapper ficticio ni fallback a App pública. vercel.private.json no es configuración automática de Production. Build estándar dist permanece separado. Cambios de cliente: CSRF sólo en memoria del módulo y logout fallido oculta trabajo pero no anuncia revocación confirmada; ofrece reintentar cierre. .gitignore/eslint sólo excluyen el directorio generado nuevo, no código/reglas.

### Resultados locales

23 PASS, cero fallos/omisiones en el conjunto final serverless-private (6), private-remote (4), e1 (13). Dobles de Auth y almacenamiento, datos ficticios, nueva instancia de API en cada solicitud; ninguna llamada a servicios de cuentas/proveedor reales. Casos: PKCE/consumo único/replay; cookie opaca sin tokens; identidad con mismo email pero subject ajeno rechazada; sin sesión/cookie inválida/expirada rechazadas; origen/CSRF/Host/protocolo inválidos; logout y rechazo posterior; sesión independiente conservada; CAS sin sobrescritura y confirmación idempotente; proyecto inexistente rechazado; dos invocaciones concurrentes sólo ejecutan una simulación; resultado duradero; intento abandonado no reejecutado; E1/decisión recuperados sin análisis; un refresh con lease, contención, revocación durante refresh, lease abandonado y expiración absoluta; configuración inválida/Production deshabilitada; cifrado vinculado al registro; transporte del almacén separado del JWT de datos. Esto no prueba las transacciones PostgreSQL reales.

TLS real local: Node HTTPS en loopback, certificado/clave ficticios temporales fuera de OneDrive, CA confiada explícitamente sólo por el cliente de prueba y verificación de certificado activa; se comprobaron cabeceras Secure/HttpOnly/Lax y rechazo sin sesión. No se alteró el almacén de certificados del sistema ni se saltaron advertencias de navegador. Archivos ficticios eliminados al terminar el caso satisfactorio. No acredita entrega/almacenamiento de cookies en Chrome/Vercel.

Navegador: e1-browser y private-browser PASS tras los últimos ajustes, API interceptada/datos aislados y cero tráfico externo/errores de página. Se agrega comprobación de CSRF en POST y logout incierto: ocultar trabajo, no anunciar éxito, no repetir automáticamente, reintento explícito y cierre confirmado. No se repite matriz general de layout. Dos pruebas de navegador más las 23 anteriores: 25 casos únicos en este tramo, sin sumar repeticiones. La omisión opcional histórica de storage y los dos fallos históricos de separadores permanecen separados/no reejecutados; no se convierten en PASS. Sin lector de pantalla ni conformidad integral.

Lint cero errores/advertencias, build estándar y privado PASS. Público conserva index-BKrjc9rv.js/index-TIaxFCsK.css del candidato previo; privado protected-DBMtES1B.js/protected-TIaxFCsK.css en dist-private/protected.html. Inspección de ambos bundles: sin login ficticio/createTestAuth, nombres de secretos de servidor ni clave publicable. Build privado implícito o VERCEL_ENV=production rechazado. Función de entrada en Production devuelve 404 aun con configuración de prueba ficticia. No se ejecutó Vercel CLI/build remoto ni se publicaron assets.

Incidentes sin acreditar PASS: el primer caso TLS leyó res.socket al final de la respuesta y falló; se corrigió el cliente del arnés para capturar autorización antes del cierre y cerrar conexiones, y el retest pasó. El primer navegador detectó colisión real de private.html con /private en Vite; se renombró a protected.html, conservando el loopback previo; el retest pasó. No se suprimieron verificaciones ni se modificaron antecedentes para ocultarlos.

### Límites y gate de despliegue

No hay PostgreSQL/psql/Docker local disponible; SQL nuevo revisado pero no ejecutado, y no se hicieron cambios ni consultas de Auth/datos a cuentas reales. Pendientes: verificar/aplicar transacciones, permisos/funciones y revocación en Supabase, fijar UUID/sub de las dos identidades, generar/configurar dos secretos técnicos, verificar alias HTTPS y scope exclusivo de variables, probar routing/headers/cookies/refresh/logout reales en Vercel y continuidad/conflicto desde dos computadoras. Rechazo mediante doble con email coincidente/subject distinto no es un ingreso Google ajeno probado. Las pruebas reales del runner anterior siguen como antecedentes separados, no validan automáticamente este handler nuevo. No se declara seguridad ni accesibilidad integral.

Destino recomendado y lista exacta de nombres/valores no sensibles/rutas en app/README.md: Preview exclusivo del proyecto existente, configuración privada explícita y origen HTTPS único pendiente de identificar (no se inventó alias). Google conserva su redirect exacto a Supabase; Supabase requerirá retorno exacto del alias a /api/auth/callback y Site URL /private. Nada aplicado ahora. Autorización siguiente mínima: consulta puntual de IDs sin secretos, aplicar/verificar SQL y permisos dedicados, custodiar secretos técnicos fuera de repositorio, configurar sólo Preview/callback y desplegar/pruebas entre equipos. No incluye Production/demo, IA real, migración personal, push ni operaciones Git implícitas. Candidato local sin preparar en Git.

## Conexión privada local — infraestructura autorizada, 15/10/2026

### Actualización de cierre local con servicios reales

Ingreso Google real de ivanandradecarp@gmail.com completado por el agente tras autorización explícita para el consentimiento básico observado (nombre/perfil y correo). Dos sesiones independientes, Chrome e in-app browser en la misma computadora, accedieron por Google y recuperaron el mismo espacio en Supabase. Después se ingresó con ivanandradeuxui@gmail.com en Chrome, con los mismos permisos básicos, y se recuperó el mismo brief/decisión/próxima acción. Ambas identidades autorizadas comprobadas. No se copiaron cookies/tokens entre navegadores ni se instrumentó la API en este recorrido real. Al terminar se cerraron todas las sesiones de producto usadas en la prueba.

Proyecto ficticio «Prueba remota E1 · 15 octubre»: pedido literal y fuente aportada guardados; selección explícita en Sources; aporte humano separado; orientación determinista simulada con tres propuestas; aceptación humana de una síntesis; un bloque en Brief E1, fuente citada, aporte humano, dos pendientes y próxima acción; cierre E1. La segunda sesión recuperó esos datos/decisión/brief, y una recarga conservó exactamente dos ejecuciones históricas (una cancelada tras interrupción y una completa) y una acción humana, sin generación automática. No se subieron proyectos personales locales. La decisión fue una acción del agente sobre un caso ficticio autorizado, no validación del producto por Iván.

Conflicto real: segunda sesión con revisión anterior intentó crear «Conflicto ficticio no debe guardarse»; RPC transaccional devolvió conflicto, UI bloqueó escritura; cargar cambios externos recuperó sólo los dos proyectos existentes, sin ese intento, conservando decisión y brief. Logout de una sesión: acceso posterior a /api/workspace devolvió permission; la otra sesión siguió operativa. Logout de la otra sesión también rechazó lectura posterior. Dos sesiones locales no equivalen a dos computadoras. Sin identidad ajena autenticada mediante Google: su rechazo se acredita con dobles del servidor y eventos ficticios del hook SQL, no como recorrido OAuth real.

Defectos detectados por esta prueba y corregidos: JSONB reordena propiedades, por lo que la comparación textual del contexto invalidaba la respuesta de un guardado con ejecución; se compara estructura manteniendo orden de arrays/valores e instantáneas originales, sin eliminar stageWork ni referencias. El intento inicial quedó preservado, recuperado como interrumpido y luego cerrado explícitamente sin reenvío, sin propuestas y con humanResolution; sólo provider simulation/externalAttempted=false puede usar esta salida. El nuevo intento simulado manual completó el recorrido. Se corrigió además el mensaje específico de conflicto y textos de Decisions/Deliverables para identificar persistencia remota. No se borraron ejecuciones ni se reinició el workspace.

Último conjunto focalizado: 64 PASS, cero fallos, una omisión opcional histórica de storage (private-remote, e1, storage, workflow-integrity, ai-flow). Incluye fixture JSONB con aporte humano, validación/finishAnalysis, contenido alterado rechazado y cierre simulado que nunca resuelve un ensayo real. Lint sin errores/advertencias y build correcto (index-BKrjc9rv.js / index-TIaxFCsK.css, exclusivamente local). Tras los últimos ajustes, tres pruebas de navegador afectadas PASS: e1-browser, private-browser con API interceptada y workflow-browser (cero intentos externos/errores de página en los arneses aislados). Total único de este conjunto: 67 PASS y una omisión, sin sumar repeticiones. Fallos históricos de separadores separados; sin lector de pantalla ni accesibilidad integral.

Git final: main/HEAD 71dd149e29f8488c6cf02bc6654dbe18b364e775, índice vacío, candidato sin preparar; AGENTS conserva huella metodológica previa 46ff9864aa73803b185186252b55102d56d885478ed5bbaea0c53b9d69207458. Nuevo ajuste de texto en DecisionsScreen incluido en el alcance remoto. Sin manifiesto/lockfile/dependencias nuevos. Sin staging/commit/push/despliegue, sin IA real, sin acceso al registro económico ni archivos privados excluidos. Capturas de datos ficticios, localizador privado lógico `visualizations/2026/10/15/tp-private-e1/`, fuera del repositorio y OneDrive. Producción pública no modificada.

Gate pendiente: adaptar la ejecución protegida para HTTPS/Vercel y sesiones adecuadas a reinicios/instancias, revisar el candidato y autorizar expresamente configuración/despliegue de prueba con callbacks exactos (no comodines), proveedor simulado sólo en ese entorno y verificación desde dos computadoras. El servidor Vite/loopback actual no se publica. No se habilita IA real, no se migra almacenamiento personal ni se modifica la demo pública por inferencia. Respaldos/recuperación Free siguen bajo responsabilidad del usuario; la continuidad de estas sesiones no demuestra recuperación ante pérdida total del proyecto Supabase.

Incidentes adicionales sin acreditarlos como PASS: primer arranque del arnés de navegador usó ruta Windows sin URI file y no ejecutó los tres casos; corregida sólo la variable de ejecución. Una comprobación check() observó el checkbox temporalmente deshabilitado durante guardado remoto, pero la selección se confirmó después sin repetir envío. Una espera de navegador omitió state:visible; se corrigió la espera sin volver a ejecutar el análisis. Captura fullPage in-app no disponible; captura representativa guardada desde Chrome fuera del repositorio. Navegación Google tuvo esperas/transiciones y timeouts de lectura, sin imprimir códigos de retorno, tokens ni respuestas Auth.

El corte parcial siguiente conserva las comprobaciones y límites previos a completar estos recorridos; sus pendientes de login/dos sesiones quedan superados sólo por los casos reales descritos arriba.

### Corte parcial anterior de esta conexión

Tramo en curso, posterior al cierre de la revisión E1 simulada. Iván confirmó uso académico/personal no comercial, Vercel Hobby y Supabase Free con pausa y copias a cargo del usuario; dos identidades Google autorizadas al mismo espacio personal: ivanandradeuxui@gmail.com e ivanandradecarp@gmail.com. Administración de Supabase por GitHub independiente del acceso al producto. No portal, IA real ni publicación autorizados en este tramo.

Recursos dedicados comprobados sin equivalentes previos: Supabase ai-product-discovery-copilot, ref lkzgydnglkrcmztviqsf, Ivan-andrade7’s Org Free, Healthy/Nano/us-east-1; Google Cloud AI Discovery Copilot TP, id ai-discovery-copilot-tp, OAuth en pruebas. No se tocaron los dos proyectos Supabase pausados ni My First Project. No se vinculó facturación ni activó prueba de pago. Iván aceptó directamente la política de datos de Google, creó el cliente web TP prueba local protegida y transfirió el secreto directamente a Supabase; el agente no leyó el secreto OAuth.

Base configurada: esquema tp_private con tres tablas RLS habilitado, sin privilegios directos para anon/authenticated; funciones autenticadas con comprobación de Google y correo verificado, espacio único, revisión transaccional y registro idempotente de comandos. Hook Before User Created activo y restrictivo a esas dos direcciones/Google. Correo, acceso anónimo y vinculación manual deshabilitados. Callback de Google a Supabase exacto; Site URL http://127.0.0.1:5182/private y único retorno a http://127.0.0.1:5182/api/auth/callback, sin comodines ni previews. Audiencia Google en Prueba con exactamente las dos identidades guardadas; no se publicó la aplicación OAuth. Inicio real abierto: selector de cuenta y consentimiento Google observado para una identidad autorizada; sólo Nombre e imagen de perfil / Dirección de correo electrónico. Pendiente que Iván pulse Continuar y comprobar el retorno; no se acredita login exitoso todavía.

Código local: servidor de prueba exclusivamente loopback 5182, sesión HttpOnly en memoria con PKCE y verificación del usuario en servidor; tokens sólo en memoria del proceso. Repositorio remoto mediante JWT del usuario y clave publicable, nunca service_role. Configuración local fuera de OneDrive/Git en AppData/Local/AI-Discovery-Copilot/private-test.json, acceso Windows restringido al usuario. Ninguna clave/versionado de credenciales en el repositorio. Proveedor determinista exclusivamente simulado en este servicio; sin fallback a proveedor real. Entrada /private sólo en desarrollo local y excluida del build estático de producción. App/vistas/revisión/E1 siguen compartidos, ahora esperan confirmación asíncrona y bloquean nuevos cambios ante incertidumbre; resolución manual del mismo comando. Sin importación de proyectos personales.

Comprobado hasta este corte: lint sin errores/advertencias, build correcto; 49 pruebas de dominio/API con dobles aprobadas y una opcional histórica omitida; dos pruebas de navegador de regresión afectada aprobadas y una prueba nueva de interfaz remota con API interceptada aprobada (52 casos únicos aprobados, una omisión opcional histórica). Esta última verifica dos contextos aislados, guardado asíncrono, confirmación perdida/resolución idempotente, conflicto sin sobrescritura, E1/revisión/cierre/brief, recarga sin análisis y logout. /private?e1 no habilita el acceso ficticio. No acredita servicios reales. SQL real: tres tablas protegidas, RPC anónimas sin permiso, acceso directo autenticado a tablas sin permiso, hook rechaza correo ajeno y proveedor email y permite correo autorizado (eventos ficticios). API local sin sesión devuelve 403 para sesión/lectura/escritura/análisis; RPC Supabase con clave publicable sola devuelve 401. Configuración Auth consultable con clave publicable válida: Google sí, email/anónimo no. Esto no acredita todavía login Google real, dos sesiones reales, conflictos remotos ni E1 con datos guardados en Supabase. No lector de pantalla; no accesibilidad integral. Fallos históricos de separadores e intentos inválidos previos permanecen separados.

Dependencias: intento pnpm add detenido por ERR_PNPM_UNEXPECTED_STORE; no se cambió manifiesto ni lockfile ni se reparó el almacén. Se usa HTTP/Node ya disponible, sin nuevas dependencias. Incidentes de ejecución sin acreditarlos como PASS: Python no disponible (sin ediciones), tipeo SQL agotó tiempo antes de ejecutar (se reemplazó íntegramente con pegado y luego se ejecutó con éxito), primer retorno del formulario local encontró el cambio de servidor y requirió recarga. Otros intentos no acreditados como PASS: el arnés remoto buscó Deliverables como enlace en vez de botón; se corrigió el localizador, se verificó el comportamiento existente y se repitió satisfactoriamente. Una invocación apuntó a tests desde la raíz en lugar de app y no ejecutó pruebas. El formulario de audiencia rechazó dos emails en una sola entrada; se corrigieron como entradas separadas y el panel confirmó exactamente dos usuarios de prueba.

Estado aún no listo para despliegue: completar pruebas reales y preparar ejecución HTTPS/sesiones durables para Vercel; el servidor de desarrollo loopback no se publica. Dos sesiones locales no equivalen a dos computadoras. Lotes 1 y 2 cerrados, producción y registro económico intactos; cero IA real, sin staging/commit/push.



## E1 integrado — correcciones e integración local, 15/10/2026

Autorización: corregir creación ante confirmación incierta y contexto humano; integrar E1 con proyectos y vistas existentes, proveedor simulado, sin recursos externos, claves, registro económico, IA, instalaciones, staging, commits ni publicación. Precondiciones comprobadas: main/HEAD 71dd149e29f8488c6cf02bc6654dbe18b364e775, índice vacío, mismo diff previo (metodología en AGENTS/contexto, candidato E1 y documentación). Se tomaron huellas de los 94 archivos del candidato dentro de alcance. AGENTS y el bloque metodológico previo quedan preservados; elementos privados sin leer/modificar. Lotes 1 y 2 permanecen cerrados.

### Cambios y compatibilidad

- Se retiró E1Workspace y su servicio/modelo paralelo e1-test-v1. E1Development sólo representa acceso autorizado/denegado y monta App con dobles. El mismo constructor/Projects/New Project/Overview/Work/Sources/Decisions/Deliverables y repositorio sirven al trabajo de etapa. La clave de prueba anterior permanece sin lectura ni migración. El adaptador prefija claves v0.3/anteriores bajo copilot-e1-integrated-test:, sin consultar datos personales.
- Extensión opcional explícita project.stageWork.E1.version=1: known, humanInputs, nextAction, closed. Se valida su forma y relaciones de aportes con proyecto/fuentes/propuestas. Sin cambiar la versión base v0.3 ni sobrescribir datos al leer. Compatibilidad comprobada en sentido lector nuevo → fixture antiguo, incluidos campos históricos, tipo string anterior y respaldos; un lector antiguo puede rechazar las extensiones de E1 nuevo. No se afirma compatibilidad inversa ni migración de datos reales.
- Propuestas comparten sourceRefs, runId, originalContent, estados y revisión de Work. Las decisiones conservan secuencia, acciones, contenido anterior/actual y original. Simulación queda como origen/proveedor explícito, sin reclasificar datos históricos. El brief E1 de Deliverables deriva de aceptadas/editadas, muestra aportes humanos separados, pendientes y próxima acción. Reabrir retira el bloque y reabre el estado de etapa.
- Creación: se reutiliza el intento estable de NewProject/App. persistWorkspace reconoce un reenvío ya guardado sólo si el contenido serializado completo, revisión esperada+1 y escritor coinciden, comprobando además los antecedentes. Revisión o escritor distinto sigue bloqueando como conflicto. Se probó guardar y lanzar un error ficticio posterior: primer intento aplicado, reenvío sin otro proyecto ni otra revisión; una creación intencional nueva recibe otro ID.
- Contexto humano: bloque humanContext independiente de solicitud, fuentes e instrucción E1, rotulado human/declaration-not-independent-evidence. Incluye aportes generales propios y los limitados a fuentes sólo cuando éstas siguen seleccionadas. Aportes ajenos se excluyen; payload forjado se rechaza. Respuestas a preguntas actualizan lo conocido únicamente en el contexto pertinente. Los caracteres de ese bloque cuentan en el límite de entrada. Cambiar el contexto humano invalida una respuesta en curso.
- Fuente obligatoria para ejecutar; el constructor E1 no duplica la solicitud como fuente. Sin fuente el proyecto puede guardarse y continuar manualmente. Proveedor ficticio determinista, sin interpretación semántica ni salida externa. Datos/instrucción se entregan por argumentos separados al doble; todavía no hay transporte real E1.

### Pruebas ejecutadas y evidencia

- Lint PASS, cero errores/advertencias; build PASS. Sin modificar manifiesto, lockfile, configuración, dependencias o servicio real. Los marcadores del wrapper/dobles no aparecen en dist. Panel y contratos de etapa sí pertenecen a la aplicación compartida; su inclusión no constituye autenticación ficticia de producción.
- E1: **14 aprobadas, cero fallidas y cero omitidas**: 13 de dominio/adaptadores y una de navegador Edge headless. Prueban identidad denegada/cerrada, constructor compartido, fuente no fabricada, confirmación perdida y reintento, nueva intención, conflicto concurrente, revisión/historial/brief/reapertura, exportación/recuperación, contexto humano realmente recibido por el doble, exclusión de aportes ajenos/fuentes deseleccionadas, preguntas conocidas, obsolescencia por aporte nuevo, compatibilidad v0.3, ausencia de lecturas/escrituras personales mediante sentinel ficticio, interrupción/incertidumbre sin reenvío y cancelación.
- Navegador: mismo Projects/New Project/Overview/Work/Decisions/Deliverables; fallo posterior al guardado, reenvío con un ID, creación nueva con otro ID, fuente explícita, aporte humano general dentro del request guardado, editar/aceptar en Work, historial en Decisions, responder pregunta y cerrar E1, brief en Deliverables, recarga/nueva sesión ficticia con pendientes/próxima acción conservados. Abrir, recuperar, navegar, reabrir y continuar no aumentaron el número de ejecuciones. Panel E1 y Deliverables sin desbordamiento a 320/390/1280. Cero errores de página e intentos externos en el recorrido final monitorizado.
- Producción local desde dist: ?e1 abre Tus proyectos sin acceso simulado; las rutas conocidas E1Development.jsx y test-adapters.js devuelven HTML de fallback, no JavaScript ni el módulo de prueba. No hay acceso ficticio habilitado por parámetro/ruta. Esto no demuestra autorización de una futura API.
- Regresiones afectadas: storage, workflow-integrity, proposal-types, ai-flow y workflow-browser con navegador: **60 aprobadas y una opcional histórica omitida**. La ejecución conjunta de dominio registró 72 PASS/1 omisión (incluye 13 E1); navegador E1 y workflow-browser se ejecutaron aparte. No se suman repeticiones. Workflow-browser conserva su matriz interna; no se abrió una auditoría nueva. Los fixtures de ai-flow bloquean red externa y sólo ejercitan el servicio loopback inyectado, sin ejecutar el arranque CLI/registro económico privado.
- La omisión es UI_TESTS histórica de storage, no PASS ni fallo. Los dos fallos históricos de separadores continúan como antecedentes, sin alterar sus pruebas ni declararlos resueltos. Sin lector de pantalla ni declaración de accesibilidad integral.

Se conservan los intentos previos como diagnóstico, sin acreditarlos como PASS: el primer fixture de dominio no seleccionaba la fuente y fue corregido para representar selección explícita; navegador detectó un mensaje de guardado que ocultaba la finalización (corregido en E1Panel). Otros intentos del arnés buscaban Reabrir sin seleccionar la propuesta aceptada, repetían el fallo ficticio después de recargar o sembraban un sentinel incompatible en el origen de producción. Se corrigió el arnés y completó el recorrido final; no se ocultaron fallos ni se cambiaron criterios para obtener PASS. Una comprobación de diff detectó y eliminó un espacio final de App.

### Límites y gate

Integración local, no Google real, backend remoto protegido, sincronización entre computadoras, presupuesto operativo o consumo real. Repositorio local síncrono; un API remoto requiere orquestación asíncrona y autorización/aislamiento/transacciones/idempotencia en servidor, no sólo sustituir los dobles. La identidad simulada y localStorage prefijado no son barreras de seguridad reales. Formularios y borradores no confirmados conservan sus límites de sesión. Estados inciertos/interrumpidos bloquean; no hay resolución automática. No se leyeron/migraron/borraron datos personales, el sandbox anterior ni archivos privados.

Pendientes antes del gate externo: dato del plan y rol sobre Vercel, declaración del uso para evaluar elegibilidad de Hobby, plan/cupo activo en Supabase, identidad Google y administración/recuperación disponibles. Sin consultar facturación ni credenciales. Configuración de recursos/OAuth, custodia de secretos, habilitación/prueba real de IA y publicación requieren autorizaciones separadas. Candidato local sin staging/commit; versión funcional publicada 3835117, cierre documental 71dd149. No se modifican los antecedentes fechados siguientes.

## Primer tramo E1 — desarrollo local simulado, 15/10/2026

Autorización: implementar localmente E1 con autenticación, persistencia y proveedor simulados; sin recursos externos, credenciales, consumo, migraciones, staging, commits o publicación. Dirección confirmada: espacio privado remoto individual, Google exclusivo de Iván, pedido → brief revisado → próxima acción, evaluar Supabase Free sin contratar. La elegibilidad de Hobby y los planes/cupos actuales no se comprobaron. Lotes 1 y 2 permanecen cerrados; versión funcional publicada 3835117, cierre documental 71dd149. Este tramo no cambia producción.

Estado inicial: main/HEAD 71dd149e29f8488c6cf02bc6654dbe18b364e775, índice vacío. AGENTS.md y contexto.md tenían únicamente la actualización metodológica previa. Se conservaron huellas de los 88 archivos seguidos antes de editar; AGENTS.md queda íntegro y el bloque metodológico de contexto se preserva. Los dos elementos privados no seguidos permanecieron sin leer/modificar. No se accedió al registro económico ni se ejecutó código del servicio real para esta verificación.

### Implementación y criterio cumplido

Entrada de desarrollo loopback `?e1` en la misma aplicación/repositorio; no otro producto. Identidad simulada de Iván y acceso denegado; creación/apertura de proyectos separados de v0.3; pedido original literal, fuentes con selección explícita, información conocida recuperada; instrucción E1 de producto versionada y adaptada desde la referencia metodológica, sin atribuir uso histórico previo. No se automatizan otras etapas ni se exige negocio/blueprint.

Proveedor ficticio determinista: síntesis con extracción literal de una fuente seleccionada, hipótesis explícita y pregunta prioritaria cuando objetivo/restricciones no están registrados. No realiza comprensión semántica, no interpreta instrucciones de fuentes ni consulta URLs. Se verifican contrato y citas con el validador existente. Sin fuente se guarda el proyecto, pero no se llama al proveedor; el pedido no se duplica. La llamada conserva solicitud y fuentes por separado, contexto de ejecución e instrucción versionada.

Revisión: aceptar, editar y aceptar, rechazar, pendiente/reabrir. Propuesta original inmutable; decisiones y respuestas humanas separadas. El brief se deriva de bloques aceptados, conserva referencias, aportes humanos, pendientes y próxima acción. Cerrar E1 requiere un bloque aceptado y próxima acción; puede cerrar con pendientes explícitos y no habilita otra etapa. Recuperar/reabrir no vuelve a ejecutar IA. El adaptador sólo usa una clave de almacenamiento de prueba, sin leer/migrar datos existentes.

Contratos asíncronos de autenticación y repositorio con propietario/revisión, proveedor inyectable; rechazo de operaciones sin sesión simulada autorizada, control de concurrencia de prueba, identificador de ejecución reutilizable sin segundo envío, contexto obsoleto sin aplicación, respuestas inválidas sin propuestas, y resultado incierto/ejecución inconclusa bloqueando futuros envíos. No se presenta ese control en cliente como autorización segura de un backend remoto. Los adaptadores reales deberán exigir estos controles en servidor.

### Comprobaciones ejecutadas

- Lint PASS: cero errores y advertencias. Build PASS, sin instalaciones ni cambios de dependencias, manifiesto, lockfile o configuración.
- E1 final: **12 pruebas aprobadas, cero fallidas, cero omitidas** (11 de dominio/adaptadores y una de navegador Edge headless). Incluyen acceso anónimo/ajeno/cerrado, preservación literal, guardado sin fuente y cero llamadas al doble, creación idempotente, respuesta seleccionada y citas, revisión y original, aporte humano separado, no repetir preguntas de información estructurada conocida, brief/cierre/reapertura, nuevo servicio recuperando estado, doble envío concurrente, salida obsoleta, formato/cita/éxito falso rechazados, incertidumbre persistente, cierre de sesión durante respuesta, fallo de escritura, conflicto y corrupción preservada.
- Navegador E1 con contexto ficticio descartable y red interceptada: recorrido desde acceso denegado hasta brief cerrado y recuperación después de recarga/nueva sesión simulada, cierre sin contenido privado en pantalla, Tab y foco visible, anchos 320/390/1280 sin desbordamiento. Cero intentos externos y cero errores de página en ese recorrido. La revisión visual detectó un checkbox afectado por estilos compartidos; se acotó su estilo en E1, se tradujeron los estados visibles y se repitieron lint/build y las 12 pruebas E1 con PASS.
- Producción real local desde `dist`, solicitando `?e1`: abre Tus proyectos, sin botón de sesión simulada ni carga de módulos E1. Los adaptadores quedan fuera del build; no se activa la prueba con una opción de runtime de producción.
- Regresiones afectadas: workflow-integrity, workflow-browser con navegador habilitado y storage: **34 aprobadas, cero fallidas, una opcional histórica omitida**. Se ejecutaron junto con las primeras 10 pruebas E1 (44 PASS/1 omisión); después se ampliaron dos casos E1 y se ejecutó su conjunto final de 12. No se suman repeticiones como pruebas nuevas. La matriz que ya contiene workflow-browser se ejecutó como parte de esa suite, sin abrir una nueva auditoría general.
- La omisión es el opt-in UI_TESTS histórico de storage; no equivale a fallo ni a PASS. Los dos fallos históricos de separadores permanecen como antecedentes separados; no se modificaron ni se declaran resueltos por este tramo.

Una captura auxiliar intentó importar Playwright desde el REPL y falló por incompatibilidad de exportación del runtime; no fue una prueba del producto ni se acreditó como PASS. Se usó después el mismo ejecutable Node/runtime de las pruebas para capturar el recorrido ficticio, con cero intentos externos. Capturas temporales fuera del repositorio, en `%TEMP%/copilot-e1-review-FggSBO/`. Sin lector de pantalla, sin verificación de anuncios ni declaración de accesibilidad integral.

### Límites y siguiente paso

Sólo simulación de autenticación/IA y persistencia en este navegador de prueba, no Google, backend protegido, persistencia remota, sincronización entre computadoras, presupuesto operativo o seguridad comprobada. El cierre de una propuesta de prueba no acredita aceptación por Iván ni validación con usuarios. Formularios no confirmados son temporales; ante un análisis inconcluso o incierto se informa bloqueo y no se incorpora ni reenvía contenido, sin herramienta de resolución automática en este tramo. No existe garantía de transacciones remotas desde localStorage.

El estado económico conocido 3/5/halted y permisos consumidos no se consultó ni se modificó. No hubo generaciones reales, compras, llamadas del proveedor, credenciales ni cambios en servicios externos, Notion/Figma/Pizarra. Se preserva v0.3 y no se migran proyectos locales.

Siguiente paso concreto, después de revisión de este candidato: confirmar elegibilidad/planes/cupo y aceptar límites de Free; con autorización específica, configurar identidad Google exclusiva, almacenamiento y API remotos que implementen estos puertos y controles en servidor. Custodia del secreto, habilitación/prueba real de IA y publicación permanecen gates distintos. Candidato exclusivamente local, sin preparar en Git.

## Cierre documental reconciliado del Lote 2 — 15/10/2026

Versión funcional publicada y verificada vigente: `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, Lote 2 (F01/F11/F12) dentro de la cobertura documentada. Lote 1 e2befd6 y los hotfixes anteriores permanecen como antecedentes. La publicación exitosa en GitHub Pages y Vercel, enlaces, assets y resultados por alojamiento se conservan en "Publicación y retest público del Lote 2", inmediatamente debajo. Las pruebas directas, instrumentación ficticia e intentos inválidos se mantienen separados; los intentos inválidos no se acreditan como PASS. IA pública deshabilitada y cero generaciones durante Lote 2, sin lector de pantalla ni declaración de accesibilidad integral.

Iván amplió la autorización documental a AGENTS.md, README.md, app/README.md, contexto.md y este registro. Precondiciones comprobadas sin consultas públicas: main, HEAD y origin/main local en 3835117, índice vacío y únicamente contexto.md/registro canónico modificados. Se conciliaron sólo afirmaciones vigentes sobre versión y gate en los cinco documentos; no se cambiaron los registros históricos fechados que siguen debajo. Los estados "pendiente", "local" o "no publicado" de esos cortes describen su momento histórico, no el gate vigente.

Este cierre es exclusivamente documental y tiene autorización para un único commit local `docs: reconcile navigation and focus release status`; no representa otra versión funcional ni nuevas pruebas. No se repitieron pruebas funcionales ni consultas públicas, ni se modificaron código, dependencias, configuración o servicios. Su push requiere autorización separada. El siguiente incremento funcional está pendiente de definición y autorización de Iván; no se crea ni se inicia otro lote mediante esta conciliación.

## Publicación y retest público del Lote 2 — 15/10/2026

### Precondiciones, commit y push

Iván autorizó un único push normal de main y la verificación de sus despliegues, con actualización exclusivamente documental sin otro commit. Antes de preparar la publicación: main/HEAD en `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, archivos seguidos limpios e índice vacío; el commit incluía exactamente los 16 archivos del candidato probado. Las huellas previas y el contenido preparado/confirmado se contrastaron sin diferencias. No se repitieron las pruebas locales completas. Las comprobaciones de firmas de secretos sobre el candidato no detectaron coincidencias; no se accedió a almacenes de credenciales.

git ls-remote confirmó main remoto en `06045764f397a330d980f3e9e71fb827d629b962`, igual al padre del commit autorizado: avance fast-forward sin divergencia. `git push origin main` completó normalmente `0604576..3835117`. Sin fetch, merge, rebase, force push, ramas, worktrees ni commits adicionales. Después se verificó main remoto y origin/main local en 3835117, diferencia 0/0 respecto de HEAD.

### Despliegues y assets

| Alojamiento | Evidencia y asociación | Resultado |
| --- | --- | --- |
| GitHub Pages | [Workflow 38755371460](https://github.com/Ivan-andrade7/ai-product-discovery-copilot/actions/runs/38755371460), head_sha 3835117bf6abd9a5d247b3cdc26dbbc5c26dc096; deployment 7095998310, environment github-pages | completed/success; alias [GitHub Pages](https://ivan-andrade7.github.io/ai-product-discovery-copilot/) HTTP 200 |
| Vercel | [Despliegue 5KzNtn9rtWj3yZ6rzeiWqXMoPQ6v](https://vercel.com/ivan-andrade/ai-product-discovery-copilot/5KzNtn9rtWj3yZ6rzeiWqXMoPQ6v); GitHub deployment 7095993122, environment Production, mismo SHA | success; [alias Production](https://ai-product-discovery-copilot.vercel.app/) HTTP 200; environment URL ai-product-discovery-copilot-ko0bwrcu6-ivan-andrade.vercel.app |

La asociación del commit se verificó mediante metadatos públicos de GitHub Actions/deployments/statuses. Ambos alias cargaron los mismos nombres y bytes del build local ya probado de ese commit:

| Asset | SHA-256 local y de cada alojamiento |
| --- | --- |
| assets/index-DVPkSybh.js | e60cc1d4650343b730296b248e45bfad1ab0450318d3127ff8cf4c519ecbc6a2 |
| assets/index-TIaxFCsK.css | 9e9285f0f208a107349a9754a3f297546ba616eeb09b4c4d6426f914d3b531e3 |

Se comprobaron nombre en HTML, HTTP 200 y hash del contenido servido por cada alias, sin asumir equivalencia sólo por la URL. No se cambió configuración, infraestructura, conexiones o dependencias.

### Smoke público, separado por alojamiento

Edge headless ya instalado, contextos descartables independientes por origen, sin datos personales ni sesiones de Abacus. Se cargaron fixtures ficticios de v0.3 y referencias explícitas para probar destinos de Sources; no son evidencia de un modelo ni datos reales. La instrumentación se ejecutó sólo en la memoria del navegador aislado, sin escribir en el producto o servidor.

| Comprobación | GitHub Pages | Vercel Production |
| --- | --- | --- |
| F01: regreso visible en las seis secciones; regreso directo sin borrador, sin aviso y con foco en Tus proyectos | PASS | PASS |
| F01: borrador entre secciones, aviso con cambios, Continuar/Descartar por teclado y foco de destino | PASS | PASS |
| F11: lang es y título estático AI Discovery Copilot | PASS | PASS |
| F12: abrir/crear proyecto enfoca Overview; New Project enfoca Nombre y cancelar devuelve a Nuevo proyecto | PASS | PASS |
| F12: 36 transiciones laterales por teclado, foco en control activado, aria-current, scroll y contorno completo | PASS | PASS |
| Recuperación instrumentada: destino inexistente/ajeno, sin alternativa silenciosa; Volver a Sources enfoca h1 y primera selección explícita enfoca h2 | PASS | PASS |
| Conflicto instrumentado con evento storage real entre dos pestañas ficticias: Continuar conserva borrador/bloqueo; Descartar carga externo y enfoca Tus proyectos | PASS | PASS |
| Fallo de escritura ficticio: doble envío/reintento, respaldo con un candidato, posterior guardado del mismo ID y foco Overview, sin duplicación | PASS | PASS |
| F08 mínimo: blancos rechazados; solicitud válida conservada literalmente | PASS | PASS |
| F09: primero/segundo destino exacto desde Sources con referencias ficticias explícitas | PASS | PASS |
| Layout: 36 casos con nombres largos y seis anchos, cabecera sin colisión/desbordamiento y foco completo | PASS | PASS |
| IA pública deshabilitada antes/después de comprobar servicio; cero generaciones | PASS | PASS |
| Assets idénticos, errores/advertencias de consola e intentos ajenos al origen de la app monitorizados | Hashes iguales; cero errores/advertencias; cero intentos externos | Hashes iguales; cero errores/advertencias; cero intentos externos |

Anchos: 320, 390, 901, 1024, 1025 y 1280 px. Los 36 casos por origen corresponden a seis secciones de proyecto con nombre largo sin espacios por seis anchos. Se comprobaron colisiones entre marca/regreso/título y scrollWidth/clientWidth, no sólo desbordamiento. Tab/Shift+Tab/Enter comprobaron foco, aria-current, contorno y scroll antes/después de cada transición del Sidebar; el contorno del regreso también quedó íntegro dentro del viewport.

Los recorridos de abrir, crear, cancelar, regresar, editar y pulsar destinos válidos son acciones directas de la interfaz con fixtures ficticios. En cambio, destinos inválidos se indujeron mediante el callback real de Sources localizado en su componente React; el producto no publica un enlace inválido para acceder a ellos. El conflicto usó otra pestaña aislada escribiendo una revisión externa ficticia y se verificó el estado cargado; el fallo de guardado se provocó temporalmente en Storage.setItem. Ninguno representa un fallo real de almacenamiento o proveedor ni autoriza usar datos económicos.

Dos ejecuciones preliminares del arnés no completaron todas sus comprobaciones: una buscó un proyecto que el propio fixture externo había reemplazado, y otra comparó objetos de distintos contextos de JavaScript con igualdad estricta de prototipos. Se corrigió únicamente el arnés temporal y se completaron las secciones afectadas en contextos descartables, comparando el contenido serializado exacto del candidato. Una operación de generación dinámica de funciones del arnés fue rechazada por el runtime y no aportó evidencia; se continuó con funciones explícitas permitidas. Sólo se consideran PASS las comprobaciones finales completadas, no esos intentos preliminares. No se confirmó un fallo del producto ni se modificó código para completar el smoke.

### Límites y estado final

No se utilizó lector de pantalla ni se comprobaron sus anuncios; tampoco zoom, otros motores, todas las terminaciones de sesión o accesibilidad integral. No se repitió una auditoría UX completa, evaluación de calidad de IA ni la suite local de 114 pruebas en producción. Esa suite y su omisión opcional pertenecen a la verificación local anterior; los dos fallos históricos de separadores se mantienen separados y no se presentan como pruebas públicas. No quedaron comprobaciones solicitadas bloqueadas en este smoke final; los límites citados no se declaran PASS.

Los contextos de prueba se cerraron. La evidencia temporal local está en `%TEMP%/copilot-lote2-public-UZiErp/public-results.json`, sin incorporarse al repositorio. Las lecturas de metadatos de publicación y descarga de assets se distinguen del tráfico monitorizado de la app. No hubo credenciales, registro económico privado, generaciones, cambios de IA/backend/persistencia, dependencias, Notion, Figma o Pizarra. Los elementos no seguidos excluidos no se leyeron ni modificaron.

**Resultado:** Lote 2 publicado y verificado en ambos alojamientos, commit 3835117. Después de la publicación sólo se actualizaron contexto.md y este registro, sin staging ni segundo commit. HEAD/main/origin/main local y main remoto permanecen en el commit publicado, sin divergencia. Siguiente gate: revisión de los dos cambios documentales pendientes; su eventual versionado y cualquier otro incremento requieren autorización separada. No se declara otra versión funcional por estas notas.

## Cierre de la advertencia de lint del Lote 2 — 15/10/2026

Control inicial: main, HEAD y referencia local origin/main en `06045764f397a330d980f3e9e71fb827d629b962`, índice vacío y exactamente los 16 archivos modificados esperados. Sin fetch, cambios concurrentes ni otros archivos seguidos inesperados. Los dos elementos no seguidos fuera de alcance continuaron sin lectura/modificación. Se conservaron huellas SHA-256 de los 46 archivos seguidos de app y documentación correspondiente antes de editar.

### Advertencia, causa y corrección mínima

Advertencia reproducida en el app canónico: app/src/screens/WorkScreen.jsx:36:6, `React Hook useEffect has a missing dependency: 'selected'. Either include it or remove the dependency array`, regla react-hooks/exhaustive-deps. Pertenece al efecto de recuperación introducido por F12 del Lote 2; estaba recibido desde Abacus y preservado por el correctivo anterior, pero no existía en la base 06045764. No es una advertencia de Lote 1 ni de la instalación de dependencias ya reparada.

El cuerpo leía el objeto selected mientras declaraba únicamente `[selected?.id]`. El efecto sólo necesita comprobar la existencia del identificador seleccionado. Se sustituyó la condición `recoveryFocusRef.current && selected` por `recoveryFocusRef.current && selected?.id`; se conservaron la dependencia por id, el reset del permiso antes de focus y la referencia al h2. No se agregó selected como dependencia amplia, no se silenciaron reglas ni se añadieron excepciones. La recuperación sigue sin seleccionar alternativas silenciosamente y el foco se consume sólo después de la selección explícita. No cambia la selección, F09, contenido ni persistencia.

### Pruebas y resultado

- Lint final en app: **PASS, código 0, cero errores y cero advertencias**.
- Build final: PASS, 33 módulos; assets `index-DVPkSybh.js` y `index-TIaxFCsK.css`.
- Suite con WORKFLOW_UI_TESTS=1 y el runtime de navegador ya disponible: **114 aprobadas, cero fallidas y una omitida**, 115 registradas. No se instalaron más dependencias. La omisión es el opt-in histórico de storage.test.mjs, UI_TESTS no activado, y permanece separada de los dos fallos de separadores históricos.
- app/tests/workflow-browser.test.mjs se amplió sin quitar aserciones anteriores: dos escenarios de destino inválido (id inexistente y proyecto ajeno) invocan el callback real de Sources dentro de App aislada. Ambos muestran Propuesta no disponible sin revisión alternativa. Enter en Volver a Sources enfoca su h1. Al repetir la recuperación y activar por teclado Seleccionar la primera propuesta disponible, se selecciona exactamente la primera y el h2 recibe foco una sola vez.
- Se instrumentaron sólo en cada página ficticia las llamadas a focus sobre el h2: el contador aumenta exactamente una vez por recuperación explícita y no aumenta al abrir el editor, modificar el borrador y escribir mediante teclado. El textarea mantiene el foco y el contenido esperado en ambos escenarios. Sin backdoor en el producto ni cambio de lógica para facilitar el test.
- La suite pertinente conservó PASS de F08 mínimo, F09, borradores, creación/reintento, regresiones laterales y conflicto. Sus 60 mediciones integradas y 36 transiciones de foco siguen pasando; no se ejecutó otra matriz independiente de layout porque el cambio es una guarda de efecto y no modifica geometría. Los resultados de nombres largos del correctivo anterior se conservan sin presentarlos como repetidos.
- Cero intentos externos y cero errores/advertencias de consola en el recorrido controlado. Datos ficticios y contextos descartables; sin claves, registro económico, IA ni servicios externos. No se dispone de lector de pantalla para este cierre, no hay afirmación de conformidad integral.

Los fallos de separadores de ruta reproducidos anteriormente en base y candidato permanecen como antecedente separado; one-shot.test.mjs y trial-ledger.test.mjs no se modificaron ni se ocultaron sus hooks. En el entorno ordinario pasaron con la suite de este cierre. Manifiesto, lockfile, configuración y resto del código conservan sus huellas; sólo se editaron WorkScreen.jsx, workflow-browser.test.mjs y los dos documentos autorizados respecto del candidato recibido.

### Alcance completo previsto para eventual commit

Revisión del diff contra 06045764: exclusivamente F01/F11/F12 del Lote 2, sus correcciones, pruebas y documentación. Sin cambios de IA, backend, servicios, esquema de persistencia, dependencias o configuraciones. Lista completa de archivos previstos, todavía sin staging:

1. app/index.html
2. app/src/App.css
3. app/src/App.jsx
4. app/src/components/ProjectSidebar.jsx
5. app/src/components/TopBar.jsx
6. app/src/screens/ActivityScreen.jsx
7. app/src/screens/DecisionsScreen.jsx
8. app/src/screens/DeliverablesScreen.jsx
9. app/src/screens/NewProjectScreen.jsx
10. app/src/screens/OverviewScreen.jsx
11. app/src/screens/ProjectsScreen.jsx
12. app/src/screens/SourcesScreen.jsx
13. app/src/screens/WorkScreen.jsx
14. app/tests/workflow-browser.test.mjs
15. contexto.md
16. docs/verification-2026-10-07.md

Propuesta de commit, no ejecutada: `fix: improve project navigation and focus recovery`. Descripción: agrega regreso explícito a Projects, idioma/título del documento y foco por intención para apertura, creación, recuperación y navegación; conserva borradores y scroll, evita la superposición de cabecera y orienta el foco tras cargar cambios externos. Valida el recorrido con lint sin advertencias, build y 114 pruebas aprobadas, una opcional omitida; no habilita IA ni cambia persistencia.

**Dictamen final:** candidato local listo para autorización expresa de versionado de Iván, con revisión de GuIA. Índice vacío; main, HEAD y origin/main local sin movimiento. No hubo staging, commit, ramas, worktrees, fetch, push, merge, deploy ni publicación. El versionado no está ejecutado ni autorizado por este dictamen.

## Correcciones autorizadas del Lote 2 — 15/10/2026, candidato local

### Control inicial y cambios

Iván autorizó las tres correcciones propuestas y la reparación acotada de dependencias para lint. Antes de modificar se verificaron main, HEAD y referencia local origin/main en `06045764f397a330d980f3e9e71fb827d629b962`, índice vacío y exactamente los 14 archivos locales previstos. `.abacusai/` y `contexto-Ivan.md` continuaron ajenos, sin lectura/modificación ni cambios de exclusión. Se preservaron copias/huellas de 46 archivos seguidos dentro de un directorio temporal fuera del repositorio. No se detectaron cambios concurrentes o inesperados.

Cambios realizados por Codex en este correctivo, sobre el diff recibido:

- app/src/App.css: `.topbar-start` admite wrap también fuera del breakpoint móvil, manteniendo la grilla existente y el contenido completo. Marca y regreso se distribuyen dentro de la misma celda; sin recortes globales, cambios de tipografía ni rediseño.
- app/src/components/ProjectSidebar.jsx: sólo la activación de un control lateral transmite la intención navigation y el scrollLeft de origen. No se solicita foco al escribir o por un render ordinario.
- app/src/App.jsx: el consumidor de intención restaura scrollLeft en el nav montado y enfoca su control aria-current=page con preventScroll. El onFocus/revealControl existente conserva la holgura del contorno. Al completar loadExternal se solicita el foco heading de Projects; no cambia su lógica de datos, descartes o persistencia.
- app/tests/workflow-browser.test.mjs: se añaden aserciones observables de colisión de cabecera, foco al cargar cambios externos y foco/aria-current/scroll después de cada transición lateral; se conserva la comprobación de contorno previa. No se modificaron one-shot.test.mjs ni trial-ledger.test.mjs ni sus hooks de limpieza.
- contexto.md y este registro: estado, reparación, resultados y límites actualizados. Los otros cambios anteriores del Lote 2 se preservaron byte a byte.

### Reparación exacta del entorno de lint

README de app indica pnpm; manifiesto conserva sus scripts y pnpm-lock.yaml, formato 9, fija eslint-plugin-react-hooks 7.1.1 y zod 4.6.5. Se usó pnpm 11.25.0 disponible en este equipo con `pnpm install --frozen-lockfile --force --ignore-scripts --prefer-offline`; respondió Already up to date y no restituyó el archivo ausente. No se alteró configuración para forzarlo.

Se descargó únicamente el paquete exacto mediante `npm pack zod@4.6.5 --ignore-scripts --pack-destination <TEMP-del-correctivo> --json`, fuera del repositorio. npm se usó como transporte puntual del paquete, no para instalar el proyecto ni generar otro lock. Se verificó el SHA-512 completo del tarball contra la integridad fijada en pnpm-lock.yaml:

`sha512-v5l/aFXZQeai4awLbOpSoHecE9UiMrnfx75tEXLjNonXVARxQ5mOeipTjROUchszUNCqnE+hqAMujRsRHsut2Q==`

Tras comprobar que las 840 entradas pertenecían a package/ y no contenían segmentos de escape, se extrajo con tar --strip-components 1 en el directorio instalado `app/node_modules/.pnpm/zod@4.6.5/node_modules/zod`. Esto restituyó el paquete íntegro y json-schema.cjs sin parchear código de terceros, actualizar versiones ni agregar dependencias. Los SHA-256 de app/package.json y app/pnpm-lock.yaml permanecieron idénticos. No se borraron carpetas del proyecto ni se limpiaron cachés globales; no se leyeron credenciales. El único acceso externo fue la obtención del paquete necesario.

`npm run lint`: finalizó con código 0, **cero errores y una advertencia** react-hooks/exhaustive-deps en app/src/screens/WorkScreen.jsx:36, por selected en el efecto de recuperación. Ese efecto ya estaba en el código recibido y no se modificó bajo estas tres correcciones. Se deja visible para la revisión de versionado, sin desactivar reglas ni atribuir un PASS sin advertencias.

### Verificación final

- Build: PASS, 33 módulos; assets index-Cwu_RGRH.js e index-TIaxFCsK.css.
- Suite con WORKFLOW_UI_TESTS=1: **114 aprobadas, cero fallidas, una omitida**, 115 registradas. Se usó el navegador Edge ya instalado y el puente temporal de ruta del ejecutable documentado en el dictamen anterior; no se instaló un navegador. La omitida es el recorrido opt-in histórico de storage.test.mjs (UI_TESTS no activado).
- El recorrido de workflow, pertinente por los cambios de navegación y conflicto, mantuvo PASS para borradores por proyecto/propuesta, continuidad/descarte, creación y reintento sin duplicación, solicitud literal, F08 mínimo y selección exacta F09. Registra 60 medidas de layout sin desbordamiento, cero colisiones de cabecera en esos estados y 36 transiciones laterales en los seis anchos, ahora con aserciones adicionales posteriores a Enter: foco en el control activado, aria-current conservado, contorno completo y scroll horizontal/vertical preservado (tolerancia de 1 px).
- Retest focalizado independiente de cabecera: seis pantallas de proyecto con nombre largo sin espacios a 320, 390, 901, 1024, 1025 y 1280 px, **36/36 casos sin superposición entre marca/regreso/título ni desbordamiento**, con contorno completo del regreso dentro del viewport. Se inspeccionó captura a 1025 px. No se ocultó contenido.
- Teclado de Sidebar: Tab/Shift+Tab/Enter comprobados antes y después de cada transición. No se mueve el foco al h1. Edición adicional de un borrador mediante teclado mantuvo el foco en textarea durante los re-renders, sin restauraciones laterales repetidas.
- Conflicto entre dos pestañas de un contexto ficticio: la segunda guardó revisión y texto externo distintos, generando el evento storage real. Continuar mediante teclado conservó literalmente el borrador, mantuvo Guardar y aceptar deshabilitado y restauró el foco al disparador Cargar cambios externos. Tras volver a solicitar carga y Descartar y salir con Enter, Projects mostró el estado externo, desapareció el conflicto y el h1 Tus proyectos recibió foco con contorno sólido. Al reabrir Work no quedaba un editor/borrador. El arreglo no cambió el raw externo ni la lógica de persistencia.
- Navegadores/contextos descartables, datos ficticios, tráfico de la aplicación restringido a loopback, cero intentos externos y cero errores/advertencias de consola en el recorrido automatizado. Sin servicios de IA, credenciales, registro económico privado, Notion, Figma o Pizarra. No hay lector de pantalla en esta verificación; tampoco se probaron zoom, otros motores ni conformidad integral de accesibilidad.

Los dos fallos de separadores de ruta se conservan como **antecedente independiente**, reproducidos en base y candidato durante el dictamen anterior. No se repitió esa reproducción porque las correcciones no tocan esos archivos ni su comportamiento; no se alteraron pruebas o entorno para ocultarlos. El entorno ordinario y la suite actual pasaron sus hooks de limpieza.

Evidencia temporal local: `%TEMP%/copilot-lote2-fix-MMcmRx/` contiene copia previa/huellas, tarball verificado, header-results.json, keyboard-conflict-results.json y header-fixed-1025.png. No es una nueva fuente canónica ni parte del candidato Git. El Vite existente de 127.0.0.1:5183 se conservó; el servidor efímero del test se cerró por la propia prueba.

**Dictamen:** las tres correcciones autorizadas están comprobadas; candidato listo para revisión de versionado de GuIA/Iván, con la advertencia de lint explícita. El Lote 2 continúa local y sin publicar. El diff total ahora incluye los 14 archivos previos más ProjectSidebar.jsx y workflow-browser.test.mjs; sólo seis archivos fueron editados en este correctivo. Índice vacío, HEAD/main/origin/main local sin movimiento. No hubo staging, ramas, worktrees, commit, fetch, push, merge, deploy o publicación. La revisión/decisión de versionado es el siguiente gate; este dictamen no la ejecuta.

## Dictamen Codex anterior del Lote 2 — 15/10/2026, previo a las correcciones

### Restauración, alcance y preservación

Raíz local verificada: `C:/Users/Ivan/OneDrive`. Se consultaron AGENTS global, mapa transversal, AGENTS del TP, README, app/README, contexto y este registro. Git se verificó sin fetch: rama main, HEAD y referencia local origin/main en `06045764f397a330d980f3e9e71fb827d629b962`; índice vacío. La versión funcional publicada sigue siendo documentalmente `e2befd6a9d1e7046a5af73d7b80d6427e05aa841`; no se consultaron alojamientos ni servicios externos.

El diff recibido comprende exactamente 14 archivos: app/index.html; app/src/App.css; app/src/App.jsx; app/src/components/TopBar.jsx; las ocho pantallas Activity, Decisions, Deliverables, Overview, Sources, Work, NewProject y Projects; contexto.md y este registro. Antes de esta revisión: 144 inserciones y 38 eliminaciones. No se leyó contenido ni se modificaron `.abacusai/` o `contexto-Ivan.md`, tampoco exclusiones. Se preservó el diff de Abacus. Codex sólo actualizó los dos documentos autorizados; no editó código, estilos, pruebas, manifiesto ni lockfile, ni reparó dependencias. SHA-256 de los 41 archivos seguidos de código/configuración/pruebas inspeccionados se mantuvo idéntico durante la revisión. No se detectaron cambios concurrentes.

Se verificó la correspondencia del Vite existente en 127.0.0.1:5183, PID 11772: su línea de comando apunta al vite.js del app canónico. Se contrastaron idioma/título y fuente servida del lote. Se utilizaron contextos nuevos con datos ficticios; no se dependió del almacenamiento o sesión de Abacus ni se detuvo su proceso. El recorrido opcional existente abrió y cerró además su propio servidor en un puerto efímero.

### Hallazgos y correcciones propuestas, no implementadas

| Prioridad / hallazgo | Ubicación | Reproducción y resultado | Corrección mínima propuesta |
| --- | --- | --- | --- |
| P2 — cabecera nueva se superpone | app/src/App.css:35, :50 y :68; TopBar.jsx:4 | Abrir un proyecto y enfocar el regreso a 901, 1024, 1025 o 1280 px. La marca y el nuevo botón comparten una columna fija de 220 px sin wrap fuera del breakpoint móvil. El botón llega a x=303,06 y el título comienza en x=272: solapamiento de 31,06 px con nombre normal. Captura inspeccionada a 1025 px confirma texto y contorno invadiendo el título. También se reproduce en las seis secciones con nombre largo. No hay desbordamiento del documento. Es una regresión del Lote 2. | Permitir wrap dentro de `.topbar-start` también en escritorio para mantener marca/regreso íntegramente en su celda, sin cambiar la grilla ni ocultar contenido. Retestar altura, nombre largo, botones y contorno en los seis anchos. |
| P2 — foco lateral cae a body | app/src/components/ProjectSidebar.jsx:44; app/src/App.jsx:199 | Enfocar Work en Overview y pulsar Enter: Work se muestra, pero activeElement es BODY. Cada Screen desmonta/remonta su Sidebar y navigate no recibe acción de foco. El problema es preexistente, confirmado ahora, y contradice la premisa de que el control permanece montado. Los 36 checks existentes de foco evalúan el control antes de activarlo; no prueban la conservación tras la transición. | Pasar una intención de foco sólo desde el click lateral y, después del montaje, enfocar el control activo de la nueva `.project-nav` con preventScroll. Capturar/restaurar el scroll horizontal del nav de origen y reutilizar revealControl para conservar la holgura de 6 px del contorno, sin desplazamiento vertical innecesario. No mover todos los cambios de sección al h1 ni alterar la selección de F09. |
| P2 — descarte para cargar cambios externos no orienta el foco | app/src/App.jsx:219 y :284–298 | Borrador modificado, conflicto de almacenamiento ficticio, Cargar cambios externos, Descartar y salir mediante Enter. Projects aparece y el borrador se descarta, pero activeElement es BODY. performExit deriva a loadExternal y esa ruta omite requestFocus. El descarte por regreso normal sí enfoca Tus proyectos. Es una omisión de cobertura de F12, no pérdida de datos nueva. | Solicitar la intención heading al completar loadExternal antes de mostrar Projects, reutilizando el consumidor existente. Mantener la limpieza de borradores y el estado externo; probar con y sin borrador y comprobar foco en Tus proyectos. |

No se implementó ninguna de estas propuestas. No se amplió el alcance a copy, ayuda, persistencia, backend ni diseño general.

### Pruebas ejecutadas y resultados separados

| Capa / condiciones | Aprobadas | Fallidas | Omitidas | Resultado |
| --- | --- | --- | --- | --- |
| npm test estándar, entorno actual | 113 | 0 | 2 | PASS; ambos recorridos opt-in omitidos |
| npm test con WORKFLOW_UI_TESTS=1 | 114 | 0 | 1 | PASS; workflow-browser existente ejecutado; storage.test UI_TESTS no activado |
| Base 06045764 extraída, entorno normal | 113 | 0 | 2 | PASS |
| Base 06045764 extraída, TEMP/TMP con `/` | 113 | 2 | 2 | Fallos de cleanup reproducidos |
| Candidato, mismo TEMP/TMP con `/` | 113 | 2 | 2 | Mismos dos fallos de cleanup |
| npm run build | — | — | — | PASS, 33 módulos; assets index-CkeTiTcO.js e index-AXkqAuJp.css |
| npm run lint | — | — | — | BLOQUEADO antes del análisis por dependencia incompleta |

No se suman ejecuciones repetidas ni mediciones de layout como si fueran pruebas unitarias diferentes. Los 117 del informe de Abacus incluyen los dos hooks fallidos; cuando esos hooks no fallan el runner informa 115 casos, no dos tests desaparecidos.

La reproducción de base se realizó con git ls-tree y git show para extraer únicamente archivos seguidos del app a un directorio temporal fuera del repositorio; sin checkout, worktree, ramas, instalaciones ni cambios de pruebas. En ambos árboles, los fallos son `test.after` de app/tests/one-shot.test.mjs:19, aserción :23, y app/tests/trial-ledger.test.mjs:28, aserción :32. path.dirname(dir) entrega backslashes y os.tmpdir() conserva las barras de TEMP/TMP. Se reprodujo modificando sólo el entorno de esos procesos temporales. Las pruebas y dependencias implicadas no forman parte del diff del Lote 2; los archivos de la base provienen de 06045764. Propuesta opcional para otro cambio autorizado: comparar rutas normalizadas/resueltas en las guardas de limpieza, manteniendo la comprobación del prefijo del directorio; no suprimir el hook ni ocultar fallos.

Lint: el manifiesto declara eslint-plugin-react-hooks ^7.1.1; el lock fija 7.1.1 y su dependencia zod 4.6.5. La instalación disponible se identifica como Zod 4.6.5, pero `v4/core/index.cjs:51` requiere `./json-schema.cjs`, ausente en disco. ESLint 10.12.0 falla durante la carga del plugin antes de revisar fuentes. No es un diagnóstico del código del lote. Paso mínimo pendiente de autorización: restaurar/reinstalar las dependencias de desarrollo completas con el lockfile congelado, sin actualizar versiones, y repetir lint. No se ejecutó instalación, reparación manual ni cambio de configuración para eludirlo.

### Navegador, teclado y layout

Edge instalado en Program Files (x86), headless mediante Playwright ya disponible en el runtime del equipo. La resolución channel msedge de Playwright buscaba una ruta inexistente en AppData; se proporcionó la ruta real del ejecutable en un puente temporal fuera del repo. Las pruebas originales quedaron intactas; el puente sólo resuelve el runtime del navegador. No se instaló software. El recorrido workflow-browser produjo PASS con 60 mediciones de layout, 36 comprobaciones de foco antes de activación, un diálogo beforeunload, cero intentos externos y cero errores/advertencias de consola. Se mantuvieron sus bloqueos de red por origen. No se intentó eludir la denegación de herramientas de la sesión anterior de Abacus: se usó la herramienta independiente disponible en esta sesión.

Cobertura funcional verificada sin repetir la auditoría integral:

- Crear, fallo de escritura/reintento con el mismo candidato, doble clic/Enter repetido, respaldo y recarga sin duplicación; F08 mínimo conserva texto literal significativo y rechaza sólo blancos: PASS.
- Borradores por proyecto/propuesta, navegación entre secciones, descarte individual, aviso al salir, conservación literal al continuar y limpieza al descartar: PASS. Fuera de v0.3/backup, con pérdida prevista al recargar; no cambia la persistencia.
- F09: primera, segunda, pendiente/resuelta y nueva selección desde Sources; destino inexistente o ajeno sin sustitución silenciosa: PASS. F01: regreso visible desde las seis secciones y protección de borradores: PASS funcional, con defecto de cabecera indicado.
- F11: lang es y título AI Discovery Copilot: PASS. F12 se probó mediante Tab, Shift+Tab y Enter enviados por page.keyboard, no mediante dispatchEvent o clic de JavaScript: apertura/creación enfoca Overview; New Project enfoca Nombre; cancelar enfoca Nuevo proyecto; regreso normal/descarte a home enfoca Tus proyectos; recuperación a Sources enfoca su h1; selección explícita desde recuperación enfoca el h2 de la primera propuesta.
- Continuar mediante teclado desde Work restaura el disparador visible; al venir desde Overview remonta Work y usa el fallback h1 conservando el texto. Tab/Shift+Tab entre Continuar y Descartar conserva el contorno sólido. Continuar ante conflicto conserva borrador y bloqueo, con foco en Cargar cambios externos. Descartar ante conflicto y navegación lateral fallan la orientación del foco, según hallazgos.
- Los destinos inválidos de recuperación se indujeron invocando el callback real de Sources desde su componente en memoria, con datos ficticios; los pasos de recuperación y selección se ejecutaron por teclado sobre App real. Una prueba preliminar de creación posterior a un evento storage sintético que no se había persistido quedó contaminada por el desfase de revisión y se descartó; repetida en un contexto independiente, creó un solo proyecto y enfocó Overview. No se atribuye ese conflicto artificial al producto.
- Comprobación adicional: 48 mediciones de ocho pantallas a 320, 390, 901, 1024, 1025 y 1280 px con nombres de proyecto largos sin espacios; cero desbordamientos de página. En las seis vistas de proyecto, el regreso mantuvo su contorno dentro del viewport. Se detectó colisión con el título en 24 casos (seis secciones por cuatro anchos desktop), pese a scrollWidth correcto. Las seis mediciones con nombre normal confirman el mismo defecto desde 901 px. Layout no se declara PASS global.

Evidencia temporal local del 15/10: `%TEMP%/copilot-lote2-review-SWs3P5/` conserva copia aislada de base, salidas base-normal/base-slash/current-slash, review-results.json, long-layout.json y header-1025.png inspeccionado. Es evidencia temporal del equipo, no una nueva fuente canónica ni parte del versionado. No se accedió a credenciales, registro económico privado, sesiones personales ni IA. No hubo llamadas a servicios externos, Notion/Figma/Pizarra, staging, commit, fetch, push, merge, despliegue o publicación. El Vite original sigue ajeno a la gestión de esta revisión.

**Dictamen y siguiente gate:** Lote 2 local, no cerrado y no listo para versionar. Revisión de GuIA y autorización de Iván para la corrección mínima de cabecera, foco lateral y foco al cargar cambios externos; por separado, restauración de dependencias para completar lint y decisión sobre las guardas de cleanup. Después, retest focalizado de esos defectos sin repetir indiscriminadamente lo ya suficiente. Lector de pantalla, zoom, otros motores y accesibilidad integral no se verificaron. No se modificó el estado económico ni se autorizan generaciones.

## Estado vigente — Lote 1 publicado y cierre documental, 15/10/2026

Versión funcional publicada: `e2befd6a9d1e7046a5af73d7b80d6427e05aa841`. Este cierre sólo concilia documentación; no cambia código, estilos, pruebas, configuración ni assets y no repite el smoke funcional. Los apartados siguientes distinguen la auditoría, implementación local, commit, publicación, smoke y límites; los estados locales anteriores quedan como antecedentes, no pendientes vigentes.

### Auditoría e implementación

La auditoría UX read-only previa constató pérdida de edición al desmontar Work (F02), duplicación en memoria al reintentar creación tras fallo de escritura (F03), navegación desde Sources sin seleccionar la propuesta pulsada (F09) y admisión de solicitudes sólo en blanco (F08 mínimo). No fue un estudio con participantes. Las causas, correcciones y retest local se conservan íntegros en el antecedente de implementación inmediatamente inferior; `app/tests/workflow-integrity.test.mjs` y `app/tests/workflow-browser.test.mjs` conservan las pruebas del contrato.

### Commit e integración publicados

Commit único de diez archivos: `e2befd6`, mensaje `fix: protect workflow drafts and creation retries`, desde la base `c4efe0a`. Se integró `fix/workflow-integrity` en main mediante fast-forward y push normal, sin commit adicional, rebase, squash, amend ni force push. Main y origin/main quedaron en e2befd6 al publicar el lote; la rama se conservó. `contexto-Ivan.md` quedó no seguido, excluido y sin leer/modificar. Los cierres documentales posteriores no cambian la versión funcional.

- [GitHub Actions 38676903164](https://github.com/Ivan-andrade7/ai-product-discovery-copilot/actions/runs/38676903164): completed/success, head_sha e2befd6.
- [GitHub Pages](https://ivan-andrade7.github.io/ai-product-discovery-copilot/): HTTP 200 y recursos correctos.
- [Vercel](https://ai-product-discovery-copilot.vercel.app/): despliegue Production completado; [despliegue 8g9FuR5d9VQ5RoUjrcaguFx2BBMm](https://vercel.com/ivan-andrade/ai-product-discovery-copilot/8g9FuR5d9VQ5RoUjrcaguFx2BBMm), asociado al mismo commit. Alias público comprobado mediante coincidencia de assets.

Ambos sirvieron `index-Cpo93JQh.js` (SHA256 `76d6f41f9a4ba21fe3a5d1afa52ecb9874e559de1de90a052fecff85c49ca10c`) e `index-C2SOjp2r.css` (SHA256 `7fcbcb2db29043976d83909f8ea5ef1d5128f201385b21b2c6958ff1b43d2e9b`), idénticos al build local probado. Búsqueda específica en assets: sin firmas de secretos ni rutas privadas; no acredita seguridad integral.

### Smoke público delimitado de e2befd6

Edge headless, contextos descartables y datos ficticios por origen. Pruebas públicas independientes de las locales; sin almacenamiento personal. No se hicieron llamadas de IA ni se usaron credenciales o registro económico. Las consultas de metadatos de publicación son lecturas separadas del tráfico de la aplicación.

| Comprobación por alojamiento | GitHub Pages | Vercel |
| --- | --- | --- |
| F02: borrador literal entre secciones, separación por proyecto/propuesta, descarte individual y confirmación única | PASS | PASS |
| F02: advertencia al salir con cambios reales; ninguna sin cambios | PASS | PASS |
| F03: creación única, escritura fallida aislada, candidato único, reintento mismo ID, guardado posterior y nueva creación distinta | PASS | PASS |
| F03: doble clic y Enter repetido; respaldo de la copia en memoria | PASS | PASS |
| F09: primera/segunda propuesta, pendiente/resuelta, regreso y nueva selección, proyecto vacío | PASS | PASS |
| F09: identificador inexistente o de otro proyecto, recuperación sin sustitución silenciosa | PASS | PASS |
| F08 mínimo: vacío/espacios/tabs/saltos rechazados; texto breve/no ASCII y extremos literales conservados | PASS | PASS |
| Projects, New Project, Overview, Work, Sources, Decisions, Deliverables y AI Activity; acciones de revisión | PASS | PASS |
| Estado confirmado persistente; demo separado; nuevos proyectos sin propuestas genéricas | PASS | PASS |
| IA pública deshabilitada antes/después de comprobar servicio | PASS | PASS |
| 60 mediciones de layout: scrollWidth === clientWidth | PASS | PASS |
| 36 comprobaciones de foco y activación de navegación | PASS | PASS |
| Consola: errores/advertencias observados | Cero | Cero |
| Solicitudes ajenas al alojamiento en recorridos monitorizados | Cero | Cero |

Anchos focalizados: 320, 390, 901, 1024, 1025 y 1280 px. Diez estados: borrador largo sin espacios, salida, conflicto con borrador, validación, reintento, actividad, recuperación, lectura fallida y dos destinos inválidos. Sin desbordamiento; contorno completo en el scroller/viewport, Tab/Shift+Tab y Enter. No se repitió la auditoría responsive integral. Los destinos inválidos se indujeron mediante el callback publicado de Sources en contextos aislados, no por una ruta pública inexistente ni alterando el producto. Fallos de lectura/escritura y fixtures son instrumentación ficticia, no fallos sobre datos reales ni respuestas de proveedores.

Recarga: un diálogo beforeunload observado por alojamiento; borrador perdido y raw confirmado intacto. Prueba adicional de respaldo/cierre por alojamiento: evento storage sintético aislado para habilitar el respaldo existente; descarga sin el borrador y con workspace confirmado idéntico. Se cerró la pestaña sin ejecutar beforeunload y se abrió otra en el mismo contexto: borrador ausente y estado confirmado conservado. Los borradores son sólo memoria de sesión, fuera de v0.3, decisiones, actividad y respaldos; no se promete recuperarlos tras recarga/cierre ni garantizar la advertencia nativa en toda terminación. No hay importación por interfaz.

Se comprobó además un conflicto real entre dos pestañas ficticias: cargar cambios externos con borrador pidió confirmación; continuar conservó texto y bloqueo, descartar permitió cargar. Esto no elimina la carrera residual de localStorage. Cada dominio mantiene almacenamiento independiente; no se transfirieron datos entre ellos.

### Límites y próximo gate

IA pública deshabilitada; sin nuevas generaciones, credenciales ni acceso al registro económico. Estado conocido histórico: 3/5, halted y permisos consumidos, sin modificación/reconciliación en estos lotes. Un único recorrido real mínimo previo no demuestra calidad general; corpus de cuatro casos sin ejecutar. Sin login, multiusuario, adjuntos, portal ni monetización operativa. Persisten los límites de almacenamiento local, concurrencia, navegador único, falta de lector de pantalla/zoom y ausencia de conformidad integral de accesibilidad o seguridad.

Próximo gate: **Lote 2 — orientación y accesibilidad básica** (F01 regreso explícito a Projects, F11 idioma/título y F12 orientación del foco), no implementado y con autorización separada. Primero auditar el comportamiento y después implementar, respetando la protección de borradores publicada. No incluye microcopy integral, ayuda, espaciado general ni rediseño y no declara accesibilidad integral. El incremento protegido de IA sigue siendo otro objetivo posterior, no iniciado.

## Antecedente — implementación local del Lote 2 antes de versionar, 15/10/2026

Base comprobada antes de modificar: main en 06045764f397a330d980f3e9e71fb827d629b962, archivos seguidos limpios e índice vacío (`.abacusai/.gitignore` y `contexto-Ivan.md` quedaron no seguidos y ajenos, sin leer ni modificar). Alcance: F01, F11 y F12. Este lote quedó sin staging, commit, push ni publicación; HEAD permaneció en 0604576 durante toda la sesión.

### Implementación

- F01: `TopBar.jsx` admite la prop `showBack`; las seis pantallas de proyecto (Overview, Work, Sources, Decisions, Deliverables, Activity) la activan y muestran "← Volver a proyectos" junto a la marca, reutilizando el mismo `onHome`/`requestExit` sin tocar su lógica. Projects y New Project no la reciben. CSS nuevo (`.topbar-start`, `.topbar-back`) envuelve ambos botones en la celda existente de la grilla para no alterar `grid-template-columns`; se agregó una variante compacta dentro del `@media (max-width: 900px)` ya existente.
- F11: `index.html` pasó a `lang="es"` y título estático `AI Discovery Copilot`. Sin título dinámico ni traducción general del resto de la interfaz.
- F12: se agregó en `App.jsx` una infraestructura explícita de foco por intención (`requestFocus` + `focusToken` + un único `useEffect` consumidor), invocada sólo en los sitios acordados: crear proyecto y abrir proyecto mueven el foco al `<h1 tabIndex="-1">` de la pantalla destino (selector genérico `main h1[tabindex="-1"]`, único por ser la única pantalla montada en `<main>`); cancelar New Project devuelve el foco al botón "Nuevo proyecto" (`data-autofocus="new-project"`); "Volver a Sources" desde la recuperación de Work mueve el foco al `<h1>` de Sources; seleccionar la primera propuesta desde la recuperación mueve el foco al `<h2>` de la propuesta mostrada (`selectFirstFromRecovery`, preservando la selección exacta de F09); "Continuar editando" restaura el foco al control que disparó la salida si sigue montado y visible, o cae al `<h1>` de Work si no; "Descartar y salir" reutiliza los mismos destinos de `performExit`. New Project enfoca "Nombre" una sola vez al montar. La navegación lateral (`ProjectSidebar`) no recibe ningún `focusAction` y no se tocó: no hay movimiento de foco agregado por este lote en esa ruta. El aviso de borradores conserva su comportamiento no modal, sin captura de foco; sólo se agregó la captura del elemento disparador (`exitTriggerRef`) para la restauración posterior.

### Verificación realizada

- `npm run build` (vite): PASS, sin errores.
- `npm test` (`node --test tests/*.test.mjs`): 117 casos, 113 aprobados, 2 fallidos, 2 omitidos. Los dos fallos (`one-shot.test.mjs`, `trial-ledger.test.mjs`) son una comparación de separador de ruta (`\\` vs `/`) sobre `os.tmpdir()` en Windows, ajena a los archivos modificados en este lote (no tocan `src/App.jsx` ni las pantallas) y preexistente al margen de este cambio. La prueba opcional `workflow-browser.test.mjs` quedó omitida por no tener Playwright instalado en este entorno (`WORKFLOW_UI_TESTS` no se activó), igual que antes de este lote. No se instalaron dependencias nuevas; las pruebas verificaron cero llamadas de red externas (`assert.equal(network, 0)`).
- `npm run lint` (eslint) no pudo ejecutarse: la instalación local de `eslint-plugin-react-hooks`/`zod` en `node_modules` tiene un módulo faltante (`zod/v4/core/json-schema.cjs`) ajeno a este lote; no se reinstalaron ni agregaron paquetes para no incumplir la restricción de dependencias. **Lint queda sin verificar en este entorno**, no declarado como PASS.
- Verificación manual en navegador (Edge vía MCP) contra `vite` local en `127.0.0.1`, con el workspace demo ficticio existente: confirmado por evidencia de herramienta — `document.documentElement.lang === "es"`; título "AI Discovery Copilot"; botón "← Volver a proyectos" visible en la TopBar de un proyecto; abrir el proyecto demo deja el foco en `<h1 tabindex="-1">Overview</h1>`; montar New Project deja el foco en el input "Nombre" (placeholder "Ej. Discovery v0.1"). Navegación lateral (Overview→Work): el foco no fue movido por código nuevo; al desmontarse la pantalla (cada pantalla monta su propia instancia de `ProjectSidebar`, arquitectura preexistente no tocada en este lote) el foco cae de forma nativa del navegador a `<body>`, no al `<h1>` de la pantalla siguiente. Esto no es una regresión de este lote ni estaba dentro del alcance acordado de F12 corregirlo.
- **No se pudo completar** la verificación en navegador de: foco al cancelar New Project (vuelta a "Nuevo proyecto"), foco en la recuperación de Work (Sources y encabezado de propuesta), restauración de foco en "Continuar editando"/"Descartar y salir", Tab/Shift+Tab/Enter sobre el aviso de borradores, y las mediciones de layout en 320/390/901/1024/1025/1280 px. La herramienta de navegador del entorno denegó de forma intermitente las acciones de interacción (clicks/ejecución) durante la sesión ("Browser permission was not granted"), impidiendo continuar esas comprobaciones; no es un resultado de prueba fallido, es una comprobación no realizada. Estos puntos quedan pendientes de un reintento con la herramienta de navegador disponible.
- No hay lector de pantalla disponible en este entorno: el foco comprobado mediante `document.activeElement` no equivale a anuncio verificado por un lector de pantalla ni a accesibilidad integral.

Dictamen: F01 y F11 verificados en código, build y navegador. F12 verificado parcialmente (dos de seis destinos de foco comprobados en navegador; el resto implementado y revisado en código pero no ejercitado en navegador por la limitación de herramienta señalada). Lote local no declarado como publicado, pendiente de revisión de GuIA y de completar la verificación interrumpida antes de cualquier decisión de versionado.

## Antecedente — implementación local del Lote 1 antes de versionar, 15/10/2026

Base comprobada: main y origin/main en c4efe0ac91a36b8130ca5625cbb5eea51b421282, archivos seguidos limpios e índice vacío. Se creó únicamente la rama local fix/workflow-integrity. Este lote está sin commit y no publicado. La referencia pública previa sigue siendo c4efe0a (cierre documental sobre la versión funcional 08853c5); no se reconsultaron los alojamientos. contexto-Ivan.md continúa ajeno y no seguido; no fue leído ni modificado.

### Causas y correcciones delimitadas

- F02: Work guardaba edición y selección en estado del componente, perdido al desmontarlo. Ahora App mantiene borradores de sesión por proyecto/propuesta, separados del workspace v0.3. Navegar entre secciones o propuestas conserva el texto literal; descartar afecta sólo al borrador elegido. Confirmar es la única operación que crea una decisión y retira ese borrador. La selección se mantiene sobre el elemento revisado para no actuar involuntariamente sobre el siguiente.
- La salida existente a Projects y la sustitución por cambios externos advierten si hay cambios reales, con Continuar editando o Descartar y salir. Abrir un editor sin modificarlo no advierte. Recargar/cerrar pierde los borradores: se solicita la advertencia nativa beforeunload, cuya presentación depende del navegador. No hay persistencia durable de borradores ni cambio de esquema; no forman parte de decisiones, actividad, evidencia o respaldo.
- F03: cada reenvío creaba otro UUID de proyecto. Ahora el intento tiene identidad estable y un candidato inmutable reutilizado al reintentar; los campos quedan congelados después del primer envío válido. Una creación intencional posterior recibe otra identidad, aunque coincidan nombre y texto. Ante fallo sigue disponible la copia en memoria y la exportación existente; recargar sin guardarla/exportarla pierde esa copia y conserva el último estado persistido. No existe restauración por interfaz.
- F09: Sources sólo enviaba el nombre de pantalla. Ahora envía proyecto e identificador de propuesta. Work comprueba ambos; un destino inexistente o ajeno muestra Propuesta no disponible, sin elegir otra silenciosamente. El usuario puede volver a Sources o seleccionar explícitamente la primera disponible.
- F08 mínimo: validación por trim para rechazar espacios, tabs y saltos de línea sin texto. La solicitud significativa se conserva literalmente, sin mínimo arbitrario; el error se asocia al campo sin alterar su nombre accesible.

### Verificación del candidato

- Suite completa con el nuevo recorrido de navegador habilitado: 115 casos, 114 aprobados, una prueba anterior opcional de navegador omitida, cero fallos. Lint y build PASS. No se instalaron dependencias. La batería económica usa archivos ficticios aislados, no el registro privado real.
- Después de ampliar únicamente la prueba de navegador con regresiones de recuperación y foco, se repitieron lint, build y suite completa con el recorrido nuevo habilitado: PASS, nuevamente 114 aprobadas y una opcional omitida. Edge headless, Vite local, contextos descartables y datos ficticios. El recorrido opcional anterior permanece omitido; no se presenta como ejecutado. El puerto fijo 5173 estaba ocupado y no se detuvo ni reutilizó el proceso que lo ocupaba.
- Borrador exacto después de Sources, Overview, Decisions, Deliverables y Activity; aislamiento entre propuestas/proyectos; descarte individual; aviso de salida y ambas alternativas; ausencia de aviso sin cambios; confirmación repetida con una decisión: PASS. El raw v0.3 permaneció idéntico al navegar con borradores.
- Recarga: un diálogo beforeunload observado, borrador eliminado y estado confirmado byte-equivalente. El guardado de una decisión y el entregable sobrevivieron a la recarga; no se garantiza la advertencia ante cierre forzado o terminación del navegador.
- Creación con fallo de escritura, doble clic, Enter repetido, exportación existente y recuperación programática, reintento exitoso con el mismo proyecto completo, nueva creación intencional y recarga: PASS. El respaldo ficticio contenía un único candidato, con solicitud/fuente literales; durante el fallo el raw persistido no cambió. Otra prueba de recarga confirmó que un candidato no guardado se pierde, sin reemplazar datos anteriores.
- Sources: destinos primero, segundo, pendiente, resuelto y nueva selección: PASS. Componente Work con destino inexistente o de otro proyecto: recuperación explícita, sin tarjeta alternativa. Proyecto nuevo vacío y sin propuestas genéricas: PASS. No se simuló una respuesta de proveedor en este recorrido.
- Dos pestañas: una decisión externa bloqueó la copia anterior; cargarla con borrador pendiente pidió confirmación, Continuar conservó el texto y el bloqueo, Descartar permitió cargar. Prueba aislada adicional: reintento contra una revisión más nueva devuelve conflicto sin sobrescribir. No se elimina la carrera residual de localStorage ni se declara exclusión mutua.
- Regresión: aceptar, editar/aceptar, rechazar, pendiente y reabrir; originales, contadores, Decisions, Deliverables, Activity, proyectos independientes y fuentes sin revisar: PASS. Recuperación incompatible conserva el raw; fallo de lectura muestra recuperación.
- Layout focalizado: diez estados por seis anchos (320, 390, 901, 1024, 1025, 1280), 60 mediciones reales con scrollWidth === clientWidth. Incluye borrador largo sin espacios, avisos de salida/conflicto, validación, reintento, actividad, recuperación, lectura fallida y dos destinos inválidos. No se cambió CSS ni se repitió la auditoría responsive integral anterior.
- Foco y Enter: 36 comprobaciones sobre los seis destinos y esos seis anchos, contorno de 3 px completo dentro del scroller o viewport. También Tab/Shift+Tab y Enter en el aviso y acciones nuevas. Sin gestión general de foco entre pantallas, lector de pantalla ni declaración de accesibilidad integral.
- Cero errores/advertencias de consola y cero solicitudes externas en el recorrido monitorizado, con interceptación restrictiva. Generaciones deshabilitadas; no se usaron credenciales, IA real ni registro económico. Estado económico histórico conocido 3/5, halted y permisos consumidos: no se releyó ni modificó.
- Un primer recorrido detectó una asociación de etiqueta alterada por el mensaje de validación: se corrigió con aria-labelledby/aria-describedby. Un segundo fallo pertenecía al arnés de importación de módulos de Vite y se corrigió sólo en la prueba. Los recorridos posteriores completos pasaron; no se acreditan esos intentos iniciales como PASS.

Dictamen: lote local satisfactorio en la cobertura registrada, pendiente de revisión y autorización separada de versionado. Sin staging, commit, push, publicación ni cambios en Notion/Figma. No habilita el incremento protegido de IA ni otros lotes de UX.

## Antecedente — publicación funcional y cierre documental, 14/10/2026

Versión funcional publicada: 08853c5b2b3b51d4d94c9d070d8d2f8756f89889. Contiene exactamente los diez archivos auditados del hotfix y documentación; se integró fix/sources-responsive-hotfix en main mediante fast-forward, sin squash/rebase/amend ni nuevo commit de integración. Push normal; main, origin/main y la rama conservada quedaron en 08853c5, sin divergencia. El cierre exclusivamente documental posterior no cambia el código ni los assets funcionales y se distingue de esta versión.

- [GitHub Actions 38651956942](https://github.com/Ivan-andrade7/ai-product-discovery-copilot/actions/runs/38651956942): completed/success y head_sha 08853c5.
- [GitHub Pages](https://ivan-andrade7.github.io/ai-product-discovery-copilot/): HTTP 200, recursos correctos.
- [Vercel](https://ai-product-discovery-copilot.vercel.app/): Production, Ready/Current; [despliegue 2Y6JkBYkXrQBeGUcT7ksZ5HTB34y](https://vercel.com/ivan-andrade/ai-product-discovery-copilot/2Y6JkBYkXrQBeGUcT7ksZ5HTB34y), commit y alias comprobados.

Ambos sitios sirvieron index-AoXxgLD0.js (SHA256 d92e9e2250b716e96f1932a2c0c5fa8ecdac31cb43b7ca999904e1228381b606) e index-C2SOjp2r.css (SHA256 7fcbcb2db29043976d83909f8ea5ef1d5128f201385b21b2c6958ff1b43d2e9b), idénticos al build probado. Búsqueda específica de firmas de claves y rutas privadas en estos assets: sin hallazgos; no acredita seguridad integral.

### Smoke público delimitado de 08853c5

Edge headless, contextos nuevos y datos ficticios por origen. Esta evidencia pública es independiente del retest local y de las simulaciones. No se hicieron llamadas de IA ni se usaron credenciales o registro económico.

| Comprobación por alojamiento | GitHub Pages | Vercel |
| --- | --- | --- |
| Projects, New Project, Overview, Work, Sources, Decisions, Deliverables, AI Activity | PASS | PASS |
| Crear y abrir proyecto ficticio; propuestas demo separadas | PASS | PASS |
| Proyecto nuevo sin propuestas genéricas ni ejecuciones | PASS | PASS |
| Persistencia byte-equivalente tras recarga y recuperación de fuente ficticia | PASS | PASS |
| IA pública deshabilitada antes/después de comprobar servicio | PASS | PASS |
| 112 mediciones de layout: scrollWidth === clientWidth | PASS | PASS |
| 96 comprobaciones de foco completo, Tab y Shift+Tab | PASS | PASS |
| Enter y aria-current de los seis destinos | PASS | PASS |
| Consola: cero errores/advertencias observados | PASS | PASS |
| Solicitudes a destinos ajenos al alojamiento o servicio IA | Cero | Cero |

Anchos: 320, 360, 390, 430, 901, 1024, 1025 y 1280 px. No se observó desbordamiento de página en demo con decisión/entregable y proyecto personal con nombres, URLs y textos ficticios largos. Scroll horizontal interno utilizable y contorno completo. Cada dominio conserva almacenamiento local independiente; no se transfirieron datos entre dominios.

Un primer instrumento se descartó por consultar executions en lugar del campo real runs. Se corrigió sólo el script temporal; el recorrido posterior completo pasó. No fue un fallo acreditado del producto ni se modificó código para superar la prueba. No se suman layout/foco a las pruebas automatizadas ni al corpus de calidad.

Responsive y foco: cerrados en esta cobertura; no pendiente de versionar/publicar. Límites: sin otros motores, zoom, lector de pantalla ni conformidad integral de accesibilidad o seguridad. El único recorrido real mínimo previo no demuestra calidad general. Corpus de cuatro casos sin ejecutar. Contador conocido 3/5, halted: true, permisos consumidos y sin autorización para nuevas generaciones; este cierre no accedió ni modificó su registro.

Próximo gate: definir un incremento protegido antes de exponer IA a Iván o clientes, con autenticación, backend, secretos, persistencia y controles de uso/costo. La plataforma pública continúa estática y con IA deshabilitada; login, backend remoto, portal, leads y monetización no están implementados. Todo nuevo incremento, llamada de IA, infraestructura o publicación futura requiere alcance y autorización propios. Los antecedentes siguientes conservan los estados y gates al corte de cada lote, no el gate vigente.

## Antecedente — hotfix local de grillas y foco móvil antes del commit, 14/10/2026

Base y HEAD: 73df8870d366d08594dd91c8145e954e6b279497, rama fix/sources-responsive-hotfix. Inicio comprobado: sólo App.css modificado por Abacus, índice vacío y contexto-Ivan.md no seguido. Ese archivo no fue leído, modificado, agregado, movido ni eliminado. No hay commit nuevo del hotfix.

Última publicación comprobada en la sesión previa: 73df887 en GitHub Pages (workflow 38633344247, success) y Vercel (producción 5t6K4SpaQozf951TdiHx4QFFGVPt, Ready/Current). No se reconsultaron los alojamientos en este lote local. La comprobación pública previa se detuvo al encontrar Sources de 936 px en viewport de 901 px; no acredita un recorrido completo en ambos alojamientos. 61704e7 ya está incluido/publicado; b56d9e6 es antecedente. IA pública deshabilitada.

Se conserva el hotfix exacto de Abacus: en max-width: 1024px, overview-feature-grid, overview-content-grid, work-grid, decisions-grid, deliverable-layout y sources-grid se apilan en minmax(0, 1fr). Sources imponía mínimos de 240 + 420 + 24 px incompatibles con los 617 px disponibles a 901 px. Sin cambios de cabecera, paleta, tipografía, contratos, persistencia o IA; sin overflow-x: hidden.

### Antecedente de foco y corrección localizada

El primer retest del hotfix pasó 728 mediciones y 78 posteriores al teclado, pero encontró navegación parcialmente recortada: Decisions a 320/360 px y Deliverables a 430 px. A 320 px se midió Decisions entre x=276,27 y 364,50, con borde del contenedor en x=300 y scrollLeft=0; el contorno de 3 px era visible sólo parcialmente. Enter funcionaba. La misma geometría fue reproducida con el CSS base 73df887; no era regresión del hotfix.

Causa comprobable: el scroll automático de foco dejaba un botón parcialmente visible y el scroller no reservaba el espacio del outline de 3 px más su offset de 3 px. No se atribuye una causa interna adicional al motor del navegador. Corrección: padding y scroll-padding-inline de 6 px únicamente en navegación móvil; ProjectSidebar desplaza sólo ese contenedor cuando el control enfocado o activo queda fuera de sus límites útiles. Desplazamiento instantáneo, sin mover otros contenedores ni cambiar destinos. Se conservan scroll horizontal interno, controles de 44 px, indicador de 3 px, ruta activa y paleta.

### Retest del código corregido

- Automatizadas: 101 casos, 100 aprobados, una opcional de navegador omitida, cero fallos. Lint y build PASS; interceptores bloquearon salida externa y registraron cero intentos. Sin instalaciones.
- Layout real del build estático en Edge headless, origen loopback, contextos aislados: 56 escenarios por 13 anchos, 728 mediciones. En todos, document.documentElement.scrollWidth === document.documentElement.clientWidth. Las cifras del retest anterior se conservan separadas, no se usan para acreditar este código.
- Vistas: Projects, New Project, Overview, Work, Sources, Decisions, Deliverables y AI Activity. Demo, nuevos proyectos vacíos, nombres de 49/183/1040 caracteres, cadenas continuas, URLs, fuentes seleccionadas y aportadas, citas, títulos/contenido/justificación largos, edición, decisiones y entregables poblados, actividad y formularios. Recuperación por JSON inválido, errores de lectura/guardado y conflicto entre pestañas provocados exclusivamente en almacenamiento aislado.

| Ancho/clientWidth | scrollWidth en los 56 escenarios | Resultado |
| --- | --- | --- |
| 320 | 320 | PASS |
| 360 | 360 | PASS |
| 390 | 390 | PASS |
| 430 | 430 | PASS |
| 768 | 768 | PASS |
| 880 | 880 | PASS |
| 899 | 899 | PASS |
| 900 | 900 | PASS |
| 901 | 901 | PASS |
| 902 | 902 | PASS |
| 1024 | 1024 | PASS |
| 1025 | 1025 | PASS |
| 1280 | 1280 | PASS |

- Teclado/foco: recorrido real de las seis opciones con Tab y Shift+Tab a 320, 360, 390, 430, 901, 1024, 1025 y 1280 px: 96 comprobaciones del control y contorno completo. En móvil se midieron los cuatro bordes incluyendo outline/offset contra el scrollport; en escritorio, donde la navegación no recorta overflow, contra el viewport. Foco de 3 px y :focus-visible PASS. Las 48 activaciones individuales de destinos mediante Enter conservaron el encabezado correcto y aria-current=page.
- Dos ejecuciones preliminares del instrumento se descartaron: una comenzó con foco programático sin modalidad de teclado, otra trató equivocadamente la caja de navegación de escritorio como área de recorte. No son fallos adicionales del producto ni resultados usados como PASS.
- Aceptar, editar/aceptar, rechazar, mantener pendiente y reabrir mediante Enter: PASS. Decisions y Deliverables poblados; persistencia byte-equivalente tras recarga y contenido editado recuperado: PASS. El registro de actividad y originales se conservaron en los fixtures.
- Consola: cero errores/advertencias y cero solicitudes externas en los recorridos. Sin servicio de IA, claves ni análisis real; comprobar servicio mantuvo el análisis deshabilitado, sin contenido ficticio de fallback.
- Inspección visual: contorno completo de Decisions en captura local ficticia a 320 px; Sources había sido inspeccionado en capturas del retest anterior a 901/1024/1025 px. No se presenta esa inspección anterior como captura del nuevo build. Los fixtures de ejecuciones/propuestas son simulaciones sólo de prueba, no respuestas nuevas ni evaluación de calidad.

Se conciliaron AGENTS, README principal/app, contexto, matriz, inventario y borrador; no se generó PDF ni se modificaron Notion/Figma. Se mantienen un único registro de verificación y los antecedentes fechados. Contador histórico 3/5, ambos permisos consumidos, halted: true, tokens no disponibles y 21,3 créditos diarios sin atribución individual: no se accedió ni modificó el registro económico en este lote. Ninguna nueva generación está autorizada.

Dictamen: hotfix local de grillas y foco satisfactorio en la cobertura probada, listo para revisión y autorización de commit local; sin staging, commit, push ni publicación. Próximo gate: versionado local autorizado por separado. Límites: Edge headless, sin lector de pantalla, zoom ni otros motores; no conformidad WCAG integral, seguridad global ni calidad general del modelo. Corpus de cuatro casos no ejecutado.

## Antecedente del cierre documental previo a publicación — 14/10/2026

Último commit local existente: 61704e7. Cabecera, Work, textos y cierre documental posteriores están corregidos, probados y todavía sin commit; el candidato está listo para commit local con autorización separada. Los dos bloqueantes responsive identificados están resueltos en los retests registrados, no se declara cobertura universal. Público comprobado: b56d9e6 en ambos alojamientos mientras no haya push; IA pública deshabilitada.

Existe un único caso ficticio real exitoso del recorrido mínimo, independiente de las simulaciones; primer intento fallido conservado, respuesta histórica type string intacta, cuatro casos del corpus sin ejecutar. No valida calidad general, seguridad integral ni accesibilidad completa. Contador 3/5, halted: true, ambos permisos consumidos, tokens no disponibles y créditos agregados sin atribución individual; no se autorizan nuevas generaciones.

Próximo gate: autorización específica de commit local; push y publicación requieren otra autorización. Se conciliaron las frases de bloqueo de otros documentos sin cambiar código ni repetir pruebas en este lote documental. Las secciones fechadas siguientes son registros al corte de cada lote: sus fallos, pendientes y dictámenes históricos no describen automáticamente el estado actual.

## Reflow mínimo de Work alrededor de 901 px — 14/10/2026

Se conserva el FAIL anterior: Work medía 936 px en un viewport de 901 px. Causa comprobada: work-grid exigía un mínimo conjunto de 240 + 420 + 24 px dentro de una columna principal que a 901 px sólo dispone de 617 px. El mínimo de 420 px pertenece a la segunda columna, que contiene proposal-review; no era un fallo de la cabecera.

Corrección exclusivamente en App.css: media query max-width: 1024px para apilar work-grid en minmax(0, 1fr). La regla móvil previa continúa aplicándose hasta 900 px y las dos columnas se conservan desde 1025 px. No se modificaron la cabecera ya corregida, tipografía, paleta, contenido, contratos, almacenamiento, IA ni historiales. Sin recorte ni overflow-x: hidden.

Prueba focalizada sobre el build estático en Edge headless, contexto aislado y sin servicio privado: seis escenarios por doce anchos, 72 comprobaciones. Estados: demo pendiente, aceptado, edición larga, editado/aceptado, rechazado, y fixture ficticio con título, propuesta, justificación, cita literal y fuente extensa sin espacios. En todos los casos document.documentElement.scrollWidth igualó innerWidth y el panel de revisión no desbordó su contenedor.

| Viewport | Documento | Resultado en los seis escenarios |
| --- | --- | --- |
| 320 | 320 | PASS |
| 360 | 360 | PASS |
| 390 | 390 | PASS |
| 430 | 430 | PASS |
| 880 | 880 | PASS |
| 899 | 899 | PASS |
| 900 | 900 | PASS |
| 901 | 901 | PASS |
| 902 | 902 | PASS |
| 1024 | 1024 | PASS |
| 1025 | 1025 | PASS, dos columnas |
| 1280 | 1280 | PASS, dos columnas |

Aceptar, editar/aceptar, rechazar, mantener pendiente y reabrir mediante Enter: PASS. Persistencia byte-equivalente tras recarga y entregable con el texto editado: PASS. Se comprobaron 23 pasos de Tab sobre controles con foco visible de 3 px y en pantalla; incluyen repetición al ciclar, no 23 controles únicos. El paso por BODY se separó de los controles. Comprobar servicio en el build público equivalente mantuvo el análisis deshabilitado. Cero solicitudes externas y cero errores/advertencias de consola en el recorrido. El fixture es sólo evidencia local de layout, no respuesta real ni evaluación de modelo.

Suite completa: 100 aprobadas y una opcional de navegador omitida; lint y build PASS, con interceptores que bloquearon red externa y registraron cero intentos. El recorrido focalizado es evidencia separada de esa suite. git diff --check PASS. Registro económico leído sólo para comparación: misma huella antes/después; proceso nuevo mantiene 3/5, ambas autorizaciones consumidas, halted y externalEnabled: false.

Sólo App.css y este registro se modificaron en el lote adicional. Se conservaron los cambios locales anteriores. Archivo ajeno no seguido: contexto-Ivan.md, intacto y expresamente excluido de cualquier futuro commit del candidato; su huella permaneció igual. Sin staging, commit, push ni publicación.

Dictamen actualizado: bloqueante responsive de Work resuelto en la cobertura probada; candidato técnico apto para revisión/versionado local. Las frases de bloqueo del lote anterior en otros documentos quedan como pendientes de conciliación, sin editarlas bajo esta autorización limitada al registro. Publicación sigue requiriendo autorización separada y cierre documental coherente. No se declara accesibilidad integral, seguridad global ni calidad general del modelo.

## Corrección local de cabecera, textos y referencias — 14/10/2026

Base 61704e7, sin cambios en consumo ni almacenamiento. La auditoría previa confirmó b56d9e6 en ambos alojamientos y encontró desbordamiento por nombres largos: 458 px de página a 390 px con un nombre de 49 caracteres. Se conserva ese FAIL como antecedente; los PASS previos no cubrían este extremo.

Corrección mínima: topbar-title con min-width: 0 y overflow-wrap: anywhere; columna móvil minmax(0, 1fr). Sin ocultamiento global, recorte, reducción tipográfica ni cambio de paleta. Work distingue el servicio público ausente del arranque local bloqueado; Activity diferencia esos estados de los ensayos anteriores registrados. No se alteraron eventos, originales, propuestas ni el contrato estricto. Se actualizaron referencias a 61704e7 local y b56d9e6 público; la decisión integral concurrente de contexto se preservó, junto con contexto-Ivan.md sin intervenir.

Pruebas automatizadas locales: 100 aprobadas, una opcional omitida; lint y build PASS. Red externa bloqueada por interceptores: cero intentos. La prueba opcional omitida no sustituye el recorrido separado siguiente.

Build estático en Edge headless, contexto aislado, sin clave ni servicio privado: 37 escenarios / 222 comprobaciones de layout a 320, 360, 390, 430, 900 y 1280 px, sin desbordamiento en esos escenarios. Projects, formulario, Overview, Work, Sources, Decisions, Deliverables y Activity; nombres de 49, 183 y 1040 caracteres; texto fuente/solicitud sin espacios, edición, decisiones/entregable poblados, conflicto con nombre largo, JSON inválido, errores de lectura y guardado. El título completo no desborda su contenedor. Aceptar, editar, rechazar, pendiente y reabrir mediante Enter y persistencia tras recarga: PASS. Tab en controles del aviso de conflicto mantuvo foco visible de 3 px. Análisis deshabilitado antes/después de comprobar servicio. Cero solicitudes externas y cero errores/advertencias de consola en este recorrido.

Textos históricos: fixture completamente ficticio con una ejecución rechazada y otra válida conservó type string y la procedencia indicada, sin frases absolutas sobre ausencia de llamadas anteriores. Es una simulación de presentación de historial, no una generación ni evaluación real del modelo. El único caso real previo sigue como evidencia independiente.

Límite nuevo comprobado: a 901 px, Work con el demo normal mide 936 px de página. La causa es su grilla con minmax(240px, 300px) + minmax(420px, 780px) + gap, no la cabecera. Esa regla ya existe en 61704e7 y permanece intacta. Se detuvo la extrapolación de PASS a ese ancho; no se cambió la grilla por ampliar el lote de cabecera. Dictamen: cabecera corregida en cobertura probada, pero candidato todavía no listo para publicar por este desbordamiento distinto.

No se declara accesibilidad integral, calidad general de IA ni cumplimiento académico definitivo. No se repitió una generación real ni el corpus de cuatro casos. Contador 3/5, permisos consumidos y halted permanecen; la reconciliación individual sigue pendiente. Sin staging, commit, push ni publicación; este lote no modifica la versión pública.

## Cierre local de tipos y documentación — 14/10/2026

El segundo intento real conservó `type: "string"`. La revisión comprobó que el prompt mostraba ese literal como ejemplo y el contrato aceptaba cualquier texto; el adaptador no lo normalizaba. El valor pertenece a la respuesta del proveedor, no a una sustitución local. No hay evidencia para determinar por qué el modelo eligió copiarlo: la influencia del ejemplo es una explicación plausible, no una causa interna comprobada.

`type` se conserva como etiqueta semántica legible, coherente con `certainty`: Afirmación/evidence, Hipótesis/hypothesis y Pregunta/question. Se corrigió el mensaje preparado y se exige el par exacto en nuevas respuestas. Genéricos, desconocidos y pares inconsistentes se rechazan en estructura con `invalid_type`; campos ausentes o vacíos con `invalid_fields`. No hay reparación, referencias fabricadas ni llamada adicional. No se añade `inference`; evidence exige cita y revisión, no valida una deducción como hecho textual.

No se migra almacenamiento ni se modifica la respuesta histórica. La lectura y exportación de estados anteriores siguen conservando literalmente `string` y originales; la aceptación histórica no se presenta como validación bajo el contrato nuevo. La compatibilidad de lectura no flexibiliza la entrada de respuestas nuevas.

Pruebas locales del código corregido: comando estándar 101 casos, 100 aprobados, una prueba opcional de navegador omitida y cero fallos; lint y build PASS. El archivo `proposal-types.test.mjs` aporta 12 casos: pares válidos, genérico/ausente/desconocido/inconsistente, mensaje preparado y rechazo del adaptador, y lectura/exportación/decisión/guardado conservadores de un v0.3 ficticio histórico. Interceptores de red de esa batería comprobaron cero tráfico externo. No se repitió el recorrido real ni se ejecutó el corpus; las cifras históricas de navegador y layout no se suman a estos casos.

Una lectura desde un proceso nuevo confirmó 3/5, halted: true, arranque budget_blocked y externalEnabled: false. El hash del registro económico antes/después de esa lectura fue idéntico. No se accedió a credenciales ni se modificó el registro. Ambas autorizaciones permanecen consumidas. El presupuesto original de 140 créditos sigue condicionado; las excepciones históricas no constituyen garantía económica ni habilitan futuros intentos.

La evidencia real sigue siendo un único caso ficticio exitoso (HTTP 200, claude-sonnet-4-6, stop, tokens no disponibles), separado de las simulaciones. Saldo 13.897 → 13.889 y 21,3 créditos API diarios del 13/10 son agregados no atribuibles a una llamada. Calidad general, resistencia adversarial, seguridad integral, login, multiusuario, adjuntos, leads, portal y monetización no están validados/implementados. Permanecen rótulos heredados de UI sobre ausencia de llamadas, ya registrados como limitación; no se amplía este lote para corregirlos.

Cambios de este cierre: contracts, diagnóstico, prompt Abacus, fixture ai-flow, pruebas proposal-types; README principal/app, contexto, matriz, borrador y corpus. Los demás cambios pendientes de transporte/control pertenecen a lotes anteriores y se preservan. Sin staging, commit, push ni publicación. La versión pública no cambia.

## Cierre del segundo intento real — ejecución 13/10, comprobación final 14/10/2026

Se realizó exactamente una generación adicional desde Work. Solicitud económica `d37b7e42-b53d-41d3-969a-905e9ce1474e`, número 3/5; ejecución del proyecto `8a288daf-6777-40b9-985e-3b71a9cfa4d6`. Modelo solicitado e informado: `claude-sonnet-4-6`; HTTP 200, finalización `stop`, sin diagnóstico de rechazo y uso de tokens no disponible. El permiso nuevo quedó consumido antes del envío; el catálogo y el primer intento fallido permanecen conservados. No hubo reintentos, catálogo adicional, reparación, router ni sustitución.

La solicitud breve pidió una sola propuesta evidence; sólo se seleccionó “Registro ficticio breve”, de menos de 1.000 caracteres. La solicitud original quedó deseleccionada como fuente y viajó en su mensaje separado conforme al adaptador; salida máxima solicitada 500 tokens, sin streaming ni herramientas. La respuesta pasó JSON, estructura y referencias literales. Su afirmación conservó diez consultas y cuatro preguntas sobre recepción; la justificación señaló ausencia de tiempos y ventas. Esto demuestra fidelidad preliminar en este caso sencillo. El campo libre `type` devolvió el literal `string`: técnicamente válido, pero etiqueta poco útil; se registra como limitación de calidad/instrucción, sin editar el original ni modificar el contrato.

Se revisó el contenido y el asistente ejecutó una aceptación de prueba autorizada. Decisions mostró una acción, original preservado y cambio pendiente → aceptada; Deliverables mostró un bloque con origen de modelo y cita de la fuente ficticia. No fue una evaluación independiente con participantes. El 14/10 se reabrió la interfaz local con el servicio privado cerrado: Projects conservó una decisión, Deliverables conservó el bloque y AI Activity conservó ejecución y aceptación. Persistencia comprobada en ese navegador/origen; no sincronización remota.

Consumo: antes del segundo intento, saldo global 13.897 (103 usados); al cierre del 14/10, 13.889 (111 usados), diferencia global de 8 créditos. El panel diario muestra 21,3 créditos de RouteLLM API el 13/10; es un agregado de equipo/día sin identificador de solicitud. No se atribuye exclusivamente la diferencia de 8 al segundo intento ni el agregado a una solicitud concreta. Se conserva también la diferencia histórica de 14 del primer intento. Los cargos individuales de catálogo y ambas generaciones siguen `null`, sin reconciliación inventada ni conversión de tokens.

Antes del envío se verificó Auto Refill desactivado y Metering ya activo, sin modificar facturación. El cierre verificó que no queda ningún proceso `one-shot-runner.mjs`; no se recuperó su clave, que desapareció al terminar el proceso. Desde un proceso nuevo, registro 3/5, `halted: true`, segunda excepción consumida/no disponible, arranque normal `budget_blocked` y `externalEnabled: false`. Ninguna nueva generación está autorizada o habilitada.

Preparación local: 88 pruebas aprobadas, una opcional omitida; lint/build PASS (registro de preparación siguiente). Este cierre no repitió la batería ni ejecutó el corpus de cuatro casos. Alcance demostrado: conexión real, respuesta válida, incorporación, acción de revisión y entregable persistente en un caso ficticio mínimo. No demuestra calidad general, resistencia adversarial, seguridad integral ni plataforma multiusuario. Los rótulos fijos heredados sobre “sin llamadas” siguen siendo una contradicción conocida de UI, documentada sin corregir en este lote. Sólo se actualizó este registro durante el cierre; sin commit, push, despliegue ni Notion/Figma.

## Preparación del segundo intento real — 13 de octubre de 2026

Iván autorizó una única generación adicional con créditos exactos desconocidos, `claude-sonnet-4-6`, una fuente ficticia de hasta 1.000 caracteres y salida máxima solicitada de 500 tokens. Antes de ejecutar, el panel mostró 13.897 créditos (103 usados), Auto Refill desactivado y Metering ya activo. No se modificó facturación ni se consultó el catálogo.

Se persistió una nueva autorización `ivan-2026-10-13-second-generation-unknown-credits`, sin reutilizar la anterior. Estado de preparación: 2/5, primer intento fallido intacto, primera excepción consumida, nueva autorización pendiente y `halted: true`. Se comprobó por comparación programática que ambos registros históricos quedaron idénticos. El inicio normal permanece bloqueado incluso con la autorización pendiente; sólo el runner privado puede reservar la solicitud 3 bajo ese permiso. La reserva consume el permiso antes del envío, conserva `halted: true` y bloquea generaciones posteriores.

Se añadió conservación saneada de `finishReason` y diagnóstico por etapa en la ejecución y en los metadatos del nuevo intento, sin guardar texto del proveedor, claves ni fuentes en el registro económico. Pruebas locales: 88 aprobadas y una opcional de navegador omitida; lint y build PASS. Los casos ficticios de éxito y rechazo verificaron preservación histórica, 3/5, motivo de finalización, diagnóstico y cierre tras reapertura del registro. Todavía no se ejecutó este segundo intento: queda pendiente la introducción personal de la clave en el diálogo privado.

## Diagnóstico local del rechazo real — 13 de octubre de 2026

Se inspeccionaron exclusivamente el código del TP, el registro autorizado del intento y este documento. No se accedió a credenciales ni a registros ajenos, no se recuperó una respuesta desde servicios y no hubo llamadas externas.

### Qué permite concluir la evidencia histórica

Comprobado: el intento 2 recibió HTTP 200, conservó `claude-sonnet-4-6` como modelo informado y terminó `invalid`, sin uso de tokens disponible. El transporte pudo leer el JSON externo y su campo de modelo; por eso un JSON externo ilegible, una respuesta externa `null` y el límite de tamaño previo a ese parseo no explican este intento según el recorrido observado. El modelo informado coincide con el solicitado.

La respuesta original y la etapa de rechazo no se conservaron. No puede determinarse cuál de estas alternativas ocurrió: contenido ausente/no textual/demasiado largo, JSON interno inválido, estructura inválida o referencias inválidas. Markdown alrededor del JSON y el literal `evidence|hypothesis|question` son posibilidades reproducidas con datos ficticios, no causas acreditadas de la respuesta real. El uso `null` no demuestra por sí solo si el proveedor omitió los tokens o si estaban en un formato no reconocido. No se reconstruyó ni reclasificó el intento histórico.

### Defectos demostrados y corrección

- Un JSON externo válido pero `null` hacía acceder a `parsed.model` sin validar el objeto; ahora se rechaza explícitamente en `provider_format / invalid_envelope`, conservando el estado HTTP.
- El `catch` del adaptador perdía los metadatos conocidos ante una excepción posterior a recibir la respuesta. Ahora conserva intento, modelo, uso numérico permitido y HTTP, y distingue excepción de transporte de excepción interna del adaptador.
- Los controles de modelo y finalización contable también conservan los metadatos disponibles cuando rechazan; el contenido se mantiene excluido del resultado fallido.
- El diagnóstico distingue formato externo, extracción de contenido, parseo JSON interno, estructura, referencias y controles. Sólo admite códigos fijos de etapa/motivo; se conserva con la ejecución del proyecto sin escribir fuentes, claves ni respuestas completas en logs o en el registro económico.
- Se aclaró la salida solicitada: un objeto JSON sin Markdown, campos requeridos no vacíos y un único valor permitido de certeza. El contrato sigue rechazando Markdown, campos faltantes, referencias desconocidas y citas inexistentes; no se reparan respuestas ni se eliminan campos para lograr aprobación.

Archivos de este lote: `app/server/providers/abacus.mjs`, `app/server/providers/abacus-transport.mjs`, `app/server/trial.mjs`, `app/server/one-shot.mjs`, `app/src/ai/contracts.js`, nuevo `app/src/ai/diagnostics.js`, nuevo `app/tests/diagnostics.test.mjs` y este registro. Se preservaron los cambios locales previos del intento único; no se modificó su registro económico.

### Comprobaciones y límites

Comando estándar: 86 pruebas aprobadas, una opcional de navegador omitida (87 registradas); lint y build PASS. Se añadieron 19 pruebas con respuestas ficticias y bloqueo explícito de sockets/fetch externos: JSON externo inválido/nulo/array, ausencia de choices, contenido no textual, JSON interno inválido/con Markdown, estructura y certeza incorrectas, referencias sin respaldo, respuesta truncada, caso válido, diagnóstico saneado y excepción después de recibir metadatos. Se comprobó que los rechazos no incorporan propuestas y conservan uso/modelo/HTTP disponibles. No se volvió a ejecutar el recorrido de navegador ni una evaluación de calidad real.

El archivo económico conservó exactamente su SHA256 antes/después: `07B2DB69F6D56A2BC2CCF234C51D18C74934C061BF8032F990D8279ECCFC2D30`. Sigue en 2/5, intento histórico fallido, excepción consumida, `halted: true`, cargos desconocidos y generaciones deshabilitadas. Se conserva la diferencia global observada de 14 créditos, sin atribución exclusiva ni reconciliación inventada. Los cuatro casos del corpus continúan no ejecutados. No hubo commit, push ni despliegue.

## Intento real único autorizado — 13 de octubre de 2026

Se ejecutó una sola generación real desde Work, sobre el candidato local derivado de `b56d9e6f46952c99755095d853a02052fe56e2b5`, con cambios locales de control. La autorización exceptuó exclusivamente el máximo económico previo de 140 créditos para este intento; no autorizó compras, recargas, upgrades ni generaciones adicionales.

### Preparación y controles

- Cuenta inspeccionada por su interfaz: Basic, Auto Refill desactivado y API Metering ya activado. No se modificaron esos ajustes.
- Se preservó el catálogo como solicitud 1/5, con créditos y reconciliación desconocidos.
- La excepción persistida identifica esta autorización y permite sólo la solicitud 2. La reserva consume la excepción y fija `halted: true` antes del envío; el máximo en créditos permanece `null`, sin conversión ni reconciliación inventada.
- Modelo exacto solicitado: `claude-sonnet-4-6`; salida máxima solicitada: 500 tokens. Una fuente ficticia inferior a 1.000 caracteres y solicitud breve, sin streaming, herramientas, router, sustitución ni reintentos.
- La interfaz seleccionó exclusivamente “Registro operativo ficticio”; “Solicitud original preservada” quedó deseleccionada como fuente. La solicitud se prepara en un mensaje propio y la fuente en otro, mediante el adaptador existente. Se inspeccionaron selección y originales en la interfaz; no se guardó una captura del tráfico HTTP ni contenido en el registro económico.
- Credencial introducida personalmente en diálogo enmascarado y transferida por pipe local a memoria del servicio; no se guardó en archivos, navegador, argumentos o registros.
- Pruebas locales previas: 67 aprobadas, una opcional omitida; lint y build PASS. Las cuatro pruebas nuevas usan transporte ficticio con red bloqueada y comprueban límites, preservación del catálogo, reserva 2/5 y bloqueo tras reapertura del registro.

### Resultado observado

- Solicitud económica: `5f155ab3-1f1f-4332-a950-8d93d8e71092`, número 2/5.
- Ejecución de proyecto: `fe66c1be-a3d2-4221-8432-53f075353e67`.
- HTTP 200; modelo informado `claude-sonnet-4-6`; resultado del adaptador `invalid`. Uso de tokens no disponible en los metadatos conservados.
- No se incorporaron propuestas. No pudieron comprobarse fidelidad, revisión de una respuesta válida, decisión ni entregable derivado del modelo. No se repitió el intento.
- Recargar conservó el proyecto ficticio, solicitud original, fuente y selección, y el evento de ejecución fallida; cero propuestas y cero decisiones nuevas.
- El registro no conserva la respuesta original inválida ni una etapa detallada de rechazo. Por eso no permite establecer si falló el JSON, su estructura o las referencias. HTTP 200 acredita respuesta de conexión, no integración completa ni calidad del modelo.

### Consumo y cierre

El panel global mostró 13.911 créditos antes y 13.897 después (89 y 103 usados): diferencia observada de 14 créditos, sin atribución exclusiva a esta llamada. El registro de uso visible era diario y no mostraba aún una fila del 13 de octubre; advierte actualización de hasta una hora. Los créditos del catálogo y de la generación siguen desconocidos y pendientes de reconciliación. No se inventó un cargo ni se volvió a generar.

El servicio privado fue detenido y la clave descartada con su proceso. Registro persistente final: 2/5, excepción consumida, `halted: true`; ambos cargos permanecen `null`. Reiniciar el servicio normal no habilita generaciones.

Limitación de UI observada: textos fijos de Work/AI Activity todavía describen el lote anterior sin llamadas reales, aunque el evento muestra el modelo y el intento real. Después del fallo, Work conserva el estado de conexión en memoria hasta comprobar de nuevo el servicio; el control persistente bloquea otro envío. Queda pendiente ajustar esos textos y mejorar el diagnóstico por etapa bajo otro lote. Los cuatro casos del corpus de evaluación continúan no ejecutados; este intento técnico independiente no los sustituye.

Este archivo es la autoridad detallada de verificación. Conserva la verificación histórica del 7 de octubre y los retests posteriores del candidato todavía no publicado. Un resultado histórico no demuestra por sí solo el comportamiento del árbol local vigente.

## Revisión histórica de la adaptación local — 10 de octubre de 2026

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

## Resumen histórico — 10 de octubre de 2026

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

Esta sección conserva el corte local del 8/10 para el hallazgo responsive, no el estado vigente. No reemplaza ni borra los resultados anteriores: distingue el PASS histórico, el fallo observado después de publicar el commit `cd1f8b71211604cddd7ccc2cccb4c78bb957866a` y el retest de la corrección todavía no versionada ni publicada en aquel corte.

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

### Límites del resultado al corte del lote histórico

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

## Próximo hito de preparación — antecedente superado

Este gate pertenece a la preparación anterior a los intentos reales del 13/10. Se conserva como antecedente; el gate vigente está al inicio de este registro.

Resolver la conversión oficial de créditos, reconciliar la consulta de catálogo y calcular conservadoramente el lote frente al presupuesto condicionado de 140 créditos. Sólo después corresponde autorizar y ejecutar la prueba real de IA. Versionar o publicar el candidato local requiere una autorización separada; la cobertura accesible completa y las tecnologías de asistencia siguen pendientes.
