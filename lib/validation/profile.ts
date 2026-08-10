import { z } from "zod";

export const updateProfileSchema = z.object({
  bio: z.string().trim().max(120, "120 caractères max.").optional(),
  avatarUrl: z.union([z.string().trim().url("URL invalide"), z.literal("")]).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
