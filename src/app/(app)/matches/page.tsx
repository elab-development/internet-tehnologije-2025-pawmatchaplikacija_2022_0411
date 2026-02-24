"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MatchItem = {
  match: { id: string; createdAt: string | null };
  myPetId: string;
  otherPet: {
    id: string;
    ime: string;
    grad: string | null;
    images?: string[];
  };
};

export default function MatchesPage() {
  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/matches", { credentials: "include" });
      const data = await r.json();
      setItems(data.matches ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-[420px] px-5 pt-6">Loading...</div>;
  }

  return (
    <main className="mx-auto w-full max-w-[420px] px-5 pb-28 pt-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Matches</h1>

      <div className="mt-5 space-y-3">
        {items.map((m) => {
          const img = m.otherPet.images?.[0];

          return (
            <Link
              key={m.match.id}
              href={`/matches/${m.otherPet.id}?matchId=${m.match.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md active:scale-[0.99]"
              aria-label={`Open ${m.otherPet.ime} profile`}
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                  {img ? (
                    <img
                      src={img}
                      alt={m.otherPet.ime}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {m.otherPet.ime}
                  </div>
                  <div className="truncate text-sm text-slate-500">
                    {m.otherPet.grad ?? "—"}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {items.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-slate-600">
            Nema match-eva još.
          </div>
        )}
      </div>
    </main>
  );
}
