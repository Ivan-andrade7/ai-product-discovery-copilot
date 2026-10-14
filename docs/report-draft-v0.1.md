# Trabajo Final Integrador

## AI Product Discovery Copilot

Estado: borrador documental v0.1. No es todavía el PDF final.

## a. Introducción

### Justificación

> “Elegí este tema porque quiero aprender a conducir proyectos de producto de manera más ordenada y, al mismo tiempo, trabajar con mayor agilidad al transformar solicitudes incompletas en decisiones y entregables de diseño.”

La idea surgió mientras revisaba mi propio proceso de UX/UI y Product Design. Todavía no contaba con una forma de trabajo end-to-end consolidada y necesitaba comprender mejor qué información hace falta, qué puede descubrirse durante el proceso y cómo conservar las decisiones tomadas. A esa necesidad de aprendizaje se sumó un feedback recibido durante una experiencia en NoCountry: debía ganar agilidad, especialmente en UI, prototipado y preparación de propuestas.

La solución elegida es **AI Product Discovery Copilot**, una plataforma conceptual que recibe una solicitud de producto, incluso incompleta, y ayuda a organizarla como evidencia, supuestos, preguntas, propuestas y decisiones trazables. La IA funciona como asistencia; la persona conserva el control sobre qué aceptar, editar, rechazar o mantener pendiente.

### Objetivo

El objetivo del trabajo es demostrar, mediante una maqueta HTML navegable, cómo una interfaz asistida por IA podría acompañar una primera parte del proceso de discovery sin reemplazar la fuente original ni presentar inferencias como hechos. El recorrido publicado demuestra:

**solicitud original → propuesta demo → revisión humana → decisión → historial → entregable derivado**.

El ensayo privado local completó una respuesta real válida de claude-sonnet-4-6 sobre un único caso ficticio controlado: solicitud y fuente seleccionada → propuesta con cita e incertidumbre → revisión y aceptación de prueba por el asistente → decisión → entregable persistente. Su cierre técnico está versionado; la publicación estática no expone el servicio ni los datos privados del ensayo. Un primer intento permanece fallido. Generaciones deshabilitadas; el caso no prueba calidad general ni evaluación independiente con usuarios.

La maqueta sigue siendo compatible con el Nivel 2 admitido por la consigna. El candidato local incorpora además un recorrido real mínimo mediante un servicio privado local; no existe backend remoto ni integración habilitada para usuarios. La compatibilidad de nivel no acredita cumplimiento académico completo.

## b. Marco conceptual

### IA generativa como asistencia

En este proyecto la IA generativa se entiende como una herramienta capaz de ayudar a ordenar información, formular propuestas, señalar preguntas abiertas y producir borradores. No se la trata como una fuente independiente de evidencia ni como responsable final de una decisión de producto.

### Control humano

El principio rector del producto es: **la IA propone, la persona decide y la evidencia permanece visible**. Aceptar una propuesta no demuestra que haya sido validada con usuarios. Sólo registra que una persona decidió incorporarla al estado vigente de la demo.

### Trazabilidad

La trazabilidad permite reconstruir qué entrada originó una propuesta, qué explicación la acompañó, qué acción tomó la persona y qué versión llegó al entregable. Por eso la aplicación separa Work, Sources, Decisions, Deliverables y AI Activity en lugar de presentar una única respuesta extensa de chat.

### Herramientas

Se utilizaron herramientas de exploración visual y de implementación asistida. Figma y Figma Make se usaron para trabajar estructura y variantes visuales; UXPilot y Abacus.AI aportaron alternativas exploratorias; Codex asistió la construcción de la maqueta React, las pruebas, las correcciones y la documentación. React, Vite, ESLint y Git sostienen la implementación y su verificación, pero no son modelos de IA.

Figma Make y UXPilot no mostraron para Iván un modelo identificable. La exploración inicial en Abacus.AI fue gratuita y no registró el modelo subyacente. Posteriormente, con Basic, los intentos API solicitaron e informaron claude-sonnet-4-6. Estas evidencias no identifican retroactivamente los modelos de la exploración.

