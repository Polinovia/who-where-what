import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { checkStoryLikedAchievement } from "@/lib/db/achievements";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; storyId: string }> },
) {
  const { code, storyId } = await params;
  const body = await request.json().catch(() => null);
  const playerId = body?.playerId;

  if (typeof playerId !== "string" || !playerId) {
    return NextResponse.json({ error: "playerId manquant" }, { status: 400 });
  }

  const lobby = await prisma.lobby.findUnique({ where: { code: code.toUpperCase() } });
  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  const [player, story] = await Promise.all([
    prisma.player.findFirst({ where: { id: playerId, lobbyId: lobby.id } }),
    prisma.story.findFirst({ where: { id: storyId, lobbyId: lobby.id } }),
  ]);

  if (!player || !story) {
    return NextResponse.json({ error: "Joueur ou histoire introuvable" }, { status: 404 });
  }

  const existing = await prisma.storyLike.findUnique({
    where: { storyId_playerId: { storyId, playerId } },
  });

  if (existing) {
    await prisma.storyLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.storyLike.create({ data: { storyId, playerId } });
    await checkStoryLikedAchievement(storyId);
  }

  const likeCount = await prisma.storyLike.count({ where: { storyId } });

  return NextResponse.json({ likeCount, liked: !existing });
}
