
export type ID = string;

export type UserUloga = "admin" | "korisnik";
export type Vrsta = "dog" | "cat";
export type SwipeType = "like" | "pass";

export type User = {
  id: ID;
  uloga: UserUloga;
  ime: string;
  prezime: string;
  email: string;
  brojTelefona?: string | null;
  createdAt?: string; // ISO
};

export type Pet = {
  id: ID;
  vlasnikId: ID;
  ime: string;
  opis: string;
  vrsta: Vrsta;
  datumRodjenja?: string | null; // npr "2019-05-20"
  pol?: "male" | "female" | null;
  grad?: string | null;
  interesovanja?: string[]; // u UI kao niz
  images?: PetImage[];
};

export type PetImage = {
  id: ID;
  petId: ID;
  url: string;
  sortOrder: number;
};

export type Swipe = {
  id: ID;
  fromPetId: ID;
  toPetId: ID;
  type: SwipeType;
};

export type Match = {
  id: ID;
  pet1Id: ID;
  pet2Id: ID;
  createdAt?: string;
};

export type Message = {
  id: ID;
  matchId: ID;
  senderPetId: ID;
  text: string;
  createdAt?: string;
};

// UI “agregati” (ovo ti najviše treba u komponentama)
export type PetProfile = Pet & { images: string[] };

export type MatchCard = {
  match: Match;
  otherPet: PetProfile;
  lastMessage?: Message;
};
