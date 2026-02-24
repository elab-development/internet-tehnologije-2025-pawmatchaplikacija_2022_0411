import MapLoader from "@/components/MapLoader";

export default function Page() {
  return (
    <div className="container" style={{ 
      // Koristimo visinu celog ekrana minus visinu navbara i gornjeg paddinga
      height: "calc(100vh - 85px)", 
      display: "flex", 
      flexDirection: "column",
      overflow: "hidden", // Ključno da nema skrolovanja stranice
      paddingBottom: "5px" // Taj "milimetarski" razmak iznad navbara
    }}>
      
      {/* HEADER - Standardno poravnanje */}
      <header className="mb-4 pt-4">
        <p className="text-xs text-slate-500">📍 Belgrade</p>
        <h1 className="text-3xl font-bold mt-1">Discover</h1>
        <h2 className="text-xl font-semibold mt-4">Around me</h2>
        <p className="text-sm text-slate-500">Paws the you can find around you.</p>
      </header>

      {/* MAPA - Sada koristi flex: 1 da popuni sav slobodan prostor do dna */}
      <div style={{ 
        flex: 1, 
        width: "100%", 
        position: "relative", 
        borderRadius: "2rem", 
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        border: "1px solid #f0f0f0"
      }}>
        <MapLoader />
      </div>

    </div>
  );
}