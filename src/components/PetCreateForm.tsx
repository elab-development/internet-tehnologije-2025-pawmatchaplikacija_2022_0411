"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function PetCreateForm() {
  const router = useRouter();

  const [ime, setIme] = useState("");
  const [opis, setOpis] = useState("");
  const [vrsta, setVrsta] = useState<"dog" | "cat">("dog");
  const [pol, setPol] = useState<"male" | "female">("male");
  const [grad, setGrad] = useState("Belgrade");
  const [datumRodjenja, setDatumRodjenja] = useState("");
  const [interesovanja, setInteresovanja] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // za sad URL (upload kasnije)

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return ime.trim() && opis.trim() && (vrsta === "dog" || vrsta === "cat");
  }, [ime, opis, vrsta]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ime: ime.trim(),
          opis: opis.trim(),
          vrsta,
          pol,
          grad: grad.trim(),
          datumRodjenja: datumRodjenja.trim(),
          interesovanja: interesovanja.trim(),
          // opciono: pošalji sliku kao 1 URL (ako proširiš backend dole)
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error ?? "Greška pri kreiranju ljubimca.");
        return;
      }

      // success -> idi na home feed
      router.refresh();
      router.push("/home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center", padding: 16 }}>
      <form
        onSubmit={onSubmit}
        style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>Profile settings</h1>

        <div style={{ border: "2px dashed #e5e7eb", borderRadius: 16, padding: 18 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Image URL (za sad)</div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="npr. /pets/beki_1.jpg"
            style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
            Upload fajla ćemo posle (sad koristi URL ili putanju iz /public).
          </div>
        </div>

        <label>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Your Pet’s name</div>
          <input
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            placeholder="eg. Tobby"
            style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
            required
          />
        </label>

        <label>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Bio / Short Description</div>
          <input
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            placeholder="Short bio"
            style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
            required
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <div style={{ fontSize: 12, fontWeight: 800 }}>Species</div>
            <select
              value={vrsta}
              onChange={(e) => setVrsta(e.target.value as any)}
              style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </label>

          <label>
            <div style={{ fontSize: 12, fontWeight: 800 }}>Sex</div>
            <select
              value={pol}
              onChange={(e) => setPol(e.target.value as any)}
              style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
        </div>

        <label>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Location</div>
          <input
            value={grad}
            onChange={(e) => setGrad(e.target.value)}
            placeholder="eg. Belgrade"
            style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Birth date (YYYY-MM-DD)</div>
          <input
            value={datumRodjenja}
            onChange={(e) => setDatumRodjenja(e.target.value)}
            placeholder="2022-05-30"
            style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, fontWeight: 800 }}>Interests</div>
          <input
            value={interesovanja}
            onChange={(e) => setInteresovanja(e.target.value)}
            placeholder="eg. Walking in park, eating, sleeping..."
            style={{ width: "100%", height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
        </label>

        {err && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", padding: 10, borderRadius: 10 }}>
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          style={{
            height: 52,
            borderRadius: 16,
            border: "none",
            background: "#2563eb",
            color: "white",
            fontWeight: 900,
            cursor: loading || !canSubmit ? "not-allowed" : "pointer",
            opacity: loading || !canSubmit ? 0.7 : 1,
          }}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </main>
  );
}
