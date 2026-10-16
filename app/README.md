# AI Product Discovery Copilot — maqueta navegable

Prototipo local del Trabajo Final Integrador de la Diplomatura en IA Aplicada a Entornos Digitales de Gestión.

## Candidato privado local — 16/10/2026

Sobre `71dd149`, sin nuevo commit ni publicación: protección de borradores de Work al cerrar sesión, formularios E1 temporales por proyecto con advertencia antes de abandonar, estilos E1 incluidos por el propio panel y confirmación remota exacta antes de limpiar una edición. Formularios y borradores no forman parte de `v0.3`, decisiones ni respaldos y se pierden al recargar/cerrar. La próxima acción confirmada sí pertenece al workspace.

Dictamen local: doble activación corregida fijando el ID revisado antes de mutar y rechazando el clic repetido del mismo gesto, sin temporizador. Reapertura y acción intencional posterior conservadas. Suite completa con navegador habilitado 162/162, lint y builds público/privado aprobados. Preparado para revisión y posible commit local autorizado; no implica publicación ni equivalencia con el Preview anterior. Incidentes y límites en el registro.

Brief y análisis aplican la misma selección a aportes vinculados a fuentes; los generales permanecen. La lectura/persistencia rechaza procedencia `model`/`simulation` incompatible con su run, sin reescribir originales. Las procedencias históricas demo/unknown y tipos históricos se conservan conforme al contrato anterior.

GuIA informó recuperación desde notebook con la segunda identidad del mismo espacio/proyecto, decisión, brief, pendientes y próxima acción, persistentes tras recarga y sin nueva ejecución. No sustituye la prueba pendiente de continuidad/conflicto entre dos computadoras. El Preview desplegado anteriormente no incluye estas correcciones locales. Pruebas, incidentes y límites: [registro canónico](../docs/verification-2026-10-07.md). Las secciones de preparación anteriores conservan su contexto histórico.

## Qué demuestra

La interfaz representa un flujo asistido por IA donde:

1. se crean, listan y abren varios proyectos locales independientes;
2. los proyectos nuevos empiezan vacíos y el proyecto demo permanece separado;
3. se conserva la solicitud original y las fuentes aportadas quedan como “Aportada · sin revisar”;
4. las propuestas simuladas del demo se distinguen de esas fuentes;
5. una persona acepta, edita, rechaza, mantiene pendiente o reabre cada propuesta;
6. las acciones quedan registradas sin borrar el historial;
7. sólo las decisiones aceptadas alimentan el entregable.

Principio del producto:

> La IA propone, la persona decide y la evidencia permanece visible.

## Cómo ejecutar

Requisitos: Node.js y las dependencias del proyecto instaladas. El repositorio conserva `pnpm-lock.yaml` y el workflow existente utiliza pnpm; el retest final utilizó las dependencias ya instaladas, sin agregar paquetes.

Desde esta carpeta:

```bash
pnpm install
pnpm dev
```

Abrir la dirección local informada por Vite, normalmente `http://localhost:5173/`.

### Prueba privada con servicios reales e IA simulada

Estado posterior: defecto de campo JSON corregido (identities[].id, sin fallback) y Preview reemplazado por dpl_A2wdpitMC4npEZj6anPmFxSqrDVc en el mismo alias. 23 pruebas focalizadas, lint y ambos builds aprobados. Configuración/seguridad sin ampliar; un ingreso Google real y E1 remoto ficticio comprobados hasta decisión/brief/recuperación, con conflicto bloqueado y logout. Pendiente segunda identidad y controles remotos indicados en el registro; no se declara continuidad entre equipos. Detalle en registro canónico; el párrafo siguiente conserva el intento fallido anterior.

