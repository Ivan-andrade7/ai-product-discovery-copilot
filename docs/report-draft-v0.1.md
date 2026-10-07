# Trabajo Final Integrador

## AI Product Discovery Copilot

Estado: borrador documental v0.1. No es todavía el PDF final.

## a. Introducción

### Justificación

> “Elegí este tema porque quiero aprender a conducir proyectos de producto de manera más ordenada y, al mismo tiempo, trabajar con mayor agilidad al transformar solicitudes incompletas en decisiones y entregables de diseño.”

La idea surgió mientras revisaba mi propio proceso de UX/UI y Product Design. Todavía no contaba con una forma de trabajo end-to-end consolidada y necesitaba comprender mejor qué información hace falta, qué puede descubrirse durante el proceso y cómo conservar las decisiones tomadas. A esa necesidad de aprendizaje se sumó un feedback recibido durante una experiencia en NoCountry: debía ganar agilidad, especialmente en UI, prototipado y preparación de propuestas.

La solución elegida es **AI Product Discovery Copilot**, una plataforma conceptual que recibe una solicitud de producto, incluso incompleta, y ayuda a organizarla como evidencia, supuestos, preguntas, propuestas y decisiones trazables. La IA funciona como asistencia; la persona conserva el control sobre qué aceptar, editar, rechazar o mantener pendiente.

### Objetivo

El objetivo del trabajo es demostrar, mediante una maqueta HTML navegable, cómo una interfaz asistida por IA podría acompañar una primera parte del proceso de discovery sin reemplazar la fuente original ni presentar inferencias como hechos. El recorrido mínimo implementado es:

**solicitud original → propuesta simulada de IA → revisión humana → decisión → historial → entregable derivado**.

La entrega corresponde al Nivel 2 admitido por la consigna: una maqueta navegable que muestra el funcionamiento potencial aunque no exista todavía un backend o una integración real con un modelo.

## b. Marco conceptual

### IA generativa como asistencia

En este proyecto la IA generativa se entiende como una herramienta capaz de ayudar a ordenar información, formular propuestas, señalar preguntas abiertas y producir borradores. No se la trata como una fuente independiente de evidencia ni como responsable final de una decisión de producto.

### Control humano

El principio rector del producto es: **la IA propone, la persona decide y la evidencia permanece visible**. Aceptar una propuesta no demuestra que haya sido validada con usuarios. Sólo registra que una persona decidió incorporarla al estado vigente de la demo.

### Trazabilidad

La trazabilidad permite reconstruir qué entrada originó una propuesta, qué explicación la acompañó, qué acción tomó la persona y qué versión llegó al entregable. Por eso la aplicación separa Work, Sources, Decisions, Deliverables y AI Activity en lugar de presentar una única respuesta extensa de chat.

### Herramientas

Se utilizaron herramientas de exploración visual y de implementación asistida. Figma y Figma Make se usaron para trabajar estructura y variantes visuales; UXPilot y Abacus.AI aportaron alternativas exploratorias; Codex asistió la construcción de la maqueta React, las pruebas, las correcciones y la documentación. React, Vite, ESLint y Git sostienen la implementación y su verificación, pero no son modelos de IA.

Figma Make y UXPilot no mostraron para Iván un modelo identificable. Abacus.AI se utilizó en su modalidad gratuita, sin que quedara registrado el modelo subyacente. Estas limitaciones se declaran en lugar de atribuir nombres no verificados.

## c. Metodología

### 1. Recuperación y delimitación

El proyecto comenzó recuperando la consigna, las notas existentes y el contexto de una idea inicialmente muy amplia: asistir las etapas E1–E18 del proceso UX/Product de punta a punta. Esa visión incluía investigación, definición, wireframes, prototipos y posibles usos futuros con clientes.

Para evitar construir una plataforma demasiado grande para el TP, se separó una base académica de las extensiones futuras. La base quedó definida como una maqueta navegable con datos ficticios y control humano. Se dejaron fuera autenticación, base de datos, multiusuario, leads, CRM, automatizaciones, integraciones, despliegue e IA real.

### 2. Exploración visual

Se generaron variantes en Figma Make, UXPilot y Abacus.AI a partir de instrucciones extensas. Estas alternativas ayudaron a comparar estructuras y a consolidar en Figma un recorrido con proyectos, overview, workbench, fuentes, decisiones, entregables y actividad.

Las variantes fueron exploratorias. No se interpretaron como validación ni como evidencia de que una estructura funcionaría para usuarios reales.

### 3. Construcción por porciones verticales

La aplicación se implementó con React y Vite en incrementos verificables:

1. Projects, New Project y Overview.
2. Work y acciones humanas.
3. Decisions e historial.
4. Deliverables, Sources y AI Activity.
5. Revisión responsive y accesibilidad acotada.

Esta estrategia permitió comprobar cada relación antes de ampliar el alcance. Por ejemplo, primero se verificó que una solicitud pudiera conservarse literalmente; después se añadió una propuesta y recién entonces el registro y el entregable derivado.

### 4. Pruebas y ajustes

