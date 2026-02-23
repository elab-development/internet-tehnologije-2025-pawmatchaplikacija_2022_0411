export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { and, asc, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { matches, messages, pet, petImages } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

async function getMyPetId(userId: string) {
  const [row] = await db
    .select({ id: pet.id })
    .from(pet)
    .where(eq(pet.vlasnikId, userId));
  return row?.id ?? null;
}

// =====================
// GET /api/matches/:id/message  -> list messages
// =====================
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const matchId = cleanString(id);

  if (!matchId) {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }

  const myPetId = await getMyPetId(auth.user.id);
  if (!myPetId) {
    return NextResponse.json(
      { error: "Nemaš ljubimca u profilu" },
      { status: 400 }
    );
  }

  // security: da ne čitaš tuđe chatove
  /*const [m] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(eq(matches.pet1Id, myPetId), eq(matches.pet2Id, myPetId))
      )
    );*/
  const [m] = await db
    .select({
      id: matches.id,
      pet1Id: matches.pet1Id,
      pet2Id: matches.pet2Id,
    })
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(eq(matches.pet1Id, myPetId), eq(matches.pet2Id, myPetId))
      )
    );
  const otherPetId = m.pet1Id === myPetId ? m.pet2Id : m.pet1Id;

  const [other] = await db
    .select({
      id: pet.id,
      ime: pet.ime,
    })
    .from(pet)
    .where(eq(pet.id, otherPetId));//

  const [avatarRow] = await db
    .select({ url: petImages.url })
    .from(petImages)
    .where(eq(petImages.petId, otherPetId))
    .orderBy(asc(petImages.sortOrder))
    .limit(1);

  const otherPet = {
    id: otherPetId,
    ime: other?.ime ?? "Chat",
    avatar: avatarRow?.url ?? null,
  };


  if (!m) {
    return NextResponse.json(
      { error: "Match ne postoji ili nije tvoj" },
      { status: 404 }
    );
  }

  const list = await db
    .select({
      id: messages.id,
      matchId: messages.matchId,
      senderPetId: messages.senderPetId,
      text: messages.text,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.matchId, matchId))
    .orderBy(asc(messages.createdAt));
  return NextResponse.json({ myPetId, otherPet, messages: list }, { status: 200 });

  // return NextResponse.json({ myPetId, messages: list }, { status: 200 });
}

// =====================
// POST /api/matches/:id/message  -> send message
// body: { text: string }
// =====================
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const matchId = cleanString(id);

  if (!matchId) {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as null | { text?: string };
  const text = cleanString(body?.text);

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const myPetId = await getMyPetId(auth.user.id);
  if (!myPetId) {
    return NextResponse.json(
      { error: "Nemaš ljubimca u profilu" },
      { status: 400 }
    );
  }

  // ownership match-a
  const [m] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(
      and(
        eq(matches.id, matchId),
        or(eq(matches.pet1Id, myPetId), eq(matches.pet2Id, myPetId))
      )
    );

  if (!m) {
    return NextResponse.json(
      { error: "Match ne postoji ili nije tvoj" },
      { status: 404 }
    );
  }

  const [inserted] = await db
    .insert(messages)
    .values({
      matchId,
      senderPetId: myPetId,
      text,
    })
    .returning({
      id: messages.id,
      matchId: messages.matchId,
      senderPetId: messages.senderPetId,
      text: messages.text,
      createdAt: messages.createdAt,
    });

  return NextResponse.json({ ok: true, message: inserted }, { status: 201 });
}
