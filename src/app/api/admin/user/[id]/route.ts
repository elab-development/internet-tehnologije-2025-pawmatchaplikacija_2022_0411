export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

// =====================
// GET one user
// =====================
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const userId = cleanString(id);
  if (!userId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const [one] = await db
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
      .where(eq(user.id, userId));

    return NextResponse.json({ user: one ?? null });
  } catch {
    return NextResponse.json({ error: "failed to fetch user" }, { status: 500 });
  }
}

// =====================
// UPDATE user (PATCH)
// =====================
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const userId = cleanString(id);

  if (!userId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({} as any));

  const patch: Partial<{
    ime: string;
    prezime: string;
    brojTelefona: string;
    uloga: string;
    email: string; // ako ne zelis menjanje email-a, obrisi ova 2 reda (ovaj i if ispod)
  }> = {};

  if (cleanString(body?.ime)) patch.ime = cleanString(body.ime);
  if (cleanString(body?.prezime)) patch.prezime = cleanString(body.prezime);
  if (cleanString(body?.brojTelefona)) patch.brojTelefona = cleanString(body.brojTelefona);

  // OVO dozvoli samo ako hoces (admin use-case)
  if (cleanString(body?.uloga)) patch.uloga = cleanString(body.uloga);

  // Ako hoces da user ne moze menjati email, ukloni ovo:
  if (cleanString(body?.email)) patch.email = cleanString(body.email);

  // Ako nema sta da se apdejtuje
  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update (provide fields)" },
      { status: 400 }
    );
  }

  // validacija za ulogu (ako je poslata)
  if (patch.uloga && !["admin", "korisnik"].includes(patch.uloga)) {
    return NextResponse.json(
      { error: 'uloga must be "admin" or "korisnik"' },
      { status: 400 }
    );
  }

  // minimalna validacija email-a ako ga menjas
  if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) {
    return NextResponse.json({ error: "Email nije validan" }, { status: 400 });
  }

  // minimalna validacija telefona ako ga menjas (isto kao kod tebe)
  if (patch.brojTelefona && !/^[0-9]{6,15}$/.test(patch.brojTelefona)) {
    return NextResponse.json(
      { error: "Broj telefona smije sadržavati samo brojeve (6–15)" },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(user)
      .set(patch)
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        uloga: user.uloga,
        ime: user.ime,
        prezime: user.prezime,
        email: user.email,
        brojTelefona: user.brojTelefona,
        createdAt: user.createdAt,
      });

    return NextResponse.json({ user: updated ?? null });
  } catch {
    return NextResponse.json({ error: "ne moze da se azurira user" }, { status: 500 });
  }
}

// =====================
// DELETE user
// =====================
export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const userId = cleanString(id);
  if (!userId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    await db.delete(user).where(eq(user.id, userId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed to delete user" }, { status: 500 });
  }
}
