import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { setReadySchema } from "@/lib/validation/lobby";
import { startLobby } from "@/lib/db/start-lobby";
import { translateLobbyName } from "@/lib/translate";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const viewerLanguage = request.nextUrl.searchParams.get("language");
  const body = await request.json().catch(() => null);
  const parsed = setReadySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

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

  const player = lobby.players.find((p) => p.id === parsed.data.playerId);
  if (!player) {
    return NextResponse.json(
      { error: "Joueur introuvable dans ce lobby" },
      { status: 404 },
    );
  }

  const updatedLobby = await prisma.$transaction(async (tx) => {
    await tx.player.update({
      where: { id: player.id },
      data: { ready: parsed.data.ready },
    });

    const players = await tx.player.findMany({ where: { lobbyId: lobby.id } });
    const allReady = players.length >= 2 && players.every((p) => p.ready);

    if (!allReady) {
      return tx.lobby.findUniqueOrThrow({
        where: { id: lobby.id },
        include: { players: true },
      });
    }

    return startLobby(tx, lobby.id, players);
  });

  return NextResponse.json({ lobby: await translateLobbyName(updatedLobby, viewerLanguage) });
}