Estado 15/10/2026: Preview https://ai-discovery-copilot-private-test-ivan-andrade.vercel.app/private desplegado, **bloqueado por validación incorrecta del campo JSON de identidad**, no listo para uso. SQL protegido aplicado, respaldo privado preparado y RPC antiguas revocadas; el runner loopback anterior ya no accede a datos. Configuración sólo del despliegue, Vercel Authentication retenido, callback HTTPS exacto y local conservado. Producción intacta e IA real ausente. Corrección de código pendiente de autorización. Resultados y recuperación: registro canónico ../docs/verification-2026-10-07.md. Lo que sigue conserva el corte de preparación anterior.

#### Preparación HTTPS/Vercel — local, sin desplegar

Entradas Node de Vercel en api/ y coordinación sin estado de instancia en server/protected/. No se ejecuta Vite ni un servidor permanente dentro de una función. La entrada protected.html/src/remote/private-main.jsx siempre exige la sesión del backend; no monta acceso ficticio ni cae en la demo. El build habitual sigue generando dist para la demo. El comando `node scripts/build-private.mjs`, con TP_BUILD_TARGET=protected-test, genera dist-private; rechaza Production. vercel.private.json se selecciona explícitamente en un despliegue de prueba futuro: no se renombra a vercel.json ni se aplica a producción. Los directorios generados se excluyen de Git y del lint, sin excluir fuente.

