# AI Product Discovery Copilot — TP Final

Trabajo Final Integrador individual de la Diplomatura en IA Aplicada a Entornos Digitales de Gestión.

Repositorio público: https://github.com/Ivan-andrade7/ai-product-discovery-copilot

Demo navegable: https://ivan-andrade7.github.io/ai-product-discovery-copilot/

## Qué busca demostrar

Una plataforma asistida por IA puede ayudar a transformar una solicitud incompleta en propuestas revisables y trazables sin ocultar las fuentes, los supuestos ni las decisiones humanas.

Principio rector:

> AI proposes → Human decides → Evidence remains visible.

## Entrega base y evolución vigente

La versión pública demuestra una maqueta navegable con datos ficticios y preparación de IA cerrada a consumo. Su código incluye el cierre de un ensayo privado local exitoso del recorrido mínimo con `claude-sonnet-4-6`, en un único caso ficticio controlado; ese ensayo no habilita IA pública ni publica sus datos privados. Las generaciones están deshabilitadas.

1. crear o abrir un proyecto demo;
2. conservar la solicitud original;
3. en el proyecto demo, mostrar propuestas simuladas y claramente identificadas;
4. revisar propuestas mediante aceptar, editar, rechazar o mantener pendiente;
5. consultar fuentes y razonamiento;
6. reabrir decisiones y crear nuevas versiones;
7. consultar un entregable y el registro de actividad.

## Estado

El repositorio contiene una aplicación React + Vite navegable. Versión funcional publicada y comprobada en GitHub Pages y Vercel: `e2befd6`, Lote 1 de control e integridad, integrado en main por fast-forward y push normal. Main y origin/main quedaron sincronizados en ese commit al publicar el lote. Conserva el hotfix de Sources/grillas y foco móvil `08853c5` como antecedente. F02, F03, F09 y F08 mínimo pasaron en ambos alojamientos con los mismos assets verificados; el smoke incluyó vistas, persistencia, errores aislados, responsive y teclado. La plataforma sigue siendo estática y la IA pública permanece deshabilitada. Un cierre exclusivamente documental posterior no cambia esa versión funcional. No se declara accesibilidad integral. Resultados, enlaces y límites: [`docs/verification-2026-10-07.md`](docs/verification-2026-10-07.md).

El Lote 1 conserva borradores por proyecto/propuesta sólo durante la sesión, con descarte, confirmación y aviso antes de salir con cambios reales. No forman parte de `v0.3`, decisiones ni respaldos y se pierden al recargar/cerrar. Reintentar una creación reutiliza el mismo candidato; Sources abre el destino exacto o muestra recuperación; una solicitud sólo en blanco se rechaza sin reescribir las válidas. Instrucciones en [`app/README.md`](app/README.md).

La primera porción vertical del producto ya está implementada con datos locales:

1. listado real de múltiples proyectos locales;
2. formulario para crear un proyecto;
3. preservación literal de la solicitud original;
4. acceso al Overview del proyecto creado o del proyecto demo;
5. proyectos nuevos vacíos y un proyecto demo separado con propuestas simuladas;
6. fuente, evidencia y explicación visibles para cada propuesta;
7. aceptar, editar, rechazar, mantener pendiente y reabrir decisiones;
8. historial de acciones humanas sin sobrescribir entradas anteriores;
9. comparación entre propuesta original y versión posterior a la acción;
10. entregable derivado únicamente de decisiones aceptadas;
11. retiro automático del entregable cuando una decisión se reabre;
12. inventario de fuentes que diferencia entrada, interpretación, método y requisito;
13. actividad verificable sin registrar llamadas externas que no ocurrieron;
14. contadores del Overview sincronizados con las decisiones;
15. estados verificables y límites explícitos de la simulación;
16. almacenamiento local versionado como `v0.3`, con migración conservadora y preservación de las claves predecesoras;
17. fuentes aportadas visibles como “Aportada · sin revisar” y propuestas demo explícitamente no derivadas de esas fuentes;
18. detección de cambios entre pestañas, recuperación ante datos incompatibles o fallos de guardado y exportación de respaldo;
19. contrato y transporte local preparados para transmitir la solicitud vigente y sólo las fuentes seleccionadas, en mensajes separados;
20. bloqueo de resultados obsoletos si cambia la solicitud o el contenido de una fuente seleccionada.

Las pruebas locales con respuestas simuladas comprueban contrato, mensaje, almacenamiento y controles. Por separado, una respuesta real válida permitió revisar una cita literal e incertidumbre, aceptar la propuesta y comprobar decisión, entregable y persistencia; un intento anterior permanece fallido. La aceptación fue una acción de prueba del asistente tras revisar contenido ficticio, no un estudio con usuarios. Un caso no acredita calidad general ni seguridad integral. El detalle, las cifras de pruebas y el historial están en [`docs/verification-2026-10-07.md`](docs/verification-2026-10-07.md).

