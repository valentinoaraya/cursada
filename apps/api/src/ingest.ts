import { randomUUID } from "node:crypto";
import {
  AiSdkEmbeddingProvider,
  AiSdkLlmProvider,
  AiSdkPracticeLlmProvider,
  createOllamaEmbeddingClient,
} from "@cursada/adapter-llm";
import { LocalDocumentParser } from "@cursada/adapter-parser";
import { PgVectorChunkStore } from "@cursada/adapter-pgvector";
import {
  AskQuestion,
  GeneratePracticeQuestion,
  GradePracticeAnswer,
  IngestDocument,
  ReviewFailedPractice,
} from "@cursada/core";

export type ApiUseCases = {
  ingest: IngestDocument;
  ask: AskQuestion;
  generatePracticeQuestion: GeneratePracticeQuestion;
  gradePracticeAnswer: GradePracticeAnswer;
  reviewFailedPractice: ReviewFailedPractice;
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
  const gradePracticeAnswer = new GradePracticeAnswer(embeddings, store, practiceLlm, store.failedPractice);
  const reviewFailedPractice = new ReviewFailedPractice(store.failedPractice);
  return {
    ingest,
    ask,
    generatePracticeQuestion,
    gradePracticeAnswer,
    reviewFailedPractice,
    close: () => store.close(),
  };
}

/** @deprecated Usar createApiUseCases */
export async function createIngestDocument(databaseUrl: string): Promise<IngestDocument> {
  const api = await createApiUseCases(databaseUrl);
  return api.ingest;
}
