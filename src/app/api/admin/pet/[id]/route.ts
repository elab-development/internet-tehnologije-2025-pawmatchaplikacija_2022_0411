export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { pet } from "@/db/schema";

function cleanString(x: unknown) {
    return typeof x === "string" ? x.trim() : "";
}

// =====================
// GET one pet
// =====================
export async function GET(
    _: Request, //
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params; // ucitavanje parametra  iz linka

    const petId = cleanString(id);
    if (!petId) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try { // onda iz baze mi ucitaj
        const [one] = await db
            .select()
            .from(pet)
            .where(eq(pet.id, petId)); // gde se poklapa vrati u objekat one
        return NextResponse.json({ pet: one ?? null }); // i taj objekat vrati u json objekat
    } catch {
        return NextResponse.json({ error: "failed to fetch pet" }, { status: 500 });
    }
}


// UPDATE pet (PATCH) put i patch rade update, put kada je vise objekata a patch je za manje
export async function PATCH(
    req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params; // uzimamo id iz linka
    const petId = cleanString(id);

    if (!petId) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as any)); //izvlacimo iz body-a sve parametre koji korisnik hoce da azurira

    // patch objekat - samo prosledjena polja
    const patch: Partial<{  //kao hash mapa
        ime: string;
        opis: string;
        vrsta: string;
        datumRodjenja: string;
        pol: string;
        grad: string;
        interesovanja: string;
    }> = {};

    if (cleanString(body?.ime)) patch.ime = cleanString(body.ime);
    if (cleanString(body?.opis)) patch.opis = cleanString(body.opis);
    if (cleanString(body?.vrsta)) patch.vrsta = cleanString(body.vrsta);

    if (cleanString(body?.datumRodjenja)) patch.datumRodjenja = cleanString(body.datumRodjenja);
    if (cleanString(body?.pol)) patch.pol = cleanString(body.pol);
    if (cleanString(body?.grad)) patch.grad = cleanString(body.grad);
    if (cleanString(body?.interesovanja)) patch.interesovanja = cleanString(body.interesovanja);

    // validacija za vrstu (ako je poslata)
    if (patch.vrsta && !["dog", "cat"].includes(patch.vrsta)) {
        return NextResponse.json(
            { error: 'vrsta must be "dog" or "cat"' },
            { status: 400 }
        );
    }

    try {
        const [updated] = await db
            .update(pet)
            .set(patch) // patch prosledjujemo jer ne znamo sta ce biti prosledjeno da se  azurira
            .where(eq(pet.id, petId))
            .returning();

        return NextResponse.json({ pet: updated ?? null });
    } catch {
        return NextResponse.json({ error: "ne moze da se azurira pet" }, { status: 500 });
    }
}

// =====================
// DELETE pet
// =====================
export async function DELETE(
    _: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    const petId = cleanString(id);
    if (!petId) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
        await db.delete(pet).where(eq(pet.id, petId));
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "failed to delete pet" }, { status: 500 });
    }
}

