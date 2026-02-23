export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { pet, petImages } from "@/db/schema";
import { asc, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-server";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}


// GET all pets (with images)
export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;
  try {
    // 1) uzmi sve pets
    const ps = await db.select().from(pet).orderBy(asc(pet.ime)); // ili asc(pet.id)

    // 2) uzmi sve id-jeve
    const ids = ps.map((p) => p.id);

    // ako nema pets, vrati prazno
    if (!ids.length) {
      return NextResponse.json({ pets: [] });
    }

    // 3) uzmi sve slike za te pets
    const imgs = await db
      .select()
      .from(petImages)
      .where(inArray(petImages.petId, ids))
      .orderBy(asc(petImages.sortOrder));

    // 4) grupisi slike po petId (Map)
    const imgBy = new Map<string, any[]>();
    for (const i of imgs) {
      const arr = imgBy.get(i.petId) ?? [];
      arr.push(i);
      imgBy.set(i.petId, arr);
    }

    // 5) vrati pets + images
    return NextResponse.json({
      pets: ps.map((p) => ({
        ...p,
        images: imgBy.get(p.id) ?? [],
      })),
    });
  } catch {
    return NextResponse.json({ error: "failed to fetch pets" }, { status: 500 });
  }
}


// =====================
// CREATE pet
// =====================
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
    return NextResponse.json(
      { error: "ime, opis i vrsta su obavezni" },
      { status: 400 }
    );
  }

  if (!["dog", "cat"].includes(vrsta)) {
    return NextResponse.json(
      { error: 'vrsta mora biti "dog" ili "cat"' },
      { status: 400 }
    );
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

    return NextResponse.json({ pet: created ?? null }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json(
        { error: "Korisnik vec ima kreiranog ljubimca" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Neuspesno kreiranje ljubimca" },
      { status: 500 }
    );
  }
}
