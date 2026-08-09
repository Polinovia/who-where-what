import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { updateProfileSchema } from "@/lib/validation/profile";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  playerCode: true,
  avatarUrl: true,
  bio: true,
} as const;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const [user, friendsCount, gamesPlayed] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: profileSelect }),
    prisma.friendship.count({ where: { userId: session.user.id } }),
    prisma.lobby.count({
      where: { status: "FINISHED", players: { some: { userId: session.user.id } } },
    }),
  ]);

  return NextResponse.json({ user, stats: { friendsCount, gamesPlayed } });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { bio, avatarUrl } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(bio !== undefined ? { bio: bio || null } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
    },
    select: profileSelect,
  });

  return NextResponse.json({ user });
}
