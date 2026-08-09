import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const language = request.nextUrl.searchParams.get("language") ?? "fr";

  const categories = await prisma.category.findMany({
    where: { questions: { some: { language } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}
