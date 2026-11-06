# hu-003-practicar

Objetivo: el estudiante practica una unidad con una pregunta de su material y, al responder, ve si está bien o si falló, con archivo y página.
Rama: `feat/HU-003-practicar`
Spec: `docs/sdd/HU-003-practicar.md`
Tests: `npm test` · `npm run test:bdd`

## Specs

- S1. `AC-003-01`: Dado que cargué material en una unidad, cuando pido practicar esa unidad, entonces recibo una pregunta hecha solo con ese material.
- S2. `AC-003-02`: Dado que respondí esa pregunta, cuando pido que la corrija, entonces veo si está bien o si fallé, con el archivo y la página de donde sale la corrección.
- S3. `AC-003-03`: Dado un pasaje de otra persona, de otra materia o de otra unidad, cuando practico esta unidad, entonces la pregunta y la corrección no lo usan ni lo citan.
- S4. `AC-003-04`: Dado que esa unidad no tiene material, cuando pido practicar, entonces me avisa «No está en tu material» y no recibo una pregunta.

## Tasks

- T1. S1. hecho. `GeneratePracticeQuestion`, tests en verde.
- T2. S2. hecho. `GradePracticeAnswer`, citas desde pasajes recuperados, tests en verde.
- T3. S3. hecho. Filtro `unidad` en búsqueda (puerto + pgvector), tests y Cucumber en verde.
- T4. S4. hecho. Abstención sin modelo, tests y Cucumber en verde.
- T5. S1–S4. hecho. `AiSdkPracticeLlmProvider`, rutas Fastify, proxies Next, `PracticeForm`, BDD `HU-003-practicar.feature`. PR [#16](https://github.com/valentinoaraya/cursada/pull/16).

## Log

L1. Buenas, quiero que comencemos con la HU-003: Practicar con preguntas de una unidad.

L2. 2026-11-06. me parece bien lo que está planteado, acepto también tus sugerencias.

La historia se tomó como grande: tiene varias reglas y no se retoma solo con el pedido y el diff. Se escribieron la spec y este seguimiento. Cada pedido devuelve una sola pregunta. El caso de la unidad sin material quedó como `AC-003-04`, con el aviso ya usado en HU-002. No se partió la historia.

L3. 2026-11-06. vamos con la implementacion.

Implementación en verde: dominio, adapter LLM de práctica, búsqueda por unidad en pgvector, API, web, BDD. `npm test`, `npm run test:bdd` y `npm run typecheck` pasan. PR [#16](https://github.com/valentinoaraya/cursada/pull/16). Falta merge y cerrar issue #5. El rediseño de layout web queda fuera de este PR.
