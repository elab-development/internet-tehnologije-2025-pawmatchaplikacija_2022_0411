"use client";

import { useMemo, useState } from "react";
import MatchPetCard from "@/components/MatchPetCard";
import { matches } from "@/lib/mock/matches";

const PAGE_SIZE = 4;
const TYPE_LABELS: Record<string, string> = {
  all: "Svi",
  dog: "Pas",
  cat: "Mačka",
};


export default function MatchesPage() {
  const [page, setPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [type, setType] = useState<string>("all");
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));

  const filteredMatches = useMemo(() => {
    if (type === "all") return matches;
    return matches.filter(
      (m) => m.otherPet.vrsta === type
    );
  }, [type]);

  const types = useMemo(() => {
    return (Object.keys(TYPE_LABELS) as Array<keyof typeof TYPE_LABELS>).map((id) => ({
      id,
      label: TYPE_LABELS[id],
    }));
  }, []);

  const visible = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredMatches.slice(start, start + PAGE_SIZE);
  }, [page, filteredMatches]);

  function nextPage() {
    setPage((p) => (p + 1) % pageCount);
    setAnimKey((k) => k + 1); // resetuje animaciju
  }

  // “recent matches” uzmi prvih 4 (ili iz matches, kako želiš)
  const recent = matches.slice(0, 4).map((m) => m.otherPet);

  return (
    <div className="container">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Matches</h1>
      </header>

      {/* Recent Matches */}
      <section className="mb-6">
        <p className="mb-3 text-sm font-semibold">Recent Matches</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {recent.map((p) => (
            <div
              key={p.id}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100"
            >
              <img
                src={p.images?.[0]}
                alt={p.ime}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>
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
              className={`px-4 py-2 text-sm rounded-2xl transition ${type === id
                  ? "bg-white shadow-sm font-semibold"
                  : "text-slate-600"
                }`}
            >
              {TYPE_LABELS[id]}
            </button>
          ))}
        </div>
      </div>


      {/* Your Matches + strelica */}
      <section className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Your Matches <span className="text-slate-500">{matches.length}</span>
          </p>

          {/* mini indikator */}
          <p className="text-xs text-slate-400">
            {page + 1}/{pageCount}
          </p>
        </div>

        {/* Grid 2x2 (samo 4) */}
        <div key={animKey} className="grid grid-cols-2 gap-4 animate-slideIn">
          {visible.map((m, i) => (
            <MatchPetCard
              key={m.match.id}
              pet={m.otherPet}
              distanceLabel={i % 2 === 0 ? "0.1km away" : "4km away"}
            />
          ))}
        </div>

        {/* Strelica desno – između prvog i drugog reda */}
        <button
          onClick={nextPage}
          className="absolute right-[-10px] top-[52%] -translate-y-1/2 rounded-full bg-white/90 shadow-md border border-slate-200 h-10 w-10 flex items-center justify-center hover:scale-105 transition"
          aria-label="Next matches"
          title="Next"
        >
          ➜
        </button>
      </section>
    </div>
  );
}
