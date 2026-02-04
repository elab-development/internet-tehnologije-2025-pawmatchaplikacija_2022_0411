import type { PetProfile } from "@/lib/types";

export default function PetCard({ pet }: { pet: PetProfile }) {
  const firstImage = pet.images?.[0];

  return (
    <div className="card card-hover overflow-hidden">
      {/* Hero slika (duža/portrait) */}
      <div className="relative h-[520px] w-full bg-slate-50">
        {firstImage ? (
          <img
            src={firstImage}
            alt={pet.ime}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No image
          </div>
        )}

        {/* jači gradient dole da tekst bude čitljiv */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        {/* Podaci NA SLICI */}
        <div className="absolute bottom-20 left-0 right-0 p-5 text-white">
          {/* vrsta (badge) */}
          <div className="mb-2 inline-flex rounded-full bg-orange-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
            {pet.vrsta === "dog" ? "PAS" : "MAČKA"}
          </div>

          {/* ime */}
          <p className="text-3xl font-semibold leading-none">{pet.ime}</p>

          {/* lokacija */}
          <p className="mt-2 text-sm text-white/85">
            {pet.grad ?? "Nepoznata lokacija"}
          </p>

          {/* interesovanja (chips) */}
          {!!pet.interesovanja?.length && (
            <div className="mt-4 flex flex-wrap gap-2">
              {pet.interesovanja.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/15 px-3 py-1 text-[12px] text-white/95 backdrop-blur border border-white/20"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Dugmad PREKO slike */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
          <button className="fab">
            ❌
          </button>
          <button className="fab fab-primary">
            ❤️
          </button>
        </div>

      </div>
    </div>
  );
}

