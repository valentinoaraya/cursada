import { randomUUID } from "node:crypto";
import {
  AiSdkEmbeddingProvider,
  AiSdkLlmProvider,
  AiSdkPracticeLlmProvider,
  createOllamaEmbeddingClient,
} from "@cursada/adapter-llm";
import { LocalDocumentParser } from "@cursada/adapter-parser";
import { PgVectorChunkStore } from "@cursada/adapter-pgvector";
import { AskQuestion, GeneratePracticeQuestion, GradePracticeAnswer, IngestDocument } from "@cursada/core";

export type ApiUseCases = {
  ingest: IngestDocument;
  ask: AskQuestion;
  generatePracticeQuestion: GeneratePracticeQuestion;
  gradePracticeAnswer: GradePracticeAnswer;
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
  const practiceLlm = new AiSdkPracticeLlmProvider();
  const generatePracticeQuestion = new GeneratePracticeQuestion(embeddings, store, practiceLlm);
  const gradePracticeAnswer = new GradePracticeAnswer(embeddings, store, practiceLlm);
  return {
    ingest,
    ask,
    generatePracticeQuestion,
    gradePracticeAnswer,
    close: () => store.close(),
  };
}

/** @deprecated Usar createApiUseCases */
export async function createIngestDocument(databaseUrl: string): Promise<IngestDocument> {
  const api = await createApiUseCases(databaseUrl);
  return api.ingest;
}
