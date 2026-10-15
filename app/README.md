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

### Lote 1 UX — publicado en e2befd6

- Editar en Work conserva un borrador por proyecto y propuesta al cambiar de sección. No es una decisión hasta confirmar; puede descartarse individualmente. Salir del proyecto con cambios pendientes exige elegir continuar o descartar.
- Los borradores viven sólo durante la sesión: no están en `v0.3` ni en el respaldo. Recargar o cerrar los pierde; se solicita la advertencia nativa, sin garantizar su presentación en todos los cierres.
- Tras un fallo de creación, **Reintentar guardado** conserva el mismo candidato y los campos originales bloqueados. La exportación existente rescata la copia en memoria; recargar sin guardar/exportar la pierde. No hay importación por interfaz. Cancelar y comenzar otra creación es una intención nueva, no un reintento.
- Sources abre la propuesta vinculada exacta; un destino inválido se explica sin seleccionar otra automáticamente. Solicitudes sólo de espacios/tabs/saltos se rechazan sin reescribir las válidas.

El lote fue versionado, integrado por fast-forward y publicado en ambos alojamientos. F02, F03, F09 y F08 mínimo pasaron el smoke público delimitado. Detalle de cobertura y antecedentes: [`../docs/verification-2026-10-07.md`](../docs/verification-2026-10-07.md).

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
- Adaptación oscura `d758512` y hotfix de grillas/foco `08853c5` conservados en la versión funcional publicada `e2befd6`. Los ensayos y registros privados siguen siendo locales; el servicio auxiliar no se publica. El bloqueo histórico de lint quedó superado en los retests posteriores.
- La inspección interna no constituye validación con usuarios, seguridad integral ni conformidad completa de accesibilidad.

## Estado publicado y límites

Versión funcional publicada: `e2befd6`, Lote 1 integrado por fast-forward en main y verificado en ambos alojamientos. Main y origin/main quedaron sincronizados al publicarlo; las ramas del lote y del hotfix se conservan. Los cierres exclusivamente documentales no cambian los assets funcionales. Smoke público delimitado satisfactorio; IA pública deshabilitada. Resultados y límites en el registro canónico.

El código publicado usa `v0.3` y conserva la preparación que transmite solicitud y sólo fuentes seleccionadas en mensajes separados y bloquea resultados obsoletos; no habilita IA pública. Un caso ficticio privado previo completó el recorrido con una respuesta real de `claude-sonnet-4-6`, decisión de prueba, entregable y persistencia. La calidad general y la resistencia adversarial no están validadas. Nuevas respuestas requieren type Afirmación/evidence, Hipótesis/hypothesis o Pregunta/question; los tipos históricos se conservan literalmente.

La cobertura y el consumo se registran en [`../docs/verification-2026-10-07.md`](../docs/verification-2026-10-07.md). Estado económico: 3/5, ambas autorizaciones consumidas, halted y generaciones deshabilitadas. El consumo agregado no permite atribución individual. El corpus de cuatro casos permanece sin ejecutar. Login, multiusuario, PDF/imágenes, leads, portal y monetización no están implementados.

Antes de exponer IA a Iván o clientes se requiere definir un incremento protegido de autenticación, backend, secretos, persistencia y controles de uso/costo, con autorización propia. No se habilita ese incremento ni nuevas generaciones mediante este cierre documental.

Próximo gate: Lote 2 — orientación y accesibilidad básica (F01/F11/F12), no implementado y con autorización separada. Primero auditar, después implementar; conservar la protección de borradores. No incluye microcopy integral, ayuda, espaciado general ni rediseño y no declara accesibilidad integral. Alcance en [`../contexto.md`](../contexto.md).

## Tecnología

- React.
- Vite.
- ESLint.
- CSS propio sin biblioteca visual externa.

La documentación académica y del proceso se encuentra en la carpeta `docs/` del repositorio principal.