Destino recomendado: un Preview exclusivo del proyecto Vercel existente, con un alias HTTPS estable y configuración limitada a ese despliegue/rama de prueba autorizada; sin promoverlo a Production ni modificar los alias públicos. El alias no se creó ni se verificó: se debe obtener del recurso real antes de fijar TP_ORIGIN y callbacks, sin inventar un dominio disponible. Otras previews, Production y configuraciones incompletas reciben 404 en la API, incluso si se conoce la ruta. El origen se compara exactamente; no se infiere de x-forwarded-host. [Funciones Node](https://vercel.com/docs/functions/runtimes/node-js), [cabeceras de Vercel](https://vercel.com/docs/headers/request-headers), [entornos y alcance de variables](https://vercel.com/docs/environment-variables).

Sesiones: cookie opaca __Host-tp_session, Secure/HttpOnly/SameSite=Lax/Path=/, sin Domain, máximo ocho horas y treinta minutos de inactividad en servidor. Lax permite el retorno OAuth GET; los POST requieren Origin exacto y X-TP-CSRF ligado a la sesión. PKCE de un uso con diez minutos de vigencia, almacenado duraderamente. Tokens cifrados AES-GCM con vínculo a su registro, sólo descifrados en servidor. Renovación con lease/CAS duradero; otra instancia no repite el refresh. Confirmación incierta o lease abandonado bloquea y exige nuevo ingreso. Logout revoca antes de confirmar; si falla no se anuncia éxito y se ofrece reintento explícito sin mostrar trabajo. No se depende de las opciones de expiración de un plan pago de Supabase. La comprobación de sesión activa también se exige en las funciones de datos: [sesiones, renovación y revocación en Supabase](https://supabase.com/docs/guides/auth/sessions).

Preparado, **no aplicado**, remote/protected-schema.sql: sesiones, clave de alcance acotado e intentos de análisis duraderos; RLS y sin acceso directo a tablas; lecturas/guardados autenticados que verifican sesión y conservan v0.3, CAS y recibos idempotentes. Registra claim antes del simulador; repetición exacta devuelve resultado registrado, ejecución en curso/incierta no se reenvía, lease vencido se marca interrumpido al consultar sin generar. El esquema revoca las RPC antiguas a authenticated: aplicarlo retira el acceso del runner loopback anterior a los datos, aunque conserva datos e historial. No ejecutar antes del gate y sin preparar su reemplazo protegido.

El transporte del almacén de sesiones usa sólo una credencial backend dedicada de 256 bits (hash en base) para una función de alcance limitado a sesiones cifradas. Aunque esa función tiene permiso de transporte anon, **sin esa credencial rechaza**; no es acceso anónimo a proyectos. No es service_role ni una clave administrativa. Los datos usan siempre JWT del usuario, sesión activa, correo verificado y UUID/subject Google fijados, nunca dominio ni coincidencia de correo como único permiso. El subject se contrasta con provider_id de la identidad Google, separado del UUID de usuario: [objeto de identidad Supabase](https://supabase.com/docs/guides/auth/identities). La configuración administrativa no es accesible por anon/authenticated.

Configuración futura exacta (sin valores sensibles, no creada ahora):

| Destino | Nombre | Valor/regla |
|---|---|---|
| Build privado | TP_BUILD_TARGET | protected-test |
| Funciones del Preview exclusivo | TP_DEPLOYMENT_TARGET | protected-test |
| Vercel, variable del sistema | VERCEL_ENV | preview; Production queda rechazado |
| Funciones | TP_ORIGIN | origen HTTPS exacto del alias de prueba, pendiente de verificar; sin ruta ni barra final |
| Funciones | TP_SUPABASE_URL | https://lkzgydnglkrcmztviqsf.supabase.co |
| Funciones | TP_SUPABASE_PUBLISHABLE_KEY | clave publicable de ese proyecto, campo protegido; no administrativa |
| Funciones | TP_ALLOWED_IDENTITIES | array de dos objetos {email,userId,googleSubject}; sólo ivanandradeuxui@gmail.com e ivanandradecarp@gmail.com; UUID/sub pendientes de consulta puntual, no se infieren del correo |
| Funciones, campos secretos | TP_SESSION_ENCRYPTION_KEY / TP_SESSION_STORE_KEY | dos valores distintos, aleatorios de 32 bytes en hexadecimal, generados/configurados en el gate externo, no VITE_ ni archivos sincronizados |
| Supabase, consola administrativa | tp_configure_protected | las dos identidades verificadas y sólo SHA256 del valor TP_SESSION_STORE_KEY; nunca el secreto de cifrado ni credencial administrativa en la app |
| Supabase Auth, Site URL | URL | TP_ORIGIN + /private |
| Supabase Auth, Redirect URLs | URL exacta | TP_ORIGIN + /api/auth/callback, sin comodines; no añadir todas las previews |
| Google OAuth, redirect ya configurado | URL exacta, se conserva | https://lkzgydnglkrcmztviqsf.supabase.co/auth/v1/callback |

No se necesita añadir el callback Vercel a Google: el intermediario OAuth sigue siendo Supabase. No se utiliza SDK JavaScript de Google, por lo que no se agrega otro origen JavaScript por inferencia. Audiencia de pruebas limitada a las dos cuentas, sin Publicar app ni ampliar scopes. La URL completa de retorno de Supabase quedará pendiente hasta verificar el alias: las expresiones de la tabla no representan un callback ya configurado. No compartir variables secretas con Production, demo ni todas las previews; configuración local anterior queda fuera de OneDrive y no se convierte automáticamente en configuración remota.

Pruebas locales y límites de TLS/dobles/SQL pendiente en el registro canónico. El siguiente gate requiere autorizar consulta de los UUID/sub sin secretos, aplicación/verificación de SQL en el proyecto dedicado, generación/custodia de los dos secretos técnicos, configuración exclusiva de Preview/callback exacto y despliegue de prueba; luego login, revocación, continuidad/conflictos desde dos computadoras. No incluye IA real, migración personal, promoción a Production ni publicación de la demo. Cualquier operación Git necesaria requiere su autorización propia.

Servidor local: ejecutar node server/private-test.mjs desde app y abrir http://127.0.0.1:5182/private. Configuración inicial mediante formulario loopback /local-setup si falta el archivo privado en AppData/Local/AI-Discovery-Copilot/private-test.json; sólo acepta publishable key del proyecto dedicado, sin imprimirla ni sobrescribir configuración. No se usan claves administrativas. El archivo y tokens nunca se copian al repositorio/OneDrive; los tokens de sesión quedan en memoria del servidor. Reiniciar ese proceso exige volver a ingresar. No hay fallback a acceso ficticio cuando falla Google o Supabase.

Google real vía Supabase/PKCE; API requiere sesión y valida las dos identidades autorizadas de Iván. Datos ficticios en un espacio remoto único: funciones del script remote/schema.sql, RLS sin acceso directo a tablas, lista explícita y hook restrictivo previo al alta. Credencial de datos: JWT de usuario, no service_role. Guardado con revisión y comando idempotente; incertidumbre bloquea cambios hasta resolver el mismo intento manualmente. No se consultan ni migran claves locales personales. Abrir/recuperar/continuar nunca dispara análisis.

Servicio y entrada sólo para la prueba loopback de desarrollo; no son un despliegue Vercel ni un servidor de producción. El proveedor sigue simulado, sin import del runner económico/IA real. Recursos y cobertura real/pendiente en contexto y registro canónico; dos sesiones locales no prueban dos computadoras. El despliegue protegido requiere otro gate explícito.

Verificado con Google/Supabase reales desde Chrome e in-app browser independientes en esta computadora: E1 completo con datos ficticios, decisión/brief/próxima acción recuperados, conflicto sin sobrescritura y rechazo tras logout. No acredita dos computadoras ni rechazo OAuth completo de una identidad ajena (ese caso usa dobles/eventos SQL). JSONB puede reordenar propiedades: se comparan contenidos estructurados conservando las instantáneas originales y el rechazo de cambios. Un intento exclusivamente simulado interrumpido/incierto puede cerrarse explícitamente sin reenviarlo ni borrar su historial; luego otra orientación exige acción manual. No se aplica a ensayos reales.

### E1 integrado — sólo desarrollo local con dobles de prueba

Con pnpm dev limitado a loopback, abrir http://127.0.0.1:5173/?e1 (o el puerto informado). E1 usa Projects, New Project, Overview, Work, Sources, Decisions y Deliverables, el mismo constructor, repositorio, propuestas e historial. El wrapper de desarrollo sólo simula acceso autorizado/denegado. El workspace paralelo anterior se retiró; su antigua clave de prueba no se lee, migra ni borra.

Crear un proyecto con pedido literal, objetivo de etapa/restricciones opcionales y fuente opcional. E1 no crea una fuente desde el pedido. La fuente aportada al crear requiere selección explícita en Work/Sources; también puede agregarse una fuente desde Overview. Sin fuente seleccionada con texto se guarda, pero no se ejecuta el simulador. El reintento mantiene identidad y campos; otra creación intencional recibe otra identidad. Si el guardado se aplicó y se perdió la confirmación, el repositorio sólo lo reconoce al reenviar el contenido exacto con escritor/revisión coincidentes; otras versiones siguen siendo conflicto.

Obtener orientación simulada en Overview, revisar/editar/aceptar/rechazar/reabrir en Work y consultar historial/brief en Decisions/Deliverables. Aportes generales y respuestas humanas se guardan separados del original y se envían en humanContext como declaraciones, no como evidencia independiente ni instrucciones. Pueden limitarse a fuentes seleccionadas. Se excluyen aportes ajenos al proyecto o vinculados a fuentes deseleccionadas. Una respuesta actualiza lo conocido sólo cuando su contexto sigue seleccionado. El proveedor es determinista y ficticio, sin comprensión semántica ni salida externa.

Extensión opcional explícita: project.stageWork.E1.version = 1 contiene known, humanInputs, nextAction y closed en el proyecto canónico v0.3. Propuestas usan sourceRefs/runId/originalContent; decisiones conservan secuencia y acciones existentes. Ejecuciones ficticias se identifican como proveedor/origen simulation; históricos sin reclasificar. Se verifica lectura de v0.3 anterior sin escribir ni migrar al leer, y exportación/recuperación con E1. Un lector antiguo puede rechazar las extensiones nuevas: no se promete compatibilidad inversa.

Repositorio compartido local en src/repository.js. El adaptador de desarrollo mapea las claves exclusivamente bajo copilot-e1-integrated-test:, sin consultar claves personales. No es otro modelo de proyectos. Recargar exige nueva sesión ficticia y abre Projects con trabajo guardado. Formularios/borradores sin confirmar siguen siendo temporales. Estado incierto/interrumpido bloquea nuevos análisis sin reenvío automático ni resolución automática.

El import del wrapper y los dobles depende de import.meta.env.DEV y loopback; no se incluyen en dist. Panel y contratos E1 sí son de la aplicación compartida: su presencia no es un login ficticio. En producción ?e1 abre la aplicación habitual; conocer una ruta no habilita el wrapper. La prueba comprueba ausencia de acceso simulado y que las rutas de módulos no sirven JavaScript.

Los controles son simulaciones, no Google ni autorización de servidor. El repositorio local actual es síncrono: conectar API/Google/Postgres requiere orquestación asíncrona y autorización, revisión e idempotencia transaccionales en servidor. No basta con sustituir claves o activar una variable. No hay continuidad entre equipos, secretos ni consumo real. Elegibilidad/cupos y aceptación de límites Free pendientes.

Pruebas: node --test tests/e1.test.mjs. Para navegador ejecutar build, habilitar WORKFLOW_UI_TESTS=1 y PLAYWRIGHT_MODULE apuntando al runtime instalado, y ejecutar tests/e1-browser.test.mjs. Sin nuevas dependencias. Resultados y antecedentes en el registro canónico.

## Recorrido recomendado

1. Abrir `Discovery v0.1` desde Projects o crear otro proyecto con datos ficticios.
2. Revisar la solicitud original en Overview.
3. Entrar a Work.
4. Aceptar, editar, rechazar o mantener pendiente una propuesta.
5. Consultar el registro en Decisions y el efecto en Deliverables.
6. Volver a Work, reabrir una decisión y comprobar que el historial se conserva.
7. Recargar el navegador y verificar que los proyectos mantienen estados independientes.
8. Consultar Sources para distinguir fuentes aportadas de contenido demo.
9. Usar Exportar respaldo antes de limpiar datos locales o ensayar una recuperación.

## Verificaciones técnicas

### Lote 2 UX — versión funcional publicada

Versión funcional vigente: `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, publicada y comprobada en GitHub Pages y Vercel. F01 (regreso a Projects), F11 (idioma/título) y F12 (foco por intención) están implementados y verificados en la cobertura registrada. Se conservan la protección de borradores y los recorridos del Lote 1. El registro separa pruebas directas, instrumentación ficticia de recuperación/conflicto/guardado e intentos inválidos del arnés, que no se cuentan como PASS. IA pública deshabilitada; cero generaciones durante el lote. Sin lector de pantalla ni declaración de accesibilidad integral. Enlaces, assets y resultados por alojamiento: [`../docs/verification-2026-10-07.md`](../docs/verification-2026-10-07.md).

### Antecedente — Lote 1 UX, publicado en e2befd6

- Editar en Work conserva un borrador por proyecto y propuesta al cambiar de sección. No es una decisión hasta confirmar; puede descartarse individualmente. Salir del proyecto con cambios pendientes exige elegir continuar o descartar.
- Los borradores viven sólo durante la sesión: no están en `v0.3` ni en el respaldo. Recargar o cerrar los pierde; se solicita la advertencia nativa, sin garantizar su presentación en todos los cierres.
- Tras un fallo de creación, **Reintentar guardado** conserva el mismo candidato y los campos originales bloqueados. La exportación existente rescata la copia en memoria; recargar sin guardar/exportar la pierde. No hay importación por interfaz. Cancelar y comenzar otra creación es una intención nueva, no un reintento.
- Sources abre la propuesta vinculada exacta; un destino inválido se explica sin seleccionar otra automáticamente. Solicitudes sólo de espacios/tabs/saltos se rechazan sin reescribir las válidas.

El lote fue versionado, integrado por fast-forward y publicado en ambos alojamientos. F02, F03, F09 y F08 mínimo pasaron el smoke público delimitado. Detalle de cobertura y antecedentes: [`../docs/verification-2026-10-07.md`](../docs/verification-2026-10-07.md).

```bash
pnpm lint
pnpm build
pnpm preview
```

## Alcance y límites vigentes

- Nivel 2: maqueta HTML navegable.
- Datos ficticios en el demo; los proyectos nuevos no reciben propuestas genéricas.
- Persistencia en `localStorage` con formato `v0.3`; las claves predecesoras se preservan durante las migraciones.
- Exportación disponible; la recuperación fue probada programáticamente, pero no existe importación por interfaz.
- Aviso y bloqueo de una pestaña desactualizada, con una ventana residual de carrera porque `localStorage` no ofrece transacciones.
- Servicio auxiliar local limitado a loopback, sin backend remoto de producto, autenticación, base de datos remota ni sincronización entre dispositivos.
- Contrato, transporte reemplazable y registro duradero de consumo preparados, pero generaciones reales deshabilitadas.
- Adaptación oscura `d758512`, hotfix de grillas/foco `08853c5` y Lote 1 `e2befd6` conservados como antecedentes de la versión funcional publicada `3835117`. Los ensayos y registros privados siguen siendo locales; el servicio auxiliar no se publica. El bloqueo histórico de lint quedó superado en los retests posteriores.
- La inspección interna no constituye validación con usuarios, seguridad integral ni conformidad completa de accesibilidad.

## Estado publicado y límites

Versión funcional publicada: `3835117bf6abd9a5d247b3cdc26dbbc5c26dc096`, Lote 2 verificado en ambos alojamientos. Lote 1 `e2befd6` y el hotfix permanecen como antecedentes; sus ramas se conservan. El cierre exclusivamente documental posterior no cambia los assets ni constituye otra versión funcional. Smoke público delimitado satisfactorio; IA pública deshabilitada. Resultados y límites en el registro canónico.

El código publicado usa `v0.3` y conserva la preparación que transmite solicitud y sólo fuentes seleccionadas en mensajes separados y bloquea resultados obsoletos; no habilita IA pública. Un caso ficticio privado previo completó el recorrido con una respuesta real de `claude-sonnet-4-6`, decisión de prueba, entregable y persistencia. La calidad general y la resistencia adversarial no están validadas. Nuevas respuestas requieren type Afirmación/evidence, Hipótesis/hypothesis o Pregunta/question; los tipos históricos se conservan literalmente.

La cobertura y el consumo se registran en [`../docs/verification-2026-10-07.md`](../docs/verification-2026-10-07.md). Estado económico: 3/5, ambas autorizaciones consumidas, halted y generaciones deshabilitadas. El consumo agregado no permite atribución individual. El corpus de cuatro casos permanece sin ejecutar. Login, multiusuario, PDF/imágenes, leads, portal y monetización no están implementados.

Antes de exponer IA a Iván o clientes se requiere definir un incremento protegido de autenticación, backend, secretos, persistencia y controles de uso/costo, con autorización propia. No se habilita ese incremento ni nuevas generaciones mediante este cierre documental.

Lote 2 (F01/F11/F12) implementado y verificado dentro de la cobertura registrada, sin rediseño ni declaración de accesibilidad integral. El siguiente incremento funcional está pendiente de definición y autorización de Iván. Este cierre es exclusivamente documental; su push requiere autorización separada y no habilita otro incremento. Estado en [`../contexto.md`](../contexto.md).

## Tecnología

- React.
- Vite.
- ESLint.
- CSS propio sin biblioteca visual externa.

La documentación académica y del proceso se encuentra en la carpeta `docs/` del repositorio principal.