## c. Metodología

### 1. Recuperación y delimitación

El proyecto comenzó recuperando la consigna, las notas existentes y el contexto de una idea inicialmente muy amplia: asistir las etapas E1–E18 del proceso UX/Product de punta a punta. Esa visión incluía investigación, definición, wireframes, prototipos y posibles usos futuros con clientes.

Se separó la base académica de las extensiones futuras. El contrato, transporte y registro local permitieron dos intentos reales autorizados individualmente: uno fallido y uno exitoso en un caso mínimo ficticio. Autenticación, persistencia remota, multiusuario, PDF/imágenes, leads, portal y monetización siguen fuera del candidato. La publicación estática no incluye el servicio privado ni los cambios locales posteriores.

### 2. Exploración visual

Se generaron variantes en Figma Make, UXPilot y Abacus.AI a partir de instrucciones extensas. Estas alternativas ayudaron a comparar estructuras y a consolidar en Figma un recorrido con proyectos, overview, workbench, fuentes, decisiones, entregables y actividad.

Las variantes fueron exploratorias. No se interpretaron como validación ni como evidencia de que una estructura funcionaría para usuarios reales.

#### Prompts e intervenciones representativas

El registro completo se conserva en `docs/prompt-log.md`. El ejemplo principal fue el **Prompt maestro de exploración visual v0.1**, que fijó el principio “AI proposes → Human decides → Evidence remains visible”, las pantallas mínimas, los límites de alcance y los estados que debían representarse.

Durante la prueba, Iván también dirigió correcciones mediante intervenciones concretas. Al observar “3 pendientes”, señaló que la tarjeta actual debía seguir contando mientras no tuviera una acción; esto corrigió el contador. Luego preguntó si una decisión aceptada podía volver a editarse; a partir de esa revisión se incorporó la reapertura con conservación del historial y retiro del contenido del entregable. Estas decisiones humanas modificaron el comportamiento propuesto por las herramientas.

### 3. Construcción por porciones verticales

La aplicación se implementó con React y Vite en incrementos verificables:

1. Projects, New Project y Overview.
2. Work y acciones humanas.
3. Decisions e historial.
4. Deliverables, Sources y AI Activity.
5. Revisión responsive y accesibilidad acotada.
6. Corrección del modelo local para conservar múltiples proyectos, validar el almacenamiento y representar fallos y conflictos sin pérdida silenciosa.
7. Preparación de un contrato de análisis y un transporte local deshabilitado por defecto, con solicitud y fuentes seleccionadas separadas.

Esta estrategia permitió comprobar cada relación antes de ampliar el alcance. Por ejemplo, primero se verificó que una solicitud pudiera conservarse literalmente; después se añadió una propuesta y recién entonces el registro y el entregable derivado.

### 4. Pruebas y ajustes

Las pruebas fueron recorridos manuales internos en navegador. No constituyen pruebas con usuarios. Se verificaron creación, navegación, edición, aceptación, rechazo, mantenimiento en cola, reapertura, sincronización de contadores e inclusión o retiro del entregable.

Durante las pruebas se detectaron y corrigieron problemas concretos:

- el contador debía incluir la tarjeta actual mientras siguiera pendiente;
- una decisión aceptada debía poder reabrirse;
- el historial registraba dos veces una acción debido a un efecto secundario dentro de una actualización de estado de React;
- los rótulos de pendientes y decisiones debían flexionar correctamente en singular y plural; la corrección se verificó con cero, uno y varios;
- los estados seleccionados necesitaban información semántica además del cambio visual.
- el primer despliegue falló porque GitHub Pages todavía no estaba habilitado para GitHub Actions; se corrigió la configuración y el segundo intento completó build y publicación.

La verificación distingue pruebas automatizadas con respuestas ficticias, recorridos históricos de navegador/layout y el caso real mínimo exitoso. Las cifras y resultados se conservan en `docs/verification-2026-10-07.md`; no se suman como evidencias equivalentes.

