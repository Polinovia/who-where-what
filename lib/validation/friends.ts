import { z } from "zod";

export const addFriendSchema = z.object({ userId: z.string().min(1) });
export type AddFriendInput = z.infer<typeof addFriendSchema>;
