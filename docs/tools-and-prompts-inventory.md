# Inventario de herramientas, modelos y prompts

Fecha de revisión: 7 de octubre de 2026.

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
| Codex | Lectura de fuentes, implementación React, revisión, correcciones y documentación | Aplicación y documentos locales; el lote vigente aún no tiene commit | Identificador exacto del modelo pendiente de recuperar desde una fuente verificable |
| React | Construcción de la interfaz por componentes | Aplicación navegable | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| Vite | Entorno de desarrollo y build local | Build local verificado | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| ESLint | Revisión estática | Verificación local PASS | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| Git | Historial y comparación entre estado publicado y árbol local | Último commit local identificado y cambios sin versionar | No es IA |
| GitHub Actions y Pages | Publicación estática de una versión anterior | Workflow y demo pública históricos | No son IA; el lote multiproyecto no fue publicado |
| Navegador local | Pruebas funcionales y visuales | Recorridos y estados inspeccionados | No es IA |
| Almacenamiento local simulado | Pruebas aisladas de migración, incompatibilidad, conflicto, fallo de escritura y recuperación | Resultado programático del lote local | No es IA ni prueba un backend real |

## Herramientas mencionadas, sin uso acreditado en el producto

- Los videos de YouTube compartidos fueron inspiración; su contenido no está resumido ni atribuido como decisión técnica verificable.
- Claude, Gemini, Google AI Studio, NotebookLM, n8n y otras herramientas aparecen en la consigna o en posibilidades previas, pero no deben declararse como usadas salvo evidencia adicional.
- No hay backend, modelo conectado, API, autenticación, sincronización remota ni integración activa. GitHub Pages conserva una publicación anterior; Vercel está preparado como alojamiento preferido, pero el lote vigente no fue desplegado.

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

## Pendientes mínimos

1. Confirmar el modelo usado por Codex en las sesiones principales si la interfaz permite recuperarlo; de lo contrario, declarar la limitación.
2. Seleccionar tres ejemplos breves del registro para el PDF final y mantener el prompt extenso en el repositorio.
3. Registrar el commit, la publicación y la URL de Vercel sólo después de ejecutarlos y verificarlos.
