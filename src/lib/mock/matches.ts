// src/lib/mock/matches.ts

import type { Match } from "../types";

export const matches: Match[] = [
  {
    id: "m_1",
    pet1Id: "p_dog_1",
    pet2Id: "p_cat_1",
    createdAt: "2026-02-01T18:10:00.000Z",
  },
  {
    id: "m_2",
    pet1Id: "p_dog_1",
    pet2Id: "p_dog_2",
    createdAt: "2026-01-28T12:30:00.000Z",
  },
  {
    id: "m_3",
    pet1Id: "p_cat_1",
    pet2Id: "p_dog_3",
    createdAt: "2026-01-20T09:15:00.000Z",
  },
  {
    id: "m_4",
    pet1Id: "p_dog_2",
    pet2Id: "p_dog_3",
    createdAt: "2026-01-12T20:05:00.000Z",
  },
];
