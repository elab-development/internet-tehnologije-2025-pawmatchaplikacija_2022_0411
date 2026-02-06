export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { matches, pet, petImages } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { desc, inArray, or, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-server";


export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  // 2) svi petovi korisnika (kod tebe obično 1, ali ovo podržava više)
  const myPets = await db.select({ id: pet.id }).from(pet).where(eq(pet.vlasnikId, userId));
  const myPetIds = myPets.map((p) => p.id);
  if (myPetIds.length === 0) return NextResponse.json({ matches: [] }, { status: 200 });

  const myPetIdSet = new Set(myPetIds);

  // 3) svi matches gde je pet1 ili pet2 moj pet
  const rawMatches = await db
    .select({
      matchId: matches.id,
      createdAt: matches.createdAt,
      pet1Id: matches.pet1Id,
      pet2Id: matches.pet2Id,
    })
    .from(matches)
    .where(or(inArray(matches.pet1Id, myPetIds), inArray(matches.pet2Id, myPetIds)))
    .orderBy(desc(matches.createdAt));

  if (rawMatches.length === 0) return NextResponse.json({ matches: [] }, { status: 200 });

  // 4) svi petId iz match-eva
  const allPetIds = Array.from(new Set(rawMatches.flatMap((m) => [m.pet1Id, m.pet2Id])));

  // 5) pet details
  const pets = await db
    .select({
      id: pet.id,
      vlasnikId: pet.vlasnikId,
      ime: pet.ime,
      opis: pet.opis,
      vrsta: pet.vrsta,
      datumRodjenja: pet.datumRodjenja,
      pol: pet.pol,
      grad: pet.grad,
      interesovanja: pet.interesovanja,
    })
    .from(pet)
    .where(inArray(pet.id, allPetIds));

  const petsById = new Map(pets.map((p) => [p.id, p]));

  // 6) images (sortOrder!)
  const imgs = await db
    .select({ petId: petImages.petId, url: petImages.url, sortOrder: petImages.sortOrder })
    .from(petImages)
    .where(inArray(petImages.petId, allPetIds))
    .orderBy(petImages.petId, petImages.sortOrder);

  const imagesByPetId = new Map<string, string[]>();
  for (const im of imgs) {
    const arr = imagesByPetId.get(im.petId) ?? [];
    arr.push(im.url);
    imagesByPetId.set(im.petId, arr);
  }

  // 7) response
  const result = rawMatches.map((m) => {
    const pet1 = petsById.get(m.pet1Id);
    const pet2 = petsById.get(m.pet2Id);

    // safety (ako ikad fali)
    if (!pet1 || !pet2) return null;

    const pet1IsMine = myPetIdSet.has(m.pet1Id);
    const myPetId = pet1IsMine ? m.pet1Id : m.pet2Id;
    const other = pet1IsMine ? pet2 : pet1;

    return {
      match: { id: m.matchId, createdAt: m.createdAt },
      myPetId,
      otherPet: {
        ...other,
        images: imagesByPetId.get(other.id) ?? [],
      },
    };
  }).filter(Boolean);

  return NextResponse.json({ matches: result }, { status: 200 });
}
