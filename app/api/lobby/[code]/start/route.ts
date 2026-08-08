import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { startLobby } from "@/lib/db/start-lobby";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const lobby = await prisma.lobby.findUnique({
    where: { code: code.toUpperCase() },
    include: { players: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  if (lobby.status !== "LOBBY") {
    return NextResponse.json(
      { error: "La partie a déjà commencé" },
      { status: 409 },
    );
  }

  if (lobby.players.length < 2) {
    return NextResponse.json(
      { error: "Il faut au moins 2 joueurs pour commencer" },
      { status: 409 },
    );
  }

  const updatedLobby = await prisma.$transaction((tx) =>
    startLobby(tx, lobby.id, lobby.players),
  );

  return NextResponse.json({ lobby: updatedLobby });
}
