import { describe, expect, it, vi } from "vitest";
import { generatePracticeQuestion, gradePracticeAnswer, listFailedPractice } from "./practice-client.js";

describe("generatePracticeQuestion", () => {
  it("posta materia y unidad al proxy", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ question: "¿Qué es un sistema?" }), { status: 200 });
    });

    const result = await generatePracticeQuestion(
      { materia: "analisis-de-sistemas", unidad: "1" },
      { fetchImpl },
    );

    expect(result).toEqual({ kind: "question", question: "¿Qué es un sistema?" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/practice/generate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ materia: "analisis-de-sistemas", unidad: "1" }),
      }),
    );
  });

  it("lee abstención", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ notice: "No está en tu material" }), { status: 200 });
    });

    const result = await generatePracticeQuestion(
      { materia: "m", unidad: "1" },
      { fetchImpl },
    );

    expect(result).toEqual({ kind: "abstain", notice: "No está en tu material" });
  });
});

describe("gradePracticeAnswer", () => {
  it("posta cuerpo completo al proxy", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          verdict: "Está bien",
          citations: [{ filename: "apuntes.pdf", pagina: 2 }],
        }),
        { status: 200 },
      );
    });

    const result = await gradePracticeAnswer(
      {
        materia: "analisis-de-sistemas",
        unidad: "1",
        question: "¿Qué es un sistema?",
        answer: "Un conjunto de elementos.",
      },
      { fetchImpl },
    );

    expect(result).toEqual({
      kind: "graded",
      verdict: "Está bien",
      citations: [{ filename: "apuntes.pdf", pagina: 2 }],
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/practice/grade",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          materia: "analisis-de-sistemas",
          unidad: "1",
          question: "¿Qué es un sistema?",
          answer: "Un conjunto de elementos.",
        }),
      }),
    );
  });
});

describe("listFailedPractice", () => {
  it("pide el repaso de la materia", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({ questions: [{ question: "¿Qué es un sistema?", unidad: "1" }] }),
        { status: 200 },
      );
    });

    const result = await listFailedPractice("analisis-de-sistemas", { fetchImpl });

    expect(result).toEqual([{ question: "¿Qué es un sistema?", unidad: "1" }]);
    expect(fetchImpl).toHaveBeenCalledWith("/api/practice/review?materia=analisis-de-sistemas");
  });
});
