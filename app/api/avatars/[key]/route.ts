import { NextResponse } from "next/server";
import { getAvatarStore } from "@/lib/avatar-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  let store;
  try {
    store = getAvatarStore();
  } catch {
    return NextResponse.json({ error: "Stockage indisponible" }, { status: 503 });
  }

  const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!blob) {
    return NextResponse.json({ error: "Avatar introuvable" }, { status: 404 });
  }

  const contentType = (blob.metadata as { contentType?: string })?.contentType ?? "image/jpeg";

  return new NextResponse(blob.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
