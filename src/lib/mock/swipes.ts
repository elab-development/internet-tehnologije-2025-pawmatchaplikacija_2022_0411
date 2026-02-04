// src/lib/mock/swipes.ts

import type { Swipe } from "../types";

export const swipes: Swipe[] = [
  {
    id: "s_1",
    fromPetId: "p_dog_1",
    toPetId: "p_cat_1",
    type: "like",
  },
  {
    id: "s_2",
    fromPetId: "p_dog_1",
    toPetId: "p_dog_2",
    type: "pass",
  },
  {
    id: "s_3",
    fromPetId: "p_cat_1",
    toPetId: "p_dog_1",
    type: "like",
  },
  {
    id: "s_4",
    fromPetId: "p_dog_2",
    toPetId: "p_dog_3",
    type: "like",
  },
];
