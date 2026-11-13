import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";
import { PgVectorChunkStore } from "./chunk-store.js";

const integration = process.env.CURSADA_INTEGRATION === "1";

const embedding768 = Array.from({ length: 768 }, (_, index) =>
  index === 0 ? 0.1 : index === 1 ? 0.2 : index === 2 ? 0.3 : 0,
);

describe.skipIf(!integration)("PgVectorChunkStore", () => {
  let container: StartedPostgreSqlContainer;
  let store: PgVectorChunkStore;
  let connectionUri: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("pgvector/pgvector:pg17")
      .withDatabase("cursada")
      .withUsername("cursada")
      .withPassword("cursada")
      .start();
    connectionUri = container.getConnectionUri();
    store = await PgVectorChunkStore.connect(connectionUri);
  }, 120_000);

  afterAll(async () => {
    await store.close();
    await container.stop();
  });

  it("guardar y encontrar por hash devuelve el mismo documentId", async () => {
    await store.save(
      {
        documentId: "doc-1",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        hash: "abc",
        filename: "apuntes.pdf",
      },
      [],
    );

    const found = await store.findByHash("user-1", "analisis-de-sistemas", "abc");

    expect(found).toEqual({ documentId: "doc-1" });
  });

  it("el mismo hash de otro usuario no aparece", async () => {
    await store.save(
      {
        documentId: "doc-otro-usuario",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        hash: "hash-compartido",
        filename: "apuntes.pdf",
      },
      [],
    );

    const found = await store.findByHash("user-2", "analisis-de-sistemas", "hash-compartido");

    expect(found).toBeNull();
  });

  it("el mismo hash en otra materia no aparece", async () => {
    await store.save(
      {
        documentId: "doc-otra-materia",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        hash: "hash-materia",
        filename: "apuntes.pdf",
      },
      [],
    );

    const found = await store.findByHash("user-1", "ingenieria-de-software", "hash-materia");

    expect(found).toBeNull();
  });

  it("un documento sin chunks igual deja el hash encontrable", async () => {
    await store.save(
      {
        documentId: "doc-sin-texto",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        hash: "hash-vacio",
        filename: "apuntes.pdf",
      },
      [],
    );

    const found = await store.findByHash("user-1", "analisis-de-sistemas", "hash-vacio");

    expect(found).toEqual({ documentId: "doc-sin-texto" });
  });

  it("el chunk guardado conserva materia, unidad, página, texto y embedding", async () => {
    await store.save(
      {
        documentId: "doc-chunk",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        hash: "hash-chunk",
        filename: "apuntes.pdf",
      },
      [
        {
          id: "chunk-1",
          documentId: "doc-chunk",
          userId: "user-1",
          materia: "analisis-de-sistemas",
          unidad: "1",
          pagina: 2,
          hash: "hash-chunk",
          text: "El sistema es un conjunto de elementos.",
          embedding: embedding768,
        },
      ],
    );

    const client = postgres(connectionUri);
    try {
      const rows = await client<{
        materia: string;
        unidad: string;
        pagina: number;
        text: string;
        embedding: string;
      }[]>`
        select materia, unidad, pagina, text, embedding::text as embedding
        from chunks
        where document_id = ${"doc-chunk"}
      `;

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        materia: "analisis-de-sistemas",
        unidad: "1",
        pagina: 2,
        text: "El sistema es un conjunto de elementos.",
      });
      expect(JSON.parse(rows[0]!.embedding)).toEqual(embedding768);
    } finally {
      await client.end();
    }
  });

  it("recrea la tabla si el vector no es de 768", async () => {
    const setup = postgres(connectionUri);
    try {
      await setup`DROP TABLE chunks`;
      await setup`
        CREATE TABLE chunks (
          id text PRIMARY KEY,
          document_id text NOT NULL REFERENCES documents(document_id),
          user_id text NOT NULL,
          materia text NOT NULL,
          unidad text NOT NULL,
          pagina integer NOT NULL,
          hash text NOT NULL,
          text text NOT NULL,
          embedding vector(3) NOT NULL
        )
      `;
    } finally {
      await setup.end();
    }

    const again = await PgVectorChunkStore.connect(connectionUri);
    try {
      await again.save(
        {
          documentId: "doc-768",
          userId: "user-1",
          materia: "analisis-de-sistemas",
          hash: "hash-768",
          filename: "apuntes.pdf",
        },
        [
          {
            id: "chunk-768",
            documentId: "doc-768",
            userId: "user-1",
            materia: "analisis-de-sistemas",
            unidad: "1",
            pagina: 1,
            hash: "hash-768",
            text: "vector local",
            embedding: embedding768,
          },
        ],
      );
      const reader = postgres(connectionUri);
      try {
        const rows = await reader<{ col_type: string }[]>`
          SELECT format_type(a.atttypid, a.atttypmod) AS col_type
          FROM pg_attribute a
          JOIN pg_class c ON c.oid = a.attrelid
          WHERE c.relname = 'chunks' AND a.attname = 'embedding' AND a.attnum > 0
        `;
        expect(rows[0]?.col_type).toBe("vector(768)");
      } finally {
        await reader.end();
      }
    } finally {
      await again.close();
    }
  });

  it("lista solo las falladas de ese usuario y esa materia", async () => {
    await store.failedPractice.save({
      userId: "user-1",
      materia: "analisis-de-sistemas",
      unidad: "1",
      question: "¿Qué es un sistema?",
    });
    await store.failedPractice.save({
      userId: "user-1",
      materia: "analisis-de-sistemas",
      unidad: "2",
      question: "¿Qué es un sistema?",
    });
    await store.failedPractice.save({
      userId: "user-2",
      materia: "analisis-de-sistemas",
      unidad: "1",
      question: "Pregunta ajena",
    });
    await store.failedPractice.save({
      userId: "user-1",
      materia: "ingenieria-de-software",
      unidad: "1",
      question: "¿Qué es un requisito?",
    });

    const questions = await store.failedPractice.list({
      userId: "user-1",
      materia: "analisis-de-sistemas",
    });

    expect(questions).toEqual([
      { question: "¿Qué es un sistema?", unidad: "1" },
      { question: "¿Qué es un sistema?", unidad: "2" },
    ]);
  });
});
