# Cursada — Copiloto de estudio con fuentes

> Documento de contexto para planificar y desarrollar el proyecto en Cursor.
> Autor: Valentino Araya (Full Stack TS, 4º año Ing. en Sistemas de Información, UTN FRSR).

## 1. Visión

Cursada es un copiloto de estudio que responde **solo con el material del usuario** (apuntes, PDFs de cátedra, parciales viejos, reglamentos) y **siempre cita la fuente** (archivo + página). Si no hay evidencia, lo dice. Además genera preguntas de práctica fieles al material y corrige respuestas contra la fuente.

### Objetivos del proyecto
1. **Uso real:** que el autor lo use todos los días para estudiar las materias de la carrera.
2. **Portfolio:** demostrar lo que hoy piden los recruiters para roles Full Stack con IA:
   - RAG con citas, búsqueda híbrida y reranking.
   - Salida estructurada validada con schema (Zod) y streaming a la UI.
   - Evals y observabilidad (Langfuse), costo/latencia por request.
   - Multi-tenant (aislamiento por usuario y materia).
   - CI/CD, testing serio, arquitectura limpia.
3. **Proceso:** desarrollado de cero con **SDD (Spec-Driven Development)** y **TDD** como guías, con trazabilidad completa.

### Problema
El material de cada materia está disperso (PDFs, apuntes, Moodle). Para estudiar hace falta:
- encontrar rápido "dónde dice X";
- practicar con preguntas basadas en el material, no inventadas;
- repasar lo que se falló.

### Usuarios
- **Primario:** el autor.
- **Secundario (post-MVP):** compañeros de la UTN, cada uno con sus materias o compartiendo una materia.

## 2. Alcance del MVP

- Cargar PDF / Markdown asociado a **materia** y **unidad**.
- Preguntar en lenguaje natural → respuesta en **streaming** con **citas** (doc + página).
- **Abstención:** "No está en tu material" cuando no hay evidencia suficiente (sin llamar al LLM).
- Generar **preguntas de práctica** por unidad.
- **Corregir** la respuesta del usuario contra la fuente, citando.
- **Historial de falladas** para repaso.

### Fuera de alcance (por ahora)
- Integración automática con Moodle (posible HU futura).
- Apps móviles nativas.
- Fine-tuning de modelos.

## 3. Cómo funciona el RAG

### Ingesta (`IngestDocument`)
1. Parsear el documento (PDF/MD) conservando número de página.
2. Calcular `hash` del contenido → si ya existe para ese usuario/materia, **no re-indexar**.
3. Chunking por sección/página, con metadatos: `userId`, `materia`, `unidad`, `docId`, `pagina`, `hash`.
4. Generar embeddings y guardar en **Postgres + pgvector** (más columna `tsvector` en español).

### Consulta (`AskQuestion`)
1. **Búsqueda híbrida:** full-text (`tsvector`, español) + similitud vectorial, filtrada por usuario y materia.
2. **Reranking** opcional (medido con evals antes/después).
3. **Umbral de abstención:** si el mejor score < umbral → responder "no hay evidencia" **sin llamar al LLM**.
4. El LLM recibe solo los chunks recuperados y devuelve salida estructurada validada con Zod:
   ```ts
   { answer: string; citations: { chunkId: string; docId: string; pagina: number }[] }
   ```
5. **Validación de citas:** cada cita debe corresponder a un chunk efectivamente recuperado; si no, se descarta/reintenta.
6. Streaming de la respuesta a la UI.

### Práctica (`GeneratePractice`, `GradeAnswer`)
- Generar preguntas a partir de chunks de una unidad (cada pregunta guarda su fuente).
- Corregir la respuesta del usuario comparándola con la fuente y citarla.
- Registrar falladas para el modo repaso.

## 4. Arquitectura

**Hexagonal / Clean en TypeScript, monorepo con npm workspaces.** Las reglas de negocio no viven en React ni en los handlers. El dominio se agrupa por feature (`ingestion`, `qa`, `practice`) y depende de puertos; los adapters implementan esos puertos.

