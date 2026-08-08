import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const kickSchema = z.object({
  requesterPlayerId: z.string().min(1),
  targetPlayerId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const parsed = kickSchema.safeParse(body);

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

  const requester = lobby.players.find((p) => p.id === parsed.data.requesterPlayerId);
  if (!requester?.isHost) {
    return NextResponse.json(
      { error: "Seul l'hôte peut exclure un joueur" },
      { status: 403 },
    );
  }

  if (parsed.data.targetPlayerId === requester.id) {
    return NextResponse.json(
      { error: "Tu ne peux pas t'exclure toi-même" },
      { status: 400 },
    );
  }

  const target = lobby.players.find((p) => p.id === parsed.data.targetPlayerId);
  if (!target) {
    return NextResponse.json(
      { error: "Joueur introuvable dans ce lobby" },
      { status: 404 },
    );
  }

  await prisma.player.delete({ where: { id: target.id } });

  const updatedLobby = await prisma.lobby.findUnique({
    where: { id: lobby.id },
    include: { players: true },
  });

  return NextResponse.json({ lobby: updatedLobby });
}
