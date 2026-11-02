import { randomUUID } from "node:crypto";
import { createOpenAiEmbeddingClient, AiSdkEmbeddingProvider } from "@cursada/adapter-llm";
import { LocalDocumentParser } from "@cursada/adapter-parser";
import { PgVectorChunkStore } from "@cursada/adapter-pgvector";
import { IngestDocument } from "@cursada/core";

export async function createIngestDocument(databaseUrl: string): Promise<IngestDocument> {
  if (databaseUrl.trim() === "") {
    throw new Error("Falta DATABASE_URL");
  }
  const chunks = await PgVectorChunkStore.connect(databaseUrl);
  return new IngestDocument(
    new LocalDocumentParser(),
    new AiSdkEmbeddingProvider(createOpenAiEmbeddingClient()),
    chunks,
    { now: () => new Date() },
    { next: () => randomUUID() },
  );
}
