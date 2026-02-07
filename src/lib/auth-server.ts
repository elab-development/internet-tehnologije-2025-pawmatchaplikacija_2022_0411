import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";

export type JwtUserClaims = {
 id: string;
  email: string;
  ime?: string;
  prezime?: string;
  uloga?: string;
};

// =====================
// Provera da li je korisnik ulogovan
// =====================
export async function requireAuth(): Promise<
  | { ok: true; user: JwtUserClaims }
  | { ok: false; res: NextResponse }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const user = verifyAuthToken(token) as JwtUserClaims;
    return { ok: true, user };
  } catch {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

// =====================
// Provera da li je ADMIN
// =====================
export async function requireAdmin(): Promise<
  | { ok: true; user: JwtUserClaims }
  | { ok: false; res: NextResponse }
> {
  // prvo: da li je ulogovan
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  // drugo: da li je admin
  if (auth.user.uloga !== "admin") {
    return {
      ok: false,
      res: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  // sve ok → admin
  return auth;
}

