import * as jwt from "jsonwebtoken";

export const AUTH_COOKIE = "auth";

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "7d";

export type JwtUserClaims = {
  id: string;
  email: string;
  ime?: string;
  prezime?: string;
  uloga?: string;
};

export function signAuthToken(claims: JwtUserClaims) {
  // BITNO: setuj subject (sub) na user id
  return jwt.sign(
    { ...claims },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
      subject: claims.id,
    }
  );
}

export function verifyAuthToken(token: string): JwtUserClaims {
  const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & any;

  // prihvati i sub i id (da ne pucaš na starim tokenima)
  const id = (payload.sub ?? payload.id) as string | undefined;
  const email = payload.email as string | undefined;

  if (!id || !email) throw new Error("invalid token");

  return {
    id,
    email,
    ime: payload.ime ?? payload.name,
    prezime: payload.prezime,
    uloga: payload.uloga ?? payload.role,
  };
}

export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
