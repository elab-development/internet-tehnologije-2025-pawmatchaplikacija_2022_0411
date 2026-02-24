import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

function isValidLatLon(lat: number, lon: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  );
}

export async function GET() {
  // 1️⃣ Proveri auth
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  // 2️⃣ Izvuci lokaciju iz baze
  const rows = await db
    .select({
      lat: user.locationLat,
      lon: user.locationLon,
      updatedAt: user.locationUpdatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const me = rows[0];

  // ✅ Nemoj 400 za NO_LOCATION (da frontend ne "puca" i da nema BadRequest spam)
  if (!me || me.lat == null || me.lon == null) {
    return NextResponse.json(
      { success: false, error: "NO_LOCATION" },
      { status: 200 }
    );
  }

  const lat = Number(me.lat);
  const lon = Number(me.lon);

  if (!isValidLatLon(lat, lon)) {
    return NextResponse.json(
      { success: false, error: "BAD_LOCATION" },
      { status: 200 }
    );
  }

  // 3️⃣ Vrati lokaciju
  return NextResponse.json({
    success: true,
    lat,
    lon,
    updatedAt: me.updatedAt,
  });
}

/**
 * POST /api/user/location
 * Čuva trenutnu lokaciju ulogovanog korisnika u bazi
 */
export async function POST(req: Request) {
  // 1️⃣ Proveri da li je korisnik ulogovan
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  // 2️⃣ Uzmi lat/lon iz body-ja
  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lon = Number(body?.lon);

  if (!isValidLatLon(lat, lon)) {
    return NextResponse.json(
      { success: false, error: "Invalid latitude or longitude" },
      { status: 400 }
    );
  }

  // 3️⃣ Upisi lokaciju u bazu
  await db
    .update(user)
    .set({
      locationLat: lat,
      locationLon: lon,
      locationUpdatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  return NextResponse.json({ success: true, lat, lon });
}