# Guía de trabajo

Cursada se construye con spec-driven development y TDD. La spec se escribe antes que los tests. El test rojo se escribe antes que el código que lo pone verde.

## Cadena

**HU (issue) → SDD → criterios AC → BDD (Gherkin) → tests → código → PR**

## Tipos de trabajo

| Tipo | Cuándo | Spec y BDD |
|---|---|---|
| `HU-XXX` | Historia de usuario | Recorre la cadena completa |
| `TASK-XXX` | Infraestructura | Sin spec ni BDD |
| `BUG-XXX` | Defecto | Empieza con un test que reproduce el error |

## Commits de una historia

Rama `feat/HU-XXX-descripcion`.

- `test(#N): red …`
- `feat(#N): green …`
- `refactor(#N): …`

`#N` apunta al issue.

## Tests

- Las reglas se prueban en `packages/core` con fakes de parser, embeddings y repositorio. Sin HTTP, sin Postgres y sin API externa.
- La integración contra Postgres + pgvector usa Testcontainers y la imagen del `docker-compose`. Se saltea si no está `CURSADA_INTEGRATION`.
- El `.feature` se automatiza con Cucumber.js después de que el caso de uso está en verde, no antes.
- Las evals miden calidad del sistema no determinista. No reemplazan estos tests. Llegan en S3.

## Dónde va cada cosa

- Reglas y casos de uso: `packages/core`.
- SQL, parser, modelo y Langfuse: `packages/adapters`.
- Schemas compartidos: `packages/contracts`.
- HTTP: `apps/api`. Presentación: `apps/web`.

Una regla nueva no se escribe en un handler ni en un componente.

## Definición de hecho de una HU

- La spec está en `docs/sdd/` y sus AC no cambiaron en silencio durante el código.
- Hay un test por AC tocado en esa entrega.
- `docs/traceability.md` tiene la fila actualizada.
- El PR usa la plantilla y el CI está verde. El commit rojo puede existir en la rama; no se mergea hasta el verde. El primer test de HU-001 es la excepción de arranque: vive en `main` hasta el commit que lo pone verde.
