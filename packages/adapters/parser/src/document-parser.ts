import { extractText } from "unpdf";
import type { DocumentParser, ParsedPage } from "@cursada/core";

const heading = /^#{1,6}\s+\S/;

export class LocalDocumentParser implements DocumentParser {
  async parse(content: Uint8Array, filename: string): Promise<ParsedPage[]> {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf")) {
      const { text } = await extractText(content);
      return text.map((pageText, index) => ({
        pagina: index + 1,
        text: pageText,
      }));
    }
    if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
      return parseMarkdown(new TextDecoder().decode(content));
    }
    throw new Error(`formato no soportado: ${filename}`);
  }
}

function parseMarkdown(source: string): ParsedPage[] {
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of source.split(/\r?\n/)) {
    if (heading.test(line) && current.length > 0) {
      sections.push(current.join("\n"));
      current = [line];
      continue;
    }
    current.push(line);
  }
  if (current.length > 0) {
    sections.push(current.join("\n"));
  }

  return sections.map((text) => ({ pagina: 1, text }));
}
