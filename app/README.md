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
- Adaptación oscura publicada el 10/10/2026 en GitHub Pages y Vercel, `d758512`. Los intentos reales y sus controles posteriores son locales; el servicio auxiliar no se publica. El bloqueo histórico de lint quedó superado en los retests locales posteriores.
- La inspección interna no constituye validación con usuarios, seguridad integral ni conformidad completa de accesibilidad.

## Estado del candidato

Último commit local existente: `61704e7`, sin push; público comprobado: `b56d9e6`. Las correcciones posteriores de cabecera, Work, textos y documentación siguen sin commit. El retest resolvió ambos desbordamientos en la cobertura registrada: el candidato está listo para commit local con autorización separada, no publicado ni habilitado para IA pública. Resultados y límites en el registro canónico.

El candidato local usa `v0.3`, transmite solicitud y sólo fuentes seleccionadas en mensajes separados y bloquea resultados obsoletos. Un caso ficticio completó el recorrido con una respuesta real de `claude-sonnet-4-6`, decisión de prueba, entregable y persistencia. La calidad general y la resistencia adversarial no están validadas. Nuevas respuestas requieren type Afirmación/evidence, Hipótesis/hypothesis o Pregunta/question; los tipos históricos se conservan literalmente.

La cobertura y el consumo se registran en [`../docs/verification-2026-10-07.md`](../docs/verification-2026-10-07.md). Estado económico: 3/5, ambas autorizaciones consumidas, halted y generaciones deshabilitadas. El consumo agregado no permite atribución individual. El corpus de cuatro casos permanece sin ejecutar. Login, multiusuario, PDF/imágenes, leads, portal y monetización no están implementados.

## Tecnología

- React.
- Vite.
- ESLint.
- CSS propio sin biblioteca visual externa.

La documentación académica y del proceso se encuentra en la carpeta `docs/` del repositorio principal.
