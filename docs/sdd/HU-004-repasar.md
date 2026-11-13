# HU-004 — Repasar las preguntas falladas

## Objetivo

El estudiante que falló una pregunta de práctica puede volver a verla cuando repasa esa materia.

## Entradas

Corregir sigue recibiendo lo que ya recibe en HU-003: `userId`, `materia`, `unidad`, `question` y `answer`.

Repasar recibe:

| Campo | Tipo | Origen |
|---|---|---|
| `userId` | string | La misma identidad que en la carga y en la práctica. En el MVP puede ser un id fijo |
| `materia` | string | La materia que quiere repasar |

## Salidas

Si la corrección es «Fallaste», además del veredicto y las citas de HU-003, esa pregunta queda guardada para ese `userId`, esa `materia` y esa `unidad`.

Si la corrección es «Está bien», o si corregir se abstiene con «No está en tu material», no queda ninguna pregunta guardada por ese pedido.

Repasar devuelve la lista de preguntas guardadas de ese `userId` y esa `materia`. Cada ítem muestra la pregunta. Si no hay ninguna, la lista está vacía.

## Reglas de negocio

1. Una corrección con veredicto «Fallaste» guarda esa pregunta para el `userId`, la `materia` y la `unidad` de ese pedido.
2. Una corrección con veredicto «Está bien» no guarda la pregunta.
3. Una corrección que se abstiene no guarda la pregunta y no escribe en el almacén de falladas.
4. Repasar devuelve solo preguntas guardadas de ese `userId` y esa `materia`.
5. Una pregunta fallada de otra persona no aparece en el repaso.
6. Una pregunta fallada de la misma persona en otra materia no aparece cuando se repasa esta materia.

## Restricciones

- Guardar y listar viven en `packages/core`. El filtro por `userId` viaja en el puerto de almacenamiento. No es un recorte posterior.
- Repasar no llama al modelo.
- No se guarda la respuesta del estudiante. Solo la pregunta, junto con la persona, la materia y la unidad.
- Quedan afuera explicar el fallo, sacar la pregunta si más tarde se responde bien, volver a corregir desde el repaso, el puntaje, el login, las evals y el deploy.

## Casos límite

- Fallar la misma pregunta dos veces deja dos ítems. Esta historia no deduplica.
- Una materia sin falladas devuelve una lista vacía, no el aviso «No está en tu material».
- La unidad se guarda con la pregunta, pero el repaso se pide por materia: entran las falladas de todas las unidades de esa materia.
- Supuesto, no pedido en los criterios: `materia` vacía al repasar no lista nada de otra materia y no llama al almacén como si la materia fuera cualquiera.

## Errores

- Si el almacén falla al guardar una fallada, esa pregunta no queda persistida y el fallo no se reemplaza por «Está bien» ni por «No está en tu material».
- Si el almacén falla al listar, no se devuelve una lista vacía en lugar del error.
- Un fallo al guardar no borra falladas que ya estaban persistidas.

## Criterios de aceptación

- `AC-004-01`: Dado que respondí una pregunta de práctica y la corrección fue «Fallaste», cuando pido repasar esa materia, entonces veo esa pregunta.
- `AC-004-02`: Dado que la corrección fue «Está bien», cuando pido repasar esa materia, entonces esa pregunta no aparece.
- `AC-004-03`: Dado que otra persona falló una pregunta, cuando yo repaso, entonces no veo la pregunta de esa persona.

## Trazabilidad

| Pieza | Ruta | Estado |
|---|---|---|
| Seguimiento | `odd/tasks/hu-004-repasar.md` | T1–T4 hechos |
| Feature | `features/HU-004-repasar.feature` | Cucumber en verde |
| Tests | `packages/core/src/qa/grade-practice-answer.test.ts`; `…/review-failed-practice.test.ts`; API `GET /practice/review`; web `listFailedPractice` | Verde |
| Código | `GradePracticeAnswer` guarda en `FailedPracticeStore`; `ReviewFailedPractice`; `PgFailedPracticeStore`; `GET /practice/review`; `PracticeForm` | Cubre AC-004-01 a AC-004-03 |
| Issue | [#6](https://github.com/valentinoaraya/cursada/issues/6) | Abierta |
| PR | [#18](https://github.com/valentinoaraya/cursada/pull/18) | Abierto |
