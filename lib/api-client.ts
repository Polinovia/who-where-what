import type { CreateLobbyInput, JoinLobbyInput } from "@/lib/validation/lobby";
import type { AddFriendInput } from "@/lib/validation/friends";

type Lobby = {
  id: string;
  code: string;
  name: string | null;
  status: "LOBBY" | "IN_PROGRESS" | "FINISHED";
  maxPlayers: number;
  totalQuestions: number;
  categoryId: string | null;
  players: { id: string; pseudo: string; isHost: boolean }[];
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.formErrors?.[0] ?? data?.error ?? "Erreur inattendue");
  }
  return data as T;
}

export async function createLobby(input: CreateLobbyInput) {
  const res = await fetch("/api/lobby", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ lobby: Lobby }>(res);
}

export async function joinLobby(input: JoinLobbyInput) {
  const res = await fetch(`/api/lobby/${input.code}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ lobby: Lobby; player: { id: string; pseudo: string } }>(res);
}

export async function getLobby(code: string) {
  const res = await fetch(`/api/lobby/${code}`);
  return parseJson<{ lobby: Lobby }>(res);
}

type Category = { id: string; name: string };

export async function listCategories() {
  const res = await fetch("/api/categories");
  return parseJson<{ categories: Category[] }>(res);
}

type Friend = { id: string; name: string; email: string };

export async function listFriends() {
  const res = await fetch("/api/friends");
  return parseJson<{ friends: Friend[] }>(res);
}

export async function addFriend(input: AddFriendInput) {
  const res = await fetch("/api/friends", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ friend: Friend }>(res);
}
