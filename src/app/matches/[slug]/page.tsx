"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { pets } from "@/lib/mock/pets";

export default function PetDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const pet = pets.find((p) => p.id === slug);

  if (!pet) return null;

  const firstImage = pet.images?.[0];

  return (
    <div className="mx-auto w-full max-w-[390px] h-[calc(100vh-32px)] px-4 py-4">
      <div className="relative h-full rounded-[28px] bg-white shadow overflow-hidden">

        {/* HERO IMAGE (gornja polovina) */}
        <div className="absolute inset-x-0 top-0 h-[55%]">
          {firstImage && (
            <img
              src={firstImage}
              alt={pet.ime}
              className="h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          <Link
            href="/matches"
            className="absolute left-4 top-4 h-10 w-10 rounded-full bg-white/30 text-white flex items-center justify-center backdrop-blur active:scale-95 transition"
          >
            ←
          </Link>
        </div>

        {/* INFO PANEL – OD SREDINE DO DOLE */}
        <div className="absolute inset-x-0 bottom-0 top-[45%] bg-white rounded-t-[28px]">
          {/* CONTENT (scrollable, ali bez ruznog scroll bara) */}
          <div
            className="h-full overflow-y-auto p-5 pb-28 overscroll-contain"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge legacy
            }}
          >
            {/* sakrij scrollbar za Chrome/Safari */}
            <style jsx>{`
      div::-webkit-scrollbar {
        display: none;
      }
    `}</style>

            <span className="inline-block mb-2 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-bold text-white">
              {pet.vrsta === "dog" ? "PAS" : "MAČKA"}
            </span>

            <h1 className="text-2xl font-semibold">{pet.ime}</h1>
            <p className="text-sm text-slate-500">{pet.grad}</p>

            <div className="mt-4">
              <p className="text-sm font-semibold">About</p>
              <p className="mt-1 text-sm text-slate-600">{pet.opis}</p>
            </div>

            {!!pet.interesovanja?.length && (
              <div className="mt-4">
                <p className="text-sm font-semibold">Interest</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pet.interesovanja.map((i) => (
                    <span
                      key={i}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS (bez razdvajanja, “floating” u panelu) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <div className="pointer-events-auto flex items-center justify-center gap-6">
              <Link
                href="/matches"
                className="h-14 w-14 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center
                   active:scale-95 transition-transform duration-150"
              >
                <span className="text-2xl text-blue-600">✕</span>
              </Link>

              <button
                onClick={() => alert("Poruka")}
                className="h-14 w-14 rounded-full bg-orange-500 text-white shadow-lg
                   flex items-center justify-center
                   active:scale-95 transition-transform duration-150 active:brightness-110"
              >
                💬
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