```
cursada/
├─ apps/
│  ├─ api/            # Fastify — handlers finos, sin reglas
│  └─ web/            # Next.js — solo presentación
├─ packages/
│  ├─ core/           # dominio: por feature
│  │  ├─ ingestion/   # entidades, use cases, puertos
│  │  ├─ qa/
│  │  └─ practice/
│  ├─ adapters/       # implementaciones de puertos
│  │  ├─ pgvector/    # ChunkStore (SQL con Drizzle)
│  │  ├─ llm/         # LlmProvider / EmbeddingProvider (Vercel AI SDK)
│  │  └─ parser/      # DocumentParser (PDF/MD)
│  └─ contracts/      # schemas Zod compartidos api <-> web
├─ evals/             # golden set + runner (suite separada)
├─ features/          # Gherkin (BDD) con tags # AC-XXX-NN
├─ docs/
│  ├─ sdd/            # specs por HU (+ _plantilla.md)
│  ├─ adr/            # decisiones de arquitectura
│  ├─ guia-de-trabajo.md
│  └─ traceability.md
├─ .cursor/rules/     # reglas para el agente
├─ AGENTS.md
└─ docker-compose.yml # Postgres + pgvector (+ Langfuse opcional)
```

### Puertos principales
- `DocumentParser` — PDF/MD → páginas/secciones.
- `EmbeddingProvider` — texto → vector.
- `LlmProvider` — generación estructurada + streaming.
- `ChunkStore` — guardar/buscar chunks (híbrida, filtrada).
- `Clock`, `IdGenerator` — para tests deterministas.

### Stack
| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript |
| Monorepo | npm workspaces |
| API | Fastify |
| Web | Next.js (React) |
| DB | PostgreSQL 17 + pgvector en Docker, local y en el VPS (+ tsvector español) |
| Acceso a datos | Drizzle (Prisma no tiene tipo vector nativo) |
| LLM | Vercel AI SDK |
| Validación | Zod |
| Tests | Vitest, Cucumber.js (BDD), Testcontainers |
| Observabilidad | Langfuse |
| CI | GitHub Actions |
| Deploy | VPS propio con Docker + Nginx |

### Decisiones cerradas

Acordadas al planificar el stack y cerradas en los ADR de S0. El detalle está en `docs/adr/`.

- **Base de datos:** PostgreSQL + pgvector en Docker, en desarrollo y en el VPS. La misma imagen en los tres entornos. Supabase también ofrece la extensión `vector`, pero el corpus de cátedra queda en el servidor propio y el único acceso es el puerto `ChunkStore`.
- **Monorepo:** npm workspaces (`apps/*`, `packages/*`) y `package-lock.json`. Cada paquete declara sus dependencias: npm eleva paquetes a la raíz de `node_modules` y un paquete puede llegar a importar algo que no listó.
- **Proxy:** Nginx en el VPS, que ya está en uso. Termina TLS y enruta la web y la API. Postgres permanece en la red interna de Docker, sin puerto público. En el `server` de la API, `proxy_buffering off` y un timeout de lectura alto para que el streaming llegue al navegador a medida que se genera.
- **Arquitectura:** hexagonal, como en el árbol de arriba.

## 5. Flujo de trabajo: SDD + TDD

