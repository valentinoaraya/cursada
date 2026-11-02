---
name: story
description: >-
  Toma UNA historia, propone 2 o 3 criterios de aceptación y un plan corto, y
  espera aprobación. Con el sí, escribe la spec en docs/sdd. No escribe código:
  eso es /pair. Usar solo cuando se nombra /story.
disable-model-invocation: true
---

# Story

Se afina una sola historia, justo antes de construirla. Vos proponés. Quien habla decide.

## Pasos

1. **Leé la historia** que te pasen (texto, issue de GitHub, ticket) y el código actual, `AGENTS.md`, `docs/adr/` y `docs/sdd/`. Si ya hay spec para esa historia, partí de esa spec. No la cambies en silencio.
2. **Criterios.** Proponé 2 o 3 en Given/When/Then. Describen qué ve o qué obtiene la persona, nunca cómo está implementado. Numeralos `AC-XXX-NN`, con el número de la HU. Si la HU todavía no tiene número, usá el siguiente libre en `docs/sdd/` y `docs/traceability.md`.
3. **Si hacen falta más de 3 criterios, no la infles: proponé partirla.** Las historias nuevas salen en formato de backlog (`Como…, quiero…, para…`) para agregar al tracker. Se sigue con la primera.
4. **Plan mínimo.** 5 viñetas como máximo. Sin código y sin nombres de archivo. Cómo atraviesa las capas, con lo mínimo que cumple los criterios. En este repo las reglas viven en `packages/core`; HTTP y React no son el lugar de una regla.
5. **Esperá el sí.** Se ajusta hasta que digan que sí. Recién ahí escribí `docs/sdd/HU-XXX-….md` con `docs/sdd/_plantilla.md` y una fila en `docs/traceability.md` (issue y PR en blanco si no existen). No abras el issue de GitHub salvo que te lo pidan. Si la abrís, agregala al proyecto **Cursada Scrumban** (`gh project item-add 5 --owner valentinoaraya --url <url>`). No escribas tests ni código.

## Reglas

- **No inventes requisitos.** Si falta un dato, preguntá.
- **Lo más simple que cumple los criterios.** Sin abstracciones, capas, configuración ni patrones «para más adelante».
- **Sugerí, no decidas.** Si un patrón ayudaría, va bajo «Sugerencias», con el porqué. Solo si ya hay una señal concreta en el código (algo que ya se repite), no por adelantado.
- **No escribas código.**

## Formato

Un bloque listo para pegar en el issue. `/pair` lo usa como entrada.

```markdown
## Historia
Como <actor>, quiero <acción>, para <beneficio>.

## Criterios de aceptación
- [ ] AC-XXX-01: Dado <contexto>, cuando <acción>, entonces <resultado>.
- [ ] AC-XXX-02: ...

## Plan
- ...

## Fuera de alcance
- <qué queda afuera de esta historia, para que no se cuele>

## Sugerencias (lo decidís vos)
- <opcional>
```
