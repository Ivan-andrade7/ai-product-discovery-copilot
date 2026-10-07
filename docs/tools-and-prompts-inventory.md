# Inventario de herramientas, modelos y prompts

Fecha de revisión: 7 de octubre de 2026.

## Regla de lectura

Este inventario distingue uso verificado, función en el proceso y datos todavía no recuperados. Mencionar una herramienta no implica que haya ejecutado IA real dentro del prototipo.

## Herramientas verificadas

| Herramienta | Uso observado | Resultado conservado | Modelo o versión |
| --- | --- | --- | --- |
| Notion | Documentación del planteo y de la consigna transcripta; registro de aclaraciones | Páginas del TP y de la consigna | No corresponde como modelo; Notion documenta, no ejecuta el producto |
| Figma Design | Consolidación de arquitectura, pantallas y estados del recorrido | Archivo “AI Product Discovery Copilot — Wireframes consolidados” | No aplica a la edición manual; cualquier función de IA usada debe declararse por separado |
| Figma Make | Generación exploratoria de una versión visual a partir de un prompt | Proyecto compartido por Iván | Modelo exacto no recuperado |
| UXPilot | Exploración de variantes visuales | Capturas aportadas por Iván | Modelo exacto no recuperado |
| Abacus.AI | Exploración de otra versión generada | Conversación enlazada por Iván | Modelo/agente exacto no recuperado |
| Codex | Lectura de fuentes, implementación React, revisión, correcciones, documentación y Git | Aplicación local, documentación y commits | Identificador exacto del modelo pendiente de registrar desde la interfaz o metadatos disponibles |
| React 19.3.0 | Construcción de la interfaz por componentes | Aplicación navegable | No es IA |
| Vite 8.3.3 | Entorno de desarrollo y build local | Build verificado | No es IA |
| ESLint 10.12.0 | Revisión estática | Verificaciones PASS | No es IA |
| Git | Historial local de versiones | Commits `5087f25` y `daff923` al corte inicial | No es IA |
| Navegador local | Pruebas funcionales y visuales | Recorridos y estados inspeccionados | No es IA |

## Herramientas mencionadas, sin uso acreditado en el producto

- Los videos de YouTube compartidos fueron inspiración; su contenido no está resumido ni atribuido como decisión técnica verificable.
- Claude, Gemini, Google AI Studio, NotebookLM, n8n y otras herramientas aparecen en la consigna o en posibilidades previas, pero no deben declararse como usadas salvo evidencia adicional.
- No hay backend, modelo conectado, API, automatización, deploy ni integración activa.

## Familias de prompts verificables

### Exploración visual

Iván pidió un prompt extenso para producir wireframes en distintas herramientas y comparar alternativas. Se verificó el uso de versiones en Figma Make, UXPilot y Abacus.AI, pero el texto exacto del prompt no está archivado en las fuentes locales revisadas.

Estado: uso verificable; texto exacto pendiente de recuperar.

### Implementación asistida

La implementación se realizó de manera iterativa, no mediante un único prompt final:

1. construir Projects, New Project y Overview;
2. incorporar Work y sus decisiones humanas;
3. registrar el historial en Decisions;
4. derivar Deliverables, Sources y AI Activity;
5. probar estados y corregir errores;
6. revisar responsive y accesibilidad de forma acotada.

Estado: secuencia verificable por archivos, pruebas y commits; falta exportar o seleccionar mensajes representativos si el informe exige ejemplos literales.

## Correcciones útiles para la metodología

- Se corrigió un contador que no debía disminuir al mantener una propuesta pendiente.
- Se añadió reapertura de decisiones para evitar estados irreversibles.
- Se detectó y corrigió un historial duplicado causado por una actualización con efectos secundarios en React.
- Se corrigieron concordancias de singular/plural surgidas durante las pruebas.
- Se añadieron estados semánticos y foco visible después de la revisión responsive/accesible.

## Pendientes mínimos

1. Confirmar el modelo usado por Codex en las sesiones principales.
2. Confirmar modelos o modos usados por Figma Make, UXPilot y Abacus.AI, si las interfaces lo muestran.
3. Recuperar el prompt extenso de exploración visual si sigue disponible en alguna conversación.
4. Elegir entre tres y cinco prompts o intercambios representativos para el informe; no es necesario transcribir toda la conversación.
