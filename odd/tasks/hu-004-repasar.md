# hu-004-repasar

Objetivo: el estudiante que falló una pregunta de práctica la vuelve a ver cuando repasa esa materia.
Rama: `feat/HU-004-repasar`
Spec: `docs/sdd/HU-004-repasar.md`
Tests: `npm test`

## Specs

- S1. `AC-004-01`: Dado que respondí una pregunta de práctica y la corrección fue «Fallaste», cuando pido repasar esa materia, entonces veo esa pregunta.
- S2. `AC-004-02`: Dado que la corrección fue «Está bien», cuando pido repasar esa materia, entonces esa pregunta no aparece.
- S3. `AC-004-03`: Dado que otra persona falló una pregunta, cuando yo repaso, entonces no veo la pregunta de esa persona.

## Tasks

- T1. S1. hecho. `GradePracticeAnswer` guarda en `FailedPracticeStore` solo si el veredicto es «Fallaste». Test rojo antes del verde.
- T2. S2. hecho. «Está bien» y abstención no escriben. Test en `grade-practice-answer.test.ts`.
- T3. S3. hecho. `ReviewFailedPractice` delega el filtro a `list({ userId, materia })`. `PgFailedPracticeStore` filtra en SQL.
- T4. S1–S3. hecho. `GET /practice/review`, proxy Next, lista en `PracticeForm`, BDD `features/HU-004-repasar.feature`.

## Log

L1. Bien, continuemos entonces con la HU-004

L2. 2026-11-13. Dale, vamos con eso.

La historia se tomó como grande: tiene varias reglas y no se retoma solo con el pedido y el diff. Se escribieron la spec y este seguimiento con los tres criterios aceptados. No se guarda la respuesta fallada. No se partió la historia.

L3. 2026-11-13. vamos con eso, no utilicemos pair, sigamos con ODD puro.

Implementación en verde en `feat/HU-004-repasar`: dominio, `PgFailedPracticeStore`, API, web y BDD. `npm test`, `npm run test:bdd` (18 escenarios) y `npm run typecheck` pasan. El test de pgvector queda salteado sin `CURSADA_INTEGRATION=1`.

L4. 2026-11-13. bien, funciona.

Probado en la web: una fallada aparece en Repaso. PR [#18](https://github.com/valentinoaraya/cursada/pull/18).
