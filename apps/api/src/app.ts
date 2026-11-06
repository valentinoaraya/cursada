import type {
  AskQuestionInput,
  AskQuestionResult,
  GeneratePracticeQuestionInput,
  GeneratePracticeQuestionResult,
  GradePracticeAnswerInput,
  GradePracticeAnswerResult,
  IngestDocumentInput,
  IngestResult,
} from "@cursada/core";
import multipart from "@fastify/multipart";
import Fastify, { type FastifyInstance } from "fastify";

export type DocumentIngest = {
  execute(input: IngestDocumentInput): Promise<IngestResult>;
};

export type QuestionAsk = {
  execute(input: AskQuestionInput): Promise<AskQuestionResult>;
};

export type PracticeGenerate = {
  execute(input: GeneratePracticeQuestionInput): Promise<GeneratePracticeQuestionResult>;
};

export type PracticeGrade = {
  execute(input: GradePracticeAnswerInput): Promise<GradePracticeAnswerResult>;
};

const localUserId = "local";

export function buildApp(options?: {
  logger?: boolean;
  ingest?: DocumentIngest;
  ask?: QuestionAsk;
  practiceGenerate?: PracticeGenerate;
  practiceGrade?: PracticeGrade;
}): FastifyInstance {
  const app = Fastify({ logger: options?.logger ?? true });

  app.get("/health", async () => ({ status: "ok" }));

  if (options?.ingest) {
    const ingest = options.ingest;
    app.register(multipart);
    app.post("/documents", async (request, reply) => {
      const file = await request.file();
      if (!file) {
        return reply.code(400).send({ message: "falta el archivo" });
      }
      const content = new Uint8Array(await file.toBuffer());
      return ingest.execute({
        userId: localUserId,
        materia: textField(file.fields.materia),
        unidad: textField(file.fields.unidad),
        filename: file.filename,
        content,
      });
    });
  }

  if (options?.ask) {
    const ask = options.ask;
    app.post<{ Body: { materia?: string; question?: string } }>(
      "/questions",
      async (request, reply) => {
        const materia = request.body?.materia ?? "";
        const question = request.body?.question ?? "";
        if (materia.trim() === "" || question.trim() === "") {
          return reply.code(400).send({ message: "faltan materia o pregunta" });
        }

        const result = await ask.execute({ userId: localUserId, materia, question });
        if (result.kind === "abstain") {
          return { notice: result.notice };
        }

        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });

        try {
          for await (const token of result.stream) {
            reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
          reply.raw.write(`data: ${JSON.stringify({ citations: result.citations })}\n\n`);
          reply.raw.write("data: [DONE]\n\n");
        } catch (error) {
          const message = error instanceof Error ? error.message : "falló el modelo";
          reply.raw.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        }
        reply.raw.end();
        return reply;
      },
    );
  }

  if (options?.practiceGenerate) {
    const practiceGenerate = options.practiceGenerate;
    app.post<{ Body: { materia?: string; unidad?: string } }>(
      "/practice/generate",
      async (request, reply) => {
        const materia = request.body?.materia ?? "";
        const unidad = request.body?.unidad ?? "";
        if (materia.trim() === "" || unidad.trim() === "") {
          return reply.code(400).send({ message: "faltan materia o unidad" });
        }

        const result = await practiceGenerate.execute({
          userId: localUserId,
          materia: materia.trim(),
          unidad: unidad.trim(),
        });
        if (result.kind === "abstain") {
          return { notice: result.notice };
        }
        return { question: result.question };
      },
    );
  }

  if (options?.practiceGrade) {
    const practiceGrade = options.practiceGrade;
    app.post<{ Body: { materia?: string; unidad?: string; question?: string; answer?: string } }>(
      "/practice/grade",
      async (request, reply) => {
        const materia = request.body?.materia ?? "";
        const unidad = request.body?.unidad ?? "";
        const question = request.body?.question ?? "";
        const answer = request.body?.answer ?? "";
        if (
          materia.trim() === "" ||
          unidad.trim() === "" ||
          question.trim() === "" ||
          answer.trim() === ""
        ) {
          return reply.code(400).send({ message: "faltan materia, unidad, pregunta o respuesta" });
        }

        try {
          const result = await practiceGrade.execute({
            userId: localUserId,
            materia: materia.trim(),
            unidad: unidad.trim(),
            question: question.trim(),
            answer: answer.trim(),
          });
          if (result.kind === "abstain") {
            return { notice: result.notice };
          }
          return {
            verdict: result.verdict,
            citations: result.citations,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "falló la corrección";
          return reply.code(502).send({ message });
        }
      },
    );
  }

  return app;
}

function textField(field: { type?: string; value?: unknown } | { type?: string; value?: unknown }[] | undefined): string {
  const single = Array.isArray(field) ? field[0] : field;
  if (!single || single.type !== "field" || typeof single.value !== "string") {
    return "";
  }
  return single.value;
}
