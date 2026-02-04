import type { MatchCard } from "@/lib/types";
import { pets } from "@/lib/mock/pets";

export const matches: MatchCard[] = [
  {
    match: {
      id: "m_1",
      pet1Id: "p_dog_1",
      pet2Id: "p_cat_1",
      createdAt: "2026-02-01",
    },
    otherPet: pets[1], // Mila
    lastMessage: {
      id: "msg_1",
      matchId: "m_1",
      senderPetId: pets[1].id,
      text: "Ćao! 😺",
      createdAt: "2026-02-01",
    },
  },
  {
    match: {
      id: "m_2",
      pet1Id: "p_dog_1",
      pet2Id: "p_dog_2",
      createdAt: "2026-02-02",
    },
    otherPet: pets[2], // Lady
    lastMessage: {
      id: "msg_2",
      matchId: "m_2",
      senderPetId: pets[2].id,
      text: "Šetnja danas? 🐾",
      createdAt: "2026-02-02",
    },
  },
  {
    match: {
      id: "m_3",
      pet1Id: "p_dog_1",
      pet2Id: "p_dog_3",
      createdAt: "2026-02-03",
    },
    otherPet: pets[3], // Rex
    lastMessage: {
      id: "msg_3",
      matchId: "m_3",
      senderPetId: pets[3].id,
      text: "Ajmo u park 💚",
      createdAt: "2026-02-03",
    },
  },
  {
    match: {
      id: "m_4",
      pet1Id: "p_dog_1",
      pet2Id: "p_cat_2",
      createdAt: "2026-02-04",
    },
    otherPet: pets[0], // Toby (namerno ponovljen radi UI)
    lastMessage: {
      id: "msg_4",
      matchId: "m_4",
      senderPetId: pets[0].id,
      text: "Voliš li duge šetnje?",
      createdAt: "2026-02-04",
    },
  },
  {
    match: {
      id: "m_5",
      pet1Id: "p_dog_1",
      pet2Id: "p_dog_4",
      createdAt: "2026-02-05",
    },
    otherPet: pets[1],
  },
  {
    match: {
      id: "m_6",
      pet1Id: "p_dog_1",
      pet2Id: "p_cat_3",
      createdAt: "2026-02-06",
    },
    otherPet: pets[2],
  },
];
