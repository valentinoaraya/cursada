import { z } from "zod";

export const citationSchema = z.object({
  filename: z.string().min(1),
  pagina: z.number().int().positive(),
});

export const abstainSchema = z.object({
  notice: z.literal("No está en tu material"),
});

export const answerSchema = z.object({
  answer: z.string(),
  citations: z.array(citationSchema),
});

export const ingestResultSchema = z.object({
  documentId: z.string().min(1),
  alreadyIndexed: z.boolean(),
  chunkCount: z.number().int().nonnegative(),
});

export const practiceQuestionSchema = z.object({
  question: z.string().min(1),
});

export const practiceGradeSchema = z.object({
  verdict: z.enum(["Está bien", "Fallaste"]),
  citations: z.array(citationSchema),
});

export type Citation = z.infer<typeof citationSchema>;
export type Abstain = z.infer<typeof abstainSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type IngestResultView = z.infer<typeof ingestResultSchema>;
export type PracticeQuestionView = z.infer<typeof practiceQuestionSchema>;
export type PracticeGradeView = z.infer<typeof practiceGradeSchema>;

export const failedPracticeListSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      unidad: z.string().min(1),
    }),
  ),
});

export type FailedPracticeListView = z.infer<typeof failedPracticeListSchema>;