En el lote multiproyecto se diferenciaron tres clases de comprobación. En navegador local se probaron proyectos independientes, fuentes aportadas, acciones humanas, activaciones repetidas, dos pestañas, responsive amplio y estrecho y un recorrido acotado con teclado. La revisión estática contrastó el esquema y las rutas de error con el código. Un almacenamiento simulado y aislado comprobó preservación de `v0.1`, migración válida única, escritura obsoleta, fallo de guardado, `v0.2` incompatible y recuperación programática del respaldo. Una entrada heredada malformada reveló una brecha; el lote correctivo incorporó validación completa antes de persistir y el retest confirmó que JSON inválido, propuestas malformadas y estructuras incompletas no crean `v0.2`. La auditoría accesible integral, las tecnologías de asistencia y la URL pública no se repitieron.

## d. Resultados

El resultado es una maqueta HTML navegable que permite:

- crear, listar y abrir múltiples proyectos locales sin reemplazar los anteriores;
- crear proyectos nuevos vacíos y conservar el proyecto demo como escenario separado;
- conservar la solicitud original sin reescritura;
- revisar en el demo tres propuestas ficticias claramente identificadas;
- consultar fuente, evidencia y explicación;
- aceptar, editar, rechazar o mantener pendiente;
- reabrir una decisión;
- consultar el historial sin borrar acciones anteriores;
- construir un borrador sólo con decisiones aceptadas;
- retirar automáticamente un bloque cuando su decisión se reabre;
- distinguir fuentes originales, interpretaciones, marcos y requisitos;
- consultar actividad observable sin afirmar que existe una IA ejecutándose;
- registrar una fuente aportada como “Aportada · sin revisar”, sin atribuirle las propuestas ficticias del proyecto;
- exportar un respaldo y detener escrituras cuando se detectan datos incompatibles o una pestaña desactualizada;
- preparar un análisis con la solicitud vigente y sólo las fuentes seleccionadas, sin mezclar contenido de fuentes con instrucciones del sistema;
- impedir que un resultado se incorpore silenciosamente cuando cambia la solicitud o una fuente seleccionada.

El candidato local usa v0.3, conserva formatos anteriores y mantiene las generaciones cerradas tras los intentos. El caso real exitoso preservó cita, incertidumbre, decisión y entregable al reabrir el navegador. El corpus de cuatro casos continúa sin ejecutar.

El código, la documentación y la evolución del proyecto están disponibles en:

https://github.com/Ivan-andrade7/ai-product-discovery-copilot

La última versión publicada comprobada puede recorrerse sin instalación en:

https://ivan-andrade7.github.io/ai-product-discovery-copilot/

La auditoría previa confirmó b56d9e6; después se publicaron 61704e7 y 73df887. La versión funcional publicada y comprobada es 08853c5, integrada por fast-forward en main y push normal, con el hotfix de Sources/grillas y foco móvil. Main y origin/main quedaron sincronizados; GitHub Actions finalizó correctamente y ambos alojamientos pasaron un smoke delimitado con assets coincidentes. La plataforma sigue siendo estática, con IA pública deshabilitada. Los commits exclusivamente documentales posteriores no cambian la versión funcional; enlaces y cobertura en el registro canónico.

### Evidencia visual seleccionada

Las figuras 1–5 documentan una versión histórica publicada. Las figuras 6–8 fueron tomadas localmente durante el lote multiproyecto; no muestran el hotfix actual ni acreditan el estado de producción. Todas usan datos ficticios.

![Figura 1. Overview con solicitud original y estado inicial.](../evidencia/screenshots/02-overview.png)

**Figura 1.** Overview conserva la entrada original y separa el estado verificable de la ruta sugerida.

![Figura 2. Propuesta editada y aceptada en Work.](../evidencia/screenshots/04-work-editada-aceptada.png)

**Figura 2.** Work mantiene visible el contexto de la propuesta y registra que la versión fue editada y aceptada.

![Figura 3. Historial después de reabrir una decisión.](../evidencia/screenshots/09-decisions-reabierta.png)

**Figura 3.** Decisions conserva la aceptación anterior y agrega la reapertura como una nueva acción.

![Figura 4. Entregable derivado de una decisión aceptada.](../evidencia/screenshots/06-deliverable-derivado.png)

