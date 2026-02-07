"use client";

import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard";
import { shuffleArray } from "@/lib/selectors";
import type { PetProfile } from "@/lib/types";

export default function Home() {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1) učitaj discover listu (bez mog pet-a)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/discover", {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? "Greška pri učitavanju ljubimaca");
        }

        const data = await res.json();
        setPets(shuffleArray(data.pets ?? []));
        setIndex(0);
      } catch (e: any) {
        console.error("DISCOVER ERROR:", e.message);
        setPets([]); // jasno stanje
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const currentPet = pets[index];
  useEffect(() => { //
    if (index >= pets.length && pets.length > 0) {
      setIndex(0);
    }
  }, [index, pets.length]);
  function nextPet() {
    setIndex((i) => i + 1);
  }


  /* async function swipe(type: "like" | "pass") {
     if (!currentPet) return;
 
     await fetch("/api/swipes", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       credentials: "include",
       body: JSON.stringify({ toPetId: currentPet.id, type }),
     });
 
     nextPet();
   }*/
  async function swipe(type: "like" | "pass") {
    if (!currentPet) return;

    await fetch("/api/swipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ toPetId: currentPet.id, type }),
    });

    if (type === "like") {
      // ❤️ izbaci currentPet iz liste
      setPets((prev) => prev.filter((p) => p.id !== currentPet.id));
      // NE POMERAJ index
    } else {
      // ❌ samo idi dalje
      nextPet();
    }
  }


  if (loading) return <div className="container safe-bottom">Učitavam...</div>;

  if (!currentPet) {
    return (
      <div className="container safe-bottom">
        <header className="mb-4">
          <p className="text-xs text-slate-500">📍 Belgrade</p>
          <h1 className="text-2xl font-semibold">Find your Pawmate</h1>
        </header>
        <p className="text-sm text-slate-500">Nema više ljubimaca za prikaz.</p>
      </div>
    );

  }

  return (
    <div className="container safe-bottom">
      <header className="mb-4">
        <p className="text-xs text-slate-500">📍 Belgrade</p>
        <h1 className="text-2xl font-semibold">Find your Pawmate</h1>
      </header>
      <div className="relative">    {/* PetCard bez dugmadi unutra */}
        <PetCard pet={currentPet} />
        {/* dugmad PREKO slike */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-4">
          <button
            className="fab"
            onClick={() => swipe("pass")}
            aria-label="Pass"
          >
            ❌
          </button>

          <button
            className="fab fab-primary"
            onClick={() => swipe("like")}
            aria-label="Like"
          >
            ❤️
          </button>
        </div></div>

    </div>
  );
}
