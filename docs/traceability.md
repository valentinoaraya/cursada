# Trazabilidad

| HU | Issue | SDD | AC | BDD | Tests | Código | PR |
|---|---|---|---|---|---|---|---|
| HU-001 | [#3](https://github.com/valentinoaraya/cursada/issues/3) | [docs/sdd/HU-001-ingesta.md](sdd/HU-001-ingesta.md) | AC-001-01 a AC-001-05 en verde, con fakes | [features/HU-001-ingesta.feature](../features/HU-001-ingesta.feature) + Cucumber en verde | `packages/core/…/ingest-document.test.ts`; parser en verde; embeddings en verde; cliente embedMany; default nomic-embed-text local sin API; API: POST /documents; sin archivo 400; sin DATABASE_URL no arranca; pgvector: lista en verde (hash, aislamiento, chunks + vector 768) | `createIngestDocument` cablea parser, embeddings y `PgVectorChunkStore` | — |
| HU-002 | [#4](https://github.com/valentinoaraya/cursada/issues/4) | Pendiente de /story | Sin escribir | — | — | — | — |
| HU-003 | [#5](https://github.com/valentinoaraya/cursada/issues/5) | Pendiente de /story | Sin escribir | — | — | — | — |
| HU-004 | [#6](https://github.com/valentinoaraya/cursada/issues/6) | Pendiente de /story | Sin escribir | — | — | — | — |
| HU-005 | [#7](https://github.com/valentinoaraya/cursada/issues/7) | Pendiente de /story | Sin escribir | — | — | — | — |

## Tasks (infraestructura)

No recorren la cadena HU → SDD → BDD. Completar la columna **Issue** con el número de GitHub al crearlas en el repo.

| Task | Issue | Estado en `main` |
|---|---|---|
| TASK-001 — Sprint 0 (scaffolding, ADRs, CI) | [#1](https://github.com/valentinoaraya/cursada/issues/1) | Hecho (`eea9d06`) |
| TASK-002 — Spec HU-001 y test rojo AC-001-01 | [#2](https://github.com/valentinoaraya/cursada/issues/2) | Hecho (`a683c8a`) |
| TASK-003 — Golden set, evals y reranking | [#8](https://github.com/valentinoaraya/cursada/issues/8) | Pendiente (S3) |
| TASK-004 — Observabilidad con Langfuse | [#9](https://github.com/valentinoaraya/cursada/issues/9) | Pendiente (S3) |
| TASK-005 — Deploy en el VPS con Nginx | [#10](https://github.com/valentinoaraya/cursada/issues/10) | Pendiente (S5) |
| TASK-006 — README en inglés con evals y demo | [#11](https://github.com/valentinoaraya/cursada/issues/11) | Pendiente (S5) |
