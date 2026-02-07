export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { pet, swipes, matches } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-server";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

function sortPair(a: string, b: string) {
  return a < b ? ([a, b] as const) : ([b, a] as const);
}

async function requireUserId() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifyAuthToken(token).id as string;
  } catch {
    return null;
  }
}

async function getMyPetId(userId: string) {
  const [myPet] = await db
    .select({ id: pet.id })
    .from(pet)
    .where(eq(pet.vlasnikId, userId));

  return myPet?.id ?? null;
}

// =====================
// GET swipes (razni pogledi)
// =====================
export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const myPetId = await getMyPetId(userId);
  if (!myPetId) {
    return NextResponse.json({ error: "Nemaš ljubimca u profilu" }, { status: 400 });
  }

  const url = new URL(req.url);
  const incoming = url.searchParams.get("incoming") === "1";
  const outgoing = url.searchParams.get("outgoing") === "1";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50) || 50, 200);

  // 1) Incoming likes: ko je lajkovao mog pet-a
  if (incoming) {
    const rows = await db
      .select({
        id: swipes.id,
        fromPetId: swipes.fromPetId,
        toPetId: swipes.toPetId,
        type: swipes.type,
        //createdAt: swipes.createdAt, // ako nemaš ovu kolonu, izbaci je
      })
      .from(swipes)
      .where(and(eq(swipes.toPetId, myPetId), eq(swipes.type, "like")))
      // .orderBy(desc(swipes.createdAt))
      .limit(limit);

    return NextResponse.json({ swipes: rows });
  }

  // 2) Outgoing: koga je moj pet swipe-ovao (like/pass)
  if (outgoing) {
    const rows = await db
      .select({
        id: swipes.id,
        fromPetId: swipes.fromPetId,
        toPetId: swipes.toPetId,
        type: swipes.type,
        // createdAt: swipes.createdAt, // ako nemaš ovu kolonu, izbaci je
      })
      .from(swipes)
      .where(eq(swipes.fromPetId, myPetId))
      // .orderBy(desc(swipes.createdAt))
      .limit(limit);

    return NextResponse.json({ swipes: rows });
  }

  // 3) Default: poslednjih swipes koje je moj pet napravio
  const rows = await db
    .select({
      id: swipes.id,
      fromPetId: swipes.fromPetId,
      toPetId: swipes.toPetId,
      type: swipes.type,
      // createdAt: swipes.createdAt, // ako nemaš ovu kolonu, izbaci je
    })
    .from(swipes)
    .where(eq(swipes.fromPetId, myPetId))
    //.orderBy(desc(swipes.createdAt))
    .limit(limit);

  return NextResponse.json({ swipes: rows });
}

// =====================
// POST swipe (like/pass) + kreiranje match-a
// =====================
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;


  // 2) body
  const body = (await req.json().catch(() => null)) as null | {
    toPetId?: string;
    type?: "like" | "pass";
  };

  const toPetId = cleanString(body?.toPetId);
  const type = body?.type;

  if (!toPetId || (type !== "like" && type !== "pass")) {
    return NextResponse.json({ error: "Neispravan zahtev" }, { status: 400 });
  }

  // 3) nadji user's pet
  const myPetId = await getMyPetId(userId);
  if (!myPetId) {
    return NextResponse.json({ error: "Nemaš ljubimca u profilu" }, { status: 400 });
  }

  const fromPetId = myPetId;

  // 4) zabrani swipe samog sebe
  if (fromPetId === toPetId) {
    return NextResponse.json({ error: "Ne možeš lajkovati svog ljubimca" }, { status: 400 });
  }

  // (opciono ali korisno) proveri da target pet postoji
  const [target] = await db.select({ id: pet.id }).from(pet).where(eq(pet.id, toPetId));
  if (!target) {
    return NextResponse.json({ error: "Pet ne postoji" }, { status: 404 });
  }

  // 5) upiši swipe (unique index sprečava dupliranje)
  // await db.insert(swipes).values({ fromPetId, toPetId, type }).onConflictDoNothing();
  // 5) upiši swipe (ako već postoji za isti par, update-uj type)
  await db
    .insert(swipes)
    .values({ fromPetId, toPetId, type })
    .onConflictDoUpdate({
      target: [swipes.fromPetId, swipes.toPetId], // jer imaš unique index na ova 2
      set: { type },
    });

  // 6) ako je like, proveri obrnuti like → napravi match
  let matched = false;

  if (type === "like") {
    const [reverse] = await db
      .select({ id: swipes.id })
      .from(swipes)
      .where(
        and(
          eq(swipes.fromPetId, toPetId),
          eq(swipes.toPetId, fromPetId),
          eq(swipes.type, "like")
        )
      );

    if (reverse) {
      const [p1, p2] = sortPair(fromPetId, toPetId);

      await db.insert(matches).values({ pet1Id: p1, pet2Id: p2 }).onConflictDoNothing();
      matched = true;
    }
  }

  return NextResponse.json({ ok: true, matched });
}

