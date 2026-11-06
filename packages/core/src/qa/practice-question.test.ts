import { describe, expect, it } from "vitest";
import type { EmbeddingProvider } from "../ingestion/ports.js";
import { GeneratePracticeQuestion } from "./practice-question.js";
import type { MaterialSearch, PracticeLlmProvider } from "./ports.js";
import type { PracticeVerdict } from "./types.js";
import type { RetrievedPassage } from "./types.js";

const baseInput = {
  userId: "user-1",
  materia: "analisis-de-sistemas",
  unidad: "1",
};

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
  generateCalls = 0;
  lastPassagesForGenerate: RetrievedPassage[] = [];

  constructor(private readonly question: string) {}

  async generatePracticeQuestion(input: { passages: RetrievedPassage[] }) {
    this.generateCalls += 1;
    this.lastPassagesForGenerate = input.passages;
    return { question: this.question };
  }

  async gradePracticeAnswer(_input: {
    question: string;
    answer: string;
    passages: RetrievedPassage[];
  }): Promise<{ verdict: PracticeVerdict }> {
    throw new Error("not used");
  }
}

describe("GeneratePracticeQuestion", () => {
  it("devuelve una pregunta hecha solo con el material de esa unidad", async () => {
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
    const llm = new FakePracticeLlm("¿Qué es un sistema según el material?");
    const useCase = new GeneratePracticeQuestion(embeddings, search, llm);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({
      kind: "question",
      question: "¿Qué es un sistema según el material?",
    });
    expect(llm.generateCalls).toBe(1);
    expect(llm.lastPassagesForGenerate).toHaveLength(1);
    expect(llm.lastPassagesForGenerate[0]!.chunkId).toBe("chunk-1");
  });

  it("no usa pasajes de otra unidad ni de otro usuario", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([
      {
        chunkId: "chunk-otra-u",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        unidad: "2",
        filename: "otra.pdf",
        pagina: 1,
        text: "Otra unidad.",
      },
      {
        chunkId: "chunk-otro-user",
        userId: "user-2",
        materia: "analisis-de-sistemas",
        unidad: "1",
        filename: "ajeno.pdf",
        pagina: 1,
        text: "Otro usuario.",
      },
    ]);
    const llm = new FakePracticeLlm("no debería llamarse");
    const useCase = new GeneratePracticeQuestion(embeddings, search, llm);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({ kind: "abstain", notice: "No está en tu material" });
    expect(llm.generateCalls).toBe(0);
  });

  it("sin material en la unidad avisa que no está en tu material", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([]);
    const llm = new FakePracticeLlm("no debería llamarse");
    const useCase = new GeneratePracticeQuestion(embeddings, search, llm);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({ kind: "abstain", notice: "No está en tu material" });
    expect(llm.generateCalls).toBe(0);
  });

  it("una unidad vacía no busca ni llama al modelo", async () => {
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
    const llm = new FakePracticeLlm("x");
    const useCase = new GeneratePracticeQuestion(embeddings, search, llm);

    await expect(
      useCase.execute({ ...baseInput, unidad: "   " }),
    ).rejects.toThrow();

    expect(embeddings.calls).toBe(0);
    expect(llm.generateCalls).toBe(0);
  });
});
