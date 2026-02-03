// src/lib/mock/messages.ts

import type { Message } from "../types";

export const messages: Message[] = [
  {
    id: "msg_1",
    matchId: "m_1",
    senderPetId: "p_dog_1",
    text: "Ćao! Kako si danas? 🙂",
    createdAt: "2026-02-01T18:12:00.000Z",
  },
  {
    id: "msg_2",
    matchId: "m_1",
    senderPetId: "p_cat_1",
    text: "Ćao! Super sam, hoćemo u šetnju uskoro?",
    createdAt: "2026-02-01T18:14:00.000Z",
  },
  {
    id: "msg_3",
    matchId: "m_2",
    senderPetId: "p_dog_1",
    text: "Hej! Vidim da voliš duge šetnje 🐾",
    createdAt: "2026-01-28T12:45:00.000Z",
  },
  {
    id: "msg_4",
    matchId: "m_3",
    senderPetId: "p_cat_1",
    text: "Zdravo! Da li tvoj pas voli mačke?",
    createdAt: "2026-01-20T09:20:00.000Z",
  },
];
