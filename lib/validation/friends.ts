import { z } from "zod";

export const addFriendSchema = z.object({
  friendEmail: z.string().trim().toLowerCase().email(),
});
export type AddFriendInput = z.infer<typeof addFriendSchema>;
