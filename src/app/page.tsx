import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#0A4DBF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <img
        src="/Login_1.png"
        alt="Mačka i pas"
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "4px solid orange",
          objectFit: "cover", 
          marginBottom: 24,
      }}
/>

      <p
        style={{
          fontSize: 22,
          marginBottom: 40,
          color: "white",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        Let’s meet new pawple around you
      </p>


      <div style={{ display: "flex", gap: 20 }}>
        <Link
          href="/login"
          style={{
            backgroundColor: "white",
            color: "#0A4DBF",
            padding: "16px 40px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Login
        </Link>

        <Link
          href="/register"
          style={{
            backgroundColor: "#FF8A00",
            color: "white",
            padding: "16px 40px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Register
        </Link>
      </div>
    </div>
  );
}


