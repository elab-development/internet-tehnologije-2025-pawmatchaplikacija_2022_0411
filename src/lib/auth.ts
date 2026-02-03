import * as jwt from "jsonwebtoken"; // biblioteka sa kreiranje dokena
//ima ulogu sign i 
// verify ima ulogu da validira svaki put kada korisnik zeli da uradi nesto zasticeno 


export const AUTH_COOKIE="auth"; //kolacic kasnije gde cemo cuvati token

const JWT_SECRET=process.env.JWT_SECRET as jwt.Secret;
const JWT_EXPIRES=process.env.JWT_EXPIRES ?? "7d"; // ovde izvlaci kada token istice ako nema onda 7d

if(!JWT_EXPIRES){
    throw new Error("Fali JWT_SECRET in env file");
}

export type JwtUserClaims={ // ako ima tokena ovo je tip podataka koji da algoritmu sta koristi da bi kreirao token
    id:string; //subject ugl je ID 
    email:string;
    ime?:string; // opciono
    prezime?:string,
    uloga?:string;
};

export function signAuthToken(claims:JwtUserClaims){ //nju pozivamo svaki put kada hocfemo da kreiramo token kada se korisnik uloguje u aplikaciju
    return jwt.sign(claims as jwt.JwtPayload, JWT_SECRET,{
        algorithm:"HS256",

        //@TYPES/JSONWEBTOKEN VOLI NUMBER | STRINGvalue -> cast resava konfilkt
        expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
    });
}

export function verifyAuthToken(token:string):JwtUserClaims{  //funkcija koju koristimo kada je korisnik vec ulogovan
    const payload=jwt.verify(token,JWT_SECRET) as jwt.JwtPayload & JwtUserClaims; //payload je token
    if(!payload?.sub || !payload?.email){ //ako je uredu token dolazi iz naseg servera
        throw new Error("invalid token");
    }

    return{ //vraca json objekat desifrovan
        id:payload.sub,
        email:payload.email,
        ime:payload.name,
        prezime:payload.prezime,
        uloga:payload.role
    };
}
//xss napad neko pokusava da ubaci javascript kode zlonamerni i da se izvrsi kod neko klijenta
//csrf napad kada neko pokusava da bez naseg znanja posalje zahtev sa naseg sajta kada smo ulogovani npr sajt banke
export function cookieOpts(){ //bezbedonosne  opcije za kolacice
    return{
        httpOnly:true,//zbog xss napada, obezbedjuje nece moci da se ucita kuki koji nije dosao sa naseg servera
        sameSite: "lax"as const,//samo na nasem sajtu citaju podaci koji su dosli sa naseg sajta
        secure: process.env.NODE_ENV==="production", // kada okacimo nas sajt na internet da on radi kukiji mogu da se salju samo sa http zahteva
        path:"/",
        maxAge:60*60*24*7,
    };
}