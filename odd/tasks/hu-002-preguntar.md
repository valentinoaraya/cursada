# hu-002-preguntar

Objetivo: el estudiante pregunta sobre una materia y ve la respuesta mientras se escribe, con archivo y página, o el aviso «No está en tu material».
Rama: `feat/HU-002-preguntar`
Spec: `docs/sdd/HU-002-preguntar.md`
Tests: `npm test` · `npm run test:bdd`

## Specs

- S1. `AC-002-01`: Dado que mi material de esa materia contiene la respuesta, cuando pregunto con mis palabras, entonces veo la respuesta mientras se escribe, con el archivo y la página de donde sale.
- S2. `AC-002-02`: Dado que mi material de esa materia no contiene la respuesta, cuando pregunto, entonces me avisa «No está en tu material» y no me da una respuesta generada.
- S3. `AC-002-03`: Dado un pasaje de otra persona, o mío de otra materia, cuando pregunto sobre esta materia, entonces la respuesta no lo cita ni lo usa.

## Tasks

- T1. S1. hecho. Dominio `AskQuestion`, tests en verde.
- T2. S2. hecho. Abstención sin llamar al LLM, tests en verde.
- T3. S3. hecho. Filtro por usuario/materia en búsqueda, tests en verde.
- T4. S1–S3. hecho. pgvector (`filename`, `search_tsv`, búsqueda híbrida), adapter LLM streaming, `POST /questions`, Cucumber HU-002.
- T5. S1–S2. hecho. UI Next.js: formulario de pregunta, proxy SSE, citas y aviso de abstención.
- T6. hecho. UI de carga: UploadForm + proxy multipart `/api/documents`, materia compartida con AskForm.

## Log

L1. /story Perfecto, quiero que arranquemos con la HU-002: Preguntar al material y citar o abstenerse.

L2. 2026-11-05. estoy de acuerdo con los criterios.

La historia se tomó como grande: tiene varias reglas y no se retoma solo con el pedido y el diff. Se escribieron la spec y este seguimiento. No hay tests ni código.

L3. 2026-11-05. Dale, vamos con lo que sigue.

Implementación en verde: dominio, adapters, API y BDD. `npm test` y `npm run test:bdd` pasan. Falta PR y cerrar issue #4.

L4. 2026-11-05. Vamos con la UI.

Web: `AskForm`, `ask-client` con tests, `POST /api/questions` proxy al Fastify, contratos de cita con filename/página. Sin UI de carga todavía. Falta commit/PR.

L5. 2026-11-05. Metamos la UI de carga de documentos.

`UploadForm` + `upload-client` + proxy `/api/documents`. `StudyWorkspace` comparte la materia entre carga y pregunta. Falta commit/PR.
