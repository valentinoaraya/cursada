# HU-003 — Practicar con preguntas de una unidad

## Objetivo

El estudiante pide practicar una unidad, recibe una pregunta hecha con su material de esa unidad y, al responder, ve si está bien o si falló, con el archivo y la página.

## Entradas

Generar la pregunta recibe:

| Campo | Tipo | Origen |
|---|---|---|
| `userId` | string | Identidad de quien practica. En el MVP puede ser un id fijo, como en la carga |
| `materia` | string | Materia de la unidad |
| `unidad` | string | Unidad con la que quiere practicar |

Corregir la respuesta recibe:

| Campo | Tipo | Origen |
|---|---|---|
| `userId` | string | La misma identidad |
| `materia` | string | La misma materia |
| `unidad` | string | La misma unidad |
| `question` | string | La pregunta que recibió |
| `answer` | string | Lo que respondió |

## Salidas

Si la búsqueda devuelve pasajes de esa persona, esa materia y esa unidad, generar devuelve:

| Campo | Tipo | Significado |
|---|---|---|
| `question` | string | Una sola pregunta, armada solo con esos pasajes |

Si la búsqueda no devuelve ningún pasaje, generar devuelve:

| Campo | Tipo | Significado |
|---|---|---|
| `notice` | string | El texto exacto «No está en tu material» |
| `question` | ausente | No hay pregunta generada |

Si hay pasajes y el estudiante respondió, corregir devuelve:

| Campo | Tipo | Significado |
|---|---|---|
| `verdict` | string | El texto exacto «Está bien» o «Fallaste» |
| `citations` | lista | Cada cita muestra el nombre del archivo y la página de un pasaje recuperado |

Si la búsqueda no devuelve ningún pasaje, corregir devuelve el aviso «No está en tu material», sin veredicto y sin citas.

## Reglas de negocio

1. Cada pedido de práctica devuelve una sola pregunta, armada solo con pasajes de ese `userId`, esa `materia` y esa `unidad`.
2. Si la búsqueda no devuelve ningún pasaje, generar responde «No está en tu material», no llama al modelo y no entrega una pregunta.
3. Corregir usa solo los pasajes de ese `userId`, esa `materia` y esa `unidad`. El resultado visible es «Está bien» o «Fallaste», con el archivo y la página de un pasaje recuperado.
4. Si corregir no encuentra pasajes, responde «No está en tu material», no llama al modelo y no entrega veredicto ni citas.
5. Un pasaje de otra persona, de otra materia o de otra unidad no entra en la pregunta, no entra en la corrección y no se cita.
6. Cada cita visible es el nombre del archivo con el que se cargó el documento y la página de un pasaje recuperado para esa corrección. Una cita que no corresponda a uno de esos pasajes no se muestra.

## Restricciones

- Los dos casos de uso viven en `packages/core`. Hablan con el puerto de búsqueda y con el puerto del modelo. No llaman al modelo cuando se abstienen.
- El filtro por `userId`, `materia` y `unidad` viaja en el puerto de almacenamiento. No es un recorte posterior.
- La búsqueda de hoy filtra persona y materia. Esta historia le agrega la unidad. El pasaje recuperado no trae la unidad, así que el corte no puede hacerse después.
- No se guarda la pregunta, la respuesta ni el veredicto. Volver a lo fallado es la HU-004.
- Quedan afuera el login, el repaso, varias preguntas en un mismo pedido, el puntaje, el tiempo, las evals, el reranking y el deploy.

## Casos límite

- Un pasaje de otra persona, aunque el texto coincida, no se usa ni se cita.
- Un pasaje de la misma persona en otra materia, o en otra unidad, no se usa ni se cita.
- Una unidad sin pasajes produce el aviso «No está en tu material», sin pregunta.
- La cita muestra el nombre original del archivo y la página, aunque el documento tenga además un id interno.
- Supuesto, no pedido en los criterios: una unidad vacía, o una respuesta vacía, no busca y no llama al modelo, y no usa el aviso «No está en tu material». Ese aviso queda para una búsqueda que no devolvió pasajes.
- Supuesto, no pedido en los criterios: como esta historia no guarda la pregunta, corregir puede recibir el texto de la pregunta en el mismo pedido. Igual solo usa pasajes de esa unidad.

## Errores

- Si la búsqueda falla, no se llama al modelo, no se entrega una pregunta y no se entrega el aviso «No está en tu material».
- Si el modelo falla habiendo pasajes, no se entregan pregunta, veredicto ni citas, y el fallo no se reemplaza por el aviso de abstención.
- Un fallo no deja pregunta, respuesta ni veredicto guardados, porque esta historia no los persiste.

## Criterios de aceptación

- `AC-003-01`: Dado que cargué material en una unidad, cuando pido practicar esa unidad, entonces recibo una pregunta hecha solo con ese material.
- `AC-003-02`: Dado que respondí esa pregunta, cuando pido que la corrija, entonces veo si está bien o si fallé, con el archivo y la página de donde sale la corrección.
- `AC-003-03`: Dado un pasaje de otra persona, de otra materia o de otra unidad, cuando practico esta unidad, entonces la pregunta y la corrección no lo usan ni lo citan.
- `AC-003-04`: Dado que esa unidad no tiene material, cuando pido practicar, entonces me avisa «No está en tu material» y no recibo una pregunta.

## Trazabilidad

| Pieza | Ruta | Estado |
|---|---|---|
| Seguimiento | `odd/tasks/hu-003-practicar.md` | T1–T5 hechos; falta PR |
| Feature | `features/HU-003-practicar.feature` | Escrito. Cucumber en verde (`npm run test:bdd`) |
| Tests | `packages/core/src/qa/practice-question.test.ts`; `…/grade-practice-answer.test.ts` | Verde |
| Código | `GeneratePracticeQuestion`, `GradePracticeAnswer`, `AiSdkPracticeLlmProvider`, `PgVectorChunkStore.search` con `unidad`, `POST /practice/generate`, `POST /practice/grade`, web `PracticeForm` + `/api/practice/*` | Cubre AC-003-01 a AC-003-04 |
| Issue | [#5](https://github.com/valentinoaraya/cursada/issues/5) | Abierta |
| PR | [#16](https://github.com/valentinoaraya/cursada/pull/16) | Abierto |
