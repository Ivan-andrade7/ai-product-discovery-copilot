# Matriz de cumplimiento académico

Fecha de conciliación documental: 17 de octubre de 2026, posterior al commit local c4f8ef8. No incorpora nuevas pruebas ni acredita publicación.

## Versiones y cierre vigente

Público funcional comprobado: `3835117` (Lotes 1/2 cerrados), con cierre documental `71dd149`. Último candidato técnico local: `c4f8ef8`, rama `codex/visual-system-layout`, incluye visual/ayuda `b210b45` y preparación protegida Abacus/Gemini, deshabilitada por defecto y sin promoción. Gemini sólo tiene documentación/dobles, no cuenta o calidad reales comprobadas; nuevas migraciones SQL preparadas, no aplicadas ni verificadas en PostgreSQL/RLS. 237/237, lint y ambos builds corresponden al retest local registrado, no a pruebas nuevas ni cumplimiento académico definitivo. Preview anterior y ensayo real Abacus histórico separados. [Estado y próximo gate](../contexto.md#cierre-local-vigente-y-próximo-gate--17102026), [evidencia única](verification-2026-10-07.md#cierre-vigente-del-candidato-local-c4f8ef8--17102026).

## Autoridad y límites

- Fuente original contrastada: `Trabajo Final Integrador.pdf`, 5 páginas, modificación registrada el 4 de agosto de 2026.
- La fecha límite figura en esa copia como 8 de noviembre de 2026 a las 23:59. Debe reconfirmarse si existe un aviso docente posterior.
- La aclaración registrada en Notion el 5 de octubre separa transcripción de la consigna (secciones 1–9) de interpretación propia (Lectura ejecutiva y 10–11). Esa aclaración no modifica por sí sola el PDF original.
- Esta matriz no convierte Notion en fuente de ejecución ni presenta requisitos interpretativos como oficiales.

## Requisitos del PDF original

| Requisito | Estado al corte | Evidencia o pendiente |
| --- | --- | --- |
| Solución o contenido original con IA generativa o Vibe Coding | Compatible en estado local, cierre académico pendiente | Una ejecución real exitosa del recorrido mínimo con Claude Sonnet 4.6, en un único caso ficticio; generaciones cerradas después. No valida calidad general. |
| Tema fundamentado y frase “Elegí este tema porque…” | Cumplido en borrador | La introducción abre su justificación con la frase requerida y explica el valor de la IA. |
| Repositorio de GitHub | Público existente; Lotes 1/2 publicados | Funcional 3835117 y cierre documental 71dd149; c4f8ef8 sólo local, no se afirma que esté en el remoto. |
| README claro sobre qué hace, para qué sirve y cómo se usa | Disponible; cierre documental para revisión | Separa público, preparación multiproveedor local, Previews y ensayo real histórico; no declara calidad general. |
| Mostrar evolución del proyecto | Historial conservado | Antecedentes y fallos conservados; 9001b12 protegido, b210b45 visual/ayudas y c4f8ef8 multiproveedor incluidos en la cadena local, sin confundir publicación. |
| Nivel de entrega válido | Compatible localmente con Nivel 2 | La maqueta navegable sigue siendo compatible con un nivel admitido, pero esta matriz no declara cumplimiento académico definitivo ni sustituye la revisión final contra la fuente original. |
| Contenido textual, gráfico, audiovisual o interactivo | Cumplido localmente | Interfaz interactiva y documentación textual. |
| Identificar modelos y herramientas usadas en cada parte | Cumplido con limitación declarada | Figma Make, UXPilot y Abacus exploratorio no dejaron un modelo identificable. En los intentos API se solicitó e informó claude-sonnet-4-6. El modelo exacto de Codex continúa pendiente de recuperación. |
| Informe PDF con introducción | Cumplido en borrador | Incluye tema, justificación y objetivo. |
| Informe PDF con marco conceptual | Cumplido en borrador | Describe IA como asistencia, control humano, trazabilidad y herramientas utilizadas. |
| Informe PDF con metodología | Parcial avanzado | Explica proceso, ajustes, decisiones, fallos y correcciones; ya contiene ejemplos de prompts/intervenciones. Falta seleccionar y condensar para el PDF final. |
| Informe PDF con resultados | Parcial avanzado | Borrador actualizado con un caso real exitoso, fallo anterior y límites. PDF final, selección de capturas y maquetación pendientes. |
| Informe PDF con análisis crítico y AIBPS | Cumplido en borrador | Evalúa fortalezas, limitaciones y las cuatro dimensiones sin atribuir métricas inexistentes. |
| Informe PDF con conclusiones | Cumplido en borrador | Incluye aprendizajes y recomendaciones futuras. |
| Máximo recomendado de 10 páginas, Arial o Calibri 11, interlineado 1.5 | Pendiente de reconfirmación final | El PDF final no fue modificado ni vuelto a contrastar en este lote. No se reafirma extensión ni formato actuales sin revisar el artefacto final. |
| Link al repositorio y PDF enviados por correo | Pendiente externo | No crear, publicar ni enviar sin autorización específica en la etapa de entrega. |
| Correo y asunto según la consigna | Pendiente externo | PDF original: enviar desde correo institucional a `contacto@diegoparras.com`; asunto sólo `TP ` seguido del correo institucional del estudiante. Comprobar avisos posteriores y autorizar envío. |

## No exigido por la consigna

- Entrevistas o una cuota de participantes.
- Investigación primaria.
- Piloto con usuarios.
- Métricas reales de producto.
- Backend, autenticación o base de datos.
- IA real integrada para que el Nivel 2 sea admisible.
- Despliegue en Vercel o Netlify para el Nivel 2.

Estas actividades pueden mejorar el proyecto si aportan a una decisión y hay tiempo, pero no deben presentarse como obligaciones académicas adicionales.

## Riesgos y próximos cierres

1. Algunos proveedores no muestran un modelo identificable; esa limitación debe declararse en el informe.
2. Falta condensar los ejemplos de prompts ya presentes, seleccionar capturas/enlaces, revisar el contenido y verificar el PDF final antes de retirar la marca de borrador. La consigna no exige defensa en vivo ni otra presentación audiovisual.
3. La fecha debe contrastarse con cualquier aviso docente posterior al PDF.
4. La versión pública usa localStorage v0.3, sin backend remoto ni login; el candidato c4f8ef8 conserva preparación privada y añade Abacus/Gemini de autoridad servidor, sin generaciones reales habilitadas. El caso real histórico no prueba Gemini, calidad general ni aislamiento multiusuario comercial.
5. Versión funcional pública comprobada: 3835117 en ambos alojamientos; Lote 1 e2befd6 y su smoke F02/F03/F09/F08 mínimo son antecedentes conservados. Detalle y límites en [`verification-2026-10-07.md`](verification-2026-10-07.md). No se deduce cumplimiento académico definitivo. Las capturas anteriores conservan origen y corte, no se presentan como producción vigente.
6. La simulación sólo prueba contrato e interfaz; no demuestra calidad, resistencia real a instrucciones adversariales ni costo.
7. Antecedente Abacus 3/5, permisos consumidos, halted y generaciones deshabilitadas. Tokens no disponibles; saldo 13.897 → 13.889 y 21,3 créditos API diarios no permiten reconciliar una llamada individual. No autoriza Gemini ni otros consumos; cuatro casos ficticios siguen no ejecutados.
8. Acceso privado y persistencia remota están preparados en el candidato separado; aislamiento multiusuario, PDF/imágenes, leads, portal y monetización no están implementados para uso general ni son exigencias académicas.
9. Cabecera/Work y Sources/foco conservan sus correcciones y smokes históricos. La preparación protegida ya está versionada localmente; antes de habilitar IA faltan cuenta/cuota, datos, custodia segura, migraciones/transacciones/RLS y límites, con autorización específica. No se declara cumplimiento académico definitivo ni seguridad integral.
10. Lote 2 (F01/F11/F12) cerrado y publicado en su cobertura, sin accesibilidad integral. Próximo cierre académico: evidencia coherente, PDF final y condiciones de envío. Resolver el Preview exacto, probar dos computadoras o autorizar futuras llamadas son gates de producto separados, no exigencias docentes adicionales. Alcance en [`../contexto.md`](../contexto.md).
