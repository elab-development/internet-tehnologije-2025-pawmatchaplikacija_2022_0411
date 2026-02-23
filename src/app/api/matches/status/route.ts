export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { matches, pet } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

async function getMyPetId(userId: string) {
  const [myPet] = await db
    .select({ id: pet.id })
    .from(pet)
    .where(eq(pet.vlasnikId, userId))
    .limit(1);

  return myPet?.id ?? null;
}

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const url = new URL(req.url);
  const otherPetId = url.searchParams.get("petId");

  if (!otherPetId) {
    return NextResponse.json(
      { ok: false, error: "Missing petId" },
      { status: 400 }
    );
  }

  const myPetId = await getMyPetId(userId);
  if (!myPetId) {
    return NextResponse.json(
      { ok: false, error: "NO_PET" },
      { status: 400 }
    );
  }

  const [m] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(
      or(
        and(eq(matches.pet1Id, myPetId), eq(matches.pet2Id, otherPetId)),
        and(eq(matches.pet2Id, myPetId), eq(matches.pet1Id, otherPetId))
      )
    )
    .limit(1);

  return NextResponse.json({
    ok: true,
    matched: !!m,
    matchId: m?.id ?? null,
  });
}