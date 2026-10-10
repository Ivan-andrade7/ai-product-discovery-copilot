# AI Product Discovery Copilot — maqueta navegable

Prototipo local del Trabajo Final Integrador de la Diplomatura en IA Aplicada a Entornos Digitales de Gestión.

## Qué demuestra

La interfaz representa un flujo asistido por IA donde:

1. se crean, listan y abren varios proyectos locales independientes;
2. los proyectos nuevos empiezan vacíos y el proyecto demo permanece separado;
3. se conserva la solicitud original y las fuentes aportadas quedan como “Aportada · sin revisar”;
4. las propuestas simuladas del demo se distinguen de esas fuentes;
5. una persona acepta, edita, rechaza, mantiene pendiente o reabre cada propuesta;
6. las acciones quedan registradas sin borrar el historial;
7. sólo las decisiones aceptadas alimentan el entregable.

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
- Datos ficticios en el demo; los proyectos nuevos no reciben propuestas genéricas.
- Persistencia en `localStorage` con formato `v0.3`; las claves predecesoras se preservan durante las migraciones.
- Exportación disponible; la recuperación fue probada programáticamente, pero no existe importación por interfaz.
- Aviso y bloqueo de una pestaña desactualizada, con una ventana residual de carrera porque `localStorage` no ofrece transacciones.
- Servicio auxiliar local limitado a loopback, sin backend remoto de producto, autenticación, base de datos remota ni sincronización entre dispositivos.
- Contrato, transporte reemplazable y registro duradero de consumo preparados, pero generaciones reales deshabilitadas.
- El candidato local vigente no fue publicado. GitHub Pages y Vercel conservan el commit público anterior.
- La inspección interna no constituye validación con usuarios, seguridad integral ni conformidad completa de accesibilidad.

## Estado del candidato

El candidato local usa `v0.3`, transmite al adaptador la solicitud vigente junto con sólo las fuentes seleccionadas y mantiene separados sistema, solicitud y contenido no confiable. Si la solicitud o una fuente cambia durante el análisis, el resultado queda obsoleto y no se incorpora silenciosamente. Estas rutas se probaron con transporte simulado y salida externa bloqueada; no demuestran IA real ni calidad del modelo.

La cobertura vigente se registra de forma canónica en [`../docs/verification-2026-10-07.md`](../docs/verification-2026-10-07.md): 63 pruebas aprobadas y una opcional omitida en el comando estándar; en un recorrido separado, 21/21 comprobaciones de navegador y 90 de layout. El corpus de cuatro casos permanece preparado y no ejecutado.

## Tecnología

- React.
- Vite.
- ESLint.
- CSS propio sin biblioteca visual externa.

La documentación académica y del proceso se encuentra en la carpeta `docs/` del repositorio principal.
