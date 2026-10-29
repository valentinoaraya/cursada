# Cursada

Study copilot that answers only from the user's materials and always cites the file and page. If the material does not contain the answer, it says so.

Copiloto de estudio para las materias de Ingeniería en Sistemas (UTN FRSR). Este repositorio está en el Sprint 0: hay estructura, decisiones y el primer test en rojo. Todavía no indexa documentos ni responde preguntas.

## Desarrollo

Hace falta Node 24, npm y Docker.

```bash
npm install
docker compose up -d
npm run dev:api
npm run dev:web
```

- API: `http://localhost:3001/health`
- Web: `http://localhost:3000`

`npm test` corre los tests de dominio. El de ingesta está en rojo a propósito: `IngestDocument` todavía no cumple `AC-001-01`. Los tests contra Postgres se saltean salvo que exista `CURSADA_INTEGRATION=1`.

## Documentación

- [CURSADA.md](CURSADA.md) — contexto del producto
- [docs/adr](docs/adr/README.md) — decisiones
- [docs/sdd/HU-001-ingesta.md](docs/sdd/HU-001-ingesta.md) — primera historia
- [docs/guia-de-trabajo.md](docs/guia-de-trabajo.md) — SDD y TDD
- [AGENTS.md](AGENTS.md) — reglas para quien escribe código

El README en inglés con resultados de evaluaciones es un entregable del Sprint 5.
