---
name: backlog
description: >-
  Parte una idea o una funcionalidad ya conversada en historias de usuario
  verticales, de una línea, en español. No escribe criterios ni código: eso
  es /story. Usar solo cuando se nombra /backlog.
disable-model-invocation: true
---

# Backlog

Ayudás a partir en historias lo que te cuenten. Los requisitos los trae quien habla. Vos ordenás y cortás.

## Conversación

1. Escuchá la idea. Si algo no está claro, preguntá. Una pregunta por vez, con la respuesta que sugerís.
2. Leé `docs/adr/` antes de hablar de stack o de alcance. Si la decisión ya está aceptada, no la reabras: citá el ADR. El stack se conversa solo si el proyecto todavía no tiene ADR.
3. Preguntá si aplica alguna decisión cara de cambiar que **no** esté ya cerrada en un ADR. Solo preguntá, no la diseñes:
   - Multi-tenant o multi-organización
   - Permisos o roles
   - Offline o sincronización
   - Varios idiomas o varias monedas
4. Mirá `docs/sdd/`, `odd/tasks/` y `docs/traceability.md`. No repitas una historia que ya existe.
5. Proponé el backlog. Quien habla lo ajusta.

## Reglas

- **No inventes requisitos.** Partí solo lo que te dijeron. Si ves un hueco, preguntá.
- **Cada historia entrega valor sola** y atraviesa todas las capas (datos, backend, UI). Nunca cortes por capa.
- **Sin historias técnicas.** El actor no es el desarrollador ni el sistema. «Levantar la base» o «crear el modelo» no son historias. Esa infraestructura se construye dentro de la primera historia que la necesita, como `TASK-XXX`, no como `HU-XXX`.
- **Pocas historias.** 10–15 como máximo. Preferible agregar después que recortar ahora.
- **Una línea por historia.** Sin criterios de aceptación, sin detalle técnico, sin estimaciones ni prioridades.
- La primera historia nueva es la más chica que se puede usar de punta a punta. Si ya hay un esqueleto en el repo, no lo vuelvas a proponer.

## Formato

```markdown
## Contexto
<una o dos líneas: qué es y para quién>
Stack: <ADR que ya lo cierra, o lo recién acordado>
Decisiones caras: <las que aplican y no estaban en un ADR, o «ninguna nueva»>

## Backlog
1. Como <actor>, quiero <acción>, para <beneficio>.
2. Como <actor>, quiero <acción>, para <beneficio>. Requiere: #1
```

`Requiere: #N` solo cuando la historia no tiene sentido sin la otra.

Las historias van al tracker cuando te lo pidan. No crees issues ni archivos hasta ese pedido. Al crearlas, agregalas al proyecto de GitHub **Cursada Scrumban** de `valentinoaraya` (`gh project item-add 5 --owner valentinoaraya --url <url>`). Si aparece una decisión nueva de proyecto, proponé un ADR nuevo. No edites un ADR aceptado ni reescribas `AGENTS.md`.
