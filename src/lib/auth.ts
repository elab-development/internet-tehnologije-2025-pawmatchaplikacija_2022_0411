import * as jwt from "jsonwebtoken"; // biblioteka sa kreiranje dokena
//ima ulogu sign i 
// verify ima ulogu da validira svaki put kada korisnik zeli da uradi nesto zasticeno 


export const AUTH_COOKIE="auth"; //kolacic kasnije gde cemo cuvati doken

const JWT_SECRET=process.env.JWT_SECRET as jwt.Secret;
const JWT_EXPIRES=process.env.JWT_EXPIRES ?? "7d"; // ovde izvlaci kada token istice ako nema onda 7d

if(!JWT_EXPIRES){
    throw new Error("Fali JWT_SECRET in env file");
}

export type JwtUserClaims={ // ako ima tokena ovo je tip podataka koji da algoritmu sta koristi da bi kreirao token
    sub:string; //subject ugl je ID 
    email:string;
    name?:string; // opciono
    role?:string;
};

export function signAuthToken(claims:JwtUserClaims){
    return jwt.sign(claims as jwt.JwtPayload, JWT_SECRET,{
        algorithm:"HS256",

        //@TYPES/JSONWEBTOKEN VOLI NUMBER | STRINGvalue -> cast resava konfilkt
        expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
    });
}

///export function verifyAuthToken(token:string):JwtUserClaims{ 
  //  const payload=jwt.verify(token,JWT_SECRET) as jwt
//}