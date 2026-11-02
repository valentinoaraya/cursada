import { createHash } from "node:crypto";
import type { Clock, IdGenerator } from "../shared/ports.js";
import type { ChunkStore, DocumentParser, EmbeddingProvider } from "./ports.js";
import type { IngestDocumentInput, IngestResult, NewChunk } from "./types.js";

export class IngestDocument {
  constructor(
    private readonly parser: DocumentParser,
    private readonly embeddings: EmbeddingProvider,
    private readonly chunks: ChunkStore,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute(input: IngestDocumentInput): Promise<IngestResult> {
    const hash = createHash("sha256").update(input.content).digest("hex");
    const existing = await this.chunks.findByHash(input.userId, input.materia, hash);
    if (existing) {
      return { documentId: existing.documentId, alreadyIndexed: true, chunkCount: 0 };
    }

    const pages = await this.parser.parse(input.content, input.filename);
    const withText = pages.filter((page) => page.text.trim() !== "");
    const vectors =
      withText.length === 0 ? [] : await this.embeddings.embed(withText.map((page) => page.text));
    const documentId = this.ids.next();
    const saved: NewChunk[] = withText.map((page, index) => ({
      id: this.ids.next(),
      documentId,
      userId: input.userId,
      materia: input.materia,
      unidad: input.unidad,
      pagina: page.pagina,
      hash,
      text: page.text,
      embedding: vectors[index] ?? [],
    }));
    await this.chunks.save(
      { documentId, userId: input.userId, materia: input.materia, hash },
      saved,
    );

    return { documentId, alreadyIndexed: false, chunkCount: saved.length };
  }
}
