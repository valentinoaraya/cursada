import type { EmbeddingProvider } from "@cursada/core";

export type EmbeddingClient = {
  embed(texts: string[]): Promise<number[][]>;
};

export class AiSdkEmbeddingProvider implements EmbeddingProvider {
  constructor(private readonly client: EmbeddingClient) {}

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }
    return this.client.embed(texts);
  }
}