**Figura 4.** Deliverables incorpora únicamente el contenido aceptado y muestra su origen.

![Figura 5. Reflow móvil de Work a 390 píxeles.](../evidencia/screenshots/10-work-mobile-390.png)

**Figura 5.** La vista móvil reorganiza la cola y las acciones en una sola columna.

![Figura 6. Lista real de proyectos en el candidato local.](../evidencia/screenshots/11-projects-multiproyecto-local.png)

**Figura 6.** Projects muestra dos proyectos locales independientes y su estado derivado.

![Figura 7. Fuente aportada sin revisar en el candidato local.](../evidencia/screenshots/13-sources-aportada-local.png)

**Figura 7.** Sources distingue la fuente aportada y no le atribuye propuestas demo.

![Figura 8. Vista amplia con textos ficticios extensos.](../evidencia/screenshots/12-overview-amplio-texto-largo-local.png)

**Figura 8.** El contexto amplio conserva jerarquía y legibilidad en el escenario inspeccionado; no constituye una prueba integral de responsive.

La aplicación conserva varios proyectos, sus fuentes, propuestas, decisiones y entregables mediante el formato local `v0.3`. Los proyectos nuevos empiezan sin propuestas; una fuente ingresada se mantiene “sin revisar” y el contenido simulado permanece en el demo separado. Las claves predecesoras se conservan y las migraciones se validan antes de persistir.

Los datos incompatibles se preservan para rescate y un fallo de guardado mantiene la copia en memoria exportable. La exportación existe y el respaldo pudo recuperarse programáticamente; todavía no hay importación desde la interfaz. Cada navegador mantiene su propia copia y no existe sincronización remota.

Pendiente para la versión final: seleccionar cuáles de estas capturas entrarán en el límite recomendado del informe.

## e. Análisis crítico

### Fortalezas

La principal fortaleza es la separación explícita entre entrada, interpretación y decisión. La solicitud original permanece visible y las propuestas no se presentan como hallazgos de research. El historial permite entender qué cambió y la reapertura evita convertir una decisión en algo irreversible.

La maqueta también mantiene proporcionalidad: representa el recorrido necesario para demostrar la idea sin intentar automatizar todo E1–E18. Esto facilita explicar el aporte de IA y el papel humano con un alcance defendible.

### Limitaciones

Las pruebas simuladas comprueban contrato y controles; una respuesta real exitosa demuestra el recorrido técnico mínimo en un caso ficticio. No demuestra calidad general, seguridad integral ni resistencia adversarial. No hay login, aislamiento multiusuario, PDF/imágenes, leads, portal ni monetización; persistencia sólo local. No hubo investigación primaria ni pruebas con usuarios, ni métricas de productividad.

La respuesta real devolvió type: string. El prompt ofrecía ese literal y el contrato aceptaba texto libre; el adaptador lo conservó sin normalización. Se corrigieron las nuevas respuestas para exigir Afirmación/evidence, Hipótesis/hypothesis o Pregunta/question, sin añadir inference. La respuesta histórica conserva string y su aceptación: no se presenta como salida del contrato revisado ni se modifica retroactivamente.

El contrato estructura `evidence`, `hypothesis` y `question`; `inference` no está implementada como categoría autónoma. El corpus conserva cuatro casos ficticios no ejecutados. La simulación no demuestra calidad del modelo, resistencia real a instrucciones engañosas ni costo máximo.

La aplicación detecta cambios observados entre pestañas y bloquea la copia desactualizada, pero `localStorage` no ofrece una transacción entre lectura y escritura. Por eso persiste un riesgo de carrera ante escrituras estrictamente simultáneas y no se afirma protección completa de concurrencia.

La migración conservadora funcionó para el ejemplo válido y rechazó sin escritura los casos malformado, inválido e incompleto probados. Esto no garantiza compatibilidad con cualquier dato heredado imaginable; los originales continúan disponibles para rescate.

La revisión accesible fue una inspección técnica limitada. Se revisaron reflow, jerarquía, foco y estados semánticos, pero no se ejecutó una auditoría WCAG completa ni pruebas con tecnologías de asistencia.

