# Inventario de herramientas, modelos y prompts

Fecha de conciliación documental: 17 de octubre de 2026, posterior a c4f8ef8 local. Los cortes anteriores se conservan como antecedentes en el registro. No se verifican versiones instaladas ni se ejecutan pruebas en este lote.

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
| Codex | Lectura de fuentes, implementación React, revisión, correcciones y documentación | Lotes 1/2 públicos; c4f8ef8 local incorpora visual/ayudas y preparación Abacus/Gemini, sin habilitarla | Identificador exacto del modelo histórico pendiente de recuperar desde una fuente verificable |
| Gemini API, preparación local | Lectura documental oficial y adaptador/transporte con dobles ficticios | Preparado en c4f8ef8; sin cuenta/cuota, latencia/calidad ni solicitud real comprobadas | gemini-3.8-flash documentado como candidato; no usado en una generación real |
| React | Construcción de la interfaz por componentes | Aplicación navegable | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| Vite | Entorno de desarrollo y build local | Build local verificado | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| ESLint | Revisión estática | Verificación local PASS | No es IA; versión declarada en el manifiesto, no reconfirmada aquí como versión instalada |
| Git | Historial y comparación entre estado publicado y candidato | Público comprobado 3835117; HEAD local c4f8ef8 en codex/visual-system-layout, incluye b210b45; no se consultó remoto en este cierre | No es IA |
| GitHub Actions y Pages / Vercel | Alojamiento público y Preview privado separado | Público 3835117 comprobado; Preview anterior separado e intento exacto de 9001b12 fallido por configuración privada de build ausente; no despliegue de c4f8ef8 | No son IA; IA pública deshabilitada; detalles en registro canónico |
| Google / Supabase / API Node protegida | Acceso privado y persistencia remota del espacio personal de prueba | Dos identidades de Iván recuperaron el mismo espacio según evidencia registrada; continuidad/conflicto entre dos computadoras pendientes | No son modelos de IA; no acreditan aislamiento entre clientes ni uso general |
| Simulador E1 | Orientación determinista del candidato protegido | Flujo de revisión/brief con procedencia simulation | No es un modelo real ni prueba calidad de IA |
| Navegador local | Pruebas funcionales y visuales | Recorridos y estados inspeccionados | No es IA |
| Almacenamiento local simulado | Pruebas aisladas de migración, incompatibilidad, conflicto, fallo de escritura y recuperación | Resultado programático del lote local | No es IA ni prueba un backend real |

## Herramientas mencionadas, sin uso acreditado en el producto

- Los videos de YouTube compartidos fueron inspiración; su contenido no está resumido ni atribuido como decisión técnica verificable.
- Google AI Studio, NotebookLM, n8n y otras posibilidades no se declaran usadas sin evidencia. Gemini tiene preparación documental/local con dobles, no uso real de API. Google AI Pro no acredita cuota API. Claude Sonnet 4.6 sí figura en los dos intentos históricos, no como validación de otros modelos.
- La aplicación pública no tiene backend remoto ni autenticación. El candidato protegido sí prepara acceso privado y persistencia remota para el espacio personal; no demuestra aislamiento multiusuario ni continuidad completa entre equipos. El ensayo histórico de IA mediante servicio local permanece separado de E1 simulado: 3/5, halted: true y ambos permisos consumidos, sin autorización nueva. IA pública deshabilitada; 21,3 créditos agregados no permiten atribución individual. Detalle en el registro.

Preparación de modelos, no generaciones: proveedor/modelo sólo del servidor; Abacus conservado y Gemini deshabilitado por defecto. El plan no declara ganador: Gemini/Sol base conceptual, Claude opcional, Groq pendiente y Astra excepcional. Cuatro casos ficticios sin ejecutar y cero intentos autorizados. 237/237, lint y ambos builds pertenecen al retest local del candidato, sin llamadas externas a proveedores; nuevas migraciones SQL sin aplicar/verificar en PostgreSQL/RLS. Los identificadores de candidatos no son modelos usados en los dos intentos históricos. [Corpus](ai-evaluation-corpus.md), [registro vigente](verification-2026-10-07.md#cierre-vigente-del-candidato-local-c4f8ef8--17102026).

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
3. Lote 2 cerrado y publicado en su cobertura, sin accesibilidad integral. Para el PDF final: distinguir herramientas por entorno, seleccionar evidencia y mantener desconocidos explícitos. Resolver el Preview exacto y las pruebas entre equipos son pendientes de producto separados; no habilitan consumos ni bloquean por sí solos una entrega académica Nivel 2 honesta. Alcance en [`../contexto.md`](../contexto.md).
