"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type MeResponse = {
  user: {
    id: string;
    ime: string;
    prezime: string;
    email: string;
    uloga: string;
  };
};

export default function AccountSettingsForm() {
  const router = useRouter();

  const [loadingMe, setLoadingMe] = useState(true);

  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [brojTelefona, setBrojTelefona] = useState("");
  //const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showNewPwd2, setShowNewPwd2] = useState(false);


  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ====== PREFILL from /api/auth/me + (optional) user details ======
  useEffect(() => {
    async function load() {
      setLoadingMe(true);
      setErr("");

      // 1) auth + basic info
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const me: MeResponse = await res.json();

      // 2) uzmi detalje user-a (da dobiješ brojTelefona)
      const details = await fetch(`/api/admin/user/${me.user.id}`, {
        credentials: "include",
      }).then((r) => r.json());

      setIme(details?.user?.ime ?? me.user.ime ?? "");
      setPrezime(details?.user?.prezime ?? me.user.prezime ?? "");
      setEmail(details?.user?.email ?? me.user.email ?? "");
      setBrojTelefona(details?.user?.brojTelefona ?? "");

      setLoadingMe(false);
    }

    load();
  }, [router]);

  const canSubmit = useMemo(() => {
    if (!ime.trim() || !prezime.trim()) return false;
    if (!email.trim()) return false;
    if (!brojTelefona.trim()) return false;
    if (!/^\+?\d{6,15}$/.test(brojTelefona.trim())) return false;


    return true;
  }, [ime, prezime, email, brojTelefona]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    setLoading(true);
    try {
      // opet uzmi me (da dobijemo id sigurno)
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const me: MeResponse = await meRes.json();

      // ✅ payload MORA biti van fetch-a
      const payload: any = {
        ime: ime.trim(),
        prezime: prezime.trim(),
        email: email.trim(),
        brojTelefona: brojTelefona.trim(),
      };

      // ✅ lozinku šaljemo samo ako je korisnik uneo nešto
      if (newPassword.trim() || newPassword2.trim()) {
        if (newPassword !== newPassword2) {
          setErr("Nove lozinke se ne poklapaju.");
          setLoading(false);
          return;
        }
        payload.newPassword = newPassword;
        payload.newPassword2 = newPassword2;
      }

      // ✅ fetch samo prima body
      const res = await fetch(`/api/admin/user/${me.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErr(data?.error ?? "Neuspešno ažuriranje profila.");
        return;
      }

      setOkMsg("Sačuvano ✅");
      setNewPassword("");
      setNewPassword2("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }


  // ----- styles (kopirano iz tvog AuthForm) -----
  const page: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "16px 16px 120px 16px",
  };

  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 380,
  };

  const label: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 6,
  };

  const inputBase: React.CSSProperties = {
    height: 44,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: "0 12px",
    fontSize: 14,
    outline: "none",
    width: "100%",
  };

  const field: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const twoCols: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  };

  const btn: React.CSSProperties = {
    height: 48,
    borderRadius: 24,
    border: "none",
    cursor: loading || !canSubmit ? "not-allowed" : "pointer",
    fontSize: 16,
    fontWeight: 800,
    color: "white",
    backgroundColor: "#0B4DBA", // plavo kao na figmi (možeš promeniti)
    opacity: loading || !canSubmit ? 0.65 : 1,
    marginTop: 6,
  };

  const errorBox: React.CSSProperties = {
    background: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#991B1B",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 13,
  };

  const okBox: React.CSSProperties = {
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    color: "#065F46",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 13,
  };

  if (loadingMe) {
    return (
      <main style={page}>
        <div style={card}>
          <div style={{ textAlign: "center", color: "#6b7280" }}>Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <div style={card}>
        {/* Header */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Link
              href="/settings"
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                color: "#111827",
              }}
              aria-label="Back"
            >
              ←
            </Link>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>
              Account Settings
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 6 }}>
            Enter Your General Info
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.35 }}>
            You can edit your profile info anytime.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={twoCols}>
            <div style={field}>
              <div style={label}>First name</div>
              <input value={ime} onChange={(e) => setIme(e.target.value)} style={inputBase} />
            </div>

            <div style={field}>
              <div style={label}>Last name</div>
              <input value={prezime} onChange={(e) => setPrezime(e.target.value)} style={inputBase} />
            </div>
          </div>

          <div style={field}>
            <div style={label}>E-mail address</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputBase}
            />
          </div>

          <div style={field}>
            <div style={label}>Phone number</div>
            <input
              value={brojTelefona}
              onChange={(e) => setBrojTelefona(e.target.value)}
              placeholder="60 123 44 56"
              style={inputBase}
            />
          </div>
          {/*div style={field}>
            <div style={label}>Current password</div>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              style={inputBase}
            />
          </div>*/}

          <div style={field}>
            <div style={label}>New password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showNewPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                style={{ ...inputBase, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowNewPwd((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 0,
                  height: 44,
                  width: 38,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: 14,
                }}
                aria-label="Toggle password visibility"
              >
                👁
              </button>
            </div>
          </div>


          <div style={field}>
            <div style={label}>Re-enter new password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showNewPwd2 ? "text" : "password"}
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                placeholder="Re-enter new password"
                style={{ ...inputBase, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowNewPwd2((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 0,
                  height: 44,
                  width: 38,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: 14,
                }}
                aria-label="Toggle password visibility"
              >
                👁
              </button>
            </div>
          </div>



          {err && <div style={errorBox}>{err}</div>}
          {okMsg && <div style={okBox}>{okMsg}</div>}

          <button type="submit" disabled={loading || !canSubmit} style={btn}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </main>
  );
}
