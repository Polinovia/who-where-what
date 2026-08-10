import { getStore } from "@netlify/blobs";

/**
 * Zero-config `getStore` only finds Netlify's context automatically when
 * running on Netlify itself (deployed, or via `netlify dev`). Plain `next
 * dev` has no such context, so local testing needs an explicit site ID +
 * token (from a Netlify personal access token) — see .env's comment.
 */
export function getAvatarStore() {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;

  if (siteID && token) {
    return getStore({ name: "avatars", siteID, token });
  }

  return getStore("avatars");
}
