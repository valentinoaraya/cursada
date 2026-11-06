import type { RetrievedPassage } from "./types.js";

export type MaterialSearchInput = {
  userId: string;
  materia: string;
  question: string;
  questionEmbedding: number[];
};

export interface MaterialSearch {
  search(input: MaterialSearchInput): Promise<RetrievedPassage[]>;
}

export interface LlmProvider {
  answer(input: {
    question: string;
    passages: RetrievedPassage[];
  }): Promise<{
    stream: AsyncIterable<string>;
    citations: Array<{ filename: string; pagina: number }>;
  }>;
}
