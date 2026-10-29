# ADR-0003 — Alcance del MVP

- Estado: aceptado
- Fecha: 2026-10-29

## Contexto

El primer usuario es el autor, estudiando las materias de la carrera. El corpus puede tener copyright y es privado. El portfolio necesita RAG con citas, abstención, práctica contra la fuente y aislamiento por usuario, sin convertir el MVP en un producto para toda la facultad.

## Decisión

Entra en el MVP:

- Cargar PDF o Markdown asociado a una materia y una unidad.
- Preguntar en lenguaje natural y recibir la respuesta en streaming, con citas de archivo y página.
- Abstenerse, sin llamar al modelo, cuando no hay evidencia suficiente.
- Generar preguntas de práctica por unidad y corregir la respuesta contra la fuente.
- Guardar las falladas para repaso.

Queda fuera, hasta un sprint posterior o una historia nueva:

- Integración con Moodle.
- Apps móviles nativas.
- Fine-tuning.
- Login. El dominio recibe `userId` desde S1; la identidad llega en S5.
- Reranking. El puerto puede existir vacío; se mide en S3 contra el golden set.
- Hospedar Langfuse. Se decide en S3.
- Nginx y el deploy en el VPS. Llegan en S5. Hasta entonces se desarrolla contra Docker local.

La demo pública usa apuntes propios o documentos públicos. El material de cátedra de terceros no se publica.

## Consecuencias

- S1 puede testear aislamiento con dos `userId` aunque no haya registro.
- No se agrega una integración externa para cumplir una historia del MVP.
- El README en inglés, con resultados de evals, es parte de S5 y no de este sprint.
