"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [otherName, setOtherName] = useState<string>("Chat");
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);

  // ✅ NOVO: signature da ne radimo setState ako nema promena
  const sigRef = useRef<string>("");
  // ✅ NOVO: autoscroll anchor
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const apiUrl = useMemo(() => {
    if (!matchId) return "";
    return `/api/matches/${matchId}/message`;
  }, [matchId]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  async function load(isBackground = false) {
    if (!apiUrl) return;

    if (!isBackground) setLoading(true);
    if (!isBackground) setErr("");

    try {
      const res = await fetch(apiUrl, {
        credentials: "include",
        cache: "no-store", // ✅ NOVO
      });
      const raw = await res.text();

      if (!res.ok) {
        if (!isBackground) setErr(`HTTP ${res.status} – ${raw.slice(0, 200)}`);
        return;
      }

      const data = JSON.parse(raw);

      // meta
      const nextOtherName = data?.otherPet?.ime ?? "Chat";
      const nextOtherAvatar = data?.otherPet?.avatar ?? null;
      const nextMyPetId = data?.myPetId ?? null;

      // messages
      const nextMessages: MessageDto[] = Array.isArray(data.messages)
        ? data.messages
        : [];

      // ✅ NOVO: signature (poslednja poruka je dovoljna)
      const last = nextMessages[nextMessages.length - 1];
      const nextSig = `${last?.id ?? ""}|${last?.createdAt ?? ""}|${
        last?.text ?? ""
      }|${nextMessages.length}`;

      // update meta (ovo može i bez sig-a)
      setOtherName(nextOtherName);
      setOtherAvatar(nextOtherAvatar);
      setMyPetId(nextMyPetId);

      // update messages samo ako ima promene
      if (nextSig !== sigRef.current) {
        sigRef.current = nextSig;
        setMessages(nextMessages);

        // ✅ NOVO: skroluj dole kad dođe novo
        // (malo odloži da DOM stigne da se nacrta)
        setTimeout(scrollToBottom, 0);
      }
    } catch (e: any) {
      if (!isBackground) setErr(e?.message ?? "Fetch error");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }

  useEffect(() => {
    if (!matchId) return;

    load(false);

    // ✅ NOVO: polling (pozadinski)
    const t = setInterval(() => load(true), 900); // probaj 700-1000ms
    return () => clearInterval(t);
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
      const msg = data?.message as MessageDto | undefined;

      setText("");

      if (msg?.id) {
        setMessages((prev) => {
          // ✅ spreči dupliranje ako polling u međuvremenu povuče isto
          if (prev.some((x) => x.id === msg.id)) return prev;
          const next = [...prev, msg];
          // update sig odmah
          sigRef.current = `${msg.id}|${msg.createdAt}|${msg.text}|${next.length}`;
          return next;
        });

        // ✅ skrol odmah
        setTimeout(scrollToBottom, 0);
      } else {
        await load(true);
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
              <img
                src={otherAvatar}
                alt={otherName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center">🐾</div>
            )}
          </div>

          <h1 className="text-lg font-semibold">{otherName}</h1>
        </div>
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
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "ml-auto bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.text}
              </div>
            );
          })}

          {/* ✅ NOVO: scroll anchor */}
          <div ref={bottomRef} />
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
