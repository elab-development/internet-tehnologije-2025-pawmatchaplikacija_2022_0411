export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-server";

function cleanString(x: unknown) {
  return typeof x === "string" ? x.trim() : "";
}

// GET /api/admin/users
export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;
  try {
    const rows = await db
      .select({
        id: user.id,
        uloga: user.uloga,
        ime: user.ime,
        prezime: user.prezime,
        email: user.email,
        brojTelefona: user.brojTelefona,
        createdAt: user.createdAt,
      })
      .from(user);

    return NextResponse.json({ users: rows });
  } catch {
    return NextResponse.json({ error: "failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users  (admin kreira usera) - prima password, pa hashira
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const auth = await requireAuth();
  if (!auth.ok) return auth.res;

  const userId = auth.user.id;
  const ime = cleanString(body?.ime);
  const prezime = cleanString(body?.prezime);
  const email = cleanString(body?.email);
  const brojTelefona = cleanString(body?.brojTelefona);
  const password = cleanString(body?.password);
  const uloga = cleanString(body?.uloga) || "korisnik";

  if (!ime || !prezime || !email || !password) {
    return NextResponse.json(
      { error: "ime, prezime, email i password su obavezni" },
      { status: 400 }
    );
  }

  if (!["admin", "korisnik"].includes(uloga)) {
    return NextResponse.json(
      { error: 'uloga mora biti "admin" ili "korisnik"' },
      { status: 400 }
    );
  }

  // check email unique
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  if (existing.length) {
    return NextResponse.json({ error: "Email vec postoji" }, { status: 400 });
  }

  const passHash = await bcrypt.hash(password, 10);

  try {
    const [created] = await db
      .insert(user)
      .values({
        ime,
        prezime,
        email,
        passHash,
        uloga,
        brojTelefona: brojTelefona || null,
      })
      .returning({
        id: user.id,
        uloga: user.uloga,
        ime: user.ime,
        prezime: user.prezime,
        email: user.email,
        brojTelefona: user.brojTelefona,
        createdAt: user.createdAt,
      });

    return NextResponse.json({ user: created ?? null }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Neuspesno kreiranje korisnika" },
      { status: 500 }
    );
  }
}
