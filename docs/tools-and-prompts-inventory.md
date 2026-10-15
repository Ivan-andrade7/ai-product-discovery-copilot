# Inventario de herramientas, modelos y prompts

Fecha de revisión vigente: 15 de octubre de 2026. El corte inicial del 7 de octubre se conserva como antecedente en los registros enlazados.

## Regla de lectura

Este inventario distingue uso verificado, función en el proceso y datos todavía no recuperados. Mencionar una herramienta no implica que haya ejecutado IA real dentro del prototipo.

## Herramientas verificadas

| Herramienta | Uso observado | Resultado conservado | Modelo o versión |
| --- | --- | --- | --- |
| Notion | Documentación del planteo y de la consigna transcripta; registro de aclaraciones | Páginas del TP y de la consigna | No corresponde como modelo; Notion documenta, no ejecuta el producto |
| Figma Design | Consolidación de arquitectura, pantallas y estados del recorrido | Archivo “AI Product Discovery Copilot — Wireframes consolidados” | No aplica a la edición manual; cualquier función de IA usada debe declararse por separado |
| Figma Make | Generación exploratoria de una versión visual a partir de un prompt | Proyecto compartido por Iván | Iván no tuvo acceso a un nombre de modelo identificable |
| UXPilot | Exploración de variantes visuales | Capturas aportadas por Iván | Iván no tuvo acceso a un nombre de modelo identificable |
| Abacus.AI | Exploración de otra versión generada | Conversación enlazada por Iván | Modalidad gratuita; modelo/agente exacto no identificado |
| Abacus API / Basic | Dos generaciones personales autorizadas: primera fallida, segunda válida en un caso ficticio mínimo | Recorrido real mínimo, decisión, entregable y persistencia; generaciones cerradas después | claude-sonnet-4-6 solicitado e informado; tokens no disponibles; no valida calidad general |
| Codex | Lectura de fuentes, implementación React, revisión, correcciones y documentación | Lote 1 e2befd6 versionado/publicado; hotfix 08853c5 histórico, cierre documental separado | Identificador exacto del modelo pendiente de recuperar desde una fuente verificable |
| React | Construcción de la interfaz por componentes | Aplicación navegable | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| Vite | Entorno de desarrollo y build local | Build local verificado | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| ESLint | Revisión estática | Verificación local PASS | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| Git | Historial y comparación entre estado publicado y árbol local | e2befd6 integrado por fast-forward; push normal y main y origin/main sincronizados al publicar el lote; ramas conservadas | No es IA |
| GitHub Actions y Pages / Vercel | Alojamiento estático existente | e2befd6: workflow success, despliegue Production completado; assets coincidentes y smoke público satisfactorio | No son IA; IA pública deshabilitada, límites y enlaces en el registro canónico |
| Navegador local | Pruebas funcionales y visuales | Recorridos y estados inspeccionados | No es IA |
| Almacenamiento local simulado | Pruebas aisladas de migración, incompatibilidad, conflicto, fallo de escritura y recuperación | Resultado programático del lote local | No es IA ni prueba un backend real |

## Herramientas mencionadas, sin uso acreditado en el producto

- Los videos de YouTube compartidos fueron inspiración; su contenido no está resumido ni atribuido como decisión técnica verificable.
- Gemini, Google AI Studio, NotebookLM, n8n y otras herramientas aparecen en la consigna o en posibilidades previas; no se declaran usadas sin evidencia. Claude Sonnet 4.6 sí figura en los dos intentos API registrados, no como validación de otros usos.
- No hay backend remoto, autenticación ni sincronización. Hubo un ensayo real mínimo exitoso mediante servicio privado local, ahora bloqueado: 3/5, halted: true y ambos permisos consumidos, sin autorización para nuevas generaciones. La IA pública está deshabilitada. El consumo agregado de 21,3 créditos no permite atribución individual; detalle en el registro de verificación.

## Familias de prompts verificables

### Exploración visual

El **Prompt maestro de exploración visual v0.1** fue recuperado de la página Notion del proyecto y quedó conservado en `docs/prompt-log.md`. Se verificó su uso como base para producir alternativas en Figma Make, UXPilot y Abacus.AI.

Estado: uso y texto verificables. Las salidas fueron exploratorias; no prueban validación ni selección automática.

### Implementación asistida

La implementación se realizó de manera iterativa, no mediante un único prompt final:

1. construir Projects, New Project y Overview;
2. incorporar Work y sus decisiones humanas;
3. registrar el historial en Decisions;
4. derivar Deliverables, Sources y AI Activity;
5. probar estados y corregir errores;
6. revisar responsive y accesibilidad de forma acotada.
7. convertir el estado único en múltiples proyectos locales, versionar el almacenamiento y probar recuperación y conflictos entre pestañas.

Estado: secuencia verificable por archivos, pruebas y commits. `docs/prompt-log.md` conserva intervenciones literales sobre contador, reapertura, navegación y recorte de alcance.

## Correcciones útiles para la metodología

- Se corrigió un contador que no debía disminuir al mantener una propuesta pendiente.
- Se añadió reapertura de decisiones para evitar estados irreversibles.
- Se detectó y corrigió un historial duplicado causado por una actualización con efectos secundarios en React.
- Se corrigieron concordancias de singular/plural surgidas durante las pruebas.
- Se añadieron estados semánticos y foco visible después de la revisión responsive/accesible.
- Se reemplazó el listado estático por proyectos locales reales e independientes.
- Se separaron las fuentes aportadas sin revisar de las propuestas ficticias.
- Se incorporaron migración conservadora `v0.1` → `v0.2`, exportación, recuperación y bloqueo ante conflictos observados entre pestañas.
- Se evitó que una activación repetida resolviera la propuesta siguiente.
- La auditoría UX posterior llevó al Lote 1 publicado: borradores de sesión separados del estado confirmado, reintento de creación con identidad estable, destino exacto desde Sources y rechazo de solicitudes sólo en blanco. La evidencia local y pública se distingue en [`verification-2026-10-07.md`](verification-2026-10-07.md); no hubo nuevas llamadas de IA, credenciales ni acceso al registro económico.

## Pendientes mínimos

1. Confirmar el modelo usado por Codex en las sesiones principales si la interfaz permite recuperarlo; de lo contrario, declarar la limitación.
2. Seleccionar tres ejemplos breves del registro para el PDF final y mantener el prompt extenso en el repositorio.
3. Próximo gate: Lote 2 — orientación y accesibilidad básica (F01/F11/F12), aún no implementado; primero auditar y después implementar con autorización separada, respetando borradores. Excluye microcopy integral, ayuda, espaciado general y rediseño; no declara accesibilidad integral. Alcance en [`../contexto.md`](../contexto.md). Responsive previo cerrado en su cobertura; el incremento protegido de IA continúa como objetivo posterior independiente, sin habilitar consumos.
