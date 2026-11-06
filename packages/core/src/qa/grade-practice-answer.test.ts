import { describe, expect, it } from "vitest";
import type { EmbeddingProvider } from "../ingestion/ports.js";
import { GradePracticeAnswer } from "./grade-practice-answer.js";
import type { MaterialSearch, PracticeLlmProvider } from "./ports.js";
import type { RetrievedPassage } from "./types.js";

type ScopedPassage = RetrievedPassage & { userId: string; materia: string; unidad: string };

class FakeEmbeddings implements EmbeddingProvider {
  calls = 0;

  async embed(texts: string[]): Promise<number[][]> {
    this.calls += 1;
    return texts.map(() => [0.1, 0.2, 0.3]);
  }
}

class InMemoryMaterialSearch implements MaterialSearch {
  constructor(private readonly passages: ScopedPassage[]) {}

  async search(params: {
    userId: string;
    materia: string;
    unidad?: string;
    question: string;
    questionEmbedding: number[];
  }): Promise<RetrievedPassage[]> {
    return this.passages
      .filter(
        (passage) =>
          passage.userId === params.userId &&
          passage.materia === params.materia &&
          (params.unidad === undefined || passage.unidad === params.unidad),
      )
      .map(({ chunkId, filename, pagina, text }) => ({ chunkId, filename, pagina, text }));
  }
}

class FakePracticeLlm implements PracticeLlmProvider {
  gradeCalls = 0;
  lastInput?: {
    question: string;
    answer: string;
    passages: RetrievedPassage[];
  };

  constructor(private readonly verdict: "Está bien" | "Fallaste") {}

  async generatePracticeQuestion(_input: {
    passages: RetrievedPassage[];
  }): Promise<{ question: string }> {
    throw new Error("not used");
  }

  async gradePracticeAnswer(input: {
    question: string;
    answer: string;
    passages: RetrievedPassage[];
  }) {
    this.gradeCalls += 1;
    this.lastInput = input;
    return {
      verdict: this.verdict,
    };
  }
}

const baseInput = {
  userId: "user-1",
  materia: "analisis-de-sistemas",
  unidad: "1",
  question: "¿Qué es un sistema?",
  answer: "Un conjunto de elementos relacionados.",
};

describe("GradePracticeAnswer", () => {
  it("devuelve veredicto y cita el archivo y la página", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([
      {
        chunkId: "chunk-1",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        unidad: "1",
        filename: "apuntes.pdf",
        pagina: 2,
        text: "Un sistema es un conjunto de elementos.",
      },
    ]);
    const llm = new FakePracticeLlm("Está bien");
    const useCase = new GradePracticeAnswer(embeddings, search, llm);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({
      kind: "graded",
      verdict: "Está bien",
      citations: [{ filename: "apuntes.pdf", pagina: 2 }],
    });
    expect(llm.gradeCalls).toBe(1);
    expect(llm.lastInput?.passages).toHaveLength(1);
  });

  it("no usa pasajes de otra unidad", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([
      {
        chunkId: "chunk-u2",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        unidad: "2",
        filename: "otra.pdf",
        pagina: 1,
        text: "Solo unidad 2.",
      },
    ]);
    const llm = new FakePracticeLlm("Está bien");
    const useCase = new GradePracticeAnswer(embeddings, search, llm);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({ kind: "abstain", notice: "No está en tu material" });
    expect(llm.gradeCalls).toBe(0);
  });

  it("respuesta vacía no busca ni llama al modelo", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([
      {
        chunkId: "chunk-1",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        unidad: "1",
        filename: "apuntes.pdf",
        pagina: 1,
        text: "Texto.",
      },
    ]);
    const llm = new FakePracticeLlm("Está bien");
    const useCase = new GradePracticeAnswer(embeddings, search, llm);

    await expect(useCase.execute({ ...baseInput, answer: "   " })).rejects.toThrow();

    expect(embeddings.calls).toBe(0);
    expect(llm.gradeCalls).toBe(0);
  });
});
