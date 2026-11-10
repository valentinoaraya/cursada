# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primario: Valentino Araya, estudiante de 4º año de Ingeniería en Sistemas de Información (UTN FRSR). Lo usa tanto a diario durante la cursada (consultar apuntes y PDFs de cátedra) como en modo intensivo antes de parciales y finales (encontrar rápido "dónde dice X" y practicar).

Secundario (post-MVP): compañeros de la UTN, cada uno con sus materias o compartiendo una materia, con corpus privado por usuario.

El trabajo del usuario: estudiar una materia a partir de su propio material disperso (PDFs, apuntes, Moodle, parciales viejos, reglamentos), sin perder tiempo buscando ni dudando de si la respuesta es fiel a la fuente.

## Product Purpose

Cursada es un copiloto de estudio que responde solo con el material que el usuario cargó y siempre cita la fuente (archivo + página). Si no hay evidencia suficiente, lo dice. Además genera preguntas de práctica fieles al material, corrige las respuestas del usuario contra la fuente y guarda las falladas para repasar.

Éxito: el autor lo usa todos los días para estudiar, y el proyecto sirve como portfolio de un producto RAG serio (citas, abstención, evals, aislamiento por usuario).

## Positioning

A diferencia de un chatbot genérico, Cursada nunca responde fuera del material del usuario: cada respuesta trae cita verificable (documento y página) y, cuando no hay evidencia, se abstiene con "No está en tu material" sin inventar y sin llamar al modelo.

## Operating Context

- Material de entrada: PDF y Markdown, asociados a una materia y a una unidad.
- Flujos del MVP: cargar documento, preguntar en lenguaje natural con respuesta en streaming y citas, generar preguntas de práctica por unidad, corregir la respuesta del usuario contra la fuente, repasar falladas.
- Se usa desde el navegador, en una estación de estudio o antes de rendir; la sesión puede ser larga.
- La web es solo presentación: las reglas de negocio viven en `packages/core` y la API (Fastify) tiene handlers finos.

## Capabilities and Constraints

- Plataforma: web (Next.js, React). Apps móviles nativas fuera de alcance.
- Cada usuario mantiene su corpus privado: un usuario nunca ve chunks de otro.
- Las citas mostradas deben corresponder a chunks efectivamente recuperados.
- Si ningún chunk supera el umbral, la UI muestra la abstención; no hay respuesta del modelo.
- Fuera de alcance por ahora: integración automática con Moodle, fine-tuning.
- Indefinido: modelo de cuentas/login para el uso multiusuario (S5).

## Brand Commitments

- Nombre: Cursada.
- Idioma de la interfaz: español rioplatense con voseo, directo y sin relleno. El README y el material de portfolio van en inglés.
- Mensaje de abstención ya acuñado: "No está en tu material".

## Evidence on Hand

- Contexto y alcance: `CURSADA.md` y `docs/adr/`.
- Specs de historias: `docs/sdd/HU-001-ingesta.md`, `HU-002-preguntar.md`, `HU-003-practicar.md`.
- No hay todavía resultados de evals, métricas de costo/latencia, demos públicas ni testimonios; no inventarlos. El golden set y los resultados llegan en el Sprint 3.

## Product Principles

1. La fuente es el producto: toda afirmación se muestra junto a su cita, y la cita debe poder verificarse.
2. Abstenerse es un resultado legítimo, no un error: "No está en tu material" se presenta con la misma claridad que una respuesta.
3. El material del usuario es suyo y privado; ninguna interfaz sugiere mezcla de corpus entre usuarios.
4. Estudiar es un trabajo repetido: la velocidad de encontrar "dónde dice X" pesa más que la novedad.
5. Practicar y repasar se apoyan en el mismo material: las preguntas y correcciones citan su fuente.
