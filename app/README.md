# AI Product Discovery Copilot — maqueta navegable

Prototipo local del Trabajo Final Integrador de la Diplomatura en IA Aplicada a Entornos Digitales de Gestión.

## Qué demuestra

La interfaz representa un flujo asistido por IA donde:

1. se crean, listan y abren varios proyectos locales independientes;
2. se conserva una solicitud original y las fuentes aportadas quedan como “Aportada · sin revisar”;
3. las propuestas simuladas se distinguen de esas fuentes;
4. una persona acepta, edita, rechaza, mantiene pendiente o reabre cada propuesta;
5. las acciones quedan registradas sin borrar el historial;
6. sólo las decisiones aceptadas alimentan el entregable.

Principio del producto:

> La IA propone, la persona decide y la evidencia permanece visible.

## Cómo ejecutar

Requisitos: Node.js y las dependencias del proyecto instaladas. El repositorio conserva `pnpm-lock.yaml` y el workflow existente utiliza pnpm; el retest final utilizó las dependencias ya instaladas, sin agregar paquetes.

Desde esta carpeta:

```bash
pnpm install
pnpm dev
```

Abrir la dirección local informada por Vite, normalmente `http://localhost:5173/`.

## Recorrido recomendado

1. Abrir `Discovery v0.1` desde Projects o crear otro proyecto con datos ficticios.
2. Revisar la solicitud original en Overview.
3. Entrar a Work.
4. Aceptar, editar, rechazar o mantener pendiente una propuesta.
5. Consultar el registro en Decisions y el efecto en Deliverables.
6. Volver a Work, reabrir una decisión y comprobar que el historial se conserva.
7. Recargar el navegador y verificar que los proyectos mantienen estados independientes.
8. Consultar Sources para distinguir fuentes aportadas de contenido demo.
9. Usar Exportar respaldo antes de limpiar datos locales o ensayar una recuperación.

## Verificaciones técnicas

```bash
pnpm lint
pnpm build
pnpm preview
```

## Alcance y límites vigentes

- Nivel 2: maqueta HTML navegable.
- Datos locales ficticios y propuestas de IA simuladas.
- Persistencia en `localStorage` con formato `v0.2`; la clave `v0.1` se conserva durante la migración.
- Exportación disponible; la recuperación fue probada programáticamente, pero no existe importación por interfaz.
- Aviso y bloqueo de una pestaña desactualizada, con una ventana residual de carrera porque `localStorage` no ofrece transacciones.
- Sin backend, autenticación, base de datos remota, IA real, integraciones ni sincronización entre dispositivos.
- El lote multiproyecto permanece local y no fue publicado. GitHub Pages conserva una versión anterior.
- La inspección interna no constituye validación con usuarios, seguridad integral ni conformidad completa de accesibilidad.

## Estado del candidato

El lote correctivo valida el resultado completo de una migración antes de escribir `v0.2`. Un `v0.1` malformado, con JSON inválido o estructura incompleta queda en modo de recuperación, conserva el original y no crea datos nuevos inválidos. Los rótulos de pendientes y decisiones fueron comprobados con cero, uno y varios. El retest focalizado, el recorrido multiproyecto, `lint` y build finalizaron correctamente; el candidato local queda listo para decidir su versionado, no su publicación.

## Tecnología

- React.
- Vite.
- ESLint.
- CSS propio sin biblioteca visual externa.

La documentación académica y del proceso se encuentra en la carpeta `docs/` del repositorio principal.
