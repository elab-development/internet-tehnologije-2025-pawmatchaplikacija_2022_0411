import type { PetProfile } from "@/lib/types";

export default function MatchPetCard({
  pet,
  distanceLabel,
}: {
  pet: PetProfile;
  distanceLabel: string; // npr "0.1km away"
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

      {/* name */}
      <div className="p-3">
        <p className="text-sm font-semibold">{pet.ime}</p>
      </div>
    </div>
  );
}
