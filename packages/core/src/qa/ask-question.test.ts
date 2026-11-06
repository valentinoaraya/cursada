import { describe, expect, it } from "vitest";
import type { EmbeddingProvider } from "../ingestion/ports.js";
import { AskQuestion } from "./ask-question.js";
import type { LlmProvider, MaterialSearch } from "./ports.js";
import type { RetrievedPassage } from "./types.js";

const input = {
  userId: "user-1",
  materia: "analisis-de-sistemas",
  question: "¿Qué es un sistema?",
};

type ScopedPassage = RetrievedPassage & { userId: string; materia: string };

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
  }): Promise<RetrievedPassage[]> {
    return this.passages
      .filter(
        (passage) => passage.userId === params.userId && passage.materia === params.materia,
      )
      .map(({ chunkId, filename, pagina, text }) => ({ chunkId, filename, pagina, text }));
  }
}

class FakeLlm implements LlmProvider {
  calls = 0;
  lastPassages: RetrievedPassage[] = [];

  constructor(
    private readonly answerText: string,
    private readonly citations: Array<{ filename: string; pagina: number }>,
  ) {}

  async answer(input: { question: string; passages: RetrievedPassage[] }) {
    this.calls += 1;
    this.lastPassages = input.passages;
    const answerText = this.answerText;
    const citations = this.citations;
    const stream = async function* () {
      yield answerText;
    }();
    return { stream, citations };
  }
}

async function readStream(stream: AsyncIterable<string>): Promise<string> {
  let text = "";
  for await (const chunk of stream) {
    text += chunk;
  }
  return text;
}

describe("AskQuestion", () => {
  it("devuelve la respuesta mientras se escribe, con archivo y página", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([
      {
        chunkId: "chunk-1",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        filename: "apuntes.pdf",
        pagina: 2,
        text: "Un sistema es un conjunto de elementos relacionados.",
      },
    ]);
    const llm = new FakeLlm("Un sistema es un conjunto de elementos.", [
      { filename: "apuntes.pdf", pagina: 2 },
    ]);
    const ask = new AskQuestion(embeddings, search, llm);

    const result = await ask.execute(input);

    expect(result.kind).toBe("answer");
    if (result.kind !== "answer") {
      return;
    }
    expect(await readStream(result.stream)).toBe("Un sistema es un conjunto de elementos.");
    expect(result.citations).toEqual([{ filename: "apuntes.pdf", pagina: 2 }]);
    expect(llm.calls).toBe(1);
  });

  it("avisa que no está en el material y no genera respuesta", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([]);
    const llm = new FakeLlm("inventado", [{ filename: "apuntes.pdf", pagina: 1 }]);
    const ask = new AskQuestion(embeddings, search, llm);

    const result = await ask.execute(input);

    expect(result).toEqual({ kind: "abstain", notice: "No está en tu material" });
    expect(llm.calls).toBe(0);
  });

  it("no usa pasajes de otro usuario ni de otra materia", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([
      {
        chunkId: "chunk-otro",
        userId: "user-2",
        materia: "analisis-de-sistemas",
        filename: "ajeno.pdf",
        pagina: 1,
        text: "Secreto ajeno.",
      },
      {
        chunkId: "chunk-otra-materia",
        userId: "user-1",
        materia: "ingenieria-de-software",
        filename: "otra-materia.pdf",
        pagina: 1,
        text: "Otra materia.",
      },
    ]);
    const llm = new FakeLlm("inventado", [{ filename: "ajeno.pdf", pagina: 1 }]);
    const ask = new AskQuestion(embeddings, search, llm);

    const result = await ask.execute(input);

    expect(result).toEqual({ kind: "abstain", notice: "No está en tu material" });
    expect(llm.calls).toBe(0);
  });

  it("descarta citas que no corresponden a un pasaje recuperado", async () => {
    const embeddings = new FakeEmbeddings();
    const search = new InMemoryMaterialSearch([
      {
        chunkId: "chunk-1",
        userId: "user-1",
        materia: "analisis-de-sistemas",
        filename: "apuntes.pdf",
        pagina: 2,
        text: "Un sistema es un conjunto de elementos.",
      },
    ]);
    const llm = new FakeLlm("Respuesta.", [
      { filename: "apuntes.pdf", pagina: 2 },
      { filename: "inventado.pdf", pagina: 99 },
    ]);
    const ask = new AskQuestion(embeddings, search, llm);

    const result = await ask.execute(input);

    expect(result.kind).toBe("answer");
    if (result.kind !== "answer") {
      return;
    }
    expect(result.citations).toEqual([{ filename: "apuntes.pdf", pagina: 2 }]);
  });
});
