import { describe, expect, it } from "vitest";
import type { FailedPracticeStore } from "./ports.js";
import { ReviewFailedPractice } from "./review-failed-practice.js";

class MemoryFailedPractice implements FailedPracticeStore {
  rows: Array<{ userId: string; materia: string; unidad: string; question: string }> = [];
  listCalls = 0;
  failList = false;

  async save(input: { userId: string; materia: string; unidad: string; question: string }) {
    this.rows.push(input);
  }

  async list(input: { userId: string; materia: string }) {
    this.listCalls += 1;
    if (this.failList) {
      throw new Error("no se pudo listar");
    }
    return this.rows
      .filter((row) => row.userId === input.userId && row.materia === input.materia)
      .map(({ question, unidad }) => ({ question, unidad }));
  }
}

describe("ReviewFailedPractice", () => {
  it("devuelve la pregunta fallada de esa materia", async () => {
    const failed = new MemoryFailedPractice();
    await failed.save({
      userId: "user-1",
      materia: "analisis-de-sistemas",
      unidad: "1",
      question: "¿Qué es un sistema?",
    });
    await failed.save({
      userId: "user-1",
      materia: "analisis-de-sistemas",
      unidad: "2",
      question: "¿Qué es un sistema?",
    });
    const useCase = new ReviewFailedPractice(failed);

    const result = await useCase.execute({ userId: "user-1", materia: "analisis-de-sistemas" });

    expect(result).toEqual({
      questions: [
        { question: "¿Qué es un sistema?", unidad: "1" },
        { question: "¿Qué es un sistema?", unidad: "2" },
      ],
    });
  });

  it("no devuelve la fallada de otra materia", async () => {
    const failed = new MemoryFailedPractice();
    await failed.save({
      userId: "user-1",
      materia: "ingenieria-de-software",
      unidad: "1",
      question: "¿Qué es un requisito?",
    });
    const useCase = new ReviewFailedPractice(failed);

    const result = await useCase.execute({ userId: "user-1", materia: "analisis-de-sistemas" });

    expect(result).toEqual({ questions: [] });
  });

  it("no devuelve la fallada de otra persona", async () => {
    const failed = new MemoryFailedPractice();
    await failed.save({
      userId: "user-2",
      materia: "analisis-de-sistemas",
      unidad: "1",
      question: "Pregunta ajena",
    });
    const useCase = new ReviewFailedPractice(failed);

    const result = await useCase.execute({ userId: "user-1", materia: "analisis-de-sistemas" });

    expect(result).toEqual({ questions: [] });
  });

  it("sin falladas devuelve lista vacía", async () => {
    const failed = new MemoryFailedPractice();
    const useCase = new ReviewFailedPractice(failed);

    const result = await useCase.execute({ userId: "user-1", materia: "analisis-de-sistemas" });

    expect(result).toEqual({ questions: [] });
  });

  it("materia vacía no llama al almacén", async () => {
    const failed = new MemoryFailedPractice();
    await failed.save({
      userId: "user-1",
      materia: "analisis-de-sistemas",
      unidad: "1",
      question: "¿Qué es un sistema?",
    });
    const useCase = new ReviewFailedPractice(failed);

    const result = await useCase.execute({ userId: "user-1", materia: "   " });

    expect(result).toEqual({ questions: [] });
    expect(failed.listCalls).toBe(0);
  });

  it("si el almacén falla al listar, no devuelve lista vacía", async () => {
    const failed = new MemoryFailedPractice();
    failed.failList = true;
    const useCase = new ReviewFailedPractice(failed);

    await expect(useCase.execute({ userId: "user-1", materia: "analisis-de-sistemas" })).rejects.toThrow(
      "no se pudo listar",
    );
  });
});
