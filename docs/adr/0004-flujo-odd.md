# ADR-0004 — Flujo ODD

- Estado: aceptado
- Fecha: 2026-11-02

## Contexto

El repositorio arrancó con spec obligatoria para cada historia: `docs/sdd/` antes de los tests, y commits separados en rojo, verde y refactor. ODD pasa a ser el orden de cada implementación. La spec sigue sirviendo cuando el cambio es demasiado grande para retomar solo con el pedido y el diff.

## Decisión

- Cada implementación nueva sigue ODD.
- Un cambio chico no crea spec ni archivo en `odd/tasks/`. El test rojo sigue antes del código cuando hay comportamiento observable.
- Un cambio grande, incluida una HU con varias reglas, tiene spec aceptada en `docs/sdd/` antes de los tests y seguimiento en `odd/tasks/<feature>.md` antes del primer cambio de código.
- El ciclo de código es test rojo, código verde y refactor con los tests verdes. El commit junta el test y el comportamiento de esa unidad.
- `docs/sdd/HU-001-ingesta.md` queda como está.

## Consecuencias

- `AGENTS.md`, `docs/guia-de-trabajo.md` y `.cursor/rules/flujo-odd.mdc` describen este orden.
- HU-002 en adelante recibe spec cuando se la clasifica grande, no antes.
- Una infraestructura `TASK-XXX` no lleva spec.
