# AI Product Discovery Copilot — maqueta navegable

Prototipo del Trabajo Final Integrador de la Diplomatura en IA Aplicada a Entornos Digitales de Gestión.

## Qué demuestra

La interfaz representa un flujo asistido por IA donde:

1. se conserva una solicitud original;
2. la IA presenta propuestas simuladas con contexto y razonamiento;
3. una persona acepta, edita, rechaza o mantiene pendiente cada propuesta;
4. las acciones quedan registradas sin borrar el historial;
5. sólo las decisiones aceptadas alimentan el entregable.

Principio del producto:

> La IA propone, la persona decide y la evidencia permanece visible.

## Cómo ejecutar

Requisitos: Node.js y pnpm.

Desde esta carpeta:

```bash
pnpm install
pnpm dev
```

Abrir la dirección local informada por Vite, normalmente `http://localhost:5173/`.

## Recorrido recomendado

1. Abrir `Discovery v0.1` desde Projects.
2. Revisar la solicitud original en Overview.
3. Entrar a Work.
4. Aceptar o editar una propuesta.
5. Consultar el registro en Decisions.
6. Ver el bloque incorporado en Deliverables.
7. Volver a Work y reabrir la decisión.
8. Comprobar que Decisions conserva ambas acciones y Deliverables retira el bloque.
9. Consultar Sources y AI Activity para revisar contexto y límites.

## Verificaciones técnicas

```bash
pnpm lint
pnpm build
pnpm preview
```

## Alcance y límites

- Nivel 2: maqueta HTML navegable.
- Datos locales ficticios.
- Propuestas de IA simuladas y claramente identificadas.
- Estado únicamente en memoria; recargar reinicia la sesión.
- Sin backend, autenticación, base de datos, IA real, integraciones ni despliegue.
- La inspección interna no constituye validación con usuarios ni conformidad integral de accesibilidad.

## Tecnología

- React.
- Vite.
- ESLint.
- CSS propio sin biblioteca visual externa.

La documentación académica y del proceso se encuentra en la carpeta `docs/` del repositorio principal.
