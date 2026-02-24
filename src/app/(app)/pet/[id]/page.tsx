"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type PetImage = {
  id: string;
  url: string;
  sortOrder: number;
};

type PetDetails = {
  id: string;
  ime: string;
  opis: string;
  vrsta: string;
  datumRodjenja?: string | null;
  pol?: string | null;
  grad?: string | null;
  interesovanja?: string | null;
  images?: PetImage[];
  vlasnikId?: string;
};

export default function PetProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [pet, setPet] = useState<PetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [liking, setLiking] = useState(false);
  const [likeMsg, setLikeMsg] = useState<string | null>(null);

  // ✅ match stanje (da dugme bude Chat umesto Like)
  const [isMatched, setIsMatched] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadPet() {
      setLoading(true);
      setError(null);

      try {
        // 1) ucitaj pet profil
        const res = await fetch(`/api/pet/${id}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          setError(json?.error ?? "Ne mogu da učitam ljubimca");
          setPet(null);
          return;
        }

        setPet(json.pet);

        // 2) ✅ proveri match status DIREKTNO za ovog ljubimca
        try {
          const msRes = await fetch(`/api/matches/status?petId=${id}`);
          const msJson = await msRes.json();

          if (msRes.ok && msJson?.ok) {
            setIsMatched(!!msJson.matched);
            setMatchId(msJson.matchId ?? null);
          } else {
            setIsMatched(false);
            setMatchId(null);
          }
        } catch {
          setIsMatched(false);
          setMatchId(null);
        }
      } catch {
        setError("Greška pri učitavanju");
        setPet(null);
      } finally {
        setLoading(false);
      }
    }

    loadPet();
  }, [id]);

  async function handleLike() {
    if (!pet?.id) return;

    setLiking(true);
    setLikeMsg(null);

    try {
      const res = await fetch("/api/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPetId: pet.id, type: "like" }),
      });

      const json = await res.json();

      if (!res.ok) {
        setLikeMsg(json?.error ?? "Neuspešno lajkovanje");
        return;
      }

      if (json?.matched) {
        setIsMatched(true);
        setMatchId(json.matchId ?? null);
        setLikeMsg("MATCH! 🎉");
      } else {
        setLikeMsg("Lajkovano ✅ Čekamo da uzvrati.");
      }
    } catch {
      setLikeMsg("Greška pri slanju like-a");
    } finally {
      setLiking(false);
    }
  }

  if (!id) return <div style={{ padding: 20 }}>Nedostaje ID u URL-u.</div>;
  if (loading) return <div style={{ padding: 20 }}>Učitavam profil...</div>;

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Pet profil</h1>
        <p>Greška: {error}</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Pet profil</h1>
        <p>Nema podataka.</p>
      </div>
    );
  }

  return (
    <div
      className="container animate-slideIn"
      style={{
        minHeight: "100vh",
        overflowY: "auto",
        paddingBottom: "140px",
      }}
    >
      {/* HERO IMAGE */}
      <div className="relative w-full h-[320px] rounded-3xl overflow-hidden mb-6">
        <img
          src={pet.images?.[0]?.url || "/placeholder.jpg"}
          alt={pet.ime}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-3xl font-bold">{pet.ime}</h1>
          {pet.grad && <p className="text-sm opacity-90">{pet.grad}</p>}
        </div>
      </div>

      {/* DETAILS CARD */}
      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-60">Vrsta</p>
            <p className="font-semibold capitalize">{pet.vrsta}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-60">Pol</p>
            <p className="font-semibold capitalize">{pet.pol ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-60">Rođen</p>
            <p className="font-semibold">
              {pet.datumRodjenja ? new Date(pet.datumRodjenja).toLocaleDateString() : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider opacity-60">Grad</p>
            <p className="font-semibold">{pet.grad ?? "-"}</p>
          </div>
        </div>

        {/* Opis */}
        <div>
          <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Opis</p>
          <p className="text-sm leading-relaxed">{pet.opis}</p>
        </div>

        {/* Interesovanja */}
        {pet.interesovanja && (
          <div>
            <p className="text-xs uppercase tracking-wider opacity-60 mb-2">
              Interesovanja
            </p>

            <div className="flex flex-wrap gap-2">
              {pet.interesovanja.split(",").map((i, idx) => (
                <span key={idx} className="badge">
                  {i.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          {isMatched ? (
            <button
              onClick={() => {
                if (matchId) router.push(`/chat/${matchId}`);
                else router.push("/matches");
              }}
              className="flex-1 fab-primary rounded-full py-3 font-semibold"
            >
              💬 Chat
            </button>
          ) : (
            <button
              onClick={handleLike}
              disabled={liking}
              className="flex-1 fab-primary rounded-full py-3 font-semibold"
            >
              {liking ? "Lajkujem..." : "🐾 Like"}
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="flex-1 rounded-full border border-border py-3 font-semibold"
          >
            Nazad
          </button>
        </div>

        {likeMsg && (
          <p className="text-sm mt-3">
            <b>Status:</b> {likeMsg}
          </p>
        )}
      </div>
    </div>
  );
}