export { IngestDocument } from "./ingestion/ingest-document.js";
export type {
  ChunkStore,
  DocumentParser,
  EmbeddingProvider,
} from "./ingestion/ports.js";
export type {
  IngestDocumentInput,
  IngestResult,
  NewChunk,
  ParsedPage,
} from "./ingestion/types.js";
export type { Clock, IdGenerator } from "./shared/ports.js";
