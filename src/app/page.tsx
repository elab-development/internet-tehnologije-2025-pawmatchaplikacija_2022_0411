import Link from "next/link";

export default function HomePage() {
  return (
    /* Pozadina celog brauzera */
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      backgroundColor: "#f0f2f5" 
    }}>
      
      {/* Kontejner veličine telefona */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,    // Širina telefona
          height: "90vh",   // Visina (90% visine ekrana)
          borderRadius: 32, // Zaobljene ivice
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          background: "#0A4DBF", // Plava boja stranice
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ padding: "20px", textAlign: "center", width: "100%" }}>
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
              display: "inline-block"
            }}
          />

          <p
            style={{
              fontSize: 22,
              marginBottom: 40,
              color: "white",
              textAlign: "center",
              fontWeight: "500"
            }}
          >
            Let’s meet new pawple <br /> around you
          </p>

          <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            <Link
              href="/login"
              style={{
                backgroundColor: "white",
                color: "#0A4DBF",
                padding: "16px 32px",
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
                padding: "16px 32px",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}