import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { getAvatarStore } from "@/lib/avatar-store";

const MAX_BYTES = 5 * 1024 * 1024;

const profileSelect = {
  id: true,
  name: true,
  email: true,
  playerCode: true,
  avatarUrl: true,
  bio: true,
} as const;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Le fichier doit être une image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image trop lourde (5 Mo max)" }, { status: 400 });
  }

  const key = session.user.id;
  try {
    const store = getAvatarStore();
    await store.set(key, await file.arrayBuffer(), { metadata: { contentType: file.type } });
  } catch {
    return NextResponse.json(
      {
        error:
          "Le stockage des avatars n'est pas configuré pour le développement local (nécessite `netlify dev` ou NETLIFY_BLOBS_SITE_ID/NETLIFY_BLOBS_TOKEN dans .env).",
      },
      { status: 503 },
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: `/api/avatars/${key}?v=${Date.now()}` },
    select: profileSelect,
  });

  return NextResponse.json({ user });
}
