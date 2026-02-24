import {
    pgTable,
    varchar,
    timestamp,
    uuid,
    integer,
    text,
    uniqueIndex,
    doublePrecision,
} from "drizzle-orm/pg-core";
import { createTableRelationsHelpers, relations } from "drizzle-orm";

/*
* uloge korisnika (3 uloge)- find friends for walk
* admin
* korisnik
* neulogovani korisnik
*/

export const userUlogaEnum = ["admin", "korisnik"] as const;
export type UserUloga = (typeof userUlogaEnum)[number];

// USER 
export const user = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(), //uuid je jedinstven id
    uloga: varchar("uloga", { length: 20 }).notNull().default("korisnik"),
    ime: varchar("ime", { length: 100 }).notNull(),
    prezime: varchar("prezime", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passHash: varchar("pass_hash", { length: 255 }).notNull(),
    brojTelefona: varchar("broj_telefona", { length: 30 }),
    createdAt: timestamp("created_at").defaultNow(),
    // Lokacija korisnika (za mapu)
    locationLat: doublePrecision("location_lat"),
    locationLon: doublePrecision("location_lon"),
    locationUpdatedAt: timestamp("location_updated_at"),

});

// PETS
export const pet = pgTable("pets", {
    id: uuid("id").defaultRandom().primaryKey(),
    vlasnikId: uuid("vlasnikId").notNull().
        references(() => user.id, { onDelete: "cascade" }), //spoljni kljuc vlasnika, cascade znaci ako se orbise vlasnik obrisace se i pets
    //image: varchar("image", { length: 500 }).notNull(),
    ime: varchar("ime", { length: 100 }).notNull(),
    opis: text("opis",).notNull(),
    vrsta: varchar("vrsta", { length: 20 }).notNull(), // dog / cat
    datumRodjenja: varchar("datumRodjenja", { length: 20 }),
    pol: varchar("pol", { length: 10 }),
    grad: varchar("grad", { length: 100 }),
    interesovanja: varchar("interesovanja", { length: 255 }),
});

//pets images
export const petImages = pgTable("pet_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    petId: uuid("pet_id").notNull()
        .references(() => pet.id, { onDelete: "cascade" }), // kada se obrise jedan pas brisu se i sve slike
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
});

//swipes
export const swipes = pgTable("swipes", {
    id: uuid("id").defaultRandom().primaryKey(),
    fromPetId: uuid("from_pet_id").notNull().references(() => pet.id),
    toPetId: uuid("to_pet_id").notNull().references(() => pet.id),
    type: varchar("type", { length: 10 }).notNull(), // like / pass
},
    (t) => ({
        fromToUnique: uniqueIndex("swipes_from_to_unique").on(t.fromPetId, t.toPetId),
    })
);

//matches
export const matches = pgTable("matches", {
    id: uuid("id").defaultRandom().primaryKey(),
    pet1Id: uuid("pet1_id").notNull().references(() => pet.id, { onDelete: "cascade" }),
    pet2Id: uuid("pet2_id").notNull().references(() => pet.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
},
    (t) => ({ //ovo sprecava da isti par pasa bude mecovan A-B B-A
        pairUnique: uniqueIndex("matches_pair_unique").on(t.pet1Id, t.pet2Id),
    })
);

//messages
export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
    senderPetId: uuid("sender_pet_id").notNull().references(() => pet.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});


//relations 
export const petsRelations = relations(pet, ({ many, one }) => ({
    vlasnik: one(user, { fields: [pet.vlasnikId], references: [user.id] }),
    images: many(petImages),
}));

export const petImageRelations = relations(petImages, ({ one }) => ({
    pet: one(pet, {
        fields: [petImages.petId],
        references: [pet.id]
    })
}));

export const matchesRelations = relations(matches, ({ many, one }) => ({
  messages: many(messages),
  pet1: one(pet, { fields: [matches.pet1Id], references: [pet.id] }),
  pet2: one(pet, { fields: [matches.pet2Id], references: [pet.id] }),
}));


import {
    pgTable,
    varchar,
    timestamp,
    uuid,
    integer,
    text,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { createTableRelationsHelpers, relations } from "drizzle-orm";

/*
* uloge korisnika (3 uloge)- find friends for walk
* admin
* korisnik
* neulogovani korisnik
*/

export const userUlogaEnum = ["admin", "korisnik"] as const;
export type UserUloga = (typeof userUlogaEnum)[number];

// USER 
export const user = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(), //uuid je jedinstven id
    uloga: varchar("uloga", { length: 20 }).notNull().default("korisnik"),
    ime: varchar("ime", { length: 100 }).notNull(),
    prezime: varchar("prezime", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passHash: varchar("pass_hash", { length: 255 }).notNull(),
    brojTelefona: varchar("broj_telefona", { length: 30 }),
    createdAt: timestamp("created_at").defaultNow(),

});

// PETS
export const pet = pgTable("pets", {
    id: uuid("id").defaultRandom().primaryKey(),
    vlasnikId: uuid("vlasnikId").notNull().
        references(() => user.id, { onDelete: "cascade" }), //spoljni kljuc vlasnika, cascade znaci ako se orbise vlasnik obrisace se i pets
    //image: varchar("image", { length: 500 }).notNull(),
    ime: varchar("ime", { length: 100 }).notNull(),
    opis: text("opis",).notNull(),
    vrsta: varchar("vrsta", { length: 20 }).notNull(), // dog / cat
    datumRodjenja: varchar("datumRodjenja", { length: 20 }),
    pol: varchar("pol", { length: 10 }),
    grad: varchar("grad", { length: 100 }),
    interesovanja: varchar("interesovanja", { length: 255 }),
});

//pets images
export const petImages = pgTable("pet_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    petId: uuid("pet_id").notNull()
        .references(() => pet.id, { onDelete: "cascade" }), // kada se obrise jedan pas brisu se i sve slike
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
});

//swipes
export const swipes = pgTable("swipes", {
    id: uuid("id").defaultRandom().primaryKey(),
    fromPetId: uuid("from_pet_id").notNull().references(() => pet.id),
    toPetId: uuid("to_pet_id").notNull().references(() => pet.id),
    type: varchar("type", { length: 10 }).notNull(), // like / pass
},
    (t) => ({
        fromToUnique: uniqueIndex("swipes_from_to_unique").on(t.fromPetId, t.toPetId),
    })
);

//matches
export const matches = pgTable("matches", {
    id: uuid("id").defaultRandom().primaryKey(),
    pet1Id: uuid("pet1_id").notNull().references(() => pet.id, { onDelete: "cascade" }),
    pet2Id: uuid("pet2_id").notNull().references(() => pet.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
},
    (t) => ({ //ovo sprecava da isti par pasa bude mecovan A-B B-A
        pairUnique: uniqueIndex("matches_pair_unique").on(t.pet1Id, t.pet2Id),
    })
);

//messages
export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
    senderPetId: uuid("sender_pet_id").notNull().references(() => pet.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});


//relations 
export const petsRelations = relations(pet, ({ many, one }) => ({
    vlasnik: one(user, { fields: [pet.vlasnikId], references: [user.id] }),
    images: many(petImages),
}));

export const petImageRelations = relations(petImages, ({ one }) => ({
    pet: one(pet, {
        fields: [petImages.petId],
        references: [pet.id]
    })
}));

export const matchesRelations = relations(matches, ({ many, one }) => ({
  messages: many(messages),
  pet1: one(pet, { fields: [matches.pet1Id], references: [pet.id] }),
  pet2: one(pet, { fields: [matches.pet2Id], references: [pet.id] }),
}));


