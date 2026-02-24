export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pet, petImages } from "@/db/schema";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

/**
 * GET /api/pet/:id
 * Vraća 1 pet + slike
 */
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const petId = cleanString(id);

  if (!petId) {
    return NextResponse.json(
      { success: false, error: "MISSING_ID" },
      { status: 400 }
    );
  }

  // 1) Pet
  const [p] = await db
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
    .where(eq(pet.id, petId));

  if (!p) {
    return NextResponse.json(
      { success: false, error: "NOT_FOUND" },
      { status: 404 }
    );
  }

  // 2) Slike
  const images = await db
    .select({
      id: petImages.id,
      petId: petImages.petId,
      url: petImages.url,
      sortOrder: petImages.sortOrder,
    })
    .from(petImages)
    .where(eq(petImages.petId, petId))
    .orderBy(asc(petImages.sortOrder));

  return NextResponse.json({ success: true, pet: { ...p, images } });
}