import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { generatePlayerCode } from "@/lib/player-code";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let user;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      user = await prisma.user.create({
        data: { name, email, passwordHash, playerCode: generatePlayerCode() },
        select: { id: true, name: true, email: true, playerCode: true },
      });
      break;
    } catch (err) {
      const isCodeCollision =
        err instanceof Error &&
        "code" in err &&
        (err as { code?: string }).code === "P2002" &&
        (err as { meta?: { target?: string[] } }).meta?.target?.includes("playerCode");
      if (!isCodeCollision) throw err;
    }
  }
  if (!user) {
    return NextResponse.json({ error: "Erreur inattendue" }, { status: 500 });
  }

  return NextResponse.json({ user }, { status: 201 });
}