Después de 61704e7 se corrigieron cabecera y Work, incluidos en 73df887. La comprobación pública posterior encontró Sources desbordado a 901 px. El hotfix de Abacus extendió el apilado hasta 1024 px a las grillas equivalentes; el retest detectó además foco móvil parcialmente recortado, reproducido en la base. Ambos se corrigieron y publicaron en 08853c5. El smoke de ocho vistas pasó en ambos alojamientos: 112 mediciones de layout y 96 de foco por sitio, anchos 320/360/390/430/901/1024/1025/1280, creación/apertura, Enter/ruta activa, persistencia y consola sin errores/advertencias observados. Edge headless, datos ficticios, sin llamadas de IA, credenciales ni acceso al registro económico. Cada dominio conserva almacenamiento independiente. No acredita accesibilidad integral, seguridad integral, lector de pantalla ni otros motores; se conservan antecedentes.

### Evaluación AIBPS

**Ágil.** El recorrido concentra propuesta, contexto y decisión en una misma zona de trabajo, y actualiza automáticamente el historial y el entregable. Esto demuestra una intención de reducir trabajo manual, pero no se midió ahorro de tiempo.

**Fluida.** La navegación mantiene continuidad entre Overview, Work, Decisions y Deliverables. En móvil las columnas se reorganizan y las acciones se apilan. La fluidez observada es técnica e interna; falta validarla con otras personas.

**Protegida.** La demo y pruebas locales usan datos ficticios; los dos intentos autorizados enviaron sólo texto ficticio a Abacus mediante un servicio privado local. Claves fuera del repositorio y consumo cerrado después. Esto no acredita seguridad integral ni aislamiento entre usuarios. El uso con clientes requiere permisos, privacidad y tratamiento de fuentes todavía no implementados.

**Bajo control humano.** Es la dimensión más desarrollada: ninguna propuesta entra al entregable sin aceptar o editar y aceptar; rechazar o mantener pendiente no la incorpora; reabrir la retira; el historial conserva la acción anterior. Aun así, controlar una propuesta no equivale a validarla con evidencia externa.

## f. Conclusiones

El trabajo permitió transformar una visión amplia en un producto demostrable y coherente con el nivel técnico admitido por la consigna. El aprendizaje principal fue que usar IA de manera profesional no consiste sólo en generar más contenido, sino en conservar el origen, explicitar la incertidumbre y diseñar momentos de decisión humana.

También resultó valioso trabajar mediante incrementos pequeños y verificables. Las pruebas revelaron errores que no eran visibles en el diseño estático, como la duplicación del historial y la relación entre reapertura y entregable. Esto mostró la diferencia entre imaginar un flujo y comprobar su comportamiento.

El recorrido real mínimo quedó demostrado, pero requiere evaluación adicional antes de uso general. Contador 3/5, permisos consumidos y halted: true. Tokens no disponibles; saldo 13.897 → 13.889 y panel con 21,3 créditos API diarios del 13/10 no permiten atribución individual. La reconciliación sigue pendiente; futuras llamadas requieren nueva autorización. Leads, portal y monetización siguen como visión futura.

## Pendientes para convertir este borrador en entrega

1. Revisar contenido, selección de capturas y extensión antes de retirar la marca de borrador.
2. Reconfirmar la fecha contra cualquier aviso docente posterior.
3. Registrar el modelo exacto de Codex si puede recuperarse; de lo contrario, mantener la limitación declarada.
4. Resolver la conversión oficial, reconciliar el consumo desconocido de la consulta de catálogo y calcular conservadoramente el lote completo.
5. Revisar el cierre local y decidir futuras evaluaciones mediante autorización separada; los cuatro casos del corpus continúan sin ejecutar.
6. Responsive y foco publicados, cerrados en la cobertura probada. Antes de exponer IA a Iván o clientes, definir un incremento protegido con autenticación, backend, secretos, persistencia y controles de uso/costo. No está implementado; cualquier incremento, llamada, infraestructura o publicación futura requiere alcance y autorización propios.
