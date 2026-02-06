export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, asc, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { matches, messages, pet } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-server";


function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}



async function getMyPetId(userId: string) {
  const [myPet] = await db.select({ id: pet.id }).from(pet).where(eq(pet.vlasnikId, userId));
  return myPet?.id ?? null;
}

async function assertMatchOwnership(matchId: string, myPetId: string) {
  const [m] = await db
    .select({ id: matches.id, pet1Id: matches.pet1Id, pet2Id: matches.pet2Id })
    .from(matches)
    .where(eq(matches.id, matchId));

  if (!m) return { ok: false as const, status: 404, error: "Match ne postoji" };
  if (m.pet1Id !== myPetId && m.pet2Id !== myPetId) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }
  return { ok: true as const, match: m };
}

// =====================
// GET /api/matches/[id]/messages
// =====================
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;
  const { id } = await ctx.params;
  const matchId = cleanString(id);
  if (!matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const myPetId = await getMyPetId(userId);
  if (!myPetId) return NextResponse.json({ error: "Nemaš ljubimca u profilu" }, { status: 400 });

  const own = await assertMatchOwnership(matchId, myPetId);
  if (!own.ok) return NextResponse.json({ error: own.error }, { status: own.status });

  const rows = await db
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

  return NextResponse.json({ myPetId, messages: rows });
}

// =====================
// POST /api/matches/[id]/messages
// body: { text: string }
// =====================
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;

  const { id } = await ctx.params;
  const matchId = cleanString(id);
  if (!matchId) return NextResponse.json({ error: "matchId is required" }, { status: 400 });

  const myPetId = await getMyPetId(userId);
  if (!myPetId) return NextResponse.json({ error: "Nemaš ljubimca u profilu" }, { status: 400 });

  const own = await assertMatchOwnership(matchId, myPetId);
  if (!own.ok) return NextResponse.json({ error: own.error }, { status: own.status });

  const body = (await req.json().catch(() => null)) as null | { text?: string };
  const text = cleanString(body?.text);
  if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

  const [created] = await db
    .insert(messages)
    .values({ matchId, senderPetId: myPetId, text })
    .returning({
      id: messages.id,
      matchId: messages.matchId,
      senderPetId: messages.senderPetId,
      text: messages.text,
      createdAt: messages.createdAt,
    });

  return NextResponse.json({ message: created }, { status: 201 });
}
