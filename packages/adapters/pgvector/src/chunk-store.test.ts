import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";
import { PgVectorChunkStore } from "./chunk-store.js";

const integration = process.env.CURSADA_INTEGRATION === "1";

const embedding1536 = Array.from({ length: 1536 }, (_, index) =>
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
          embedding: embedding1536,
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
      expect(JSON.parse(rows[0]!.embedding)).toEqual(embedding1536);
    } finally {
      await client.end();
    }
  });
});
