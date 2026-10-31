# AGENTS.md

Reglas para quien escribe código en este repositorio, persona o agente.

## Orden

1. Leer la spec en `docs/sdd/` antes de tocar un caso de uso. Si no existe, se escribe con `docs/sdd/_plantilla.md` y se acepta antes de los tests.
2. Escribir el test en rojo. Recién después, el código que lo pone verde.
3. Una historia de usuario no se da por terminada con reglas dentro de `apps/api` o `apps/web`.
4. Actualizar `docs/traceability.md` cuando aparezca o cambie un AC, un test o un PR.
5. Al crear una issue en GitHub, agregarla al proyecto **Cursada Scrumban** de `valentinoaraya`. Crearla solo en el repo no la muestra en el tablero.

```bash
gh project item-add 5 --owner valentinoaraya --url <url-de-la-issue>
```

## Prohibiciones

- No poner reglas de negocio en handlers de Fastify ni en componentes de React.
- No saltear la spec.
- No escribir el código de una regla sin un test que haya fallado antes.
- No importar Drizzle, el parser, el Vercel AI SDK ni Fastify desde `packages/core`.
- No llamar al modelo si el caso de uso decidió abstenerse.
- No hacer que un usuario pueda leer chunks de otro. El filtro viaja en el puerto de almacenamiento.
- No commitear `.env` ni credenciales. El password de `docker-compose.yml` es solo para la base local.
- No usar pnpm. El monorepo es npm workspaces y cada paquete declara sus dependencias.

## Tests

Los tests de dominio usan fakes deterministas. Postgres entra solo en la suite de integración, con Testcontainers, y se saltea si falta `CURSADA_INTEGRATION`.

## Decisiones ya tomadas

Están en `docs/adr/`. Si una decisión cambia, se escribe otro ADR. No se reabre en un comentario.

## Skills manuales

En `.cursor/skills/` están `/backlog`, `/story` y `/pair`. Solo corren cuando se las nombra. No reemplazan este archivo: la spec sigue antes que el test, y el test rojo antes que el código.
