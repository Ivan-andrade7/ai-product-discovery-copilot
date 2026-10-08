# Registro de verificación interna

Este archivo conserva la verificación histórica del 7 de octubre y agrega el retest del lote multiproyecto todavía no publicado. Un resultado histórico no demuestra por sí solo el comportamiento del árbol local vigente.

## Retest final del candidato local — corrección verificada

El retest se ejecutó sobre el árbol local exacto previo a versionar, con datos ficticios y sin instalar dependencias. Los dos fallos del lote correctivo quedaron resueltos en los escenarios definidos; el candidato queda listo para decidir su versionado, no su publicación.

### Fallos corregidos

1. **Migración inválida desde `v0.1`.** Causa confirmada: `parseLegacy` sólo comprobaba la forma superior y la salida de `migrateLegacyWorkspace` no se validaba antes de persistir. Corrección: la lectura heredada clasifica JSON inválido e incompatibilidad, valida el workspace convertido completo y entra en recuperación sin escribir si falla; `persistWorkspace` aplica además una última validación al candidato final. La clave `v0.1` queda intacta y un `v0.2` existente no se sobrescribe.
2. **Singular/plural visible.** Los textos de pendientes y decisiones ahora dependen del contador. Se comprobaron cero, uno y varios en Work y Projects.

### Pruebas reales en navegador

- Creación, apertura, recarga y persistencia independiente de varios proyectos: PASS.
- Fuente aportada como “Aportada · sin revisar” y propuestas demo sin vínculo falso: PASS.
- Aceptar, editar y aceptar, rechazar, mantener pendiente y reabrir: PASS.
- Contadores, decisiones, entregable y actividad actualizados a partir del estado: PASS funcional, con el defecto gramatical indicado.
- Doble clic y repetición de Enter: una acción sobre el elemento revisado; la propuesta siguiente no se resolvió: PASS.
- Dos pestañas con cambio casi simultáneo: una guardó y la otra quedó bloqueada hasta cargar el estado externo: PASS para el escenario observado.
- Exportación desde la interfaz: la descarga se activó sin error visible. La recuperación del contenido se comprobó por simulación programática, no mediante importación gráfica.
- Contexto amplio 1536 × 695 y estrecho 666 × 668, incluidos nombres, objetivos y URLs ficticios extensos: sin pérdida ni superposición observada en las vistas inspeccionadas.
- Teclado: orden del formulario y acciones principales mediante Enter, PASS en el recorrido acotado. El foco visible calculado fue un contorno de 2.4 px con separación de 1.6 px.
- Etiquetas y estados: roles, nombres accesibles y mensajes visibles estuvieron presentes en los controles recorridos. No se usó lector de pantalla ni se declara conformidad WCAG.
- Consola: el registro de la pestaña del retest no mostró errores ni advertencias. La comprobación se limita a esa sesión y no constituye una afirmación global.

### Simulación aislada de almacenamiento

- `v0.1` válido preservado literalmente: PASS.
- Migración válida guardada una vez y sin duplicación: PASS.
- Respaldo exportado y recuperado programáticamente: PASS.
- Escritura obsoleta bloqueada: PASS.
- Excepción de guardado reportada: PASS.
- `v0.2` incompatible preservado: PASS.
- `v0.1` con propuesta malformada, JSON inválido o estructura incompleta: PASS; modo de recuperación, original idéntico y ausencia de `v0.2`.
- Repetición de inicialización, incluido el segundo intento equivalente al modo de desarrollo: PASS; no duplicó ni sobrescribió el estado.
- Candidato inválido enviado directamente a persistencia: PASS; `validation-error` y ninguna escritura.

### Resultados focalizados por caso

