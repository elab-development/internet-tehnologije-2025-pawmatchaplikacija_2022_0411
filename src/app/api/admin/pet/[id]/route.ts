export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { pet, petImages, user } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

async function assertPetOwner(petId: string, userId: string) {
  const [p] = await db
    .select({ id: pet.id, vlasnikId: pet.vlasnikId })
    .from(pet)
    .where(eq(pet.id, petId));

  if (!p) {
    return { ok: false as const, res: NextResponse.json({ error: "Pet ne postoji" }, { status: 404 }) };
  }
  if (p.vlasnikId !== userId) {
    return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const };
}

// =====================
// GET one pet (with owner + images)
// =====================
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const petId = cleanString(id);

  if (!petId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    // 1) pet
    const [p] = await db.select().from(pet).where(eq(pet.id, petId));
    if (!p) return NextResponse.json({ pet: null });

    // (opciono) ako hoces da samo vlasnik moze da vidi detalje:
    // const own = await assertPetOwner(petId, auth.user.id);
    // if (!own.ok) return own.res;

    // 2) images za tog peta
    const imgs = await db
      .select({
        id: petImages.id,
        url: petImages.url,
        sortOrder: petImages.sortOrder,
      })
      .from(petImages)
      .where(eq(petImages.petId, petId))
      .orderBy(asc(petImages.sortOrder));

    // 3) owner (user) po vlasnikId
    const [owner] = await db
      .select({
        id: user.id,
        uloga: user.uloga,
        ime: user.ime,
        prezime: user.prezime,
        email: user.email,
        brojTelefona: user.brojTelefona,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, p.vlasnikId));

    return NextResponse.json({
      pet: {
        ...p,
        owner: owner ?? null,
        images: imgs,
      },
    });
  } catch {
    return NextResponse.json({ error: "failed to fetch pet" }, { status: 500 });
  }
}

// =====================
// UPDATE pet (PATCH) - bez brisanja polja
// =====================
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const { id } = await ctx.params;
  const petId = cleanString(id);

  if (!petId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // ownership check
  const own = await assertPetOwner(petId, userId);
  if (!own.ok) return own.res;

  const body = await req.json().catch(() => ({} as any));

  const patch: Partial<{
    ime: string;
    opis: string;
    vrsta: string;
    datumRodjenja: string;
    pol: string;
    grad: string;
    interesovanja: string;
  }> = {};

  if (cleanString(body?.ime)) patch.ime = cleanString(body.ime);
  if (cleanString(body?.opis)) patch.opis = cleanString(body.opis);
  if (cleanString(body?.vrsta)) patch.vrsta = cleanString(body.vrsta);

  if (cleanString(body?.datumRodjenja)) patch.datumRodjenja = cleanString(body.datumRodjenja);
  if (cleanString(body?.pol)) patch.pol = cleanString(body.pol);
  if (cleanString(body?.grad)) patch.grad = cleanString(body.grad);
  if (cleanString(body?.interesovanja)) patch.interesovanja = cleanString(body.interesovanja);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update (provide fields)" }, { status: 400 });
  }

  if (patch.vrsta && !["dog", "cat"].includes(patch.vrsta)) {
    return NextResponse.json({ error: 'vrsta must be "dog" or "cat"' }, { status: 400 });
  }

  try {
    const [updated] = await db.update(pet).set(patch).where(eq(pet.id, petId)).returning();
    return NextResponse.json({ pet: updated ?? null });
  } catch {
    return NextResponse.json({ error: "ne moze da se azurira pet" }, { status: 500 });
  }
}

// =====================
// DELETE pet
// =====================
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const { id } = await ctx.params;
  const petId = cleanString(id);

  if (!petId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // ownership check
  const own = await assertPetOwner(petId, userId);
  if (!own.ok) return own.res;

  try {
    await db.delete(pet).where(eq(pet.id, petId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed to delete pet" }, { status: 500 });
  }
}

