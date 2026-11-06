import type { ChunkStore, MaterialSearchInput, NewChunk, RetrievedPassage } from "@cursada/core";
import { and, eq, sql } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { customType, integer, pgTable, text, unique, vector } from "drizzle-orm/pg-core";
import postgres, { type Sql } from "postgres";

const embeddingDimensions = 768;

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const documents = pgTable(
  "documents",
  {
    documentId: text("document_id").primaryKey(),
    userId: text("user_id").notNull(),
    materia: text("materia").notNull(),
    hash: text("hash").notNull(),
    filename: text("filename").notNull(),
  },
  (table) => [unique("documents_user_materia_hash").on(table.userId, table.materia, table.hash)],
);

export const chunks = pgTable("chunks", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.documentId),
  userId: text("user_id").notNull(),
  materia: text("materia").notNull(),
  unidad: text("unidad").notNull(),
  pagina: integer("pagina").notNull(),
  hash: text("hash").notNull(),
  text: text("text").notNull(),
  embedding: vector("embedding", { dimensions: embeddingDimensions }).notNull(),
  searchTsv: tsvector("search_tsv"),
});

export class PgVectorChunkStore implements ChunkStore {
  private constructor(
    private readonly db: PostgresJsDatabase,
    private readonly client: Sql,
  ) {}

  static async connect(connectionString: string): Promise<PgVectorChunkStore> {
    const client = postgres(connectionString);
    const db = drizzle(client);
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS documents (
        document_id text PRIMARY KEY,
        user_id text NOT NULL,
        materia text NOT NULL,
        hash text NOT NULL,
        filename text NOT NULL DEFAULT 'documento.pdf',
        CONSTRAINT documents_user_materia_hash UNIQUE (user_id, materia, hash)
      )
    `);
    await db.execute(sql`
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS filename text NOT NULL DEFAULT 'documento.pdf'
    `);
    const columns = await client<{ col_type: string }[]>`
      SELECT format_type(a.atttypid, a.atttypmod) AS col_type
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      WHERE c.relname = 'chunks'
        AND a.attname = 'embedding'
        AND a.attnum > 0
        AND NOT a.attisdropped
    `;
    if (columns[0] && columns[0].col_type !== `vector(${embeddingDimensions})`) {
      await client`DROP TABLE chunks`;
    }
    await db.execute(
      sql.raw(`
      CREATE TABLE IF NOT EXISTS chunks (
        id text PRIMARY KEY,
        document_id text NOT NULL REFERENCES documents(document_id),
        user_id text NOT NULL,
        materia text NOT NULL,
        unidad text NOT NULL,
        pagina integer NOT NULL,
        hash text NOT NULL,
        text text NOT NULL,
        embedding vector(${embeddingDimensions}) NOT NULL,
        search_tsv tsvector
      )
    `),
    );
    await db.execute(sql`ALTER TABLE chunks ADD COLUMN IF NOT EXISTS search_tsv tsvector`);
    return new PgVectorChunkStore(db, client);
  }

  async findByHash(userId: string, materia: string, hash: string) {
    const rows = await this.db
      .select({ documentId: documents.documentId })
      .from(documents)
      .where(
        and(eq(documents.userId, userId), eq(documents.materia, materia), eq(documents.hash, hash)),
      )
      .limit(1);
    const row = rows[0];
    return row ? { documentId: row.documentId } : null;
  }

  async search(input: MaterialSearchInput): Promise<RetrievedPassage[]> {
    if (input.questionEmbedding.length !== embeddingDimensions) {
      return [];
    }

    const embeddingVector = `[${input.questionEmbedding.join(",")}]`;
    const unidad = input.unidad?.trim();
    // When `unidad` is omitted (e.g. AskQuestion), omit the clause. Using `($3 IS NULL OR ...)`
    // with a bound NULL makes Postgres error: "could not determine data type of parameter".
    const unidadClause = unidad ? this.client`AND c.unidad = ${unidad}` : this.client``;
    const rows = await this.client<
      {
        id: string;
        filename: string;
        pagina: number;
        text: string;
      }[]
    >`
      SELECT
        c.id,
        d.filename,
        c.pagina,
        c.text
      FROM chunks c
      INNER JOIN documents d ON d.document_id = c.document_id
      WHERE c.user_id = ${input.userId}
        AND c.materia = ${input.materia}
        ${unidadClause}
      ORDER BY (
        COALESCE(ts_rank(c.search_tsv, plainto_tsquery('spanish', ${input.question})), 0)
        + (1 - (c.embedding <=> ${embeddingVector}::vector))
      ) DESC
      LIMIT 8
    `;

    return rows.map((row) => ({
      chunkId: row.id,
      filename: row.filename,
      pagina: row.pagina,
      text: row.text,
    }));
  }

  async save(
    document: {
      documentId: string;
      userId: string;
      materia: string;
      hash: string;
      filename: string;
    },
    newChunks: NewChunk[],
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(documents).values(document);
      if (newChunks.length === 0) {
        return;
      }
      await tx.insert(chunks).values(
        newChunks.map((chunk) => ({
          id: chunk.id,
          documentId: chunk.documentId,
          userId: chunk.userId,
          materia: chunk.materia,
          unidad: chunk.unidad,
          pagina: chunk.pagina,
          hash: chunk.hash,
          text: chunk.text,
          embedding: chunk.embedding,
        })),
      );
      for (const chunk of newChunks) {
        await tx.execute(
          sql`UPDATE chunks SET search_tsv = to_tsvector('spanish', ${chunk.text}) WHERE id = ${chunk.id}`,
        );
      }
    });
  }

  async close(): Promise<void> {
    await this.client.end();
  }
}
