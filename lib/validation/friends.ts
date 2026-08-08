import { z } from "zod";

export const addFriendSchema = z.union([
  z.object({ friendEmail: z.string().trim().toLowerCase().email() }),
  z.object({ userId: z.string().min(1) }),
]);
export type AddFriendInput = z.infer<typeof addFriendSchema>;
