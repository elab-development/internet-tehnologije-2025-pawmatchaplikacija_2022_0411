import { NextResponse } from "next/server";
import { eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { pet, user } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

function distanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const url = new URL(req.url);
  const radiusKm = Number(url.searchParams.get("radiusKm") ?? "50");

  // 1️⃣ Uzmi lokaciju ulogovanog user-a
  const meRows = await db
    .select({
      lat: user.locationLat,
      lon: user.locationLon,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const me = meRows[0];

  if (!me || me.lat == null || me.lon == null) {
    return NextResponse.json({
      success: true,
      pets: [],
      reason: "NO_LOCATION"
    });
  }

  const myLat = Number(me.lat);
  const myLon = Number(me.lon);

  // 2️⃣ Uzmi sve petove + vlasnik lokaciju
  const rows = await db
    .select({
      id: pet.id,
      ime: pet.ime,
      lat: user.locationLat,
      lon: user.locationLon,
      ownerId: pet.vlasnikId,
    })
    .from(pet)
    .innerJoin(user, eq(pet.vlasnikId, user.id))
    .where(ne(pet.vlasnikId, userId)); // nemoj da vrati moj pet

  const pets = rows
    .filter((p) => p.lat != null && p.lon != null)
    .map((p) => {
      const dist = distanceInMeters(
        myLat,
        myLon,
        Number(p.lat),
        Number(p.lon)
      );

      return {
        id: p.id,
        ime: p.ime,
        lat: Number(p.lat),
        lon: Number(p.lon),
        distanceM: dist,
      };
    })
    .filter((p) => p.distanceM <= radiusKm * 1000);

  return NextResponse.json({
    success: true,
    radiusKm,
    center: { lat: myLat, lon: myLon },
    pets,
  });
}