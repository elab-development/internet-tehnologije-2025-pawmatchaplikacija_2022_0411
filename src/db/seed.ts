
import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./index";
import {
    user,
    pet,
    petImages,
    swipes,
    matches,
    messages
} from "./schema";
import { eq, and } from "drizzle-orm";

function sortPair(a: string, b: string) {
    return a < b ? [a, b] as const : [b, a] as const;
}

async function seed() {
    console.log("🌱 Seeding database...");

    const adminPassHash = await bcrypt.hash("admin123", 10);
    const anaPassHash = await bcrypt.hash("ana123", 10);
    const markoPassHash = await bcrypt.hash("marko123", 10);

    await db.transaction(async (tx) => {
        // 1) očisti sve (redosled zbog FK)
        await tx.delete(messages);
        await tx.delete(matches);
        await tx.delete(swipes);
        await tx.delete(petImages);
        await tx.delete(pet);
        await tx.delete(user);

        // 2) users //kreira mi
        const [admin] = await tx
            .insert(user) //KREIRANJE
            .values({
                uloga: "admin",
                ime: "Anja",
                prezime: "Nesic",
                email: "anjanesic@pawmatch.com",
                passHash: adminPassHash,
                brojTelefona: "+38160111222",
            })
            .returning({ id: user.id, email: user.email });
        console.log("Admin je kreiran: ", admin.email);

        const [ana] = await tx
            .insert(user)
            .values({
                uloga: "korisnik",
                ime: "Ana",
                prezime: "Jovanovic",
                email: "ana@pawmatch.com",
                passHash: anaPassHash,
                brojTelefona: "+38164123456",
            })
            .returning({ id: user.id, email: user.email });
        console.log("Korisnik je kreiran: ", ana.email);

        const [marko] = await tx
            .insert(user)
            .values({
                uloga: "korisnik",
                ime: "Marko",
                prezime: "Petrovic",
                email: "marko@pawmatch.com",
                passHash: markoPassHash,
                brojTelefona: "+38165111222",
            })
            .returning({ id: user.id, email: user.email });
        console.log("Korisnik je kreiran: ", marko.email);

        // 3) pets
        const [luna] = await tx
            .insert(pet) //kreiram psa
            .values({
                vlasnikId: ana.id,
                ime: "Luna",
                opis: "Voli šetnje i parkove. Društven i miran pas.",
                vrsta: "dog",
                datumRodjenja: "2022-04-10",
                pol: "female",
                grad: "Belgrade",
                interesovanja: "Playing in park, Barking, Sniffing",
            })
            .returning({ id: pet.id });

        const [nora] = await tx
            .insert(pet)
            .values({
                vlasnikId: marko.id,
                ime: "Nora",
                opis: "Mala mazna, voli pažnju i igru.",
                vrsta: "dog",
                datumRodjenja: "2023-01-05",
                pol: "female",
                grad: "Belgrade",
                interesovanja: "Eating, Pigeon watching, Hunting",
            })
            .returning({ id: pet.id });

        const [fluff] = await tx
            .insert(pet)
            .values({
                vlasnikId: admin.id,
                ime: "Fluff",
                opis: "Mačka koja obožava dremke i sunce.",
                vrsta: "cat",
                datumRodjenja: "2021-09-01",
                pol: "female",
                grad: "Belgrade",
                interesovanja: "Sleeping, Mouse, Hunting",
            })
            .returning({ id: pet.id });

        // 4) images
        await tx.insert(petImages).values([
            { petId: luna.id, url: "https://picsum.photos/seed/dobby1/600/800", sortOrder: 0 },
            { petId: luna.id, url: "https://picsum.photos/seed/dobby2/600/800", sortOrder: 1 },

            { petId: nora.id, url: "https://picsum.photos/seed/lady1/600/800", sortOrder: 0 },
            { petId: nora.id, url: "https://picsum.photos/seed/lady2/600/800", sortOrder: 1 },

            { petId: fluff.id, url: "https://picsum.photos/seed/fluff1/600/800", sortOrder: 0 },
        ]);

        // 5) swipes (napravićemo match Dobby <-> Lady)
        await tx.insert(swipes).values([
            { fromPetId: luna.id, toPetId: nora.id, type: "like" },
            { fromPetId: nora.id, toPetId: luna.id, type: "like" }, // ✅ obrnuto

            { fromPetId: nora.id, toPetId: fluff.id, type: "pass" },
            { fromPetId: fluff.id, toPetId: nora.id, type: "like" },
        ]);


        // 6) match (OBAVEZNO sortiranje para)
        const [pet1Id, pet2Id] = sortPair(nora.id, luna.id);

        // Ako seed pokreneš više puta, unique index bi bacao error
        // pa proverimo da li već postoji:
        const existing = await tx
            .select({ id: matches.id })
            .from(matches)
            .where(and(eq(matches.pet1Id, pet1Id), eq(matches.pet2Id, pet2Id)));

        const matchId =
            existing[0]?.id ??
            (
                await tx
                    .insert(matches)
                    .values({ pet1Id, pet2Id })
                    .returning({ id: matches.id })
            )[0].id;

        // 7) messages
        await tx.insert(messages).values([
            { matchId, senderPetId: luna.id, text: "Ćao! Hoćemo šetnju u parku?" },
            { matchId, senderPetId: nora.id, text: "Može! Kada ti odgovara?" },
            { matchId, senderPetId: luna.id, text: "Sutra oko 18h?" },
        ]);
    });

    console.log("✅ Seed done!");
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("❌ greskaaaa u seedu Seed failed:", e);
        process.exit(1);
    });

