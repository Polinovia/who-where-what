import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

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
    },
  });

  return NextResponse.json({ stories });
}