Las pruebas fueron recorridos manuales internos en navegador. No constituyen pruebas con usuarios. Se verificaron creación, navegación, edición, aceptación, rechazo, mantenimiento en cola, reapertura, sincronización de contadores e inclusión o retiro del entregable.

Durante las pruebas se detectaron y corrigieron problemas concretos:

- el contador debía incluir la tarjeta actual mientras siguiera pendiente;
- una decisión aceptada debía poder reabrirse;
- el historial registraba dos veces una acción debido a un efecto secundario dentro de una actualización de estado de React;
- algunos textos no concordaban en singular y plural;
- los estados seleccionados necesitaban información semántica además del cambio visual.

La revisión final incluyó `lint`, build de producción, consola del navegador y una inspección responsive a 390 × 844 píxeles.

## d. Resultados

El resultado es una maqueta HTML navegable que permite:

- crear o abrir un proyecto local;
- conservar la solicitud original sin reescritura;
- revisar tres propuestas ficticias claramente identificadas;
- consultar fuente, evidencia y explicación;
- aceptar, editar, rechazar o mantener pendiente;
- reabrir una decisión;
- consultar el historial sin borrar acciones anteriores;
- construir un borrador sólo con decisiones aceptadas;
- retirar automáticamente un bloque cuando su decisión se reabre;
- distinguir fuentes originales, interpretaciones, marcos y requisitos;
- consultar actividad observable sin afirmar que existe una IA ejecutándose.

El código, la documentación y la evolución del proyecto están disponibles en:

https://github.com/Ivan-andrade7/ai-product-discovery-copilot

### Evidencia visual seleccionada

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

La aplicación funciona únicamente en memoria. Al recargar se reinician el proyecto creado, las decisiones y el historial. Esta limitación es intencional para mantener la entrega en el alcance de una maqueta navegable.

Pendiente para la versión final: seleccionar cuáles de estas capturas entrarán en el límite recomendado del informe.

## e. Análisis crítico

### Fortalezas

La principal fortaleza es la separación explícita entre entrada, interpretación y decisión. La solicitud original permanece visible y las propuestas no se presentan como hallazgos de research. El historial permite entender qué cambió y la reapertura evita convertir una decisión en algo irreversible.

La maqueta también mantiene proporcionalidad: representa el recorrido necesario para demostrar la idea sin intentar automatizar todo E1–E18. Esto facilita explicar el aporte de IA y el papel humano con un alcance defendible.

### Limitaciones

Las propuestas están preparadas localmente y no provienen de un modelo conectado. No existe persistencia, autenticación, colaboración, protección de datos de clientes ni integración con servicios externos. Tampoco se realizaron entrevistas o pruebas con usuarios, por lo que no puede afirmarse que la solución mejore productividad, comprensión o calidad de las decisiones.

La revisión accesible fue una inspección técnica limitada. Se revisaron reflow, jerarquía, foco y estados semánticos, pero no se ejecutó una auditoría WCAG completa ni pruebas con tecnologías de asistencia.

### Evaluación AIBPS

**Ágil.** El recorrido concentra propuesta, contexto y decisión en una misma zona de trabajo, y actualiza automáticamente el historial y el entregable. Esto demuestra una intención de reducir trabajo manual, pero no se midió ahorro de tiempo.

**Fluida.** La navegación mantiene continuidad entre Overview, Work, Decisions y Deliverables. En móvil las columnas se reorganizan y las acciones se apilan. La fluidez observada es técnica e interna; falta validarla con otras personas.

**Protegida.** La demo usa datos ficticios, no transmite información a servicios externos y no almacena datos personales. Sin embargo, una versión futura con clientes necesitaría autenticación, permisos, privacidad, tratamiento de fuentes y políticas de retención.

**Bajo control humano.** Es la dimensión más desarrollada: ninguna propuesta entra al entregable sin aceptar o editar y aceptar; rechazar o mantener pendiente no la incorpora; reabrir la retira; el historial conserva la acción anterior. Aun así, controlar una propuesta no equivale a validarla con evidencia externa.

## f. Conclusiones

El trabajo permitió transformar una visión amplia en un producto demostrable y coherente con el nivel técnico admitido por la consigna. El aprendizaje principal fue que usar IA de manera profesional no consiste sólo en generar más contenido, sino en conservar el origen, explicitar la incertidumbre y diseñar momentos de decisión humana.

También resultó valioso trabajar mediante incrementos pequeños y verificables. Las pruebas revelaron errores que no eran visibles en el diseño estático, como la duplicación del historial y la relación entre reapertura y entregable. Esto mostró la diferencia entre imaginar un flujo y comprobar su comportamiento.

Como evolución futura, la prioridad recomendada es incorporar persistencia local o una operación real y acotada de IA manteniendo la misma trazabilidad. La captación de leads, el portal de clientes y las integraciones deberían considerarse después, cuando el flujo central esté probado y existan reglas de privacidad y permisos.

## Pendientes para convertir este borrador en entrega

1. Recuperar entre tres y cinco prompts representativos.
2. Revisar contenido, selección de capturas y extensión antes de retirar la marca de borrador.
3. Reconfirmar la fecha contra cualquier aviso docente posterior.
