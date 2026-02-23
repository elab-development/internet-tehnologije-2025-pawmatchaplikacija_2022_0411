import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const [u] = await db
    .select({
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      email: user.email,
      uloga: user.uloga,
    })
    .from(user)
    .where(eq(user.id, userId));

  if (!u) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: u });
}
