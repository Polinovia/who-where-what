import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generatePlayerCode = customAlphabet(alphabet, 8);
