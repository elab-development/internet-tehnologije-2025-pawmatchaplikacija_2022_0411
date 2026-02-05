export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <img
            src="/pawlogo.png"
            alt="Logo"
            style={{ width: 300, height: 250 }}
          />
        </div>

        {/* FORM */}
        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            type="email"
            placeholder="Email"
            style={{
              height: 44,
              borderRadius: 8,
              border: "1px solid #ccc",
              padding: "0 12px",
              fontSize: 14,
            }}
          />

          <input
            type="password"
            placeholder="Password"
            style={{
              height: 44,
              borderRadius: 8,
              border: "1px solid #ccc",
              padding: "0 12px",
              fontSize: 14,
            }}
          />

          {/* LOGIN KAO LINK */}
          <a
            href="/matches"
            style={{
              height: 48,
              borderRadius: 24,
              backgroundColor: "#FF8A00",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              marginTop: 8,
              textDecoration: "none",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Login
          </a>
        </form>
      </div>
    </main>
  );
}

