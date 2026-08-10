import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { translateLobbyName } from "@/lib/translate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const viewerLanguage = request.nextUrl.searchParams.get("language");

  const lobby = await prisma.lobby.findUnique({
    where: { code: code.toUpperCase() },
    include: { players: true },
  });

  if (!lobby) {
    return NextResponse.json({ error: "Lobby introuvable" }, { status: 404 });
  }

  return NextResponse.json({ lobby: await translateLobbyName(lobby, viewerLanguage) });
}
