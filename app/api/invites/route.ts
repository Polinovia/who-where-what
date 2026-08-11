import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const invites = await prisma.lobbyInvite.findMany({
    where: { toUserId: session.user.id, lobby: { status: "LOBBY" } },
    include: {
      lobby: { select: { code: true, name: true } },
      fromUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invites });
}
