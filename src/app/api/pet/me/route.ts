//Ovo ti treba da izvučeš “mog psa” bez da znaš petId.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pet, petImages } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  try {
    const [p] = await db.select().from(pet).where(eq(pet.vlasnikId, auth.user.id));
    if (!p) return NextResponse.json({ pet: null });

    const imgs = await db
      .select()
      .from(petImages)
      .where(eq(petImages.petId, p.id))
      .orderBy(asc(petImages.sortOrder));

    return NextResponse.json({
      pet: { ...p, images: imgs },
    });
  } catch {
    return NextResponse.json({ error: "failed to fetch my pet" }, { status: 500 });
  }
}
