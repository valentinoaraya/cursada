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

class FailingParser implements DocumentParser {
  async parse(): Promise<ParsedPage[]> {
    throw new Error("no se pudo leer el pdf");
  }
}

class FakeEmbeddings implements EmbeddingProvider {
  calls = 0;

  async embed(texts: string[]): Promise<number[][]> {
    this.calls += 1;
    return texts.map(() => [0.1, 0.2, 0.3]);
  }
}

class FailingEmbeddings implements EmbeddingProvider {
  async embed(): Promise<number[][]> {
    throw new Error("embeddings no disponibles");
  }
}

class FakeChunkStore implements ChunkStore {
  savedBatches: NewChunk[][] = [];
  private readonly documents: { documentId: string; userId: string; materia: string; hash: string }[] =
    [];

  async search() {
    return [];
  }

  async findByHash(userId: string, materia: string, hash: string) {
    const found = this.documents.find(
      (document) => document.userId === userId && document.materia === materia && document.hash === hash,
    );
    return found ? { documentId: found.documentId } : null;
  }

  async save(
    document: {
      documentId: string;
      userId: string;
      materia: string;
      hash: string;
      filename: string;
    },
    chunks: NewChunk[],
  ): Promise<void> {
    this.documents.push(document);
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

  it("no reindexa si cambia solo el nombre del archivo", async () => {
    const parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
    const embeddings = new FakeEmbeddings();
    const chunks = new FakeChunkStore();
    const ingest = new IngestDocument(parser, embeddings, chunks, new FixedClock(), new SequenceIds());

    const first = await ingest.execute(input);
    const second = await ingest.execute({ ...input, filename: "copia-de-apuntes.pdf" });

    expect(second.alreadyIndexed).toBe(true);
    expect(second.documentId).toBe(first.documentId);
    expect(parser.calls).toBe(1);
    expect(embeddings.calls).toBe(1);
    expect(chunks.savedBatches).toHaveLength(1);
  });

  it("cada chunk guardado lleva materia, unidad, documento y página", async () => {
    const parser = new FakeParser([{ pagina: 2, text: "Requerimientos." }]);
    const embeddings = new FakeEmbeddings();
    const chunks = new FakeChunkStore();
    const ingest = new IngestDocument(parser, embeddings, chunks, new FixedClock(), new SequenceIds());

    const result = await ingest.execute(input);
    const batch = chunks.savedBatches[0];

    expect(batch).toHaveLength(1);
    expect(batch?.[0]).toMatchObject({
      materia: "analisis-de-sistemas",
      unidad: "1",
      documentId: result.documentId,
      pagina: 2,
    });
  });

  it("los mismos bytes de otro usuario se indexan como documento nuevo", async () => {
    const parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
    const embeddings = new FakeEmbeddings();
    const chunks = new FakeChunkStore();
    const ingest = new IngestDocument(parser, embeddings, chunks, new FixedClock(), new SequenceIds());

    const first = await ingest.execute(input);
    const second = await ingest.execute({ ...input, userId: "user-2" });

    expect(second.alreadyIndexed).toBe(false);
    expect(second.documentId).not.toBe(first.documentId);
    expect(parser.calls).toBe(2);
    expect(embeddings.calls).toBe(2);
    expect(chunks.savedBatches).toHaveLength(2);
  });

  it("los mismos bytes en otra materia se indexan como documento nuevo", async () => {
    const parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
    const embeddings = new FakeEmbeddings();
    const chunks = new FakeChunkStore();
    const ingest = new IngestDocument(parser, embeddings, chunks, new FixedClock(), new SequenceIds());

    const first = await ingest.execute(input);
    const second = await ingest.execute({ ...input, materia: "diseno-de-sistemas" });

    expect(second.alreadyIndexed).toBe(false);
    expect(second.documentId).not.toBe(first.documentId);
    expect(parser.calls).toBe(2);
    expect(embeddings.calls).toBe(2);
    expect(chunks.savedBatches).toHaveLength(2);
  });

  it("un documento sin texto no pide embeddings y la segunda carga no reindexa", async () => {
    const parser = new FakeParser([{ pagina: 1, text: "" }]);
    const embeddings = new FakeEmbeddings();
    const chunks = new FakeChunkStore();
    const ingest = new IngestDocument(parser, embeddings, chunks, new FixedClock(), new SequenceIds());

    const first = await ingest.execute(input);
    const second = await ingest.execute(input);

    expect(first.chunkCount).toBe(0);
    expect(first.alreadyIndexed).toBe(false);
    expect(embeddings.calls).toBe(0);
    expect(second.alreadyIndexed).toBe(true);
    expect(second.documentId).toBe(first.documentId);
    expect(second.chunkCount).toBe(0);
    expect(parser.calls).toBe(1);
  });

  it("si el parser falla, no se guarda nada ni se piden embeddings", async () => {
    const embeddings = new FakeEmbeddings();
    const chunks = new FakeChunkStore();
    const ingest = new IngestDocument(
      new FailingParser(),
      embeddings,
      chunks,
      new FixedClock(),
      new SequenceIds(),
    );

    await expect(ingest.execute(input)).rejects.toThrow("no se pudo leer el pdf");
    expect(embeddings.calls).toBe(0);
    expect(chunks.savedBatches).toHaveLength(0);
  });

  it("si los embeddings fallan, no se guarda nada y una carga posterior puede reintentar", async () => {
    const parser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
    const chunks = new FakeChunkStore();
    const failing = new IngestDocument(
      parser,
      new FailingEmbeddings(),
      chunks,
      new FixedClock(),
      new SequenceIds(),
    );

    await expect(failing.execute(input)).rejects.toThrow("embeddings no disponibles");
    expect(chunks.savedBatches).toHaveLength(0);

    const embeddings = new FakeEmbeddings();
    const retry = new IngestDocument(parser, embeddings, chunks, new FixedClock(), new SequenceIds());
    const result = await retry.execute(input);

    expect(result.alreadyIndexed).toBe(false);
    expect(result.chunkCount).toBe(1);
    expect(parser.calls).toBe(2);
    expect(embeddings.calls).toBe(1);
    expect(chunks.savedBatches).toHaveLength(1);
  });
});
