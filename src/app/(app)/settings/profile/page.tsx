"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PetDto = {
  id: string;
  ime: string;
  opis: string;
  vrsta: "dog" | "cat" | string;
  datumRodjenja: string | null;
  pol: string | null;
  grad: string | null;
  interesovanja: string | null;
  images?: string[]; // kod tebe su stringovi
};

function firstImageUrl(images?: string[]) {
  const arr = Array.isArray(images) ? images : [];
  return arr[0] ?? "";
}

export default function ProfileSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [pet, setPet] = useState<PetDto | null>(null);

  const [ime, setIme] = useState("");
  const [opis, setOpis] = useState("");
  const [vrsta, setVrsta] = useState<"dog" | "cat">("dog");
  const [datumRodjenja, setDatumRodjenja] = useState("");
  const [pol, setPol] = useState("");
  const [grad, setGrad] = useState("");
  const [interesovanja, setInteresovanja] = useState("");

  // samo UI za sada (ne snima se dok ne napravimo backend rute za images)
  const [avatarUrl, setAvatarUrl] = useState("");

  const avatarUrlFromPet = useMemo(() => firstImageUrl(pet?.images), [pet]);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      // ✅ koristi rutu koja TI REALNO RADI
      const res = await fetch("/api/pet", {
        credentials: "include",
        cache: "no-store",
      });

      const raw = await res.text();

      if (!res.ok) {
        setErr(`HTTP ${res.status} – ${raw.slice(0, 250)}`);
        return;
      }

      const data = JSON.parse(raw);
      const p: PetDto | null = data?.pet ?? null;

      if (!p?.id) {
        setErr("Ne vidim pet u odgovoru sa /api/pet.");
        return;
      }

      setPet(p);

      setIme(p.ime ?? "");
      setOpis(p.opis ?? "");
      setVrsta(p.vrsta === "cat" ? "cat" : "dog");
      setDatumRodjenja(p.datumRodjenja ?? "");
      setPol(p.pol ?? "");
      setGrad(p.grad ?? "");
      setInteresovanja(p.interesovanja ?? "");

      setAvatarUrl(firstImageUrl(p.images));
    } catch (e: any) {
      setErr(e?.message ?? "Fetch error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const canSave = useMemo(() => {
    if (!pet) return false;
    if (!ime.trim()) return false;
    if (!opis.trim()) return false;
    return true;
  }, [pet, ime, opis]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pet || saving) return;

    setSaving(true);
    setErr("");
    setOkMsg("");

    try {
      const res = await fetch(`/api/admin/pet/${pet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ime,
          opis,
          vrsta,
          datumRodjenja,
          pol,
          grad,
          interesovanja,
        }),
      });

      if (!res.ok) {
        throw new Error("Neuspešno čuvanje");
      }

      setOkMsg("Sačuvano ✅");

      // opciono: ako želiš da se odmah vidi novo stanje sa servera
      await load();

      // ✅ ostaješ na istoj stranici, bez back/refresh
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }


  return (
    <main className="mx-auto w-full max-w-[420px] px-5 pb-[220px] pt-6">
      <div className="flex items-center gap-3 sticky top-0 z-50 bg-white pt-2 pb-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Profile settings</h1>
      </div>

      {loading && <p className="mt-6 text-slate-500">Učitavam...</p>}

      {!!err && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">
          {err}
        </p>
      )}

      {!loading && !err && pet && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                {(avatarUrl || avatarUrlFromPet) ? (
                  <img
                    src={avatarUrl || avatarUrlFromPet}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-2xl">🐾</div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Avatar URL</p>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="/pets/rex_1.jpg"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <Field label="Pet’s name">
              <input
                value={ime}
                onChange={(e) => setIme(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              />
            </Field>

            <Field label="Bio / Description">
              <textarea
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select
                  value={vrsta}
                  onChange={(e) => setVrsta(e.target.value as any)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                </select>
              </Field>

              <Field label="Gender">
                <input
                  value={pol}
                  onChange={(e) => setPol(e.target.value)}
                  placeholder="male / female"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Birth date">
                <input
                  value={datumRodjenja}
                  onChange={(e) => setDatumRodjenja(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </Field>

              <Field label="Location">
                <input
                  value={grad}
                  onChange={(e) => setGrad(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
                />
              </Field>
            </div>

            <Field label="Interests (comma separated)">
              <input
                value={interesovanja}
                onChange={(e) => setInteresovanja(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={!canSave || saving}
            className="h-12 w-full rounded-full bg-slate-900 text-white font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {!!okMsg && (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {okMsg}
            </p>
          )}

          <div className="h-[180px]" />
        </form>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-700">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
