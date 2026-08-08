import { z } from "zod";

export const pseudoSchema = z
  .string()
  .trim()
  .min(2, "2 caractères minimum")
  .max(20, "20 caractères maximum");

export const totalQuestionsSchema = z
  .number()
  .int()
  .min(4, "4 questions minimum")
  .max(20, "20 questions maximum");

export const createLobbySchema = z.object({
  pseudo: pseudoSchema,
  name: z.string().trim().min(1).max(40).optional(),
  totalQuestions: totalQuestionsSchema.optional().default(8),
  categoryId: z.string().min(1).optional(),
});
export type CreateLobbyInput = z.infer<typeof createLobbySchema>;

export const joinLobbySchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Le code fait 6 caractères")
    .toUpperCase(),
  pseudo: pseudoSchema,
});
export type JoinLobbyInput = z.infer<typeof joinLobbySchema>;

export const submitAnswerSchema = z.object({
  storyId: z.string().min(1),
  text: z.string().trim().min(1, "Réponse requise").max(120, "120 caractères maximum"),
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
