import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { joinLobbySchema } from "@/lib/validation/lobby";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const session = await auth();
  const body = await request.json().catch(() => null);
  const parsed = joinLobbySchema.safeParse({ ...(body ?? {}), code });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lobby = await prisma.lobby.findUnique({
    where: { code: parsed.data.code },
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

  if (lobby.players.length >= lobby.maxPlayers) {
    return NextResponse.json({ error: "Lobby complet" }, { status: 409 });
  }

  try {
    const player = await prisma.player.create({
      data: {
        lobbyId: lobby.id,
        pseudo: parsed.data.pseudo,
        isHost: false,
        userId: session?.user?.id,
      },
    });

    return NextResponse.json({ lobby, player }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ce pseudo est déjà pris dans ce lobby" },
        { status: 409 },
      );
    }
    throw err;
  }
}
