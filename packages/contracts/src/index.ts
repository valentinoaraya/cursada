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

export type Citation = z.infer<typeof citationSchema>;
export type Abstain = z.infer<typeof abstainSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type IngestResultView = z.infer<typeof ingestResultSchema>;

