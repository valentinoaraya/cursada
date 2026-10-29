# HU-001 — Ingesta de material

## Objetivo

El autor carga un PDF o un Markdown asociado a una materia y una unidad. El sistema lo guarda partido en chunks, con la página y el embedding. Si ese mismo contenido ya estaba indexado para ese usuario y esa materia, no lo vuelve a indexar.

## Entradas

`IngestDocument.execute` recibe:

| Campo | Tipo | Origen |
|---|---|---|
| `userId` | string | Identidad de quien carga. En el MVP puede ser un id fijo |
| `materia` | string | Materia elegida al cargar |
| `unidad` | string | Unidad elegida al cargar |
| `filename` | string | Nombre original del archivo. No entra en el hash |
| `content` | bytes | Contenido crudo del archivo |

## Salidas

| Campo | Tipo | Significado |
|---|---|---|
| `documentId` | string | Id del documento. En una carga repetida es el id ya existente |
| `alreadyIndexed` | boolean | `true` si el hash ya existía para ese usuario y esa materia |
| `chunkCount` | number | Chunks guardados en esta llamada. `0` si ya estaba indexado o si el documento no tiene texto |

## Reglas de negocio

1. El hash es el SHA-256 hexadecimal de `content`. El nombre del archivo no participa.
2. Si ya existe un documento con ese hash para el mismo `userId` y la misma `materia`, la llamada no parsea, no pide embeddings y no guarda chunks. Devuelve el `documentId` existente con `alreadyIndexed: true`.
3. Los mismos bytes de otro usuario, o del mismo usuario en otra materia, se indexan como un documento nuevo.
4. Cada chunk guarda `userId`, `materia`, `unidad`, `documentId`, `pagina`, `hash` y el texto de esa página o sección.
5. Una página o sección sin texto no genera chunk.
6. Un PDF se parte por página. Un Markdown se parte por encabezado cuando los hay; si el parser no informa página, la página es `1`.
7. Aunque el documento no tenga texto, se registra el hash. La carga siguiente no vuelve a parsear.

## Restricciones

- El caso de uso vive en `packages/core` y solo habla con `DocumentParser`, `EmbeddingProvider`, `ChunkStore`, `Clock` e `IdGenerator`.
- Los tests de esta historia usan fakes. No abren HTTP, Postgres ni una API externa.
- El adapter de parser, cuando exista, conserva el número de página y corre en local. La librería se elige al implementar ese adapter.
- El corpus de un usuario no se mezcla con el de otro. El filtro es parte del guardado, no un paso posterior.

## Casos límite

- Mismos bytes y otro nombre de archivo, mismo usuario y materia: no reindexa.
- Mismos bytes, otra materia: indexa.
- Mismos bytes, otro usuario: indexa.
- Documento sin texto útil: `chunkCount` es `0`, no se llama al proveedor de embeddings, y una segunda carga no reindexa.
- El orden de dos cargas iguales devuelve el mismo `documentId`.

## Errores

- Si el parser falla, no se guarda el documento ni ningún chunk, y no se llama al proveedor de embeddings.
- Si el proveedor de embeddings falla, no se guarda nada. Una carga posterior puede reintentar: el hash todavía no existe.
- El hash se persiste junto con los chunks, después de parsear y de obtener los embeddings. No antes.

## Criterios de aceptación

- `AC-001-01`: No reindexa un documento cuyo hash ya existe para ese usuario y esa materia. No vuelve a parsear, no pide embeddings y no guarda otro lote de chunks. El `documentId` de la segunda carga es el de la primera.
- `AC-001-02`: Cada chunk guardado lleva materia, unidad, documento y página.
- `AC-001-03`: Los mismos bytes de otro usuario, o en otra materia, sí se indexan.
- `AC-001-04`: Un documento sin texto no llama al proveedor de embeddings y deja registrado el hash para no reindexar.
- `AC-001-05`: Si el parser o el proveedor de embeddings fallan, no queda documento ni chunk persistido.

## Trazabilidad

| Pieza | Ruta | Estado |
|---|---|---|
| Feature | `features/HU-001-ingesta.feature` | Pendiente. Se escribe cuando el caso de uso esté en verde |
| Tests | `packages/core/src/ingestion/ingest-document.test.ts` | Rojo. Cubre `AC-001-01` |
| Código | `packages/core/src/ingestion/ingest-document.ts` | Sin implementar |
| Issue | — | Pendiente |
| PR | — | Pendiente |
