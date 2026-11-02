import { createOpenAI, openai } from "@ai-sdk/openai";
import { embedMany, type EmbeddingModel } from "ai";
import type { EmbeddingClient } from "./embedding-provider.js";

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1";

export type OpenAiEmbeddingClient = EmbeddingClient & {
  readonly model: EmbeddingModel;
};

export function createOpenAiEmbeddingClient(
  model: EmbeddingModel = openai.embedding("text-embedding-3-small"),
): OpenAiEmbeddingClient {
  return {
    model,
    async embed(texts) {
      const { embeddings } = await embedMany({ model, values: texts });
      return embeddings;
    },
  };
}

export function createOllamaEmbeddingClient(
  model: EmbeddingModel = createOpenAI({
    baseURL: ollamaBaseUrl,
    apiKey: "ollama",
  }).embedding("nomic-embed-text"),
): OpenAiEmbeddingClient {
  return createOpenAiEmbeddingClient(model);
}
