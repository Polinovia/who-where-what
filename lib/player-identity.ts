const STORAGE_PREFIX = "www:player:";

export type StoredPlayer = { playerId: string; pseudo: string };

export function savePlayerIdentity(code: string, player: StoredPlayer) {
  localStorage.setItem(STORAGE_PREFIX + code, JSON.stringify(player));
}

export function getPlayerIdentity(code: string): StoredPlayer | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + code);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPlayer;
  } catch {
    return null;
  }
}

// getSnapshot for useSyncExternalStore must return a stable reference when
// the underlying value hasn't changed, or React treats every render as a
// fresh value and loops forever. Cache the parsed result per raw string.
const snapshotCache = new Map<string, { raw: string | null; value: StoredPlayer | null }>();

export function getPlayerIdentitySnapshot(code: string): StoredPlayer | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + code);
  const cached = snapshotCache.get(code);
  if (cached && cached.raw === raw) return cached.value;

  const value = getPlayerIdentity(code);
  snapshotCache.set(code, { raw, value });
  return value;
}

// SSR-safe subscription for reading a player's identity from localStorage.
// Use with useSyncExternalStore instead of useState+useEffect, since this
// value comes from an external system and shouldn't be synced via setState
// inside an effect.
export function subscribePlayerIdentity() {
  return () => {};
}
