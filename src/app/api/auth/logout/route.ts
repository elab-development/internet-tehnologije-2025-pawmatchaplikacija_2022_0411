export const runtime="nodejs";
import { NextResponse }  from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export async function POST(){
    const res=NextResponse.json({ok:true});
                //token prazan
    res.cookies.set(AUTH_COOKIE,"",{
         httpOnly:true,
        sameSite: "lax"as const,//samo na nasem sajtu citaju podaci koji su dosli sa naseg sajta
        secure: process.env.NODE_ENV==="production", // kada okacimo nas sajt na internet da on radi kukiji mogu da se salju samo sa http zahteva
        path:"/",
        maxAge:0, // postavljamo da je istekap
        expires:new Date(0), 
    });
    return res;

    // kako cookie zna koji je to token, tako sto u heder u http zahteva on je dobio taj token i zna zakog korisnika
    // je taj token vezan i samo njemu postavi da je istekao
}