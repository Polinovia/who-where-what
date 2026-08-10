import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { translateText } from "@/lib/translate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const viewerPlayerId = request.nextUrl.searchParams.get("playerId");
  // The reader's own UI language. Each answer/question was written/fetched
  // in whichever language its author was using at the time (see
  // lib/db/current-turn.ts), so a finished story can mix languages —
  // translate anything that doesn't match the viewer's language.
  const viewerLanguage = request.nextUrl.searchParams.get("language") === "en" ? "en" : "fr";

  const lobby = await prisma.lobby.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  if (lobby.status !== "FINISHED") {
    return NextResponse.json(
      { error: "La partie n'est pas encore terminée" },
      { status: 409 },
    );
  }

  const stories = await prisma.story.findMany({
    where: { lobbyId: lobby.id },
    include: {
      starterPlayer: { select: { id: true, pseudo: true } },
      answers: {
        orderBy: { order: "asc" },
        include: {
          question: { select: { text: true, language: true } },
          player: { select: { id: true, pseudo: true } },
        },
      },
      likes: viewerPlayerId ? { where: { playerId: viewerPlayerId } } : false,
      _count: { select: { likes: true } },
    },
  });

  const translatedStories = await Promise.all(
    stories.map(async (story) => ({
      ...story,
      answers: await Promise.all(
        story.answers.map(async (answer) => {
          const [text, questionText] = await Promise.all([
            translateText(answer.text, answer.language, viewerLanguage),
            translateText(answer.question.text, answer.question.language, viewerLanguage),
          ]);
          return { ...answer, text, question: { ...answer.question, text: questionText } };
        }),
      ),
    })),
  );

  return NextResponse.json({
    stories: translatedStories.map(({ _count, likes, ...story }) => ({
      ...story,
      likeCount: _count.likes,
      likedByMe: viewerPlayerId ? likes.length > 0 : false,
    })),
  });
}
