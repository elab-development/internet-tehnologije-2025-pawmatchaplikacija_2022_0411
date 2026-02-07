"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MessageDto = {
  id: string;
  senderPetId: string;
  text: string;
  createdAt: string;
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = (params?.matchId as string) ?? "";

  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [myPetId, setMyPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState<string>("Chat");//
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);//

  const apiUrl = useMemo(() => {
    if (!matchId) return "";
    return `/api/matches/${matchId}/message`;
  }, [matchId]);

  async function load() {
    if (!apiUrl) return;
    setLoading(true);
    setErr("");

    try {
      const res = await fetch(apiUrl, { credentials: "include" });
      const raw = await res.text();

      if (!res.ok) {
        setErr(`HTTP ${res.status} – ${raw.slice(0, 200)}`);
        return;
      }

      const data = JSON.parse(raw);
      setOtherName(data?.otherPet?.ime ?? "Chat");//
      setOtherAvatar(data?.otherPet?.avatar ?? null);//

      setMyPetId(data.myPetId ?? null);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (e: any) {
      setErr(e?.message ?? "Fetch error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!matchId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  async function send() {
    const t = text.trim();
    if (!t || !apiUrl || sending) return;

    setSending(true);
    setErr("");

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text: t }),
      });

      const raw = await res.text();
      if (!res.ok) {
        setErr(`HTTP ${res.status} – ${raw.slice(0, 200)}`);
        return;
      }

      const data = JSON.parse(raw);
      const msg = data?.message;

      if (msg?.id) {
        setMessages((prev) => [...prev, msg]);
        setText("");
      } else {
        // fallback: refetch
        await load();
        setText("");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Send error");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[420px] px-5 pt-6 pb-28">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white"
          type="button"
        >
          ←
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
            {otherAvatar ? (
              <img src={otherAvatar} alt={otherName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center">🐾</div>
            )}
          </div>

          <h1 className="text-lg font-semibold">{otherName}</h1>
        </div>

        {/* <h1 className="text-lg font-semibold">Chat</h1>*/}
      </div>

      {loading && <p className="mt-6 text-slate-500">Učitavam poruke...</p>}
      {!!err && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </p>
      )}

      {!loading && !err && (
        <div className="mt-6 space-y-3">
          {messages.map((m) => {
            const mine = myPetId && m.senderPetId === myPetId;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine
                  ? "ml-auto bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-800"
                  }`}
              >
                {m.text}
              </div>
            );
          })}
        </div>
      )}

      {/* composer */}
      <div className="fixed inset-x-0 bottom-0">
        <div className="mx-auto w-full max-w-[420px] px-5 pb-5">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Napiši poruku..."
              className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={sending || !text.trim()}
              className="h-11 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
