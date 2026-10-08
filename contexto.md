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
- AI Activity muestra hechos de la sesión y aclara que no existen llamadas reales a un modelo.
- Todas las secciones del recorrido base están habilitadas.
- El estado local vigente admite múltiples proyectos reales: crear uno no reemplaza los anteriores y cada proyecto conserva fuentes, propuestas, decisiones y entregables por separado.
- El almacenamiento vigente usa el formato `v0.2`. La clave `v0.1` se conserva intacta y sólo se usa como origen de una migración conservadora cuando todavía no existe un estado `v0.2`.
- Las fuentes ingresadas por la persona se muestran como “Aportada · sin revisar”. Las propuestas preparadas para un proyecto nuevo se identifican como ficticias y no se atribuyen a esas fuentes.
- La interfaz bloquea escrituras desde una pestaña desactualizada, permite cargar el estado externo y ofrece exportación de respaldo. Esta protección no elimina por completo la carrera posible entre escrituras estrictamente simultáneas.
- Los datos `v0.2` incompatibles no se reinician silenciosamente. Se preservan para rescate; ante un fallo de guardado, la copia en memoria permanece exportable.
- La salida convertida desde `v0.1` se valida antes de persistirse. Propuestas malformadas, JSON inválido y estructuras incompletas activan recuperación sin crear `v0.2`; la clave original permanece intacta.
- Los rótulos de pendientes y decisiones flexionan correctamente cero, uno y varios en los escenarios comprobados.
- La recuperación de un respaldo fue comprobada programáticamente. Todavía no existe una acción de importación desde la interfaz.
- Este lote existe sólo en el árbol de trabajo local: no tiene commit, push ni publicación. GitHub Pages conserva la versión pública anterior.
- Vercel sigue siendo el alojamiento preferido y el repositorio tiene preparación previa, pero este lote no fue desplegado.

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

Decidir el versionado del candidato local corregido. Una publicación posterior requiere autorización separada: el workflow vigente despliega GitHub Pages ante un push a `main`, por lo que ese push también publicaría. IA real, autenticación, backend, sincronización, leads y servicios externos siguen fuera de este lote.

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

## Verificación vigente del lote multiproyecto local

- Navegador local con datos ficticios: PASS para crear dos proyectos, abrir cada tarjeta, conservar estados independientes, mostrar el nombre activo y representar una fuente aportada como “Aportada · sin revisar”.
- Navegador local: PASS para aceptar, editar y aceptar, rechazar, mantener pendiente, reabrir, actualizar contadores, conservar historial, derivar entregables y registrar actividad.
- Navegador local: PASS para doble clic y repetición por teclado sin resolver la propuesta siguiente.
- Dos pestañas locales: PASS observado para un cambio casi simultáneo; una pestaña guardó y la otra quedó bloqueada hasta cargar los cambios externos. Esto demuestra detección en el escenario probado, no exclusión mutua completa.
- Comprobación estática: el código valida el esquema `v0.2`, conserva la clave `v0.1` y separa contenido ficticio de fuentes aportadas.
- Almacenamiento simulado y aislado: PASS para preservación literal de `v0.1`, migración válida única, rechazo de `v0.1` malformado/JSON inválido/incompleto sin crear `v0.2`, prioridad de un `v0.2` válido, preservación de `v0.2` incompatible, bloqueo de escritura obsoleta, fallo de escritura y recuperación programática del respaldo.
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
