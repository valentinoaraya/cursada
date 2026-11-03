# Guía de trabajo

Cada implementación nueva sigue ODD. La spec se escribe cuando el cambio es grande, y se acepta antes de los tests. El test rojo se escribe antes que el código que lo pone verde.

## Tamaño

| Tamaño | Cuándo | Antes del código |
|---|---|---|
| Chico | Se puede retomar con el pedido y el `git diff` | Nada. El ciclo es test rojo y código |
| Grande | No se puede retomar así: varias reglas, varias sesiones, o un pedido demasiado largo | Spec aceptada en `docs/sdd/` y seguimiento en `odd/tasks/<feature>.md` |

Una HU con varias reglas es grande. Un bug, un criterio ya aceptado o un ajuste de una sesión es chico. `TASK-XXX` de infraestructura no lleva spec.

## Cambio grande

1. Escribir la spec con `docs/sdd/_plantilla.md` y aceptarla antes de los tests.
2. Crear `odd/tasks/<feature>.md` con `odd/tasks/_plantilla.md` antes del primer cambio de código. `## Specs` cita los AC aceptados. El contrato completo queda en la spec.
3. Test rojo en `packages/core`, código verde, refactor con los tests verdes.
4. Al cerrar un AC, un test o un PR, actualizar `docs/traceability.md`.

La rama es `feat/HU-XXX-descripcion`. El commit, cuando se pide, junta el test y el comportamiento de esa unidad. El mensaje es conventional (`feat`, `fix`, `test` o `refactor`) y `#N` apunta al issue.

## Cambio chico

ODD en línea. No hay archivo nuevo en `docs/sdd/` ni en `odd/tasks/`. Si el cambio tiene comportamiento observable, el test falla antes del código.

## Issue

La issue, al crearse, entra al proyecto de GitHub **Cursada Scrumban**: `gh project item-add 5 --owner valentinoaraya --url <url>`. Si no, no aparece en el tablero.

## Tests

- Las reglas se prueban en `packages/core` con fakes de parser, embeddings y repositorio. Sin HTTP, sin Postgres y sin API externa.
- La integración contra Postgres + pgvector usa Testcontainers y la imagen del `docker-compose`. Se saltea si no está `CURSADA_INTEGRATION`.
- El `.feature` se escribe cuando la historia se cuenta en Gherkin, después de que el caso de uso está en verde. No es un paso previo al código.
- Las evals miden calidad del sistema no determinista. No reemplazan estos tests. Llegan en S3.

## Dónde va cada cosa

- Reglas y casos de uso: `packages/core`.
- SQL, parser, modelo y Langfuse: `packages/adapters`.
- Schemas compartidos: `packages/contracts`.
- HTTP: `apps/api`. Presentación: `apps/web`.

Una regla nueva no se escribe en un handler ni en un componente.

## Definición de hecho

- Si el cambio es grande, la spec está en `docs/sdd/`, el seguimiento en `odd/tasks/`, y los AC no cambiaron en silencio durante el código.
- Hay un test por regla tocada en esa entrega, y ese test falló antes del código.
- `docs/traceability.md` tiene la fila actualizada cuando hay HU, AC, test o PR.
- El PR usa la plantilla y el CI está verde.