Inspirado en el proyecto de la facultad [seguimiento-medicion](https://github.com/FaustinoDuran/seguimiento-medicion), que usa un SDD propio (plantillas Markdown + reglas para el agente, sin spec-kit ni OpenSpec).

### Cadena obligatoria
**HU (Issue) → SDD → Criterios AC → BDD (Gherkin) → Tests → Código → PR**

### Tipos de trabajo
- `HU-XXX`: historia de usuario → recorre la cadena completa.
- `TASK-XXX`: infraestructura → sin SDD ni BDD.
- `BUG-XXX`: empieza con un test que reproduce el error.

### Plantilla de spec (`docs/sdd/_plantilla.md`)
Secciones fijas: objetivo · entradas · salidas · reglas de negocio · restricciones · casos límite · errores · criterios `AC-XXX-NN` · trazabilidad (feature, tests, código). **Se escribe antes de los tests.**

### BDD
- `features/HU-XXX-*.feature` en español, cada escenario etiquetado `# AC-XXX-NN`.
- Automatizar con Cucumber.js cuando el use case esté en verde.

### TDD y commits
- Rama `feat/HU-XXX-descripcion`.
- Commits separados:
  - `test(#N): red …`
  - `feat(#N): green …`
  - `refactor(#N): …`
- Tests unitarios de reglas con **fakes deterministas** de LLM y embeddings y repos en memoria (sin HTTP, sin Postgres, sin API externa).
- Tests de integración contra Postgres + pgvector en Docker (se saltean si falta la variable de entorno).

### Gobernanza
- `AGENTS.md` y `.cursor/rules/*.mdc`: orden de trabajo y prohibiciones para el agente (p. ej. no poner reglas en handlers/React, no saltear la spec, no escribir código sin test en rojo).
- ADRs en `docs/adr/`.
- `docs/traceability.md`: tabla HU → Issue → SDD → AC → BDD → tests → código → PR.
- Templates de Issue y PR con checklist de trazabilidad.
- **Mejora sobre el repo de referencia:** CI con GitHub Actions desde el día 0.

### Ejemplos de criterios de aceptación
- `AC-001-xx`: No re-indexa un documento cuyo hash ya existe para ese usuario y materia.
- `AC-001-xx`: Cada chunk guarda materia, unidad, documento y página.
- `AC-002-xx`: Si ningún chunk supera el umbral, responde "no hay evidencia en tu material" y **no llama al LLM**.
- `AC-002-xx`: Toda cita devuelta corresponde a un chunk recuperado.
- `AC-002-xx`: Un usuario nunca recupera chunks de otro usuario.

## 6. Evals (suite separada de los tests)

Los tests son deterministas; las evals miden calidad de un sistema no determinista.

- **Golden set:** 50–100 preguntas sacadas de parciales y guías, con su fuente esperada; incluir preguntas **fuera del material** para medir abstención.
- **Métricas:**
  - Retrieval: recall@k.
  - Validez de citas.
  - Tasa de abstención correcta.
  - Fidelidad a la fuente (LLM-as-judge).
  - Costo y latencia por consulta.
- **Experimentos:** comparar baseline vs. búsqueda híbrida vs. + reranking.
- **Observabilidad:** trazas en Langfuse.
- **CI:** correr evals con umbral mínimo (que una regresión rompa el build).

## 7. Hitos (~1 semana cada uno)

| Sprint | Entregable |
|---|---|
| **S0** | ADRs (stack, hexagonal, alcance), scaffolding del monorepo, docker-compose con pgvector, plantillas SDD, AGENTS.md + rules, CI |
| **S1** | HU-001 Ingesta: parse, chunk, embed, dedupe por hash |
| **S2** | HU-002 Preguntas con citas, streaming, abstención, búsqueda híbrida |
| **S3** | Golden set, runner de evals, Langfuse, reranking con métricas comparadas |
| **S4** | HU-003 Práctica (generar y corregir con fuente) + repaso de falladas |
| **S5** | Multiusuario con aislamiento por usuario/materia, deploy en VPS con Nginx, README en inglés con resultados de evals y demo |

## 8. Consideraciones

- **Derechos de autor:** el material de cátedra puede tener copyright. Cada usuario mantiene su corpus **privado**; la demo pública usa apuntes propios o documentos públicos (reglamentos, planes de estudio).
- **Costos:** registrar costo por consulta y usar modelos baratos para embeddings y corrección.
- **Privacidad:** aislamiento estricto por usuario desde el diseño (testeado con AC).

## 9. Para el README / portfolio

- README en inglés: arquitectura (diagrama), decisiones (ADRs), resultados de evals antes/después del reranking, costo por consulta, y una sección "qué falló y cómo lo diagnostiqué".
- Demo deployada + video corto.
- Post técnico en LinkedIn y sección "Destacado" con demo y repo.

## 10. Primer paso sugerido

1. Crear repo y ejecutar **S0** (TASK-001: scaffolding + CI; ADR-0001 stack; ADR-0002 arquitectura hexagonal).
2. Escribir `docs/sdd/HU-001-ingesta.md` con sus criterios AC.
3. Primer test en rojo: "no re-indexa un documento con el mismo hash".
