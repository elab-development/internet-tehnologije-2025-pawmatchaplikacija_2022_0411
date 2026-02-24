export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { desc, eq, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import { matches, messages, pet, petImages } from "@/db/schema";
import { requireAuth } from "@/lib/auth-server";

async function getMyPetId(userId: string) {
  const [row] = await db
    .select({ id: pet.id })
    .from(pet)
    .where(eq(pet.vlasnikId, userId));
  return row?.id ?? null;
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const myPetId = await getMyPetId(auth.user.id);
  if (!myPetId) {
    return NextResponse.json(
      { error: "Nemaš ljubimca u profilu" },
      { status: 400 }
    );
  }

  // 1) svi match-evi gde učestvuje moj pet
  const myMatches = await db
    .select({
      id: matches.id,
      pet1Id: matches.pet1Id,
      pet2Id: matches.pet2Id,
      createdAt: matches.createdAt,
    })
    .from(matches)
    .where(or(eq(matches.pet1Id, myPetId), eq(matches.pet2Id, myPetId)))
    .orderBy(desc(matches.createdAt));

  const matchIds = myMatches.map((m) => m.id);
  if (matchIds.length === 0) {
    return NextResponse.json({ myPetId, chats: [] }, { status: 200 });
  }

  // 2) drugi pet za svaki match
  const otherPetIdByMatch = new Map<string, string>();
  const otherPetIds: string[] = [];
  for (const m of myMatches) {
    const otherId = m.pet1Id === myPetId ? m.pet2Id : m.pet1Id;
    otherPetIdByMatch.set(m.id, otherId);
    otherPetIds.push(otherId);
  }

  // 3) poslednja poruka po match-u (bez N+1)
  const allMsgs = await db
    .select({
      matchId: messages.matchId,
      text: messages.text,
      createdAt: messages.createdAt,
      senderPetId: messages.senderPetId,
    })
    .from(messages)
    .where(inArray(messages.matchId, matchIds))
    .orderBy(desc(messages.createdAt));

  const lastMsgByMatch = new Map<
    string,
    { text: string; createdAt: Date | null; senderPetId: string }
  >();
  for (const m of allMsgs) {
    if (!lastMsgByMatch.has(m.matchId)) {
      lastMsgByMatch.set(m.matchId, {
        text: m.text,
        createdAt: m.createdAt ?? null,
        senderPetId: m.senderPetId,
      });
    }
  }

  // 4) podaci o drugim ljubimcima
  const pets = await db
    .select({
      id: pet.id,
      ime: pet.ime,
      vrsta: pet.vrsta,
      grad: pet.grad,
    })
    .from(pet)
    .where(inArray(pet.id, otherPetIds));

  const petById = new Map(pets.map((p) => [p.id, p]));

  // 5) avatar = prva slika (sortOrder ASC)
  const imgs = await db
    .select({
      petId: petImages.petId,
      url: petImages.url,
      sortOrder: petImages.sortOrder,
    })
    .from(petImages)
    .where(inArray(petImages.petId, otherPetIds))
    .orderBy(petImages.sortOrder);

  const avatarByPetId = new Map<string, string>();
  for (const img of imgs) {
    if (!avatarByPetId.has(img.petId)) avatarByPetId.set(img.petId, img.url);
  }

  // 6) sastavi chats listu
  const chats = myMatches.map((m) => {
    const otherId = otherPetIdByMatch.get(m.id)!;
    const other = petById.get(otherId);
    const last = lastMsgByMatch.get(m.id);

    return {
      matchId: m.id,
      otherPet: {
        id: otherId,
        ime: other?.ime ?? "Nepoznat",
        vrsta: other?.vrsta ?? "",
        grad: other?.grad ?? "",
        avatar: avatarByPetId.get(otherId) ?? null,
      },
      lastMessage: last
        ? { text: last.text, createdAt: last.createdAt, senderPetId: last.senderPetId }
        : null,
    };
  });

  return NextResponse.json({ myPetId, chats }, { status: 200 });
}
