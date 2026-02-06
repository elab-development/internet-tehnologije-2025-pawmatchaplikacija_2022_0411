export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { pet, petImages } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

async function requireUserId() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifyAuthToken(token).id as string;
  } catch {
    return null;
  }
}

// =====================
// GET /api/pets/[id]/images  -> sve slike za petId (sortirano)
// =====================
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const petId = cleanString(id);
  if (!petId) return NextResponse.json({ error: "petId is required" }, { status: 400 });

  
  const rows = await db
    .select({
      id: petImages.id,
      petId: petImages.petId,
      url: petImages.url,
      sortOrder: petImages.sortOrder,
    })
    .from(petImages)
    .where(eq(petImages.petId, petId))
    .orderBy(asc(petImages.sortOrder));

  return NextResponse.json({ images: rows });
}

// =====================
// POST /api/pets/[id]/images -> dodaj sliku (samo vlasnik)
// body: { url: string, sortOrder?: number }
// =====================
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const petId = cleanString(id);
  if (!petId) return NextResponse.json({ error: "petId is required" }, { status: 400 });

  // proveri da pet pripada useru
  const [p] = await db.select({ id: pet.id }).from(pet).where(and(eq(pet.id, petId), eq(pet.vlasnikId, userId)));
  if (!p) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as null | { url?: string; sortOrder?: number };
  const url = cleanString(body?.url);
  const sortOrder = Number.isFinite(body?.sortOrder) ? Number(body?.sortOrder) : 0;

  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const [created] = await db
    .insert(petImages)
    .values({ petId, url, sortOrder })
    .returning({ id: petImages.id, petId: petImages.petId, url: petImages.url, sortOrder: petImages.sortOrder });

  return NextResponse.json({ image: created }, { status: 201 });
}

// =====================
// PUT /api/pets/[id]/images -> reorder (samo vlasnik)
// body: { orders: Array<{ id: string; sortOrder: number }> }
// =====================
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const petId = cleanString(id);
  if (!petId) return NextResponse.json({ error: "petId is required" }, { status: 400 });

  // proveri vlasništvo
  const [p] = await db.select({ id: pet.id }).from(pet).where(and(eq(pet.id, petId), eq(pet.vlasnikId, userId)));
  if (!p) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as null | {
    orders?: Array<{ id: string; sortOrder: number }>;
  };

  const orders = Array.isArray(body?.orders) ? body!.orders : null;
  if (!orders || orders.length === 0) {
    return NextResponse.json({ error: "orders is required" }, { status: 400 });
  }

  // (bezbednost) update samo slika koje pripadaju ovom pet-u
  const ids = orders.map((o) => cleanString(o.id)).filter(Boolean);
  const existing = await db
    .select({ id: petImages.id })
    .from(petImages)
    .where(and(eq(petImages.petId, petId), inArray(petImages.id, ids)));

  const allowed = new Set(existing.map((x) => x.id));

  for (const o of orders) {
    const imgId = cleanString(o.id);
    if (!allowed.has(imgId)) continue;

    const so = Number.isFinite(o.sortOrder) ? Number(o.sortOrder) : 0;
    await db.update(petImages).set({ sortOrder: so }).where(eq(petImages.id, imgId));
  }

  return NextResponse.json({ ok: true });
}
