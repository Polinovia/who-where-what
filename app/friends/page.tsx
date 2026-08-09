"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFriend, listFriends } from "@/lib/api-client";

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["friends"],
    queryFn: listFriends,
    enabled: !!session?.user,
  });

  const addFriendMutation = useMutation({
    mutationFn: (friendEmail: string) => addFriend({ friendEmail }),
    onSuccess: () => {
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Erreur inattendue"),
  });

  return (
    <div className="flex flex-1 items-center justify-center bg-[#e8e1d0] px-4 py-16">
      <div className="relative w-full max-w-md rounded-2xl bg-[#faf7f0] px-10 py-14 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)]">
        <span
          aria-hidden
          className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
        />

        <Link
          href="/"
          aria-label="Back"
          className="absolute left-8 top-12 text-stone-700 hover:text-stone-900"
        >
          ←
        </Link>

        <h1 className="text-center font-[family-name:var(--font-marker)] text-3xl text-stone-900">
          Friends
        </h1>

        {status !== "loading" && !session?.user ? (
          <p className="mt-8 text-center font-[family-name:var(--font-serif)] italic text-stone-600">
            <Link href="/login" className="underline hover:text-stone-900">
              Log in
            </Link>{" "}
            to manage your friends.
          </p>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                addFriendMutation.mutate(email);
              }}
              className="mt-8 flex gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Friend's email"
                className="h-12 flex-1 rounded-xl border border-stone-300 px-4 text-stone-800 outline-none focus:border-stone-500"
              />
              <button
                type="submit"
                disabled={addFriendMutation.isPending}
                className="h-12 rounded-xl bg-[#33261c] px-5 text-stone-50 transition-colors hover:bg-[#241a13] disabled:opacity-50"
              >
                Add
              </button>
            </form>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <ul className="mt-8 flex flex-col gap-2">
              {data?.friends.length === 0 && (
                <p className="text-center font-[family-name:var(--font-serif)] italic text-stone-500">
                  No friends yet — add one above.
                </p>
              )}
              {data?.friends.map((friend) => (
                <li
                  key={friend.id}
                  className="flex items-center justify-between rounded-xl border border-stone-300 px-4 py-3"
                >
                  <span className="font-[family-name:var(--font-serif)] text-stone-800">
                    {friend.name}
                  </span>
                  <span className="text-sm text-stone-400">{friend.email}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
