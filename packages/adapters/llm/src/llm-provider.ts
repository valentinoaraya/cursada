import { createOpenAI } from "@ai-sdk/openai";
import type { LlmProvider, RetrievedPassage } from "@cursada/core";
import { streamText, type LanguageModel } from "ai";

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1";
const defaultChatModel = process.env.OLLAMA_CHAT_MODEL ?? "llama3.2";

export function createOllamaChatModel(modelId: string = defaultChatModel): LanguageModel {
  // Ollama habla Chat Completions, no Responses API.
  return createOpenAI({
    baseURL: ollamaBaseUrl,
    apiKey: "ollama",
  }).chat(modelId);
}

export class AiSdkLlmProvider implements LlmProvider {
  constructor(private readonly model: LanguageModel = createOllamaChatModel()) {}

  async answer(input: { question: string; passages: RetrievedPassage[] }) {
    const context = input.passages
      .map(
        (passage) =>
          `Archivo: ${passage.filename}, página ${passage.pagina}\n${passage.text}`,
      )
      .join("\n\n---\n\n");

    const result = streamText({
      model: this.model,
      system:
        "Respondé en español usando solo el material provisto. No inventes información fuera de esos pasajes.",
      prompt: `Material:\n${context}\n\nPregunta: ${input.question}`,
    });

    const citations = uniqueCitations(
      input.passages.map((passage) => ({
        filename: passage.filename,
        pagina: passage.pagina,
      })),
    );

    return { stream: result.textStream, citations };
  }
}

function uniqueCitations(citations: Array<{ filename: string; pagina: number }>) {
  const seen = new Set<string>();
  return citations.filter((citation) => {
    const key = `${citation.filename}:${citation.pagina}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
