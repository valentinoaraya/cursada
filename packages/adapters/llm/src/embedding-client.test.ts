import { MockEmbeddingModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";
import { createOllamaEmbeddingClient, createOpenAiEmbeddingClient } from "./embedding-client.js";

const vector = [0.1, 0.2, 0.3];

describe("createOpenAiEmbeddingClient", () => {
	it("un texto devuelve el vector que responde el modelo", async () => {
		const model = new MockEmbeddingModelV4({
			doEmbed: async () => ({ embeddings: [vector], warnings: [] }),
		});
		const client = createOpenAiEmbeddingClient(model);

		const vectors = await client.embed([
			"El sistema es un conjunto de elementos.",
		]);

		expect(vectors).toEqual([vector]);
	});

	it("sin modelo usa text-embedding-3-small", () => {
		const client = createOpenAiEmbeddingClient();

		const modelId = typeof client.model === "string" ? client.model : client.model.modelId;

		expect(modelId).toBe("text-embedding-3-small");
	});
});

describe("createOllamaEmbeddingClient", () => {
	it("sin modelo usa nomic-embed-text", () => {
		const client = createOllamaEmbeddingClient();
		const modelId = typeof client.model === "string" ? client.model : client.model.modelId;

		expect(modelId).toBe("nomic-embed-text");
	});
});
