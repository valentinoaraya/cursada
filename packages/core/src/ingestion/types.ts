export type IngestDocumentInput = {
  userId: string;
  materia: string;
  unidad: string;
  filename: string;
  content: Uint8Array;
};

export type IngestResult = {
  documentId: string;
  alreadyIndexed: boolean;
  chunkCount: number;
};

export type ParsedPage = {
  pagina: number;
  text: string;
};

export type NewChunk = {
  id: string;
  documentId: string;
  userId: string;
  materia: string;
  unidad: string;
  pagina: number;
  hash: string;
  text: string;
  embedding: number[];
};
