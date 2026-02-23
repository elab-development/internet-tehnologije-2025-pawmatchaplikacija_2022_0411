import { db } from "@/db";
import { user } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export { NextResponse } from "next/server";



type Body = { //tip podataka u parametrima
    email: string;
    password: string;

};
// req sta klijent salje
export async function POST(req: Request) { //zato sto kreiramo neki obj koji je jwt token
    // 1. parse request
    const { email, password } = (await req.json()) as Body; // ono sto je stiglo od klijenta

    //2. validate input
    if (!email?.trim() || !password) {
        return NextResponse.json(
            { error: "Niste uneli email ili lozinku" },
            { status: 401 } // korisnik nije uneo dobre kredencijale i nema pristup nicemu
        );
    }


    //3. trazim usera po emailu
    const [u] = await db
        .select({
            id: user.id,
            email: user.email,
            passHash: user.passHash,
            ime: user.ime,
            prezime: user.prezime,
            uloga: user.uloga,
        })
        .from(user)
        .where(eq(user.email, email)); //eq je equals


    if (!u) { //ako nema usera sa tim emailom opet vracamo 401
        return NextResponse.json({ error: "Pogresan email ili lozinka" }, { status: 401 });
    }

    //4. ako ima usera dodatno treba da proverimo lozinku, prvo da je desifrujem
    const ok = await bcrypt.compare(password, u.passHash);
    if (!ok) {
        return NextResponse.json({ error: "Pogresan email ili lozinka" }, { status: 401 });
    }
    // 5. sign JWT kreiram token, 
    const token = signAuthToken({
        id: u.id,
        email: u.email,
        ime: u.ime ?? undefined,
        prezime: u.prezime ?? undefined,
        uloga: u.uloga ?? undefined
    });

    // 6. set cookie with awt, korisniku vracamo token da bi mogao da upravlja
    const res = NextResponse.json({
        id: u.id,                     // OBAVEZNO
        email: u.email,                // OBAVEZNO
        ime: `${u.ime} ${u.prezime}`, // opciono
        uloga: u.uloga,
    });
    res.cookies.set(AUTH_COOKIE, token, cookieOpts()); // u njegove kolacice stavimo kolacic za autentifikaciju,
    // pozivamo funkciju sa cookieparam


    //vracanje json user podataka
    return res;

}




