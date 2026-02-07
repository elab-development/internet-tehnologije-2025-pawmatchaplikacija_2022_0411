
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
    const dijanaPassHash = await bcrypt.hash("dijana123", 10);
    const milicaPassHash = await bcrypt.hash("milica123", 10);
    const stefanPassHash = await bcrypt.hash("stefan123", 10);
    const ivanaPassHash = await bcrypt.hash("ivana123", 10);
    const nikolaPassHash = await bcrypt.hash("nikola123", 10);


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
                uloga: "korisnik",
                ime: "Dijana",
                prezime: "Novakovic",
                email: "dijana@pawmatch.com",
                passHash: dijanaPassHash,
                brojTelefona: "+381641234567"

            })
            .returning({ id: user.id, email: user.email });
        console.log("Kornisnik je kreiran: ", dijana.email);

        const [milica] = await tx
            .insert(user)
            .values({
                uloga: "korisnik",
                ime: "Milica",
                prezime: "Milosevic",
                email: "milica@pawmatch.com",
                passHash: milicaPassHash,
                brojTelefona: "+381641110001",
            })
            .returning({ id: user.id, email: user.email });
        console.log("Korisnik je kreiran: ", milica.email);

        const [stefan] = await tx
            .insert(user)
            .values({
                uloga: "korisnik",
                ime: "Stefan",
                prezime: "Ilic",
                email: "stefan@pawmatch.com",
                passHash: stefanPassHash,
                brojTelefona: "+381641110002",
            })
            .returning({ id: user.id, email: user.email });
        console.log("Korisnik je kreiran: ", stefan.email);

        const [ivana] = await tx
            .insert(user)
            .values({
                uloga: "korisnik",
                ime: "Ivana",
                prezime: "Stojanovic",
                email: "ivana@pawmatch.com",
                passHash: ivanaPassHash,
                brojTelefona: "+381641110003",
            })
            .returning({ id: user.id, email: user.email });
        console.log("Korisnik je kreiran: ", ivana.email);

        const [nikola] = await tx
            .insert(user)
            .values({
                uloga: "korisnik",
                ime: "Nikola",
                prezime: "Jankovic",
                email: "nikola@pawmatch.com",
                passHash: nikolaPassHash,
                brojTelefona: "+381641110004",
            })
            .returning({ id: user.id, email: user.email });
        console.log("Korisnik je kreiran: ", nikola.email);

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
        const [miki] = await tx
            .insert(pet)
            .values({
                vlasnikId: milica.id,
                ime: "Miki",
                opis: "Veseo pas koji obožava lopticu i duge šetnje.",
                vrsta: "dog",
                datumRodjenja: "2022-08-20",
                pol: "male",
                grad: "Belgrade",
                interesovanja: "Fetch, Long walks, Treats",
            })
            .returning({ id: pet.id });

        const [kiki] = await tx
            .insert(pet)
            .values({
                vlasnikId: stefan.id,
                ime: "Kiki",
                opis: "Radoznala mačka, voli da istražuje i da se mazi kad se opusti.",
                vrsta: "cat",
                datumRodjenja: "2021-03-12",
                pol: "female",
                grad: "Belgrade",
                interesovanja: "Sunbathing, Toys, Exploring",
            })
            .returning({ id: pet.id });

        const [argo] = await tx
            .insert(pet)
            .values({
                vlasnikId: ivana.id,
                ime: "Argo",
                opis: "Mirniji pas, super za društvo i lagane šetnje po kraju.",
                vrsta: "dog",
                datumRodjenja: "2020-11-02",
                pol: "male",
                grad: "Belgrade",
                interesovanja: "Chill walks, People, Parks",
            })
            .returning({ id: pet.id });

        const [mila] = await tx
            .insert(pet)
            .values({
                vlasnikId: nikola.id,
                ime: "Mila",
                opis: "Druželjubiva maca, voli pažnju i da se igra kanapom.",
                vrsta: "cat",
                datumRodjenja: "2022-05-30",
                pol: "female",
                grad: "Belgrade",
                interesovanja: "String toys, Cuddles, Window watching",
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

            { petId: argo.id, url: "/pets/argo.jpg", sortOrder: 0 },
            { petId: kiki.id, url: "/pets/kiki.jpg", sortOrder: 0 },
            { petId: miki.id, url: "/pets/miki.jpg", sortOrder: 0 },
            { petId: mila.id, url: "/pets/Mila.jpg", sortOrder: 0 }
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
        // AUTO-MATCH: napravi matches za sve uzajamne like parove iz swipes
        const likes = await tx
            .select({ from: swipes.fromPetId, to: swipes.toPetId })
            .from(swipes)
            .where(eq(swipes.type, "like"));

        const likeSet = new Set(likes.map((x) => `${x.from}->${x.to}`));

        const pairs = new Set<string>();

        for (const l of likes) {
            if (likeSet.has(`${l.to}->${l.from}`)) {
                const [p1, p2] = sortPair(l.from, l.to);
                pairs.add(`${p1}|${p2}`);
            }
        }
        if (pairs.size) {
            await tx
                .insert(matches)
                .values(
                    Array.from(pairs).map((k) => {
                        const [pet1Id, pet2Id] = k.split("|");
                        return { pet1Id, pet2Id };
                    })
                )
                .onConflictDoNothing();
        }


        if (pairs.size) {
            await tx.insert(matches).values(
                Array.from(pairs).map((k) => {
                    const [pet1Id, pet2Id] = k.split("|");
                    return { pet1Id, pet2Id };
                })
            ).onConflictDoNothing();
        }


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

