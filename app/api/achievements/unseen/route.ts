import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

// Fetch-and-consume: returns achievements unlocked since the last call and
// marks them seen in the same request, so each unlock is only ever
// reported to the client once.
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const unseen = await prisma.userAchievement.findMany({
    where: { userId: session.user.id, seen: false },
  });

  if (unseen.length > 0) {
    await prisma.userAchievement.updateMany({
      where: { id: { in: unseen.map((a) => a.id) } },
      data: { seen: true },
    });
  }

  return NextResponse.json({ achievements: unseen });
}
