import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const achievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    orderBy: { unlockedAt: "asc" },
  });

  return NextResponse.json({ achievements });
}
