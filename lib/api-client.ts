import type {
  CreateLobbyInput,
  JoinLobbyInput,
  SetReadyInput,
  SubmitAnswerInput,
} from "@/lib/validation/lobby";
import type { AddFriendInput } from "@/lib/validation/friends";
import type { UpdateProfileInput } from "@/lib/validation/profile";

type Lobby = {
  id: string;
  code: string;
  name: string | null;
  status: "LOBBY" | "IN_PROGRESS" | "FINISHED";
  maxPlayers: number;
  totalQuestions: number;
  currentRound: number;
  categoryId: string | null;
  language: string;
  players: {
    id: string;
    pseudo: string;
    isHost: boolean;
    ready: boolean;
    seat: number | null;
    userId: string | null;
    kicked: boolean;
  }[];
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const error = data?.error;
    const fieldErrors = (error?.fieldErrors ?? {}) as Record<string, string[]>;
    const message =
      typeof error === "string"
        ? error
        : (error?.formErrors?.[0] ?? Object.values(fieldErrors)[0]?.[0] ?? "Erreur inattendue");
    throw new Error(message);
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

export async function getLobby(code: string, language?: string) {
  const qs = language ? `?language=${encodeURIComponent(language)}` : "";
  const res = await fetch(`/api/lobby/${code}${qs}`);
  return parseJson<{ lobby: Lobby }>(res);
}

export async function setReady(code: string, input: SetReadyInput, language?: string) {
  const qs = language ? `?language=${encodeURIComponent(language)}` : "";
  const res = await fetch(`/api/lobby/${code}/ready${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ lobby: Lobby }>(res);
}

type CurrentQuestion =
  | { status: "answer"; round: number; totalQuestions: number; storyId: string; question: { id: string; text: string } }
  | { status: "waiting"; round: number; totalQuestions: number; waitingOn: string[] }
  | { status: "finished" };

export async function getCurrentQuestion(code: string, playerId: string, language: string) {
  const res = await fetch(
    `/api/lobby/${code}/question?playerId=${encodeURIComponent(playerId)}&language=${encodeURIComponent(language)}`,
  );
  return parseJson<CurrentQuestion>(res);
}

export async function submitAnswer(code: string, input: SubmitAnswerInput) {
  const res = await fetch(`/api/lobby/${code}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ status: "ok" }>(res);
}

type FinishedStory = {
  id: string;
  starterPlayer: { id: string; pseudo: string };
  answers: {
    order: number;
    text: string;
    question: { text: string };
    player: { id: string; pseudo: string };
  }[];
  likeCount: number;
  likedByMe: boolean;
};

export async function getFinishedStories(code: string, playerId?: string, language?: string) {
  const query = new URLSearchParams();
  if (playerId) query.set("playerId", playerId);
  if (language) query.set("language", language);
  const qs = query.toString();
  const res = await fetch(`/api/lobby/${code}/stories${qs ? `?${qs}` : ""}`);
  return parseJson<{ stories: FinishedStory[] }>(res);
}

export async function likeStory(code: string, storyId: string, playerId: string) {
  const res = await fetch(`/api/lobby/${code}/stories/${storyId}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId }),
  });
  return parseJson<{ likeCount: number; liked: boolean }>(res);
}

type Category = { id: string; name: string };

export async function listCategories(language: string) {
  const res = await fetch(`/api/categories?language=${encodeURIComponent(language)}`);
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

export async function startLobbyNow(
  code: string,
  input: { requesterPlayerId: string },
  language?: string,
) {
  const qs = language ? `?language=${encodeURIComponent(language)}` : "";
  const res = await fetch(`/api/lobby/${code}/start${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ lobby: Lobby }>(res);
}

type Achievement = { id: string; type: string; relatedUserId: string; unlockedAt: string };

export async function listAchievements() {
  const res = await fetch("/api/achievements");
  return parseJson<{ achievements: Achievement[] }>(res);
}

type Profile = {
  id: string;
  name: string;
  email: string;
  playerCode: string;
  avatarUrl: string | null;
  bio: string | null;
};

type ProfileStats = { friendsCount: number; gamesPlayed: number; points: number };

export async function getProfile() {
  const res = await fetch("/api/profile");
  return parseJson<{ user: Profile; stats: ProfileStats }>(res);
}

export async function updateProfile(input: UpdateProfileInput) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ user: Profile }>(res);
}

export async function uploadAvatar(file: Blob) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
  return parseJson<{ user: Profile }>(res);
}

type PlayerSearchResult = { id: string; name: string; playerCode: string; avatarUrl: string | null };

export async function searchPlayerByCode(code: string) {
  const res = await fetch(`/api/players/search?code=${encodeURIComponent(code)}`);
  return parseJson<{ player: PlayerSearchResult }>(res);
}

export async function kickPlayer(
  code: string,
  input: { requesterPlayerId: string; targetPlayerId: string },
  language?: string,
) {
  const qs = language ? `?language=${encodeURIComponent(language)}` : "";
  const res = await fetch(`/api/lobby/${code}/kick${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{ lobby: Lobby }>(res);
}
