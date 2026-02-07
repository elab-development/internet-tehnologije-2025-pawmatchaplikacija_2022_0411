export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { eq, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { pet, swipes, user } from "@/db/schema";
import { requireAdmin, requireAuth } from "@/lib/auth-server";
import bcrypt from "bcryptjs";

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
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;


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
  // ===== AUTH + PERMISSIONS =====
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  // ako nije admin, sme da menja samo sebe
  const isAdmin = auth.user.uloga === "admin";
  if (!isAdmin && auth.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }


  const body = await req.json().catch(() => ({} as any));
  const currentPassword = cleanString(body?.currentPassword);
  const newPassword = cleanString(body?.newPassword);
  const newPassword2 = cleanString(body?.newPassword2);


  const patch: Partial<{
    ime: string;
    prezime: string;
    brojTelefona: string;
    uloga: string;
    email: string;
    passHash: string;
  }> = {};


  if (cleanString(body?.ime)) patch.ime = cleanString(body.ime);
  if (cleanString(body?.prezime)) patch.prezime = cleanString(body.prezime);
  if (cleanString(body?.brojTelefona)) patch.brojTelefona = cleanString(body.brojTelefona);


  // uloga samo admin
  if (isAdmin && cleanString(body?.uloga)) patch.uloga = cleanString(body.uloga);


  //  user ne moze menjati email, ukloni ovo:
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
 if (patch.brojTelefona && !/^\+?[0-9]{6,15}$/.test(patch.brojTelefona)) {

    return NextResponse.json(
      { error: "Broj telefona sme sadržavati samo brojeve (6–15)" },
      { status: 400 }
    );
  }

  // =====================
// PROMENA LOZINKE (opciono)
// =====================
const wantsPasswordChange = currentPassword || newPassword || newPassword2;

if (wantsPasswordChange) {
  // mora sva 3 polja
  if ( !newPassword || !newPassword2) {
    return NextResponse.json(
      { error: "Popuni current password, new password i confirm password." },
      { status: 400 }
    );
  }

  // nove lozinke moraju da se poklope
  if (newPassword !== newPassword2) {
    return NextResponse.json(
      { error: "Nove lozinke se ne poklapaju." },
      { status: 400 }
    );
  }

  // minimalna dužina (možeš promeniti)
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Lozinka mora imati bar 6 karaktera." },
      { status: 400 }
    );
  }

  // uzmi trenutni hash iz baze
  const [existing] = await db
    .select({ passHash: user.passHash })
    .from(user)
    .where(eq(user.id, userId));

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // proveri trenutnu lozinku
 /* const ok = await bcrypt.compare(currentPassword, existing.passHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Trenutna lozinka nije tačna." },
      { status: 400 }
    );
  }*/

  // upiši novu lozinku (hash) u patch
  patch.passHash = await bcrypt.hash(newPassword, 10);
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
  const auth = await requireAdmin();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const userId = cleanString(id);

  if (!userId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (auth.user.id === userId) {
    return NextResponse.json(
      { error: "Ne možeš obrisati svoj nalog." },
      { status: 400 }
    );
  }

  try {
    // 1) svi petovi tog user-a
    const pets = await db
      .select({ id: pet.id })
      .from(pet)
      .where(eq(pet.vlasnikId, userId));

    const petIds = pets.map((p) => p.id);

    // 2) obrisi swipes koji referenciraju te petove (OVO ti je falilo)
    if (petIds.length > 0) {
      await db
        .delete(swipes)
        .where(or(inArray(swipes.fromPetId, petIds), inArray(swipes.toPetId, petIds)));
    }

    // 3) obrisi user-a (pets cascade), matches/messages cascade preko pet/match FK
    await db.delete(user).where(eq(user.id, userId));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE user error:", e);
    return NextResponse.json({ error: "failed to delete user" }, { status: 500 });
  }

}
