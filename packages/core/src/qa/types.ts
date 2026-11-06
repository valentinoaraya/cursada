export type AskQuestionInput = {
  userId: string;
  materia: string;
  question: string;
};

export type Citation = {
  filename: string;
  pagina: number;
};

export type AskQuestionAbstain = {
  kind: "abstain";
  notice: "No está en tu material";
};

export type AskQuestionAnswer = {
  kind: "answer";
  stream: AsyncIterable<string>;
  citations: Citation[];
};

export type AskQuestionResult = AskQuestionAbstain | AskQuestionAnswer;

export type RetrievedPassage = {
  chunkId: string;
  filename: string;
  pagina: number;
  text: string;
};
