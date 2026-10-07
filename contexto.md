# Contexto vigente

## Fecha de corte

7 de octubre de 2026.

## Estado observado

- El tema y el problema del TP están definidos de manera provisional.
- La consigna fue contrastada con el PDF original local de cinco páginas.
- La fecha del 8 de noviembre de 2026 a las 23:59 aparece en esa copia; debe reconfirmarse si existe un aviso docente posterior.
- Existe un archivo Figma con wireframes consolidados y recorrido navegable.
- Se realizaron ensayos técnicos internos con Iván; no constituyen validación con usuarios.
- No hay research primario acreditado.
- El repositorio público está disponible en `https://github.com/Ivan-andrade7/ai-product-discovery-copilot`.
- Los commits publicados usan el correo anónimo `Ivan-andrade7@users.noreply.github.com`.
- La base React + Vite fue inicializada dentro de `app/`; lint y build pasaron correctamente.
- El recorrido funcional base está completo: Projects → New Project → Overview → Work → Sources / Decisions / Deliverables / AI Activity.
- La creación conserva literalmente la solicitud original y funciona con estado local en memoria.
- Work permite revisar propuestas simuladas con fuente, evidencia y razonamiento visibles.
- Aceptar, editar, rechazar y reabrir actualizan el estado; mantener pendiente conserva el elemento en la cola.
- Decisions registra cada acción una sola vez, conserva entradas previas y compara propuesta original con versión resultante.
- El historial usa una secuencia local explícita y no inventa fechas.
- Deliverables incluye sólo propuestas aceptadas o editadas y aceptadas; reabrir retira el bloque automáticamente.
- Sources diferencia entradas originales, interpretaciones, referencias metodológicas y requisitos académicos.
- AI Activity muestra hechos de la sesión y aclara que no existen llamadas reales a un modelo.
- Todas las secciones del recorrido base están habilitadas.

## Decisión vigente

La entrega base será una maqueta HTML navegable de Nivel 2. Una extensión funcional con IA sólo se considerará después de estabilizar esa base.

Si existe tiempo adicional, la expansión seguirá este orden:

1. IA real acotada;
2. mayor cobertura del proceso;
3. entrada de leads separada del workspace interno;
4. gestión inicial de leads;
5. área del cliente e integraciones.

## Alcance base

El producto demo permitirá conservar una solicitud original, revisar propuestas simuladas de IA, distinguir evidencia y supuestos, registrar decisiones, reabrir elementos resueltos y mostrar versiones y actividad.

## Criterio de cierre

- recorrido HTML completo y navegable;
- estados críticos representados y sin callejones sin salida;
- solicitud, propuesta, decisión y versión distinguibles;
- README claro;
- evolución verificable en Git;
- herramientas y modelos identificados;
- capturas suficientes para el informe;
- simulaciones y limitaciones declaradas;
- material suficiente para redactar honestamente metodología, resultados y análisis AIBPS.

## Próximo gate

Estabilizar la entrega: ejecutar un repaso integral de contenido y navegación, preparar capturas verificables para el informe y mapear cada requisito académico al artefacto que lo demuestra. Luego decidir, según tiempo disponible, entre persistencia local o una integración de IA muy acotada. Leads, despliegue y servicios externos siguen fuera del alcance base.

## Verificación técnica inicial

- Base: React 19.3.0 + Vite 8.3.3.
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
- Backend, persistencia, IA real y servicios externos: no implementados.

## Autoridades y localizadores

- Notion TP: https://app.notion.com/p/3e3fd0da0de5810597f7c8340688197e
- Notion consigna: https://app.notion.com/p/3eafd0da0de5812fa931d85f4cf7f8b1
- Figma: https://www.figma.com/design/zX5zJeg5WeE1q4E3zDkQv2/AI-Product-Discovery-Copilot-%E2%80%94-Wireframes-consolidados
- GitHub: https://github.com/Ivan-andrade7/ai-product-discovery-copilot
- PDF original local: `C:\Users\ivana\Downloads\Trabajo Final Integrador.pdf`
