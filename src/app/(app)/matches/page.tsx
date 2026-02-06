"use client";

import { useEffect, useMemo, useState } from "react";
import MatchPetCard from "@/components/MatchPetCard";

const PAGE_SIZE = 4;
const TYPE_LABELS: Record<string, string> = {
  all: "Svi",
  dog: "Pas",
  cat: "Mačka",
};

type ApiMatch = {
  match: { id: string; createdAt: string };
  otherPet: {
    id: string;
    ime: string;
    opis: string;
    vrsta: string;
    images: string[];
  };
};

export default function MatchesPage() {
  const [data, setData] = useState<ApiMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [type, setType] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/matches", { credentials: "include" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error ?? "Greška pri učitavanju match-eva");
        }
        const j = await res.json();
        setData(j.matches ?? []);
      } catch (e: any) {
        setErr(e.message ?? "Greška");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredMatches = useMemo(() => {
    if (type === "all") return data;
    return data.filter((m) => m.otherPet.vrsta === type);
  }, [type, data]);

  const pageCount = Math.max(1, Math.ceil(filteredMatches.length / PAGE_SIZE));

  const visible = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredMatches.slice(start, start + PAGE_SIZE);
  }, [page, filteredMatches]);

  function nextPage() {
    setPage((p) => (p + 1) % pageCount);
    setAnimKey((k) => k + 1);
  }
  function prevPage() {
    setPage((p) => (p - 1 + pageCount) % pageCount);
    setAnimKey((k) => k + 1);
  }

  const recent = filteredMatches.slice(0, 4).map((m) => m.otherPet);

  if (loading) return <div className="container min-h-screen p-4">Učitavam...</div>;
  if (err) return <div className="container min-h-screen p-4 text-red-600">{err}</div>;

  return (
    <div className="container min-h-screen">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Matches</h1>
      </header>

      {/* Recent Matches */}
      <section className="mb-6">
        <p className="mb-3 text-sm font-semibold">Recent Matches</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {recent.map((p) => (
            <div key={p.id} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <img src={p.images?.[0]} alt={p.ime} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Filter */}
      <div className="my-4">
        <p className="mb-2 text-sm font-semibold">Vrsta ljubimca</p>
        <div className="inline-flex rounded-2xl bg-slate-100 p-1">
          {["all", "dog", "cat"].map((id) => (
            <button
              key={id}
              onClick={() => {
                setType(id);
                setPage(0);
                setAnimKey((k) => k + 1);
              }}
              className={`px-4 py-2 text-sm rounded-2xl transition ${
                type === id ? "bg-white shadow-sm font-semibold" : "text-slate-600"
              }`}
            >
              {TYPE_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Your Matches <span className="text-slate-500">{filteredMatches.length}</span>
          </p>
          <p className="text-xs text-slate-400">
            {page + 1}/{pageCount}
          </p>
        </div>

        <div className="relative">
          <div key={animKey} className="grid grid-cols-2 gap-4 animate-slideIn">
            {visible.map((m, i) => (
              <MatchPetCard
                key={m.match.id}
                pet={m.otherPet}
                distanceLabel={i % 2 === 0 ? "0.1km away" : "4km away"}
              />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="pointer-events-none absolute inset-y-0 left-[-12px] right-[-12px] flex items-center justify-between">
              <button onClick={prevPage} className="pointer-events-auto h-11 w-11 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center backdrop-blur active:scale-95 transition">
                ‹
              </button>
              <button onClick={nextPage} className="pointer-events-auto h-11 w-11 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center backdrop-blur active:scale-95 transition">
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="h-[220px]" />
    </div>
  );
}

