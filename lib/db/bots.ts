import type { Prisma } from "@/lib/generated/prisma/client";
import { resolveCurrentTurn } from "@/lib/db/current-turn";

type LobbyForBots = { id: string; currentRound: number; categoryId: string | null; language: string };
type PlayerForBots = { id: string; seat: number | null; isBot: boolean; kicked: boolean };

const FALLBACK_ANSWER = "...";

// Bots answer the moment a round becomes available to them — a solo tester
// is never left waiting on one. Idempotent: safe to call even if some bots
// in the round already have an answer (e.g. called from more than one
// round-advance path).
export async function submitBotAnswers(
  db: Prisma.TransactionClient,
  lobby: LobbyForBots,
  players: PlayerForBots[],
  round: number,
) {
  const bots = players.filter((p) => p.isBot && !p.kicked);
  if (bots.length === 0) return;

  await Promise.all(
    bots.map(async (bot) => {
      const turn = await resolveCurrentTurn(
        { ...lobby, currentRound: round },
        players,
        bot,
        lobby.language,
        db,
      );
      if (!turn) return;

      const options = turn.question.placeholders;
      const text = options.length > 0 ? options[Math.floor(Math.random() * options.length)] : FALLBACK_ANSWER;

      try {
        await db.answer.create({
          data: {
            storyId: turn.story.id,
            questionId: turn.question.id,
            playerId: bot.id,
            order: round + 1,
            text,
            language: lobby.language,
          },
        });
      } catch (err) {
        if (err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002") {
          return;
        }
        throw err;
      }
    }),
  );
}
