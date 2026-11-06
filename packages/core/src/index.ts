export { AskQuestion } from "./qa/ask-question.js";
export { IngestDocument } from "./ingestion/ingest-document.js";
export type { LlmProvider, MaterialSearch, MaterialSearchInput } from "./qa/ports.js";
export type {
  AskQuestionAbstain,
  AskQuestionAnswer,
  AskQuestionInput,
  AskQuestionResult,
  Citation,
  RetrievedPassage,
} from "./qa/types.js";
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
