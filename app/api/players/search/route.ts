import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Code manquant" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { playerCode: code },
    select: { id: true, name: true, playerCode: true, avatarUrl: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Aucun joueur avec cet ID" }, { status: 404 });
  }

  return NextResponse.json({ player: user });
}
