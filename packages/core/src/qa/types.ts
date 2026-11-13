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

export type GeneratePracticeQuestionInput = {
  userId: string;
  materia: string;
  unidad: string;
};

export type GeneratePracticeQuestionAbstain = {
  kind: "abstain";
  notice: "No está en tu material";
};

export type GeneratePracticeQuestionOk = {
  kind: "question";
  question: string;
};

export type GeneratePracticeQuestionResult = GeneratePracticeQuestionAbstain | GeneratePracticeQuestionOk;

export type GradePracticeAnswerInput = {
  userId: string;
  materia: string;
  unidad: string;
  question: string;
  answer: string;
};

export type GradePracticeAnswerAbstain = {
  kind: "abstain";
  notice: "No está en tu material";
};

export type PracticeVerdict = "Está bien" | "Fallaste";

export type GradePracticeAnswerGraded = {
  kind: "graded";
  verdict: PracticeVerdict;
  citations: Citation[];
};

export type GradePracticeAnswerResult = GradePracticeAnswerAbstain | GradePracticeAnswerGraded;

export type ReviewFailedPracticeInput = {
  userId: string;
  materia: string;
};

export type ReviewFailedPracticeResult = {
  questions: Array<{ question: string; unidad: string }>;
};
