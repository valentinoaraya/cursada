import { randomUUID } from "node:crypto";
import {
  AiSdkEmbeddingProvider,
  AiSdkLlmProvider,
  createOllamaEmbeddingClient,
} from "@cursada/adapter-llm";
import { LocalDocumentParser } from "@cursada/adapter-parser";
import { PgVectorChunkStore } from "@cursada/adapter-pgvector";
import { AskQuestion, IngestDocument } from "@cursada/core";

export type ApiUseCases = {
  ingest: IngestDocument;
  ask: AskQuestion;
  close: () => Promise<void>;
};

export async function createApiUseCases(databaseUrl: string): Promise<ApiUseCases> {
  if (databaseUrl.trim() === "") {
    throw new Error("Falta DATABASE_URL");
  }
  const store = await PgVectorChunkStore.connect(databaseUrl);
  const embeddings = new AiSdkEmbeddingProvider(createOllamaEmbeddingClient());
  const ingest = new IngestDocument(
    new LocalDocumentParser(),
    embeddings,
    store,
    { now: () => new Date() },
    { next: () => randomUUID() },
  );
  const ask = new AskQuestion(embeddings, store, new AiSdkLlmProvider());
  return {
    ingest,
    ask,
    close: () => store.close(),
  };
}

/** @deprecated Usar createApiUseCases */
export async function createIngestDocument(databaseUrl: string): Promise<IngestDocument> {
  const api = await createApiUseCases(databaseUrl);
  return api.ingest;
}
