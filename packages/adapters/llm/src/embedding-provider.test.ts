import { describe, expect, it } from "vitest";
import { AiSdkEmbeddingProvider } from "./embedding-provider.js";

const vector = [0.1, 0.2, 0.3];

describe("AiSdkEmbeddingProvider", () => {
  it("un texto devuelve un vector", async () => {
    const provider = new AiSdkEmbeddingProvider({
      embed: async () => [vector],
    });

    const vectors = await provider.embed(["El sistema es un conjunto de elementos."]);

    expect(vectors).toEqual([vector]);
  });

  it("varios textos devuelven la misma cantidad de vectores, en el mismo orden", async () => {
    const first = [0.1, 0.0, 0.0];
    const second = [0.0, 0.1, 0.0];
    const third = [0.0, 0.0, 0.1];
    const provider = new AiSdkEmbeddingProvider({
      embed: async (texts) => {
        const byText: Record<string, number[]> = {
          uno: first,
          dos: second,
          tres: third,
        };
        return texts.map((text) => byText[text]!);
      },
    });

    const vectors = await provider.embed(["uno", "dos", "tres"]);

    expect(vectors).toEqual([first, second, third]);
  });

  it("lista vacía devuelve lista vacía sin llamar al proveedor", async () => {
    let called = false;
    const provider = new AiSdkEmbeddingProvider({
      embed: async () => {
        called = true;
        return [vector];
      },
    });

    const vectors = await provider.embed([]);

    expect(vectors).toEqual([]);
    expect(called).toBe(false);
  });

  it("si el proveedor falla, embed rechaza", async () => {
    const provider = new AiSdkEmbeddingProvider({
      embed: async () => {
        throw new Error("proveedor caído");
      },
    });

    await expect(provider.embed(["texto"])).rejects.toThrow("proveedor caído");
  });
});