Para nuevas respuestas, `type` exige Afirmación/evidence, Hipótesis/hypothesis o Pregunta/question. El valor histórico `string` se conserva sin normalización. No está implementada la categoría `inference`.

Control económico vigente: 3/5, ambas autorizaciones consumidas y `halted: true`. Tokens no disponibles; saldo observado 13.897 → 13.889 y 21,3 créditos API agregados del 13/10, sin atribución individual ni reconciliación inventada. No hay permiso ni habilitación para otra generación.

## Cómo probar la solución

1. Entrar en `app/` e instalar las dependencias respetando el archivo de bloqueo existente.
2. Ejecutar el script `dev` del proyecto y abrir la dirección informada por Vite.
3. Abrir el proyecto demo o crear un proyecto nuevo, que empezará sin propuestas.
4. Revisar la solicitud original en Overview y entrar a Work.
5. Aceptar o editar una propuesta y consultar Decisions y Deliverables.
6. Reabrir la decisión desde Work y comprobar que el historial se conserva y el bloque sale del entregable.
7. Recargar el navegador para comprobar la persistencia local.
8. Consultar Sources y AI Activity para entender la procedencia y los límites de la demo.

Los detalles técnicos y comandos de verificación están en [`app/README.md`](app/README.md). El registro académico de prompts está en [`docs/prompt-log.md`](docs/prompt-log.md). El corpus preliminar, todavía no ejecutado, está en [`docs/ai-evaluation-corpus.md`](docs/ai-evaluation-corpus.md).

La demo pública de GitHub Pages y `https://ai-product-discovery-copilot.vercel.app/` contienen la adaptación oscura vigente. El despliegue es estático: no publica el servicio auxiliar ni habilita llamadas de IA.

## Base técnica

- React para construir la interfaz mediante componentes reutilizables.
- Vite para desarrollo local y generación de la versión distribuible.
- ESLint para revisión estática.
- `localStorage` para persistencia local versionada.

Scripts disponibles dentro de `app/`:

- `dev`: inicia una vista local de desarrollo.
- `lint`: revisa el código.
- `build`: genera la versión distribuible en `app/dist/`.

## Navegación del repositorio

- `app/`: implementación de la maqueta navegable.
- `docs/`: documentación necesaria para construir y entregar.
- `evidencia/`: capturas y registros verificables del proceso.
- `contexto.md`: estado vigente, decisiones y próximo gate.
- `AGENTS.md`: reglas de alcance, autoridad y seguridad.

## Fuentes principales

- Consigna académica original: archivo local `Trabajo Final Integrador.pdf`.
- Síntesis durable: Notion, página “Consigna oficial — Trabajo Final Integrador · Cohorte 2026”.
- Planteo del producto: Notion, página “TP Final Integrador — AI Product Discovery Copilot”.
- Diseño vigente: Figma, archivo “AI Product Discovery Copilot — Wireframes consolidados”.
- Código y documentación: GitHub, repositorio `Ivan-andrade7/ai-product-discovery-copilot`.

## Límites actuales

Está implementado el recorrido base completo: Projects, New Project, Overview, Work, Sources, Decisions, Deliverables y AI Activity.

La revisión interna cubrió estructura semántica, estados seleccionados, foco visible, objetivos táctiles y reflow móvil. Es una inspección técnica acotada: no demuestra conformidad integral de accesibilidad ni sustituye una prueba de usabilidad.

Cada navegador conserva sus proyectos en `localStorage` mediante el formato `v0.3`; no existen cuentas, aislamiento entre usuarios ni sincronización entre dispositivos. Las claves predecesoras se conservan y las migraciones se validan antes de persistir. El respaldo se puede exportar y su recuperación fue comprobada programáticamente; todavía no existe importación desde la interfaz.

La detección entre pestañas bloquea una copia desactualizada y permite cargar la versión externa, pero no es un sistema transaccional: queda un riesgo residual ante escrituras realmente simultáneas. Existe un servicio auxiliar local restringido a loopback, pero no un backend remoto de producto. El transporte y el registro económico duradero están preparados; las generaciones continúan deshabilitadas. No están implementados login, aislamiento multiusuario, adjuntos PDF/imágenes, sincronización remota, leads, portal ni monetización operativa.

Próximo gate: **Lote 2 — orientación y accesibilidad básica**, todavía no implementado y sujeto a autorización separada. Primero se auditará el comportamiento; después se implementarán F01 (regreso explícito a Projects), F11 (idioma/título) y F12 (orientación del foco), respetando la protección de borradores. No incluye microcopy integral, ayuda, espaciado general ni rediseño; no declara accesibilidad integral. El incremento protegido de IA continúa como objetivo posterior independiente, no habilitado. Estado y alcance en [`contexto.md`](contexto.md).
