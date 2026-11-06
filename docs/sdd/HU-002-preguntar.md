# HU-002 — Preguntar al material y citar o abstenerse

## Objetivo

El estudiante pregunta con sus palabras sobre una materia y ve la respuesta mientras se escribe, con el archivo y la página, o recibe el aviso «No está en tu material» cuando esa materia no contiene la respuesta.

## Entradas

`AskQuestion.execute` recibe:

| Campo | Tipo | Origen |
|---|---|---|
| `userId` | string | Identidad de quien pregunta. En el MVP puede ser un id fijo, como en la carga |
| `materia` | string | Materia sobre la que pregunta |
| `question` | string | La pregunta, con sus palabras |

## Salidas

Si la búsqueda devuelve pasajes de esa persona y esa materia:

| Campo | Tipo | Significado |
|---|---|---|
| `answer` | texto, entregado mientras se escribe | La respuesta generada solo con esos pasajes |
| `citations` | lista | Cada cita muestra el nombre del archivo y la página de un pasaje recuperado |

Si la búsqueda no devuelve ningún pasaje:

| Campo | Tipo | Significado |
|---|---|---|
| `notice` | string | El texto exacto «No está en tu material» |
| `answer` | ausente | No hay respuesta generada |
| `citations` | vacía | No se muestra ninguna cita |

## Reglas de negocio

1. La búsqueda usa solo el material de ese `userId` y esa `materia`.
2. Un pasaje de otra persona, o de la misma persona en otra materia, no se cita y no entra en la respuesta.
3. Si la búsqueda no devuelve ningún pasaje, el caso de uso responde «No está en tu material», no llama al modelo y no entrega citas.
4. Si la búsqueda devuelve pasajes, la respuesta se genera solo con esos pasajes y se entrega mientras se escribe.
5. Cada cita visible es el nombre del archivo y la página de un pasaje recuperado para esa pregunta. Una cita que no corresponda a uno de esos pasajes no se muestra.
6. El nombre que se cita es el nombre con el que se cargó el documento, no un id interno.

## Restricciones

- El caso de uso vive en `packages/core`. Habla con el puerto de almacenamiento y con el puerto del modelo. No llama al modelo cuando se abstiene.
- El filtro por `userId` y `materia` viaja en el puerto de almacenamiento. No es un recorte posterior.
- La búsqueda de ese puerto combina texto y similitud.
- Para citar el archivo, el nombre con el que se cargó tiene que estar disponible al preguntar. La carga actual no lo guarda.
- Esta historia no elige un umbral numérico. Abstenerse, con estos criterios, es no haber recuperado ningún pasaje. Afinar ese corte queda para el golden set.
- No se guarda la pregunta ni la respuesta.
- Quedan afuera el reranking, el login, la práctica, el repaso, la observabilidad y el deploy.

## Casos límite

- Un pasaje de otra persona, aunque el texto coincida con la pregunta, no se cita ni se usa.
- Un pasaje de la misma persona en otra materia no se cita ni se usa.
- Una materia sin pasajes recuperados produce el aviso «No está en tu material», sin respuesta generada.
- La cita muestra el nombre original del archivo y la página, aunque el documento tenga además un id interno.
- Supuesto, no pedido en los criterios: una pregunta vacía no busca y no llama al modelo, y no usa el aviso «No está en tu material». Ese aviso queda para una búsqueda que no devolvió pasajes.

## Errores

- Si la búsqueda falla, no se llama al modelo y no se entrega el aviso «No está en tu material».
- Si el modelo falla habiendo pasajes, no se entregan citas y el fallo no se reemplaza por el aviso de abstención.
- Un fallo no deja pregunta ni respuesta guardadas, porque esta historia no las persiste.

## Criterios de aceptación

- `AC-002-01`: Dado que mi material de esa materia contiene la respuesta, cuando pregunto con mis palabras, entonces veo la respuesta mientras se escribe, con el archivo y la página de donde sale.
- `AC-002-02`: Dado que mi material de esa materia no contiene la respuesta, cuando pregunto, entonces me avisa «No está en tu material» y no me da una respuesta generada.
- `AC-002-03`: Dado un pasaje de otra persona, o mío de otra materia, cuando pregunto sobre esta materia, entonces la respuesta no lo cita ni lo usa.

## Trazabilidad

| Pieza | Ruta | Estado |
|---|---|---|
| Seguimiento | `odd/tasks/hu-002-preguntar.md` | T1–T3 en verde (dominio, adapters, API, BDD) |
| Feature | `features/HU-002-preguntar.feature` | Escrito. Cucumber en verde (`npm run test:bdd`) |
| Tests | `packages/core/src/qa/ask-question.test.ts` | Verde. Cubre `AC-002-01` a `AC-002-03` con fakes |
| Código | `packages/core/src/qa/ask-question.ts`; pgvector `search`+`filename`; llm streaming; `POST /questions`; `apps/web` AskForm + `ask-client` | Cubre `AC-002-01` a `AC-002-03` |
| Issue | [#4](https://github.com/valentinoaraya/cursada/issues/4) | Abierta |
| PR | [#15](https://github.com/valentinoaraya/cursada/pull/15) | Abierto |
