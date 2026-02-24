import type { PetProfile } from "@/lib/types";
import Link from "next/link";

type MatchPetPreview = {
  id: string;
  ime: string;
  opis: string;
  vrsta: string;
  images: string[];
};

export default function MatchPetCard({
  pet,
  distanceLabel,
}: {
  pet: MatchPetPreview;
  distanceLabel: string;
}) {
  const firstImage = pet.images?.[0];

  return (
    <div className="card overflow-hidden">
      <div className="relative h-44 w-full bg-slate-50">
        {firstImage ? (
          <img src={firstImage} alt={pet.ime} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* distance badge */}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-[11px] text-white backdrop-blur">
          {distanceLabel}
        </div>
      </div>

      {/* name + details button */}
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="text-sm font-semibold">{pet.ime}</p>

        <Link
          href={`/matches/${pet.id}`}
          className="inline-flex items-center rounded-full border border-white/30 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white/80"
        >

          Detalji
        </Link>
      </div>


    </div>
  );
}
