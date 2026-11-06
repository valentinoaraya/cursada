import type { EmbeddingProvider } from "../ingestion/ports.js";
import type { LlmProvider, MaterialSearch } from "./ports.js";
import type { AskQuestionInput, AskQuestionResult, Citation, RetrievedPassage } from "./types.js";

const abstentionNotice = "No está en tu material" as const;

export class AskQuestion {
  constructor(
    private readonly embeddings: EmbeddingProvider,
    private readonly search: MaterialSearch,
    private readonly llm: LlmProvider,
  ) {}

  async execute(input: AskQuestionInput): Promise<AskQuestionResult> {
    if (input.question.trim() === "") {
      throw new Error("pregunta vacía");
    }

    const vectors = await this.embeddings.embed([input.question]);
    const questionEmbedding = vectors[0] ?? [];

    const passages = await this.search.search({
      userId: input.userId,
      materia: input.materia,
      question: input.question,
      questionEmbedding,
    });

    if (passages.length === 0) {
      return { kind: "abstain", notice: abstentionNotice };
    }

    const { stream, citations } = await this.llm.answer({
      question: input.question,
      passages,
    });

    return {
      kind: "answer",
      stream,
      citations: filterCitations(citations, passages),
    };
  }
}

function filterCitations(
  citations: Citation[],
  passages: RetrievedPassage[],
): Citation[] {
  return citations.filter((citation) =>
    passages.some(
      (passage) => passage.filename === citation.filename && passage.pagina === citation.pagina,
    ),
  );
}
