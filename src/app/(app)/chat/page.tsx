"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ChatItem = {
  matchId: string;
  otherPet: {
    id: string;
    ime: string;
    vrsta: string;
    grad: string;
    avatar: string | null;
  };
  lastMessage: null | {
    text: string;
    createdAt: string;
    senderPetId: string;
  };
};

function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatInboxPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/chat", { credentials: "include" });
      const raw = await res.text();

      if (!res.ok) {
        setErr(`HTTP ${res.status} – ${raw.slice(0, 200)}`);
        return;
      }

      const data = JSON.parse(raw);
      setChats(Array.isArray(data.chats) ? data.chats : []);
    } catch (e: any) {
      setErr(e?.message ?? "Fetch error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-28">
      <h1 className="text-xl font-semibold text-slate-900">Messages</h1>

      {loading && <p className="mt-6 text-slate-500">Učitavam...</p>}

      {!!err && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </p>
      )}

      {!loading && !err && chats.length === 0 && (
        <p className="mt-6 text-slate-500">Još nemaš poruke.</p>
      )}

      {!loading && !err && chats.length > 0 && (
        <div className="mt-4 space-y-2">
          {chats.map((c) => {
            const avatar = c.otherPet.avatar;

            return (
              <Link
                key={c.matchId}
                href={`/chat/${c.matchId}`}
                className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm border border-slate-100 hover:bg-slate-50 transition"
              >
                {/* avatar */}
                <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={c.otherPet.ime}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-lg">
                      🐾
                    </div>
                  )}
                </div>

                {/* text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-slate-900">
                      {c.otherPet.ime}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatTime(c.lastMessage?.createdAt)}
                    </p>
                  </div>

                  <p className="truncate text-sm text-slate-500">
                    {c.lastMessage?.text ?? "Nema poruka još."}
                  </p>
                </div>

                {/* dot (placeholder za unread) */}
                <div className="h-2 w-2 rounded-full bg-orange-500 opacity-60" />
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
