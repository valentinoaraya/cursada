# ADR-0002 — Arquitectura hexagonal

- Estado: aceptado
- Fecha: 2026-10-29

## Contexto

Las reglas que definen el producto son pocas y estrictas: no reindexar un hash ya visto, abstenerse sin llamar al modelo, citar solo chunks recuperados y no mezclar usuarios. Esas reglas se testean con fakes, sin HTTP, sin Postgres y sin APIs de pago. La interfaz se agrupa igual por capacidad: ingesta, preguntas y práctica.

## Decisión

Las dependencias apuntan hacia `packages/core`.

- `packages/core` contiene entidades, casos de uso y puertos, agrupados por feature (`ingestion`, `qa`, `practice`).
- `packages/adapters` implementa los puertos (pgvector, LLM, parser).
- `packages/contracts` tiene los schemas Zod compartidos entre la API y la web.
- `apps/api` (Fastify) y `apps/web` (Next.js) traducen HTTP y presentación. No contienen reglas de negocio.
- `Clock` e `IdGenerator` son puertos para que los tests sean deterministas.

Un caso de uso recibe interfaces. El test le pasa fakes. Cambiar Fastify, Drizzle o el proveedor del modelo no toca el dominio.

## Consecuencias

- Hay más archivos que en una carpeta por feature con la pantalla, el SQL y la llamada al modelo juntos.
- Un adapter no importa otro adapter ni una app.
- Una app puede importar contratos y llamar al caso de uso. No importa Drizzle, el parser ni el AI SDK.
- `packages/core` no importa paquetes de las apps ni de los adapters.
