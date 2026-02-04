"use client";

import { useEffect, useState } from "react";
import PetCard from "@/components/PetCard";
import { pets } from "@/lib/mock/pets";
import { shuffleArray } from "@/lib/selectors";

export default function Home() {
  const [index, setIndex] = useState(0);
  const [shuffledPets, setShuffledPets] = useState<typeof pets>(pets); // start bez random

  // shuffle tek kad se komponenta mountuje u browseru
  useEffect(() => {
    setShuffledPets(shuffleArray(pets));
  }, []);

  const currentPet = shuffledPets[index];

  function nextPet() {
    if (index < shuffledPets.length - 1) {
      setIndex((prev) => prev + 1);
    } else {
      setShuffledPets(shuffleArray(shuffledPets));
      setIndex(0);
    }
  }

  function handlePass() {
    nextPet();
  }

  function handleLike() {
    nextPet();
  }

  if (!currentPet) return null;

  return (
    <div className="container">
      <header className="mb-4">
        <p className="text-xs text-slate-500">📍 Belgrade</p>
        <h1 className="text-2xl font-semibold">Find your Pawmate</h1>
      </header>

      <PetCard pet={currentPet} />

      <div className="-mt-6 flex justify-center gap-4">
        <button className="fab" onClick={handlePass} aria-label="Pass">
          ❌
        </button>
        <button className="fab fab-primary" onClick={handleLike} aria-label="Like">
          ❤️
        </button>
      </div>
    </div>
  );
}