| Caso | Interfaz observada | Contenido almacenado |
| --- | --- | --- |
| `v0.1` válido | Aviso de migración completada y exportación disponible | `v0.1` idéntico; `v0.2` válido con revisión 1 |
| `v0.1` con propuesta malformada | Recuperación requerida, Exportar respaldo y Rescatar original | `v0.1` idéntico; no se creó `v0.2` |
| JSON inválido en `v0.1` | Mensaje específico de JSON inválido y rescate disponible | Raw idéntico; no se creó `v0.2` |
| Estructura `v0.1` incompleta | Mensaje de formato incompatible y rescate disponible | Original idéntico; no se creó `v0.2` |
| `v0.2` válido ya existente | Inicio normal, sin aviso de migración | `v0.2` idéntico; un `v0.1` presente no lo reemplazó |
| `v0.2` incompatible | Recuperación requerida, exportación y rescate | Raw `v0.2` idéntico; no fue eliminado ni reemplazado |
| Fallo simulado de escritura | “No se pudo guardar”; cambios en memoria exportables | El proyecto nuevo no apareció en `localStorage`; el respaldo descargado sí contenía la copia ficticia en memoria |
| Inicialización repetida | Tras la primera escritura, el inicio siguiente cargó `v0.2` existente | Segundo intento bloqueado como conflicto; claves sin cambios ni duplicados |

El archivo de rescate descargado para el `v0.2` inválido contenía exactamente el raw original. Estas descargas ficticias se eliminaron tras verificarlas. La recuperación de un respaldo sigue siendo programática: no existe importación por interfaz.

### Comprobación estática

- La ruta de migración carece de validación final previa a persistir.
- Las cadenas `pendientes` y `decisiones` están fijadas en plural en las vistas afectadas.
- El workflow `.github/workflows/deploy-pages.yml` se activa con un push a `main` y despliega GitHub Pages. Un push a esa rama también sería una publicación y requiere autorización expresa.
- No se repitió ninguna prueba contra la URL pública: GitHub Pages conserva deliberadamente la versión anterior.

## Lote multiproyecto local — verificación previa conservada

### Navegador local con datos ficticios

- Creación de un segundo proyecto sin reemplazar el anterior: PASS.
- Lista derivada del estado real y apertura de la tarjeta correcta: PASS.
- Estado independiente entre dos proyectos: PASS.
- Nombre del proyecto activo en la sidebar: PASS.
- Fuente ingresada visible como “Aportada · sin revisar”: PASS.
- Propuestas del proyecto nuevo rotuladas como ficticias y no derivadas de la fuente aportada: PASS.
- Aceptar, editar y aceptar, rechazar, mantener pendiente y reabrir: PASS.
- Contadores, historial, entregable y actividad derivados del estado del proyecto: PASS.
- Doble clic sobre Aceptar: una sola propuesta resuelta, PASS.
- Activación por teclado repetida: la propuesta siguiente no fue resuelta, PASS.
- Dos pestañas con acciones casi simultáneas: una guardó; la otra mostró conflicto, bloqueó las acciones y pudo cargar la versión externa, PASS para el escenario observado.

### Comprobación estática

- El formato nuevo usa la clave `ai-product-discovery-copilot:v0.2` y valida su estructura antes de leerla.
- La migración lee `ai-product-discovery-copilot:v0.1` sin escribir ni borrar esa clave.
- Si ya existe un `v0.2`, no se repite la migración desde `v0.1`.
- Los datos `v0.2` incompatibles activan recuperación en lugar de reinicio silencioso. Esta comprobación no cubre por sí sola la validez de la salida de una migración heredada.
- Las mutaciones verifican el proyecto activo, la propuesta y su estado esperado.
- Git muestra el lote como cambios locales sin commit; no se hizo push ni deploy.

### Almacenamiento simulado en entorno aislado

- Contenido `v0.1` idéntico antes y después de migrar: PASS.
- Migración ejecutada una sola vez y sin duplicar proyectos: PASS.
- Fuente heredada marcada como “Aportada · sin revisar”: PASS.
- Respaldo exportable validado y recuperado programáticamente: PASS.
- Escritura desde una revisión obsoleta bloqueada: PASS.
- Excepción simulada al guardar devuelta como fallo de escritura: PASS.
- Contenido `v0.2` incompatible preservado sin sobrescritura: PASS.

