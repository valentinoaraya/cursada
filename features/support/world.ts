import { setWorldConstructor, World } from "@cucumber/cucumber";
import { AskQuestion, IngestDocument } from "@cursada/core";
import type {
  AskQuestionResult,
  ChunkStore,
  DocumentParser,
  EmbeddingProvider,
  IngestDocumentInput,
  IngestResult,
  LlmProvider,
  MaterialSearch,
  NewChunk,
  ParsedPage,
  RetrievedPassage,
} from "@cursada/core";
import type { Clock, IdGenerator } from "@cursada/core";

type ScopedPassage = RetrievedPassage & { userId: string; materia: string };

export class FakeParser implements DocumentParser {
  calls = 0;

  constructor(private readonly pages: ParsedPage[]) {}

  async parse(): Promise<ParsedPage[]> {
    this.calls += 1;
    return this.pages;
  }
}

export class FailingParser implements DocumentParser {
  async parse(): Promise<ParsedPage[]> {
    throw new Error("no se pudo leer el pdf");
  }
}

export class FakeEmbeddings implements EmbeddingProvider {
  calls = 0;

  async embed(texts: string[]): Promise<number[][]> {
    this.calls += 1;
    return texts.map(() => [0.1, 0.2, 0.3]);
  }
}

export class FailingEmbeddings implements EmbeddingProvider {
  calls = 0;

  async embed(): Promise<number[][]> {
    this.calls += 1;
    throw new Error("embeddings no disponibles");
  }
}

export class FakeChunkStore implements ChunkStore {
  savedBatches: NewChunk[][] = [];
  documents: { documentId: string; userId: string; materia: string; hash: string }[] = [];

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

export class IngestWorld extends World {
  input: IngestDocumentInput = {
    userId: "user-1",
    materia: "analisis-de-sistemas",
    unidad: "1",
    filename: "apuntes.pdf",
    content: new Uint8Array([1, 2, 3, 4]),
  };
  parser: DocumentParser = new FakeParser([{ pagina: 1, text: "El sistema es un conjunto de elementos." }]);
  embeddings: EmbeddingProvider = new FakeEmbeddings();
  chunks = new FakeChunkStore();
  ids = new SequenceIds();
  firstResult?: IngestResult;
  lastResult?: IngestResult;
  lastError?: Error;
  searchPassages: ScopedPassage[] = [];
  llmAnswer = "";
  llmCitations: Array<{ filename: string; pagina: number }> = [];
  llmCalls = 0;
  lastAskResult?: AskQuestionResult;

  build(): IngestDocument {
    return new IngestDocument(this.parser, this.embeddings, this.chunks, new FixedClock(), this.ids);
  }

  async load(overrides: Partial<IngestDocumentInput> = {}): Promise<IngestResult> {
    this.lastError = undefined;
    try {
      const result = await this.build().execute({ ...this.input, ...overrides });
      this.lastResult = result;
      return result;
    } catch (error) {
      this.lastError = error as Error;
      throw error;
    }
  }

  async tryLoad(overrides: Partial<IngestDocumentInput> = {}): Promise<void> {
    this.lastError = undefined;
    try {
      this.lastResult = await this.build().execute({ ...this.input, ...overrides });
    } catch (error) {
      this.lastError = error as Error;
    }
  }

  async ask(input: { userId: string; materia: string; question: string }) {
    const passages = this.searchPassages;
    const llmAnswer = this.llmAnswer;
    const llmCitations = this.llmCitations;
    const search: MaterialSearch = {
      async search(params) {
        return passages
          .filter(
            (passage) => passage.userId === params.userId && passage.materia === params.materia,
          )
          .map(({ chunkId, filename, pagina, text }) => ({ chunkId, filename, pagina, text }));
      },
    };
    const llm: LlmProvider = {
      answer: async () => {
        this.llmCalls += 1;
        const stream = async function* () {
          yield llmAnswer;
        }();
        return { stream, citations: llmCitations };
      },
    };
    this.lastAskResult = await new AskQuestion(new FakeEmbeddings(), search, llm).execute(input);
  }

  async readStream(stream: AsyncIterable<string>): Promise<string> {
    let text = "";
    for await (const chunk of stream) {
      text += chunk;
    }
    return text;
  }
}

setWorldConstructor(IngestWorld);
