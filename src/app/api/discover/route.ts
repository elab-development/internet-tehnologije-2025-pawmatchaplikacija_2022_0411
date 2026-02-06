export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, ne, inArray, notInArray, or } from "drizzle-orm";

import { db } from "@/db";
import { pet, petImages, swipes, matches } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export async function GET() {
  // 1) auth (isto kao kod tebe)
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try {
    userId = verifyAuthToken(token).id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) 1 user = 1 pet (uzmi mog)
  const [myPet] = await db
    .select({ id: pet.id })
    .from(pet)
    .where(eq(pet.vlasnikId, userId));

  if (!myPet) {
    return NextResponse.json({ pets: [] }, { status: 200 });
  }

  const myPetId = myPet.id;

  // 3) A) petovi koje sam već swipe-ovala (like/pass)
  const swipedRows = await db
    .select({ toPetId: swipes.toPetId })
    .from(swipes)
    .where(eq(swipes.fromPetId, myPetId));

  const swipedToIds = Array.from(new Set(swipedRows.map((s) => s.toPetId)));

  // 4) B) petovi sa kojima već imam match (druga strana)
  const myMatches = await db
    .select({ pet1Id: matches.pet1Id, pet2Id: matches.pet2Id })
    .from(matches)
    .where(or(eq(matches.pet1Id, myPetId), eq(matches.pet2Id, myPetId)));

  const matchedOtherIds = Array.from(
    new Set(myMatches.map((m) => (m.pet1Id === myPetId ? m.pet2Id : m.pet1Id)))
  );

  // 5) exclude lista: moj pet + swipeovani + matchovani
  const excluded = Array.from(new Set([myPetId, ...swipedToIds, ...matchedOtherIds]));

  // 6) kandidati = svi ostali pets, minus excluded
  const others = await db
    .select({
      id: pet.id,
      ime: pet.ime,
      opis: pet.opis,
      vrsta: pet.vrsta,
      datumRodjenja: pet.datumRodjenja,
      pol: pet.pol,
      grad: pet.grad,
      interesovanja: pet.interesovanja,
    })
    .from(pet)
    .where(
      and(
        ne(pet.id, myPetId),
        excluded.length ? notInArray(pet.id, excluded) : undefined
      )
    );

  return NextResponse.json({ pets: await buildPetsWithImages(others) }, { status: 200 });
}

// helper
async function buildPetsWithImages(others: any[]) {
  const ids = others.map((p) => p.id);
  if (!ids.length) return [];

  const imgs = await db
    .select({ petId: petImages.petId, url: petImages.url, sortOrder: petImages.sortOrder })
    .from(petImages)
    .where(inArray(petImages.petId, ids))
    .orderBy(petImages.petId, petImages.sortOrder);

  const map = new Map<string, string[]>();
  for (const im of imgs) {
    const arr = map.get(im.petId) ?? [];
    arr.push(im.url);
    map.set(im.petId, arr);
  }

  return others.map((p) => ({
    ...p,
    images: map.get(p.id) ?? [],
    interesovanja: p.interesovanja
      ? String(p.interesovanja)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  }));
}
