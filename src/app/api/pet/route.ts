export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { pet, petImages } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-server";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

// GET my pet (with images)
export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const [p] = await db.select().from(pet).where(eq(pet.vlasnikId, userId));
  if (!p) return NextResponse.json({ pet: null }, { status: 200 });

  const imgs = await db
    .select()
    .from(petImages)
    .where(eq(petImages.petId, p.id))
    .orderBy(asc(petImages.sortOrder));

  return NextResponse.json({ pet: { ...p, images: imgs.map((i) => i.url) } },
    { status: 200 });
}

// CREATE pet
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const vlasnikId = auth.user.id;

  const body = await req.json().catch(() => ({} as any));

  const ime = cleanString(body?.ime);
  const opis = cleanString(body?.opis);
  const vrsta = cleanString(body?.vrsta);

  const datumRodjenja = cleanString(body?.datumRodjenja);
  const pol = cleanString(body?.pol);
  const grad = cleanString(body?.grad);
  const interesovanja = cleanString(body?.interesovanja);

  if (!ime || !opis || !vrsta) {
    return NextResponse.json({ error: "ime, opis i vrsta su obavezni" }, { status: 400 });
  }

  if (!["dog", "cat"].includes(vrsta)) {
    return NextResponse.json({ error: 'vrsta mora biti "dog" ili "cat"' }, { status: 400 });
  }

  try {
    const [created] = await db
      .insert(pet)
      .values({
        vlasnikId,
        ime,
        opis,
        vrsta,
        datumRodjenja: datumRodjenja || null,
        pol: pol || null,
        grad: grad || null,
        interesovanja: interesovanja || null,
      })
      .returning();
    // ⬇️ posle kreiranja pet-a upiši 1 sliku ako je poslata
    const images = Array.isArray(body?.images) ? body.images : [];
    const firstUrl = typeof images[0] === "string" ? images[0].trim() : "";

    if (created && firstUrl) {
      await db.insert(petImages).values({
        petId: created.id,
        url: firstUrl,
        sortOrder: 1,
      });
    }

    return NextResponse.json({ pet: created ?? null }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Korisnik vec ima kreiranog ljubimca" }, { status: 400 });
    }
    return NextResponse.json({ error: "Neuspesno kreiranje ljubimca" }, { status: 500 });
  }
}