### Herramientas de verificación ejecutadas

- Script de revisión estática: PASS.
- Script de build: PASS.
- Comprobación de formato del diff: PASS; sólo se informaron avisos de normalización futura de finales de línea.
- No se instalaron dependencias nuevas.

### Límites del resultado vigente

- La detección entre pestañas no es una transacción ni garantiza exclusión mutua completa. Persiste una ventana de carrera entre lectura y escritura ante simultaneidad extrema.
- La exportación existe y la recuperación fue comprobada programáticamente; no hay importación desde la interfaz.
- El fallo de guardado se probó con almacenamiento simulado, no agotando el almacenamiento real del navegador.
- En el retest final sí se repitieron responsive y teclado de forma acotada. La captura completa de consola, las tecnologías de asistencia y la URL pública no se repitieron.
- No hay backend, autenticación, IA real ni sincronización remota.
- GitHub Pages conserva la versión publicada anterior. Vercel sigue preparado y preferido, pero no contiene este lote.

## Verificación histórica — 7 de octubre de 2026

## Objeto y cobertura

Build local de la maqueta HTML navegable del AI Product Discovery Copilot. Cobertura: recorrido base, sincronización de estados, reflow móvil y una inspección técnica acotada de accesibilidad.

## Resultados observados

- Projects → New Project → Overview: creación local y preservación literal de la solicitud, PASS.
- Work: aceptar, editar y aceptar, rechazar, mantener pendiente y reabrir, PASS.
- Overview: contadores derivados del estado vigente, PASS.
- Decisions: una entrada por acción y conservación del historial al reabrir, PASS.
- Deliverables: inclusión sólo de aceptadas y retiro al reabrir, PASS.
- Sources: clasificación visible y vínculos con propuestas, PASS.
- AI Activity: datos demo y acciones humanas identificados sin afirmar llamadas a un modelo, PASS.
- Consola del navegador: sin errores ni advertencias en el recorrido probado.
- ESLint y build de Vite: PASS.
- Persistencia local: una propuesta aceptada, su entrada de historial y el bloque derivado permanecieron después de recargar y reabrir el proyecto, PASS.
- Revisión de contenido posterior a persistencia: se reemplazaron referencias obsoletas a “sin persistencia” y “sesión actual”, PASS.
- GitHub Pages: primer intento fallido por fuente no habilitada; configuración cambiada a GitHub Actions y repetición completada, PASS.
- Demo pública: carga de la pantalla Projects y recursos estáticos en la URL definitiva, PASS.

## Responsive y accesibilidad

- Inspección visual a 390 × 844 px: contenido en una columna, acciones apiladas y navegación disponible.
- Navegación activa expuesta con `aria-current`.
- Selecciones de cola, fuentes e historial expuestas con `aria-pressed`.
- Foco visible unificado para botones, campos y áreas de texto.
- Altura mínima de navegación elevada a 44 px.

## Límites

- Inspección interna, no prueba con usuarios.
- Sin lector de pantalla, checker automatizado ni matriz completa de WCAG.
- Persistencia limitada a `localStorage`: no sincroniza dispositivos, no ofrece cuentas y puede borrarse junto con los datos del navegador.
- Sin backend, autenticación, IA real ni servicios externos. El despliegue histórico fue únicamente estático.
- El despliegue es únicamente estático; no agrega backend, autenticación, IA real ni servicios de datos.
- Datos y propuestas ficticios, identificados como demo.

## Próximo retest

El retest focalizado y el recorrido multiproyecto finalizaron satisfactoriamente. El siguiente gate es decidir si corresponde versionar. Publicar en Vercel o empujar a `main` queda fuera de este cierre y requiere autorización separada; la cobertura accesible completa y las tecnologías de asistencia siguen pendientes.
