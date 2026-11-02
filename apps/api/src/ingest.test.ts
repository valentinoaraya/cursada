import { describe, expect, it } from "vitest";
import { createIngestDocument } from "./ingest.js";

describe("createIngestDocument", () => {
	it("sin DATABASE_URL no conecta", async () => {
		await expect(createIngestDocument("")).rejects.toThrow(
			"Falta DATABASE_URL",
		);
	});
});
