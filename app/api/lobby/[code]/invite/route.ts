import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { inviteToLobbySchema } from "@/lib/validation/lobby";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const parsed = inviteToLobbySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lobby = await prisma.lobby.findUnique({
    where: { code: code.toUpperCase() },
    include: { players: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  if (lobby.status !== "LOBBY") {
    return NextResponse.json({ error: "La partie a déjà commencé" }, { status: 409 });
  }

  const requester = lobby.players.find((p) => p.id === parsed.data.requesterPlayerId);
  if (!requester?.isHost) {
    return NextResponse.json({ error: "Seul l'hôte peut inviter des amis" }, { status: 403 });
  }
  if (!requester.userId) {
    return NextResponse.json(
      { error: "Connecte-toi pour inviter des amis" },
      { status: 403 },
    );
  }

  const { toUserId } = parsed.data;

  const friendship = await prisma.friendship.findUnique({
    where: { userId_friendId: { userId: requester.userId, friendId: toUserId } },
  });
  if (!friendship) {
    return NextResponse.json({ error: "Vous n'êtes pas amis" }, { status: 403 });
  }

  if (lobby.players.some((p) => p.userId === toUserId)) {
    return NextResponse.json(
      { error: "Cet ami est déjà dans la partie" },
      { status: 409 },
    );
  }

  if (lobby.players.length >= lobby.maxPlayers) {
    return NextResponse.json({ error: "La partie est complète" }, { status: 409 });
  }

  try {
    await prisma.lobbyInvite.create({
      data: { lobbyId: lobby.id, fromUserId: requester.userId, toUserId },
    });
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002") {
      // Already invited — treat as success, nothing more to do.
    } else {
      throw err;
    }
  }

  return NextResponse.json({ status: "ok" }, { status: 201 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const requesterPlayerId = request.nextUrl.searchParams.get("requesterPlayerId");
  if (!requesterPlayerId) {
    return NextResponse.json({ error: "requesterPlayerId manquant" }, { status: 400 });
  }

  const lobby = await prisma.lobby.findUnique({
    where: { code: code.toUpperCase() },
    include: { players: true },
  });
  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  const requester = lobby.players.find((p) => p.id === requesterPlayerId);
  if (!requester?.isHost) {
    return NextResponse.json({ error: "Seul l'hôte peut voir les invitations" }, { status: 403 });
  }

  const invites = await prisma.lobbyInvite.findMany({
    where: { lobbyId: lobby.id },
    select: { toUserId: true },
  });

  return NextResponse.json({ invitedUserIds: invites.map((i) => i.toUserId) });
}
