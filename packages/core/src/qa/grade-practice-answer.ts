import type { EmbeddingProvider } from "../ingestion/ports.js";
import type { FailedPracticeStore, MaterialSearch, PracticeLlmProvider } from "./ports.js";
import type { Citation, GradePracticeAnswerInput, GradePracticeAnswerResult, RetrievedPassage } from "./types.js";

const abstentionNotice = "No está en tu material" as const;

export class GradePracticeAnswer {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly search: MaterialSearch,
    private readonly llm: PracticeLlmProvider,
    private readonly failed: FailedPracticeStore,
  ) {}

  async execute(input: GradePracticeAnswerInput): Promise<GradePracticeAnswerResult> {
    if (input.unidad.trim() === "") {
      throw new Error("unidad vacía");
    }
    if (input.question.trim() === "") {
      throw new Error("pregunta vacía");
    }
    if (input.answer.trim() === "") {
      throw new Error("respuesta vacía");
    }

    const searchHint = `${input.question.trim()}\n${input.answer.trim()}`;
    const vectors = await this.embeddings.embed([searchHint]);
    const questionEmbedding = vectors[0] ?? [];

    const passages = await this.search.search({
      userId: input.userId,
      materia: input.materia,
      unidad: input.unidad.trim(),
      question: searchHint,
      questionEmbedding,
    });

    if (passages.length === 0) {
      return { kind: "abstain", notice: abstentionNotice };
    }

    const question = input.question.trim();
    const { verdict } = await this.llm.gradePracticeAnswer({
      question,
      answer: input.answer.trim(),
      passages,
    });

    if (verdict === "Fallaste") {
      await this.failed.save({
        userId: input.userId,
        materia: input.materia,
        unidad: input.unidad.trim(),
        question,
      });
    }

    return {
      kind: "graded",
      verdict,
      citations: citationsFromPassages(passages),
    };
  }
}

function citationsFromPassages(passages: RetrievedPassage[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const passage of passages) {
    const key = `${passage.filename}:${passage.pagina}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push({ filename: passage.filename, pagina: passage.pagina });
  }
  return out;
}
