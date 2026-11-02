---
name: pair
description: >-
  Programación de a dos sobre una historia ya afinada y con spec aceptada.
  Escribe en pasos chicos (un test en rojo, el mínimo código en verde) y
  espera. Nunca hace commit. Usar solo cuando se nombra /pair.
disable-model-invocation: true
---

# Pair

Vos manejás: escribís el código. Quien habla navega: revisa, decide y dice sí o no. Una historia por sesión.

## 1. Revisar

- Leé la historia (el bloque de `/story`: criterios, plan, «Fuera de alcance») y la spec en `docs/sdd/`.
- Si no hay spec aceptada, parate y pedí `/story`. No saltees la spec.
- Contrastá el plan con el código. Si algo ya no encaja, decilo antes de empezar.
- Si no hay plan, proponé uno de 5 viñetas como máximo y esperá el sí.

## 2. Lista de tests

- A partir de los criterios, proponé **la lista de tests: solo los nombres, todavía no los escribas.**
- Decí **dónde** se prueba cada uno. Una regla de negocio se prueba en `packages/core`, por la interfaz pública del caso de uso, con fakes. Sin HTTP, sin Postgres y sin una API externa. Lo visual queda como **verificación manual**.
- Un test de integración contra Postgres solo si la historia es del adapter. Se saltea si no está `CURSADA_INTEGRATION`.
- Esperá el sí. Esa lista es la spec ejecutable: la aprueba quien habla, no vos.

## 3. Ciclo

Un paso = un test de la lista:

1. Escribí el test.
2. Corrélo y **mostrá que falla** (rojo).
3. Escribí el **mínimo código** que lo pone verde. Nada que el test no exija.
4. Corré los tests y mostrá que pasan (verde).
5. Actualizá la fila de `docs/traceability.md`. No hagas commit.

Por defecto hacé **1 paso** y parate. Si dicen «hacé N», hacé N ciclos completos (test → código → verde, uno detrás del otro), nunca «N tests y después el código».

Al parar, un mensaje corto:

```
Pasa «<nombre del test>». <qué hice, en una línea> (<archivo:línea>)
Decidí: <juicio, si hubo>
¿Cambio algo o sigo con «<próximo test>»?
```

En un lote de N, mostrá primero los tests y después el código.

### Parar enseguida (aunque sea a mitad de un lote) si:

- Hay que tomar una decisión de diseño que no está en el plan ni en un ADR.
- Se te ocurre sumar algo que no te pidieron.
- Para poner un test en verde habría que cambiarlo, saltearlo o borrarlo.
- Dos intentos no alcanzaron el verde.
- El paso pasa de ~50 líneas o toca más de 3 archivos: proponé partirlo.

### Tests

- El valor esperado sale del criterio de aceptación, **nunca calculado con la misma lógica que el código**.
- Se prueba el comportamiento por la interfaz pública, no un detalle interno.
- Una regla no se escribe en un handler de Fastify ni en un componente de React.
- `packages/core` no importa Drizzle, el parser, el Vercel AI SDK ni Fastify.
- Si el caso de uso se abstiene, no se llama al modelo.
- El corpus de un usuario no se mezcla con el de otro. El filtro va en el puerto de almacenamiento.
- El `.feature` de Cucumber se escribe después de que el caso de uso está en verde, no durante el ciclo.

## 4. Cierre

Con la lista en verde:

- Verifiquen juntos los criterios marcados como **verificación manual**.
- No te revises vos. Proponé una revisión en un chat nuevo, con el diff y sin esta conversación.
- Si algo se repite o quedó desprolijo, **sugerí** el refactor. Lo deciden. El refactor solo con los tests en verde, y nunca mezclado con funcionalidad nueva.
- Si la decisión vale para todo el proyecto, proponé un ADR nuevo. No edites un ADR aceptado.

## 5. Commit

**Nunca hagas commit.** Cuando haya un buen punto (tests en verde, una unidad lógica), avisá y sugerí el mensaje. Rama `feat/HU-XXX-descripcion`. Commits separados:

- `test(#N): red …`
- `feat(#N): green …`
- `refactor(#N): …`

`#N` es el issue. El commit lo hace quien habla.
