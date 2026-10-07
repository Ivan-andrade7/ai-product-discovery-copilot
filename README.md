# AI Product Discovery Copilot — TP Final

Trabajo Final Integrador individual de la Diplomatura en IA Aplicada a Entornos Digitales de Gestión.

Repositorio público: https://github.com/Ivan-andrade7/ai-product-discovery-copilot

## Qué busca demostrar

Una plataforma asistida por IA puede ayudar a transformar una solicitud incompleta en propuestas revisables y trazables sin ocultar las fuentes, los supuestos ni las decisiones humanas.

Principio rector:

> AI proposes → Human decides → Evidence remains visible.

## Entrega base aprobada

Maqueta HTML navegable de Nivel 2 con datos demo locales. El recorrido central será:

1. crear o abrir un proyecto demo;
2. conservar la solicitud original;
3. mostrar un análisis de IA simulado y claramente identificado;
4. revisar propuestas mediante aceptar, editar, rechazar o mantener pendiente;
5. consultar fuentes y razonamiento;
6. reabrir decisiones y crear nuevas versiones;
7. consultar un entregable y el registro de actividad.

## Estado

El repositorio y la base técnica React + Vite están inicializados. La instalación de dependencias, el lint y el build pasaron correctamente el 7 de octubre de 2026.

La primera porción vertical del producto ya está implementada con datos locales:

1. listado de proyectos;
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
15. estados verificables y límites explícitos de la simulación.

La prueba manual confirmó el recorrido completo entre Projects, Overview, Work, Sources, Decisions, Deliverables y AI Activity. Cada acción produce una sola entrada; reabrir conserva la historia y retira el contenido del entregable. La prueba responsive a 390 × 844 px mostró reflow sin controles fuera de pantalla. No aparecieron errores ni advertencias en la consola del navegador. El proyecto, las decisiones y el historial viven sólo en memoria y se pierden al recargar.

## Base técnica

- React 19.3.0 para construir la interfaz mediante componentes reutilizables.
- Vite 8.3.3 para desarrollo local y generación de la versión distribuible.
- ESLint 10.12.0 para detectar errores y prácticas problemáticas.
- pnpm para instalar dependencias y ejecutar los comandos del proyecto.

Comandos disponibles dentro de `app/`:

- `pnpm dev`: inicia una vista local de desarrollo.
- `pnpm lint`: revisa el código.
- `pnpm build`: genera y verifica la versión distribuible en `app/dist/`.

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

No hay persistencia, backend, autenticación, base de datos, IA ejecutándose, integraciones, leads reales, despliegue ni validación con usuarios.
