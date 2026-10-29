import type { NewChunk, ParsedPage } from "./types.js";

export interface DocumentParser {
  parse(content: Uint8Array, filename: string): Promise<ParsedPage[]>;
}

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

export interface ChunkStore {
  findByHash(
    userId: string,
    materia: string,
    hash: string,
  ): Promise<{ documentId: string } | null>;
  save(chunks: NewChunk[]): Promise<void>;
}
