import { describe, expect, it, vi } from "vitest";
import { askQuestion, consumeAskResponse, parseSseData } from "./ask-client.js";

describe("parseSseData", () => {
  it("lee un token", () => {
    expect(parseSseData('data: {"token":"hola"}')).toEqual({ token: "hola" });
  });

  it("lee citas", () => {
    expect(parseSseData('data: {"citations":[{"filename":"apuntes.pdf","pagina":2}]}')).toEqual({
      citations: [{ filename: "apuntes.pdf", pagina: 2 }],
    });
  });

  it("lee el cierre", () => {
    expect(parseSseData("data: [DONE]")).toBe("done");
  });

  it("propaga el error del modelo", () => {
    expect(() => parseSseData('data: {"error":"model \'llama3.2\' not found"}')).toThrow(
      "model 'llama3.2' not found",
    );
  });
});

describe("consumeAskResponse", () => {
  it("devuelve abstención desde JSON", async () => {
    const response = new Response(JSON.stringify({ notice: "No está en tu material" }), {
      headers: { "content-type": "application/json" },
    });

    await expect(consumeAskResponse(response)).resolves.toEqual({
      kind: "abstain",
      notice: "No está en tu material",
    });
  });

  it("acumula tokens y citas desde SSE", async () => {
    const tokens: string[] = [];
    const body = [
      'data: {"token":"Un sistema "}\n\n',
      'data: {"token":"es un conjunto."}\n\n',
      'data: {"citations":[{"filename":"apuntes.pdf","pagina":2}]}\n\n',
      "data: [DONE]\n\n",
    ].join("");
    const response = new Response(body, {
      headers: { "content-type": "text/event-stream; charset=utf-8" },
    });

    await expect(consumeAskResponse(response, (token) => tokens.push(token))).resolves.toEqual({
      kind: "answer",
      answer: "Un sistema es un conjunto.",
      citations: [{ filename: "apuntes.pdf", pagina: 2 }],
    });
    expect(tokens).toEqual(["Un sistema ", "es un conjunto."]);
  });
});

describe("askQuestion", () => {
  it("posta materia y pregunta al proxy /api/questions", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ notice: "No está en tu material" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const result = await askQuestion(
      { materia: "analisis-de-sistemas", question: "¿Qué es un sistema?" },
      { fetchImpl },
    );

    expect(result).toEqual({ kind: "abstain", notice: "No está en tu material" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/questions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          materia: "analisis-de-sistemas",
          question: "¿Qué es un sistema?",
        }),
      }),
    );
  });
});
