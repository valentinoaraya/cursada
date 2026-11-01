import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LocalDocumentParser } from "./document-parser.js";

const fixtures = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

describe("LocalDocumentParser", () => {
  it("un PDF de una página con texto devuelve esa página y el texto", async () => {
    const content = new Uint8Array(await readFile(join(fixtures, "una-pagina.pdf")));
    const parser = new LocalDocumentParser();

    const pages = await parser.parse(content, "una-pagina.pdf");

    expect(pages).toHaveLength(1);
    expect(pages[0]?.pagina).toBe(1);
    expect(pages[0]?.text).toContain("El sistema es un conjunto de elementos.");
  });

  it("un PDF de varias páginas conserva el número de cada página", async () => {
    const content = new Uint8Array(await readFile(join(fixtures, "dos-paginas.pdf")));
    const parser = new LocalDocumentParser();

    const pages = await parser.parse(content, "dos-paginas.pdf");

    expect(pages).toHaveLength(2);
    expect(pages[0]).toMatchObject({ pagina: 1 });
    expect(pages[0]?.text).toContain("Pagina uno del apunte.");
    expect(pages[1]).toMatchObject({ pagina: 2 });
    expect(pages[1]?.text).toContain("Pagina dos del apunte.");
  });

  it("una página sin texto útil viene con text vacío", async () => {
    const content = new Uint8Array(await readFile(join(fixtures, "sin-texto.pdf")));
    const parser = new LocalDocumentParser();

    const pages = await parser.parse(content, "sin-texto.pdf");

    expect(pages).toHaveLength(1);
    expect(pages[0]?.pagina).toBe(1);
    expect(pages[0]?.text.trim()).toBe("");
  });

  it("un Markdown con encabezados parte por sección y usa página 1", async () => {
    const content = new Uint8Array(await readFile(join(fixtures, "con-encabezados.md")));
    const parser = new LocalDocumentParser();

    const pages = await parser.parse(content, "con-encabezados.md");

    expect(pages).toHaveLength(2);
    expect(pages[0]?.pagina).toBe(1);
    expect(pages[0]?.text).toContain("El sistema es un conjunto de elementos.");
    expect(pages[1]?.pagina).toBe(1);
    expect(pages[1]?.text).toContain("Los requerimientos describen lo que el sistema debe hacer.");
  });

  it("un Markdown sin encabezados es una sola sección con página 1", async () => {
    const content = new Uint8Array(await readFile(join(fixtures, "sin-encabezados.md")));
    const parser = new LocalDocumentParser();

    const pages = await parser.parse(content, "sin-encabezados.md");

    expect(pages).toHaveLength(1);
    expect(pages[0]?.pagina).toBe(1);
    expect(pages[0]?.text).toContain("El sistema es un conjunto de elementos interrelacionados.");
    expect(pages[0]?.text).toContain("No hay encabezados en este apunte.");
  });

  it("un archivo que no se puede leer hace fallar parse", async () => {
    const content = new Uint8Array(await readFile(join(fixtures, "corrupto.pdf")));
    const parser = new LocalDocumentParser();

    await expect(parser.parse(content, "corrupto.pdf")).rejects.toThrow();
  });
});
