# Preparación privada de proveedores — sin habilitar ni desplegar

Corte local posterior a `b210b45`. No acredita llamadas reales, calidad del modelo,
créditos, configuración externa ni migración aplicada. La documentación canónica
conserva el corte previo al commit y requiere conciliación en un lote separado.

## Configuración del servidor de Preview

Se conservan los controles existentes `TP_DEPLOYMENT_TARGET=protected-test`,
`VERCEL_ENV=preview`, origen HTTPS exacto, identidades fijadas, sesión y CSRF.
`TP_AI_MODE` admite `disabled` (predeterminado), `simulation` (prueba explícita)
o `real`. En real, `TP_AI_PROVIDER` y `TP_AI_MODEL` son obligatorios. Proveedores
implementados: `abacus` y `gemini`; no Groq. La configuración legacy `TP_AI_MODE=abacus`
se interpreta explícitamente como real/abacus, conservando sus variables. Una selección
contradictoria se rechaza. No hay fallback al simulador ni modelo silencioso.

Abacus requiere, sólo en servidor: `TP_ABACUS_API_KEY`, `TP_AI_MODEL`,
`TP_AI_MAX_OUTPUT_TOKENS` (1–1800), `TP_AI_MAX_SOURCES` (1–10),
`TP_AI_MAX_INPUT_CHARS` (1–12000), `TP_AI_MAX_SOURCE_CHARS` (1–6000),
`TP_AI_TIMEOUT_MS` (1–25000), `TP_AI_DAILY_LIMIT` (1–20) y
`TP_AI_SESSION_LIMIT` (1–5). Todos obligatorios; no son valores recomendados
para una prueba ni autorizan costo alguno. Se rechazan router y simulación como
modelo real. La validación de clave sólo comprueba formato, no acceso efectivo.

El servidor rechaza proveedor/modelo de cliente distintos del configurado, así como
endpoint/credencial/modo en el pedido. El cliente sólo refleja la selección del servidor.
Un pedido anterior sin provider se admite sólo para Abacus/simulation; no para Gemini.
Envía texto
seleccionado, pedido y aportes humanos separados de las instrucciones; conserva
el contrato único de evidencia/hipótesis/pregunta y referencias literales.
Endpoint fijo existente: `POST https://routellm.abacus.ai/v1/chat/completions`,
Bearer sólo en transporte servidor. Sin catálogo, streaming, herramientas,
redirecciones, reintentos, reparación ni cambio de proveedor/modelo.

## Frontera común y Gemini — preparación local, 17/10/2026

`providers/registry.mjs` construye el proveedor; `protected/analysis.mjs` ya no importa
Abacus. `messages.mjs` conserva las mismas instrucciones y solicitud/fuentes separadas
para ambos adaptadores. El resultado interno común mantiene diagnóstico, modelo
informado, externalAttempted, usage y propuestas/referencias, con revisión humana.
No hay cambios visuales ni normalización retroactiva de ejecuciones.

Gemini requiere `TP_GEMINI_API_KEY` sólo en servidor, límites obligatorios iguales a
Abacus, `TP_AI_MODEL=gemini-3.8-flash`, `TP_GEMINI_DATA_POLICY=fictional-only` y
`TP_GEMINI_BILLING_POLICY=free-no-billing`. Estas declaraciones no prueban el estado
real de la cuenta, no autorizan configuración/consumo y no garantizan costo cero.
Sin cualquiera de ellas, falla cerrado. No se configuraron variables ni claves reales.

Archivos separados: `providers/gemini.mjs` y `gemini-transport.mjs`.
REST fijo `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent`,
clave en header x-goog-api-key (nunca URL). systemInstruction y contents separan
instrucciones, pedido/aportes humanos y fuentes no confiables. generationConfig fija
candidateCount=1, maxOutputTokens explícito, responseMimeType=application/json y
responseJsonSchema derivado del mismo contrato. Sin campos extra, herramientas,
streaming, URLs de entrada consultadas, redirecciones, retries ni reparación.
La allowlist exacta se comprueba antes de reserva/envío. Respuesta acotada a 262144 bytes;
JSON/contrato/pares semánticos/referencias se validan de nuevo localmente. Un error
de formato no degrada a texto libre. Los límites de caracteres/tokens no son techo económico.

