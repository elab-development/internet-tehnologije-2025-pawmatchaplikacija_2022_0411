import { db } from "@/db";
import { user } from "@/db/schema";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export { NextResponse } from "next/server";

type Body = { //tip podataka u parametrima
    ime: string;
    prezime: string;
    email: string;
    password: string;
    brojTelefona: string;
};
// req sta klijent salje
export async function POST(req: Request) { //zato sto kreiramo neki obj koji je jwt token
    // 1. parse request
    const { ime, email, password, prezime, brojTelefona } = (await req.json()) as Body; // ono sto je stiglo od klijenta

    //2. validate input
    if (!ime?.trim() || !prezime?.trim() || !email?.trim() || !password || !brojTelefona?.trim()) {
        return NextResponse.json(
            { error: "Sva polja su obavezna" },
            { status: 400 }
        );
    }

    // 3. check if user exists
    const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
    if (existing.length) { //ako je niz duzi odnosto postoji
        return NextResponse.json({ error: "Email vec postoji" }, { status: 400 });
    }

    // 4. hash pass polje mi se zove isto kao u schemi da bih mogla lakse da ih upisem u bazu
    const passHash = await bcrypt.hash(password, 10); //param 10 koliko slozeno mora da bude hesiranje

    //5. create user 
    const [u] = await db
        .insert(user)
        .values({
            ime,
            prezime,
            email,
            passHash,               // hashirana lozinka
            brojTelefona: brojTelefona ?? null,
            // uloga i createdAt se same popune (default)
        })
        .returning({ //oovoo hocu da mii se vrati kada kreiram usera i to ssto vrati to mi smesta u prosledjeno u
            id: user.id,
            ime: user.ime,
            prezime: user.prezime,
            email: user.email,
            uloga: user.uloga,
            createdAt: user.createdAt,
        });
        //                                                                                            ^
    // 6. sign JWT za tok usera kreiramo token sa podacima koje smo dobili nakon kreiranja obj u bazi |
    const token = signAuthToken({ //napravili u okviru auth fajla, importujemo ovu funkciju
        sub: u.id,                     // OBAVEZNO
        email: u.email,                // OBAVEZNO
        name: `${u.ime} ${u.prezime}`, // opciono
        role: u.uloga,
    });


    // 7. set cookie with awt // saljemo kljentu odgovor sa serverske strane koji je json
    const res=NextResponse.json(u);
    res.cookies.set(AUTH_COOKIE,token,cookieOpts()); // u njegove kolacice stavimo kolacic za autentifikaciju,
                                                    // pozivamo funkciju sa cookieparam
    
    //vracanje json user podataka
    return res;

}