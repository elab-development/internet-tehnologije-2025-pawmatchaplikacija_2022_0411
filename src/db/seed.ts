
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
    const bukiPassHash = await bcrypt.hash("Sifra123", 10);
    const dijanaPassHash=await bcrypt.hash("dijana123",10);

    await db.transaction(async (tx) => {
        // 1) očisti sve (redosled zbog FK)
        await tx.delete(messages);
        await tx.delete(matches);
        await tx.delete(swipes);
        await tx.delete(petImages);
        await tx.delete(pet);
        await tx.delete(user);

        // 2) users //kreira mi
        const [buki] = await tx
            .insert(user)
            .values({
                uloga: "korisnik",
                ime: "Aleksandar",
                prezime: "Bukovac",
                email: "buki@test.com",
                passHash: bukiPassHash,
                brojTelefona: "061234567",
            })
            .returning({ id: user.id, email: user.email });

        console.log("Korisnik je kreiran: ", buki.email);

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

        const [dijana] = await tx
            .insert(user)
            .values({
                uloga:"korisnik",
                ime:"Dijana",
                prezime:"Novakovic",
                email:"dijana@pawmatch.com",
                passHash: dijanaPassHash,
                brojTelefona: "+381641234567"

            })
            .returning({id: user.id, email:user.email});
        console.log("Kornisnik je kreiran: ", dijana.email);


        // 3) pets
        const [rex] = await tx
            .insert(pet)
            .values({
                vlasnikId: buki.id,
                ime: "Rex",
                opis: "Energičan pas, voli trčanje i igru.",
                vrsta: "dog",
                datumRodjenja: "2021-06-15",
                pol: "male",
                grad: "Belgrade",
                interesovanja: "Running, Playing fetch",
            })
            .returning({ id: pet.id });

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

            const [beki] = await tx
            .insert(pet)
            .values({
                vlasnikId: dijana.id,
                ime: "Beki",
                opis: "Razigran pas koji voli šetnje i društvo",
                vrsta: "dog",
                datumRodjenja: "2021-12-05",
                pol: "male",
                grad: "Belgrade",
                interesovanja: "People, Fetch, Parks",
            })
            .returning({ id: pet.id });

        // 4) images
        await tx.insert(petImages).values([
            { petId: rex.id, url: "/pets/rex_1.jpg", sortOrder: 0 },
            { petId: rex.id, url: "/pets/rex_2.jpg", sortOrder: 1 },

            { petId: luna.id, url: "/pets/luna_1.jpg", sortOrder: 0 },
            { petId: luna.id, url: "/pets/luna_2.jpg", sortOrder: 1 },

            { petId: nora.id, url: "/pets/nora_1.jpg", sortOrder: 0 },
            { petId: nora.id, url: "/pets/nora_2.jpg", sortOrder: 1 },

            { petId: fluff.id, url: "/pets/fluffy_1.jpg", sortOrder: 0 },

            { petId: beki.id, url: "/pets/beki_1.jpg", sortOrder: 0 },
            { petId: beki.id, url: "/pets/beki_2.jpg", sortOrder: 1 },
        ]);

        // 5) swipes (napravićemo match Dobby <-> Lady)
        await tx.insert(swipes).values([
            { fromPetId: rex.id, toPetId: nora.id, type: "like" },
            { fromPetId: nora.id, toPetId: rex.id, type: "like" },
            { fromPetId: rex.id, toPetId: luna.id, type: "like" },
            { fromPetId: luna.id, toPetId: rex.id, type: "like" },
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
        const [p1b, p2b] = sortPair(rex.id, nora.id);
        const bukiMatch2 =
            (
                await tx
                    .insert(matches)
                    .values({ pet1Id: p1b, pet2Id: p2b })
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

