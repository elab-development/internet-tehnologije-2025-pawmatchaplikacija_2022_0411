"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type NearPet = {
  id: string;
  ime: string;
  lat: number;
  lon: number;
  demo?: boolean;
};

type Weather = {
  temperature: number;
  windspeed: number;
};

const myPinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function createNameIcon(name: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        min-width:60px;
        height:60px;
        padding:0 14px;
        border-radius:30px;
        background:#f97316;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:600;
        font-size:14px;
        box-shadow:0 6px 16px rgba(0,0,0,0.25);
        border:3px solid white;
      ">
        ${name}
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
}

function isValidLatLon(lat: number, lon: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

export default function MapPage() {
  const router = useRouter();

  const [center, setCenter] = useState<[number, number] | null>(null);
  const [pets, setPets] = useState<NearPet[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // ✅ 1) UZMI LOKACIJU IZ BROWSERA
        const coords = await new Promise<{ lat: number; lon: number }>(
          (resolve, reject) => {
            if (!("geolocation" in navigator)) {
              reject(new Error("NO_GEO"));
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (pos) =>
                resolve({
                  lat: pos.coords.latitude,
                  lon: pos.coords.longitude,
                }),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }
        );

        if (!isValidLatLon(coords.lat, coords.lon)) {
          setError("Ne mogu da učitam lokaciju (nevalidne koordinate)");
          return;
        }

        // ✅ 2) SAČUVAJ U BAZI (da radi za svakog user-a)
        const saveRes = await fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(coords),
        });

        const saveJson = await saveRes.json();

        if (!saveRes.ok || !saveJson.success) {
          setError("Ne mogu da sačuvam lokaciju (odobri Location permission)");
          return;
        }

        // ✅ 3) CENTER
        setCenter([coords.lat, coords.lon]);

        // 🟢 EKSTERNI API – Open-Meteo
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`
        );
        const weatherJson = await weatherRes.json();

        if (weatherJson?.current_weather) {
          setWeather({
            temperature: weatherJson.current_weather.temperature,
            windspeed: weatherJson.current_weather.windspeed,
          });
        }

        // 4) Near pets
        const nearRes = await fetch("/api/pet/near?radiusKm=10");
        const nearJson = await nearRes.json();

        if (nearJson?.success && Array.isArray(nearJson.pets)) {
          setPets(nearJson.pets);
        } else {
          setPets([]);
        }
      } catch (e: any) {
        // Ako je user blokirao location
        setError("Ne mogu da učitam lokaciju (odobri Location u browseru)");
      }
    }

    loadData();
  }, []);

  if (error) return <div style={{ padding: 20 }}>{error}</div>;
  if (!center) return <div style={{ padding: 20 }}>Učitavam...</div>;

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      {/* 🌦 WEATHER PANEL */}
      {weather && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "10px 18px",
            borderRadius: 20,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            zIndex: 1000,
            fontWeight: 600,
          }}
        >
          🌤 {weather.temperature}°C | 💨 {weather.windspeed} km/h
        </div>
      )}

      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={center} icon={myPinIcon}>
          <Popup>Ovo si ti 📍</Popup>
        </Marker>

        {pets.map((p) => {
          const plat = Number(p.lat);
          const plon = Number(p.lon);

          // ✅ preskoči ljubimce bez lokacije (da Leaflet ne pukne)
          if (!isValidLatLon(plat, plon)) return null;

          return (
            <Marker key={p.id} position={[plat, plon]} icon={createNameIcon(p.ime)}>
              <Popup>
                <div style={{ cursor: "pointer" }} onClick={() => router.push(`/pet/${p.id}`)}>
                  <b>{p.ime}</b>
                  <br />
                  <small>Klikni za profil</small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}