Se conserva literalmente modelVersion como modelReported; si falta o difiere del ID
solicitado se bloquea, sin adivinar aliases o reemplazarlo. Se exige STOP y un candidato
con una parte de texto; bloques/herramientas/partes adicionales quedan rechazados.
Esto puede rechazar respuestas reales con versiones o partes legítimas todavía no
verificadas: no se declara compatibilidad efectiva de cuenta. finishReason nativo
se conserva; usageMetadata mapea sólo contadores disponibles, sin fabricar un total
ni equiparar totalTokens a créditos. Un 429 no permite distinguir rate limit de cuota Free.

Lectura documental oficial realizada, NO solicitudes API:

- [Modelos](https://ai.google.dev/gemini-api/docs/models): Gemini 3.8 Flash vigente;
  elegido frente a la alternativa 3.6 por ser la versión Flash actual documentada,
  no por una comparación de calidad ni por acceso comprobado de esta cuenta.
- [REST generateContent](https://ai.google.dev/api/generate-content) y
  [claves](https://ai.google.dev/gemini-api/docs/api-key): ruta, header, envoltorio y campos.
- [Salida estructurada](https://ai.google.dev/gemini-api/docs/structured-output):
  soporta type/properties/required/additionalProperties/enum/items usados aquí;
  no fue necesario quitar restricciones del esquema. Compatibilidad documental,
  no aceptación real comprobada. validateResult sigue siendo autoridad local.
- [Precios](https://ai.google.dev/gemini-api/docs/pricing) y
  [billing](https://ai.google.dev/gemini-api/docs/billing): Free con límites/condiciones
  y uso de datos para mejora. Sólo corpus ficticio, sin clientes/personales/confidenciales.
  Google AI Pro y Gemini API no comparten por inferencia clave, cuota ni autorización.

Groq sigue sólo en la matriz, pendiente de verificar. No se implementó su transporte.
Sol es referencia paga; Claude opcional; Astra escalamiento premium excepcional,
no principal ni default. El plan deja cero intentos autorizados y ningún job ejecutable.
Detalle único en el corpus; sus cuatro entradas no cambian.

Persistencia de proyectos sigue v0.3: extensión explícita de provider para nuevas
ejecuciones Gemini y validación coherente de run/request/procedencia. Los snapshots
Abacus sin provider en el request conservan esa ausencia; no se reescriben originales.
Binarios anteriores no podrán leer ejecuciones Gemini nuevas: no prometer downgrade.

### Verificación local de esta frontera

67 pruebas focalizadas aprobadas; lint y builds público/privado aprobados. Suite completa
con UI_TESTS/WORKFLOW_UI_TESTS/PRIVATE_UI_TESTS/PRIVATE_BUILD_TESTS habilitados:
**235/235**, sin fallos ni omisiones. No sumar focalizadas, layout o pasadas previas.
Nuevas pruebas de configuración, routing, allowlist exacta, claves ficticias/ausentes,
errores de envoltorio/JSON/esquema/referencias/modelo, truncamiento, timeout,
fallos de transporte y ausencia de fallback/reintento. Sockets/fetch externos prohibidos
en las pruebas de dominio; cero intentos instrumentados. Tests económicos usan registros
ficticios aislados, no el ledger real. Estado histórico conocido 3/5/halted/permisos
consumidos conservado sin consultarlo ni modificarlo.

Navegador: una respuesta ficticia por proveedor, selección de fuente → revisión →
aceptación → entregable → recarga → reapertura → disabled. Ambas rutas sin errores
ni tráfico externo; ocho anchos 320/390/768/901/902/1024/1280/1440 sin overflow por
proveedor, mediciones separadas del conteo de tests. El arnés privado histórico registra
errores de red/503/403 deliberados para sus casos negativos; no son consola limpia global.
No se declara accesibilidad integral. El primer pase focal incluyendo TLS fue 52/53:
OpenSSL no podía crear su objeto del sistema dentro del sandbox; la suite con permisos
locales pasó ese caso. No se cambió el producto para ocultarlo.

Comparación programática de las cuatro entradas con HEAD: idénticas, ninguno de los
casos ejecutado. Proceso nuevo con configuración por defecto: disabled. Búsqueda en
ambos builds sin nombres de variables de claves ni endpoints de proveedores; alcance
por patrones, no garantía global. CSS/logo/favicon sin cambios en este lote.
Sin staging, commit, configuración externa, aplicación SQL ni consumo de modelos.

### Inventario exacto del incremento de proveedores

22 archivos intervenidos en este incremento (no confundir con todo el diff acumulado):

- Servidor: `app/server/protected/ai-config.mjs`, `app/server/protected/analysis.mjs`,
  `app/server/protected/api.mjs`, `app/server/protected/store.mjs`,
  `app/server/providers/registry.mjs`, `app/server/providers/messages.mjs`,
  `app/server/providers/abacus.mjs`, `app/server/providers/gemini.mjs`,
  `app/server/providers/gemini-transport.mjs`.
- Paso mínimo de selección/procedencia sin rediseño: `app/src/App.jsx`,
  `app/src/remote/client.js`, `app/src/ai/contracts.js`, `app/src/ai/diagnostics.js`,
  `app/src/storage.js`.
- SQL sólo preparado: `app/remote/migrations/2026-10-17-provider-boundary.sql`.
- Plan: `app/evaluation/plan.mjs`.
- Pruebas: `app/tests/gemini.test.mjs`, `app/tests/protected-ai.test.mjs`,
  `app/tests/protected-ai-browser.test.mjs`, `app/tests/evaluation-plan.test.mjs`.
- Documentación: este archivo y `docs/ai-evaluation-corpus.md`.

Seis archivos son nuevos de este incremento: registry, messages, gemini,
gemini-transport, provider-boundary.sql y gemini.test. Los otros dieciséis extienden
archivos ya existentes, algunos todavía no seguidos del lote anterior.

Doce archivos pendientes del corte anterior preservados sin editarlos en este incremento:
`app/server/protected/config.mjs`, `app/server/providers/abacus-transport.mjs`,
`app/src/e1/E1Panel.jsx`, `app/src/remote/PrivateWorkspace.jsx`,
`app/src/screens/WorkScreen.jsx`, `app/tests/one-shot.test.mjs`,
`app/tests/private-browser.test.mjs`, `app/tests/serverless-private.test.mjs`,
`app/tests/transport.test.mjs`, `app/remote/migrations/2026-10-17-protected-ai.sql`,
`app/server/providers/structured-output.mjs`, `app/tests/structured-output.test.mjs`.
Árbol acumulado: 18 archivos seguidos modificados y 16 archivos relevantes no seguidos.
Los nombres ajenos/contexto personal permanecen fuera de esta selección, sin leerlos.

## Auditoría final del candidato acumulado desde b210b45 — 17/10/2026

Alcance: revisión técnica y corrección mínima, no nueva capacidad ni publicación.
Dos defectos demostrados con pruebas que primero fallaron y luego pasaron:

1. `analysis.mjs` confundía entrar al adaptador con un envío y perdía metadatos ante
   reautenticación/confirmación fallidas. Ahora conserva sólo metadatos saneados ya
   observados (sin propuestas/cuerpo) y no inventa externalAttempted. La reserva
   sigue incierta y bloqueada, sin reenvío ni devolución de cupo.
2. La validación de runs admitía una simulación legacy reclasificada como Abacus
   cambiando provider/origin. Ahora rechaza simulation-e1 fuera de simulation y
   exige modelRequested=request.model. El test E1 anterior aceptaba esa combinación
   errónea: se corrigió, sin cambiar originales o datos reales. Un estado inconsistente
   entra en recuperación, no se normaliza ni borra. Esto es coherencia estructural,
   no certificación criptográfica de procedencia de un archivo editado manualmente.

Reconfirmación documental Google: ruta generateContent, header x-goog-api-key,
generationConfig.responseMimeType y responseJsonSchema están representados en las
referencias enlazadas arriba. El subconjunto usado no pierde restricciones; el
contrato local mantiene pares semánticos, literalidad y revisión humana. No hay
compatibilidad efectiva comprobada por una respuesta real de Gemini.

modelVersion es la versión servida, no una promesa de eco del identificador solicitado.
La [guía de nombres](https://ai.google.dev/gemini-api/docs/models#model-version-name-patterns)
distingue stable y aliases latest que cambian. No se encontró un mapa documentado
para aceptar una cadena alternativa a gemini-3.8-flash en esta preparación. Se conserva
por seguridad la igualdad literal: cualquier otra versión, incluso potencialmente
legítima, bloquea y conserva el dato informado. No se inventa equivalencia ni se
declara esa política una compatibilidad universal. Las partes extra/firma/pensamiento
también siguen como límite conservador documentado, no éxito ignorando contenido.

SQL: inspección estática de ambas migraciones, no ejecución. Orden: protected-schema,
protected-ai y provider-boundary. El default abacus refleja las únicas filas posibles
en la tabla anterior; la RPC anterior inserta con columnas explícitas. ai_mode conserva
su constraint legacy, provider distingue Gemini, y ambos conteos incluyen esas filas.
Mismo lock, requestId global, actor, huella y modelo; Gemini añade proveedor explícito.
La sesión autoriza cada acción y determina el cupo por sesión; el replay del mismo
actor puede recuperarse desde otra sesión válida sin nuevo consumo. Actor distinto
se rechaza. Estados inciertos no se resuelven por cambio de sesión/proveedor.
Esto no acredita transacciones/RLS ni una migración ya aplicada.

Retest posterior a las dos correcciones: **237/237** en la suite completa, cuatro
opciones UI/build habilitadas, cero fallos/omisiones; lint y ambos builds aprobados.
La pasada focal fue 106 aprobadas y una opcional omitida; esa opcional sí se ejecutó
en la suite completa. Los dos casos nuevos primero fallaron reproduciendo los defectos;
no se presentan esos pases iniciales como PASS ni se suman conteos. La cobertura de
dobles/navegador sigue sin acreditar calidad del modelo ni consumo real.

Comprobación programática de selección: 35 únicos = 19 seguidos modificados + 16
no seguidos relevantes. Primer chequeo de inventario usó rutas relativas al directorio
app incorrectamente y se detuvo antes de escanear contenido; corregido a raíz Git,
la comparación exacta pasó. No fue un cambio concurrente ni un fallo del producto.
Búsqueda específica en esos 35: cero patrones de claves reconocibles, PEM privados o
rutas C:/Users; no una garantía universal de ausencia de secretos. Corpus contra HEAD:
cuatro entradas idénticas. Proceso nuevo con configuración por defecto: disabled.
Diff-check aprobado; ledger y archivos ajenos no abiertos; sin staging ni commit.
Dictamen: listo para posible commit local de la preparación, NO para habilitar IA,
aplicar migraciones o publicar. El antecedente de 235 queda preservado arriba.

### Selección exacta propuesta: 35 archivos

Agrupación por responsabilidad principal; hay archivos compartidos entre incrementos.
No implica que los grupos puedan versionarse separadamente sin sus dependencias.
No se realizó staging. A/B/C juntos constituyen el candidato acumulado revisado.

#### A. Preparación privada previa — 16

- `app/server/protected/api.mjs`
- `app/server/protected/config.mjs`
- `app/server/protected/store.mjs`
- `app/server/protected/ai-config.mjs`
- `app/server/protected/analysis.mjs`
- `app/remote/migrations/2026-10-17-protected-ai.sql`
- `app/src/App.jsx`
- `app/src/e1/E1Panel.jsx`
- `app/src/remote/PrivateWorkspace.jsx`
- `app/src/remote/client.js`
- `app/src/screens/WorkScreen.jsx`
- `app/tests/private-browser.test.mjs`
- `app/tests/serverless-private.test.mjs`
- `app/tests/protected-ai.test.mjs`
- `app/tests/protected-ai-browser.test.mjs`
- `app/tests/transport.test.mjs`

#### B. Salida estricta, plan y documentación — 9

- `app/server/providers/abacus-transport.mjs`
- `app/server/providers/abacus.mjs`
- `app/server/providers/structured-output.mjs`
- `app/tests/one-shot.test.mjs`
- `app/tests/structured-output.test.mjs`
- `app/evaluation/plan.mjs`
- `app/tests/evaluation-plan.test.mjs`
- `docs/ai-evaluation-corpus.md`
- `app/server/protected/AI-PREPARATION.md`

#### C. Frontera común, Gemini y coherencia de procedencia — 10

- `app/server/providers/gemini.mjs`
- `app/server/providers/gemini-transport.mjs`
- `app/server/providers/registry.mjs`
- `app/server/providers/messages.mjs`
- `app/remote/migrations/2026-10-17-provider-boundary.sql`
- `app/src/ai/contracts.js`
- `app/src/ai/diagnostics.js`
- `app/src/storage.js`
- `app/tests/e1.test.mjs`
- `app/tests/gemini.test.mjs`

Exclusiones: .abacusai/ y contexto-Ivan.md permanecen no seguidos y fuera de la
selección, sin leer/modificar. No están ignorados por Git: no usar git add general.
Los patrones de .gitignore excluyen .env/credenciales, ledger/respuestas privadas,
respaldos, lanzadores históricos, builds y dependencias; se comprobaron rutas
representativas sin abrir artefactos privados. No se modifica .gitignore ni se añaden
capturas/diffs temporales. Documentos canónicos generales siguen sin conciliación
de publicación, deliberadamente fuera de este lote.

## Migración y reserva durable

Preparada, NO aplicada: `app/remote/migrations/2026-10-17-protected-ai.sql`, después
de `protected-schema.sql`. Tabla de reservas reales separada para no alterar las
filas ni los inserts del mecanismo simulado histórico. Mismo bloqueo transaccional
del workspace; requestId único, hash del pedido, modelo, actor, sesión, lease y
hora de reserva. Sin nueva copia del prompt/fuentes en el registro de control.
Sólo resultado validado y metadatos permitidos se guardan al finalizar.

La RPC exige JWT/sesión autorizada Y capacidad backend, nunca sólo parámetros del
cliente. Falta de RPC, versión de capacidad o lectura durable bloquea disponibilidad.
Límite diario UTC global al espacio y por sesión; cuentan reservas fallidas y
canceladas, sin devolver cupo. Una reserva en curso/interrumpida/incierta bloquea
nuevos envíos. El mismo requestId puede consultar un resultado ya finalizado sin
generar de nuevo; no se reenvía un intento abandonado. No hay desbloqueo automático
ni botón administrativo de reconciliación en este lote: incertidumbre exige revisión
manual autorizada. El SQL sólo cuenta con inspección estática y doble local;
transacciones/RLS reales deben comprobarse antes de habilitar consumo.

La migración anterior y su RPC de Abacus permanecen intactas. Se añade, sin aplicar,
`2026-10-17-provider-boundary.sql`: columna provider con antecedente Abacus por construcción
de la tabla previa y RPC Gemini separada, versión de capacidad 2 obligatoria. ai_mode
permanece como discriminador legacy de tabla, NO como procedencia; provider es la autoridad.
Ambas RPC comparten tabla, lock, bloqueos inciertos y conteos globales; cambiar proveedor
no reinicia límites. No se duplica el ledger ni el estado de proyectos. Sin la nueva RPC,
Gemini permanece no disponible. SQL verificado sólo estáticamente/con dobles; no aplicado.

Se reutiliza el transporte histórico con política configurable e inyección de pruebas;
el ledger histórico 3/5/halted y sus permisos no se leen ni modifican. No hay equivalencia
verificada de tokens/dólares a créditos: los límites reducen exposición, NO garantizan
un máximo monetario ni cargos adicionales cero. Usage se conserva sólo si es informado.

## Único gate para la prueba real

Una autorización explícita y acotada debe aprobar la preparación externa necesaria
(migración, configuración privada y Preview) y después un intento real delimitado,
sin consumo hasta verificar: almacenamiento/transacciones reales, catálogo/acceso y
tarifa del modelo elegido, condiciones de facturación/Auto Refill, saldo, límites,
custodia segura de la clave y bloqueo posterior. No se presupone que el identificador
histórico siga disponible. Si alguna condición falta, conservar `disabled`.

“Funciona siempre” significa capacidad operativa con límites y recuperación explícita;
no disponibilidad absoluta del proveedor. La demo pública y el arranque normal siguen
sin IA. No exponer el endpoint a clientes ni afirmar seguridad/calidad integral por
pruebas ficticias. No se agregan adjuntos, leads, portal o monetización.

## Antecedente: selección y salida estricta antes de la frontera común

La prioridad de ese corte era Astra (`gpt-6-astra`), con Sol (`gpt-6.1-sol`) como
competidor equilibrado y Claude (`claude-sonnet-5-5`) opcional. Son candidatos,
no resultados. No se establece TP_AI_MODEL ni un default; sigue siendo obligatorio
en servidor. Jev se rechaza también en la configuración/RPC preparada para este
flujo generativo. No hay catálogo, llamadas o cambios de configuración reales.

El adaptador añade únicamente response_format JSON Schema strict; el transporte
exige ese formato exacto derivado de las fuentes seleccionadas y rechaza downgrade,
schema alterado o parámetros adicionales antes de reservar. No se añaden opciones
de razonamiento/modelo no documentadas. Fuente de compatibilidad: verificación
informada por GuIA en la autorización, no consulta nueva de este lote sin red.
Compatibilidad por modelo/cuenta pendiente. El rechazo del formato no produce
fallback a JSON libre ni otra llamada.

`structured-output.mjs` representa la forma de los campos del contrato vigente y
deriva sus enums de PROPOSAL_TYPES. Se mantienen validateResult y sus diagnósticos;
la forma estricta se vuelve a comprobar localmente con ese mismo esquema. No se
confía en una promesa del proveedor ni se añaden inference/contradicciones como
categorías. No se modifican propuestas ni respuestas históricas guardadas.

Protocolo único: `docs/ai-evaluation-corpus.md`, sección Comparación de modelos
preparada. `app/evaluation/plan.mjs` genera solamente un plan en memoria a partir
de sus cuatro entradas canónicas, con huellas y métricas vacías; no es un runner,
importación ni autorización de consumo. Matriz base 8 intentos, opcional 12, pendiente
de presupuesto/autorización propios compatibles con límites existentes. No se cambia
la política diaria/de sesión ni el ledger histórico para permitirla. Ningún caso
ejecutado; ninguna comparación de calidad, latencia o consumo real registrada.

Verificación de este incremento: 53 pruebas focalizadas con respuestas ficticias
(incluyen regresiones anteriores), lint y ambos builds aprobados; después suite
completa **197/197**, cero fallos/omisiones, con las cuatro opciones de navegador
habilitadas. Las 14 pruebas nuevas comprueban esquema, rechazo local/allowlist y
construcción reproducible del plan; no acreditan calidad ni ejecución del corpus.
Cero solicitudes externas instrumentadas. Diff-check aprobado; CSS/logo/favicon
sin cambios. El corte anterior de 183 se conserva abajo y no se suma a 197.

## Antecedente: verificación local de preparación privada antes de salida estricta

Lint y builds público/privado aprobados; suite completa con las cuatro opciones de
navegador/build habilitadas: **183/183**, cero fallos/omisiones. No sumar las pasadas
focales ni las mediciones al conteo de pruebas. El primer pase completo fue 182/183:
storage-browser no pudo abrir loopback 5173 (ERR_CONNECTION_REFUSED). Con Vite local
disponible se repitió la suite completa y pasó; no se corrigió código para ocultarlo.

Nuevos casos de dominio/API: configuración incompleta, modelo manipulado/inesperado,
RPC ausente, límite, duplicados/concurrencia, replay entre instancias nuevas, fallo
de finalización/logout y respuestas ficticias de permisos, cuota, rate limit, JSON,
referencias, truncamiento y timeout antes/después del envío. Transporte configurable
también probado con HTTP ficticio y sockets externos prohibidos. La migración cuenta
sólo con inspección estática y doble, no ejecución en PostgreSQL real.

Navegador sobre build privado con API interceptada: selección explícita de fuente,
modelo configurado ficticio, pedido y humanContext, respuesta por adaptador Abacus
con transporte ficticio, revisión/aceptación, brief, recarga, reapertura y modo
disabled. Una ejecución ficticia, cero solicitudes externas/errores de consola.
Ocho mediciones nuevas a 320/390/768/901/902/1024/1280/1440 sin overflow, con nombre
continuo largo. El primer intento del arnés no seleccionó la fuente; el segundo usó
check() antes de confirmar el guardado asíncrono. Se corrigió el recorrido de prueba
a selección por clic y espera del estado confirmado, sin alterar la selección.

Regresiones de v0.3, borradores, decisiones y controles económicos históricos pasaron
con datos ficticios. No se leyó ni modificó el ledger real. CSS, paleta, logo/favicon,
ayudas y archivos canónicos no cambian respecto de b210b45. El build no contiene el
nombre de variable de clave Abacus ni el marcador de credencial ficticia buscados;
es una comprobación por patrones, no una garantía global. Sin staging/commit/push.
