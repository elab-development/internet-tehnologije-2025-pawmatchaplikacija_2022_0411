import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { pet, petImages } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { eq, ne } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try {
    userId = verifyAuthToken(token).id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1 user = 1 pet (uzmi mog)
  const [myPet] = await db
    .select({ id: pet.id })
    .from(pet)
    .where(eq(pet.vlasnikId, userId));

  if (!myPet) {
    return NextResponse.json({ pets: [] }, { status: 200 });
  }

  // svi ostali pets osim mog
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
    .where(ne(pet.id, myPet.id));

  const otherIds = others.map((p) => p.id);
  const imgs = otherIds.length
    ? await db
        .select({ petId: petImages.petId, url: petImages.url, sortOrder: petImages.sortOrder })
        .from(petImages)
        .where(eq(petImages.petId, petImages.petId)) // placeholder, ne treba
    : [];

  // ispravno grupisanje slika (bez "placeholder" where)
  const imgs2 = otherIds.length
    ? await db
        .select({ petId: petImages.petId, url: petImages.url, sortOrder: petImages.sortOrder })
        .from(petImages)
        // drizzle: inArray
        // import { inArray } from "drizzle-orm";
        // .where(inArray(petImages.petId, otherIds))
    : [];

  

  return NextResponse.json({ pets: await buildPetsWithImages(others) }, { status: 200 });
}

// helper (stavi na dno istog fajla)
import { inArray } from "drizzle-orm";
async function buildPetsWithImages(others: any[]) {
  const ids = others.map((p) => p.id);
  if (!ids.length) return [];

  const imgs = await db
    .select({ petId: petImages.petId, url: petImages.url, sortOrder: petImages.sortOrder })
    .from(petImages)
    .where(inArray(petImages.petId, ids));

  const map = new Map<string, string[]>();
  for (const im of imgs) {
    const arr = map.get(im.petId) ?? [];
    arr.push(im.url);
    map.set(im.petId, arr);
  }

  return others.map((p) => ({
    ...p,
    images: map.get(p.id) ?? [],
    interesovanja: p.interesovanja ? String(p.interesovanja).split(",").map((s) => s.trim()) : [],
  }));
}
