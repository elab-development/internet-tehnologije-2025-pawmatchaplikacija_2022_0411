export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { pet, petImages } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
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

// DELETE /api/pets/[id]/images/[imageId]
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string; imagesId: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imagesId } = await ctx.params;
  const petId = cleanString(id);
  const imgId = cleanString(imagesId);

  if (!petId || !imgId) return NextResponse.json({ error: "Invalid params" }, { status: 400 });

  // proveri vlasništvo pet-a
  const [p] = await db.select({ id: pet.id }).from(pet).where(and(eq(pet.id, petId), eq(pet.vlasnikId, userId)));
  if (!p) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // obriši samo ako slika pripada tom pet-u
  await db.delete(petImages).where(and(eq(petImages.id, imgId), eq(petImages.petId, petId)));

  return NextResponse.json({ ok: true });
}
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { pet, petImages } from "@/db/schema";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
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

// DELETE /api/pets/[id]/images/[imageId]
export async function DELETE(_: Request, ctx: { params: Promise<{ id: string; imageId: string }> }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imageId } = await ctx.params;
  const petId = cleanString(id);
  const imgId = cleanString(imageId);

  if (!petId || !imgId) return NextResponse.json({ error: "Invalid params" }, { status: 400 });

  // proveri vlasništvo pet-a
  const [p] = await db.select({ id: pet.id }).from(pet).where(and(eq(pet.id, petId), eq(pet.vlasnikId, userId)));
  if (!p) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // obriši samo ako slika pripada tom pet-u
  await db.delete(petImages).where(and(eq(petImages.id, imgId), eq(petImages.petId, petId)));

  return NextResponse.json({ ok: true });
}
