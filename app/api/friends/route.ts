import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { addFriendSchema } from "@/lib/validation/friends";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const friendships = await prisma.friendship.findMany({
    where: { userId: session.user.id },
    include: { friend: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    friends: friendships.map((f) => f.friend),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addFriendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const { friendEmail } = parsed.data;

  const friend = await prisma.user.findUnique({ where: { email: friendEmail } });
  if (!friend) {
    return NextResponse.json(
      { error: "Aucun utilisateur avec cet email" },
      { status: 404 },
    );
  }

  if (friend.id === userId) {
    return NextResponse.json(
      { error: "Tu ne peux pas t'ajouter toi-même" },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction([
      prisma.friendship.create({
        data: { userId, friendId: friend.id },
      }),
      prisma.friendship.create({
        data: { userId: friend.id, friendId: userId },
      }),
    ]);
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Vous êtes déjà amis" },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json(
    { friend: { id: friend.id, name: friend.name, email: friend.email } },
    { status: 201 },
  );
}
