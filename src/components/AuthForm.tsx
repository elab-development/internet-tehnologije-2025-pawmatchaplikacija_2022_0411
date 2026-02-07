"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isLogin = mode === "login";

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);


  // register-only
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd2, setShowPwd2] = useState(false);
  const [brojTelefona, setBrojTelefona] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
  const buttonLabel = isLogin ? "Login" : "Register";
  const switchHref = isLogin ? "/register" : "/login";
  const switchLeft = isLogin ? "Don't have an account? " : "Already have an account? ";
  const switchRight = isLogin ? "Sign Up" : "Login";

  const canSubmit = useMemo(() => {
    if (isLogin) return email.trim() && password;
    if (!ime.trim() || !prezime.trim()) return false;
    if (!email.trim() || !password || !password2) return false;
    if (password !== password2) return false;
    if (!brojTelefona.trim()) return false; // kod tebe je obavezno
    return true;
  }, [isLogin, ime, prezime, email, password, password2, brojTelefona]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");

    // FE check: password match + phone numeric
    if (!isLogin && password !== password2) {
      setErr("Lozinke se ne poklapaju.");
      return;
    }
    if (!isLogin && brojTelefona && !/^\d+$/.test(brojTelefona)) {
      setErr("Broj telefona može sadržati samo brojeve.");
      return;
    }

    setLoading(true);
    try {
      const body = isLogin
        ? { email: email.trim(), password }
        : {
          ime: ime.trim(),
          prezime: prezime.trim(),
          email: email.trim(),
          password,
          brojTelefona: brojTelefona.trim(),
        };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let message = "Greška pri autentifikaciji.";
        try {
          const data = await res.json();
          message = data?.error ?? message;
        } catch { }
        setErr(message);
        return;
      }

      router.refresh();
      if (isLogin) router.push("/matches");
      else router.push("register/pet");

    } finally {
      setLoading(false);
    }
  }

  // ----- styles (inline kao kod tebe) -----
  const page: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
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
    backgroundColor: isLogin ? "#FF8A00" : "#111827",
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

  return (
    <main style={page}>
      <div style={card}>
        {/* Header */}
        {isLogin ? (
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <img src="/pawlogo.png" alt="PawMatch logo" style={{ width: 92, height: 92 }} />
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#111827" }}>PawMatch</div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Link
                href="/login"
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
              <div style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>General info</div>
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 6 }}>
              Enter Your General Info
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.35 }}>
              After you register to our app, later on you can edit your profile.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {!isLogin && (
            <div style={twoCols}>
              <div style={field}>
                <div style={label}>First name</div>
                <input
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  placeholder="Your name"
                  style={inputBase}
                  required
                />
              </div>

              <div style={field}>
                <div style={label}>Last name</div>
                <input
                  value={prezime}
                  onChange={(e) => setPrezime(e.target.value)}
                  placeholder="Your last name"
                  style={inputBase}
                  required
                />
              </div>
            </div>
          )}

          <div style={field}>
            <div style={label}>E-mail address</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your e-mail address"
              style={inputBase}
              required
            />
          </div>

          <div style={field}>
            <div style={label}>Password</div>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={{ ...inputBase, paddingRight: 44, width: "100%" }}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
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

          {!isLogin && (
            <>
              <div style={field}>
                <div style={label}>Re-enter password</div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd2 ? "text" : "password"}
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder="Password"
                    style={{ ...inputBase, paddingRight: 44, width: "100%" }}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd2((s) => !s)}
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
                    aria-label="Toggle re-enter password visibility"
                  >
                    👁
                  </button>
                </div>
              </div>

              <div style={field}>
                <div style={label}>Phone number</div>
                <input
                  value={brojTelefona}
                  onChange={(e) => setBrojTelefona(e.target.value)}
                  placeholder="60 000 00 00"
                  style={inputBase}
                  required
                />
              </div>
            </>
          )}

          {err && <div style={errorBox}>{err}</div>}

          <button type="submit" disabled={loading || !canSubmit} style={btn}>
            {loading ? "Obrada..." : buttonLabel}
          </button>

          <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 6 }}>
            {switchLeft}
            <Link
              href={switchHref}
              style={{ color: "#2563eb", fontWeight: 800, textDecoration: "none" }}
            >
              {switchRight}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

