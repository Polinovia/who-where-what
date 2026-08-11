import { NextResponse } from "next/server";
import { getAvatarStore } from "@/lib/avatar-store";

// Netlify's durable data cache for Next.js Route Handlers doesn't vary
// correctly by this route's catch-all segments — a long-lived Cache-Control
// here caused it to keep serving one user's *first-ever* upload after every
// later re-upload, no matter how the URL was cache-busted. Avatars are tiny
// and requested rarely, so it's not worth chasing a caching scheme here —
// force every request straight to the blob store instead.
export const dynamic = "force-dynamic";

// Accepts /api/avatars/{userId} or /api/avatars/{userId}/{version} — the
// optional version segment exists only so a re-upload gets a fresh URL for
// the browser's own cache to key on (it doesn't affect what gets read).
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
      "Cache-Control": "no-store",
    },
  });
}
