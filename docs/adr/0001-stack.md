# ADR-0001 — Stack

- Estado: aceptado
- Fecha: 2026-10-29

## Contexto

Cursada es un monorepo TypeScript. El dominio no puede depender del framework HTTP ni del ORM. Varias capas ya estaban cerradas (npm, Next.js, Postgres + pgvector en Docker, Zod, Vercel AI SDK, Vitest, Cucumber.js, Langfuse, GitHub Actions, Nginx). Quedaban tres bifurcaciones para este ADR.

## Decisión

| Capa | Elección |
|---|---|
| Runtime | Node 24 |
| Monorepo | npm workspaces |
| API | Fastify |
| Web | Next.js (App Router), solo presentación |
| Base de datos | PostgreSQL 17 + pgvector, imagen `pgvector/pgvector:pg17`, en Docker local y en el VPS |
| Acceso a datos | Drizzle |
| Contratos | Zod en `@cursada/contracts` |
| LLM y embeddings | Vercel AI SDK, solo dentro del adapter. El proveedor y el modelo se eligen al implementar ese adapter |
| Tests de dominio | Vitest, con fakes en memoria |
| Tests de integración | Testcontainers con la misma imagen de pgvector. Se saltean si `CURSADA_INTEGRATION` no está definida |
| BDD | Cucumber.js cuando el caso de uso está en verde |
| Observabilidad | Langfuse. El compose de S0 lleva solo Postgres; cómo se hospeda Langfuse se cierra en S3 |
| CI | GitHub Actions, Node 24, `npm ci`, typecheck y tests |
| Deploy | VPS con Docker y Nginx. Postgres no se publica |

Fastify porque los handlers son finos y el contrato ya es Zod. Drizzle porque el esquema y las migraciones viven junto al adapter; la búsqueda híbrida sigue siendo SQL escrito ahí. Prisma queda descartado: no tiene tipo `vector` nativo. Testcontainers porque el aislamiento por usuario se tiene que probar contra la misma extensión que en producción, no contra un esquema compartido.

## Consecuencias

- Cada paquete declara sus dependencias. npm eleva paquetes a la raíz de `node_modules`.
- La búsqueda híbrida no pasa por el query builder: es SQL en `@cursada/adapter-pgvector`.
- El CI de S0 no levanta Docker. La suite de integración entra cuando exista el adapter y solo corre con `CURSADA_INTEGRATION=1`.
- En Nginx, el `server` de la API usa `proxy_buffering off` y un timeout de lectura alto para el streaming. Eso se configura en S5.
