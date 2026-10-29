import { describe, expect, it } from "vitest";
import { IngestDocument } from "./ingest-document.js";
import type { ChunkStore, DocumentParser, EmbeddingProvider } from "./ports.js";
import type { IngestDocumentInput, NewChunk, ParsedPage } from "./types.js";
import type { Clock, IdGenerator } from "../shared/ports.js";

const input: IngestDocumentInput = {
  userId: "user-1",
  materia: "analisis-de-sistemas",
  unidad: "1",
  filename: "apuntes.pdf",
  content: new Uint8Array([1, 2, 3, 4]),
};

class FakeParser implements DocumentParser {
  calls = 0;

  constructor(private readonly pages: ParsedPage[]) {}

  async parse(): Promise<ParsedPage[]> {
    this.calls += 1;
    return this.pages;
  }
}

class FakeEmbeddings implements EmbeddingProvider {
  calls = 0;

  async embed(texts: string[]): Promise<number[][]> {
    this.calls += 1;
    return texts.map(() => [0.1, 0.2, 0.3]);
  }
}

class FakeChunkStore implements ChunkStore {
  savedBatches: NewChunk[][] = [];

  async findByHash(userId: string, materia: string, hash: string) {
    for (const batch of this.savedBatches) {
      const found = batch.find(
        (chunk) => chunk.userId === userId && chunk.materia === materia && chunk.hash === hash,
      );
      if (found) {
        return { documentId: found.documentId };
      }
    }
    return null;
  }

  async save(chunks: NewChunk[]): Promise<void> {
    this.savedBatches.push(chunks);
  }
}

class FixedClock implements Clock {
  now(): Date {
    return new Date("2026-01-01T00:00:00.000Z");
  }
}

class SequenceIds implements IdGenerator {
  private current = 0;

  next(): string {
    this.current += 1;
    return `id-${this.current}`;
  }
}

describe("IngestDocument", () => {
  it("no re-indexa un documento cuyo hash ya existe para ese usuario y materia", async () => {
    const parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
    const embeddings = new FakeEmbeddings();
    const chunks = new FakeChunkStore();
    const ingest = new IngestDocument(parser, embeddings, chunks, new FixedClock(), new SequenceIds());

    const first = await ingest.execute(input);
    const second = await ingest.execute(input);

    expect(second.alreadyIndexed).toBe(true);
    expect(second.documentId).toBe(first.documentId);
    expect(parser.calls).toBe(1);
    expect(embeddings.calls).toBe(1);
    expect(chunks.savedBatches).toHaveLength(1);
  });
});
