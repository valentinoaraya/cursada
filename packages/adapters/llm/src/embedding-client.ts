import { openai } from "@ai-sdk/openai";
import { embedMany, type EmbeddingModel } from "ai";
import type { EmbeddingClient } from "./embedding-provider.js";

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
