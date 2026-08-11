import { NextResponse } from "next/server";
import { getAvatarStore } from "@/lib/avatar-store";

// Accepts /api/avatars/{userId} or /api/avatars/{userId}/{version} — the
// optional version segment only exists to bust Netlify's edge cache (it
// varies by path, not by query string, so a `?v=` param on a single-segment
// URL would silently keep serving the first-ever upload forever).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const key = slug[0];

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
