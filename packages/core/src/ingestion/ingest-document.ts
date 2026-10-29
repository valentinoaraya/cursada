import type { Clock, IdGenerator } from "../shared/ports.js";
import type { ChunkStore, DocumentParser, EmbeddingProvider } from "./ports.js";
import type { IngestDocumentInput, IngestResult } from "./types.js";

export class IngestDocument {
  constructor(
    private readonly parser: DocumentParser,
    private readonly embeddings: EmbeddingProvider,
    private readonly chunks: ChunkStore,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(_input: IngestDocumentInput): Promise<IngestResult> {
    throw new Error("IngestDocument no está implementado");
  }
}
