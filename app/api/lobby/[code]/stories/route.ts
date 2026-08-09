import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const viewerPlayerId = request.nextUrl.searchParams.get("playerId");

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
          question: { select: { text: true } },
          player: { select: { id: true, pseudo: true } },
        },
      },
      likes: viewerPlayerId ? { where: { playerId: viewerPlayerId } } : false,
      _count: { select: { likes: true } },
    },
  });

  return NextResponse.json({
    stories: stories.map(({ _count, likes, ...story }) => ({
      ...story,
      likeCount: _count.likes,
      likedByMe: viewerPlayerId ? likes.length > 0 : false,
    })),
  });
}
