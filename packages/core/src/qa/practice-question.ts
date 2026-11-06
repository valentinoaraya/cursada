import type { EmbeddingProvider } from "../ingestion/ports.js";
import type { MaterialSearch, PracticeLlmProvider } from "./ports.js";
import { PRACTICE_QUESTION_SEARCH_TEXT } from "./practice-query.js";
import type { GeneratePracticeQuestionInput, GeneratePracticeQuestionResult } from "./types.js";

const abstentionNotice = "No está en tu material" as const;

export class GeneratePracticeQuestion {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly search: MaterialSearch,
    private readonly llm: PracticeLlmProvider,
  ) {}

  async execute(input: GeneratePracticeQuestionInput): Promise<GeneratePracticeQuestionResult> {
    if (input.unidad.trim() === "") {
      throw new Error("unidad vacía");
    }

    const vectors = await this.embeddings.embed([PRACTICE_QUESTION_SEARCH_TEXT]);
    const questionEmbedding = vectors[0] ?? [];

    const passages = await this.search.search({
      userId: input.userId,
      materia: input.materia,
      unidad: input.unidad.trim(),
      question: PRACTICE_QUESTION_SEARCH_TEXT,
      questionEmbedding,
    });

    if (passages.length === 0) {
      return { kind: "abstain", notice: abstentionNotice };
    }

    const { question } = await this.llm.generatePracticeQuestion({ passages });
    return { kind: "question", question };
  }
}
