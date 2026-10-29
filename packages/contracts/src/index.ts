import { z } from "zod";

export const citationSchema = z.object({
  chunkId: z.string().min(1),
  docId: z.string().min(1),
  pagina: z.number().int().positive(),
});

export const answerSchema = z.object({
  answer: z.string(),
  citations: z.array(citationSchema),
});

export type Citation = z.infer<typeof citationSchema>;
export type Answer = z.infer<typeof answerSchema>;
