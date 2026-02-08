"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

  // ✅ NOVO: da ne setujemo state ako nema promena (sprečava flicker)
  const sigRef = useRef<string>("");

  async function load(isBackground = false) {
    if (!isBackground) setLoading(true);
    if (!isBackground) setErr("");

    try {
      const res = await fetch("/api/chat", {
        credentials: "include",
        cache: "no-store", // ✅ NOVO: sprečava keširanje
      });
      const raw = await res.text();

      if (!res.ok) {
        if (!isBackground) setErr(`HTTP ${res.status} – ${raw.slice(0, 200)}`);
        return;
      }

      const data = JSON.parse(raw);
      const next: ChatItem[] = Array.isArray(data.chats) ? data.chats : [];

      // ✅ NOVO: signature (matchId + createdAt + text) za detekciju promene
      const nextSig = next
        .map(
          (c) =>
            `${c.matchId}|${c.lastMessage?.createdAt ?? ""}|${
              c.lastMessage?.text ?? ""
            }`
        )
        .join("||");

      if (nextSig !== sigRef.current) {
        sigRef.current = nextSig;
        setChats(next);
      }
    } catch (e: any) {
      if (!isBackground) setErr(e?.message ?? "Fetch error");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }

  useEffect(() => {
    // ✅ inicijalno učitavanje
    load(false);

    // ✅ NOVO: polling u pozadini (ne dira loading state)
    const t = setInterval(() => load(true), 1000); // 1000ms; probaj 700-800 ako želiš "instant"
    return () => clearInterval(t);
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

                <div className="h-2 w-2 rounded-full bg-orange-500 opacity-60" />
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
