# AI Product Discovery Copilot — TP Final

Trabajo Final Integrador individual de la Diplomatura en IA Aplicada a Entornos Digitales de Gestión.

Repositorio público: https://github.com/Ivan-andrade7/ai-product-discovery-copilot

Demo navegable: https://ivan-andrade7.github.io/ai-product-discovery-copilot/

## Qué busca demostrar

Una plataforma asistida por IA puede ayudar a transformar una solicitud incompleta en propuestas revisables y trazables sin ocultar las fuentes, los supuestos ni las decisiones humanas.

Principio rector:

> AI proposes → Human decides → Evidence remains visible.

## Entrega base vigente

Maqueta HTML navegable de Nivel 2 con datos demo locales. El recorrido central será:

1. crear o abrir un proyecto demo;
2. conservar la solicitud original;
3. mostrar un análisis de IA simulado y claramente identificado;
4. revisar propuestas mediante aceptar, editar, rechazar o mantener pendiente;
5. consultar fuentes y razonamiento;
6. reabrir decisiones y crear nuevas versiones;
7. consultar un entregable y el registro de actividad.

## Estado

El repositorio contiene una maqueta React + Vite navegable. El estado vigente está implementado localmente y todavía no fue versionado ni publicado. La URL de GitHub Pages conserva la versión pública anterior.

La primera porción vertical del producto ya está implementada con datos locales:

1. listado real de múltiples proyectos locales;
2. formulario para crear un proyecto;
3. preservación literal de la solicitud original;
4. acceso al Overview del proyecto creado o del proyecto demo;
5. acceso a una cola de propuestas simuladas en Work;
6. fuente, evidencia y explicación visibles para cada propuesta;
7. aceptar, editar, rechazar, mantener pendiente y reabrir decisiones;
8. historial de acciones humanas sin sobrescribir entradas anteriores;
9. comparación entre propuesta original y versión posterior a la acción;
10. entregable derivado únicamente de decisiones aceptadas;
11. retiro automático del entregable cuando una decisión se reabre;
12. inventario de fuentes que diferencia entrada, interpretación, método y requisito;
13. actividad verificable de la sesión sin simular llamadas a IA;
14. contadores del Overview sincronizados con las decisiones;
15. estados verificables y límites explícitos de la simulación;
16. almacenamiento local versionado como `v0.2`, con migración conservadora desde la clave `v0.1` sin sobrescribirla;
17. fuentes aportadas visibles como “Aportada · sin revisar” y propuestas demo explícitamente no derivadas de esas fuentes;
18. detección de cambios entre pestañas, recuperación ante datos incompatibles o fallos de guardado y exportación de respaldo.

El retest local confirmó el recorrido entre Projects, Overview, Work, Sources, Decisions, Deliverables y AI Activity con datos ficticios. También verificó independencia entre proyectos, activaciones repetidas y conflicto entre dos pestañas. La salida convertida desde `v0.1` ahora se valida antes de persistirse: entradas malformadas, JSON inválido o estructuras incompletas quedan en recuperación sin crear `v0.2`, y la clave original permanece intacta. Los rótulos de pendientes y decisiones flexionan cero, uno y varios. `lint` y build finalizaron correctamente. Esto no equivale a seguridad integral, auditoría completa de accesibilidad ni prueba con usuarios.

## Cómo probar la solución

1. Entrar en `app/` e instalar las dependencias respetando el archivo de bloqueo existente.
2. Ejecutar el script `dev` del proyecto y abrir la dirección informada por Vite.
3. Abrir `Discovery v0.1` o crear un segundo proyecto ficticio.
4. Revisar la solicitud original en Overview y entrar a Work.
5. Aceptar o editar una propuesta y consultar Decisions y Deliverables.
6. Reabrir la decisión desde Work y comprobar que el historial se conserva y el bloque sale del entregable.
7. Recargar el navegador para comprobar la persistencia local.
8. Consultar Sources y AI Activity para entender la procedencia y los límites de la demo.

Los detalles técnicos y comandos de verificación están en [`app/README.md`](app/README.md). El registro académico de prompts está en [`docs/prompt-log.md`](docs/prompt-log.md).

La demo pública de GitHub Pages corresponde a la versión publicada anterior: todavía no incluye el lote local multiproyecto. Vercel continúa como alojamiento preferido para una publicación posterior, pero no hay despliegue vigente de esta mejora.

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

Cada navegador conserva sus proyectos en `localStorage`. La clave nueva usa el formato `v0.2`; una entrada `v0.1` válida se migra sin modificarla. La salida convertida se valida íntegramente antes de escribir: si no es compatible, no se crea `v0.2` y la interfaz permite exportar la copia en memoria o rescatar el contenido original. El respaldo se puede exportar y su recuperación fue comprobada programáticamente; todavía no existe importación desde la interfaz.

La detección entre pestañas bloquea una copia desactualizada y permite cargar la versión externa, pero no es un sistema transaccional: queda un riesgo residual ante escrituras realmente simultáneas. No existe backend, autenticación, sincronización remota, IA real, integraciones, leads reales ni validación con usuarios.
