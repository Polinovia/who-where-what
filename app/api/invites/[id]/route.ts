import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const invite = await prisma.lobbyInvite.findUnique({ where: { id } });
  if (!invite || invite.toUserId !== session.user.id) {
    return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
  }

  await prisma.lobbyInvite.delete({ where: { id } });

  return NextResponse.json({ status: "ok" });
}
