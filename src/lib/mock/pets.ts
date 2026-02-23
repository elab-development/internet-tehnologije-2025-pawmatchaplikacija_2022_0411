// src/app/lib/mock/pets.ts

import type { PetProfile } from "../types";

export const pets: PetProfile[] = [ //niz profila zivotinja
  {
    id: "p_dog_1",
    vlasnikId: "u_1",
    ime: "Toby",
    opis: "Voli lopticu, šetnje i upoznavanje novih drugara u parku.",
    vrsta: "dog",
    datumRodjenja: "2020-06-10",
    pol: "male",
    grad: "Novi Sad",
    interesovanja: ["šetnja", "park", "igranje", "loptica"],
    images: [
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "p_cat_1",
    vlasnikId: "u_2",
    ime: "Mila",
    opis: "Mirna maca, voli sunčanje na prozoru i maženje kad te upozna.",
    vrsta: "cat",
    datumRodjenja: "2021-03-02",
    pol: "female",
    grad: "Beograd",
    interesovanja: ["spavanje", "sunce", "maženje"],
    images: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "p_dog_2",
    vlasnikId: "u_3",
    ime: "Lady",
    opis: "Uvek raspoložena za društvo. Najviše voli duge šetnje i poslastice.",
    vrsta: "dog",
    datumRodjenja: "2019-11-18",
    pol: "female",
    grad: "Niš",
    interesovanja: ["duge šetnje", "poslastice", "druženje"],
    images: [
      "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "p_dog_3",
    vlasnikId: "u_4",
    ime: "Rex",
    opis: "Energija 100%. Voli trčanje, trening i nove izazove.",
    vrsta: "dog",
    datumRodjenja: "2018-08-05",
    pol: "male",
    grad: "Kragujevac",
    interesovanja: ["trčanje", "trening", "frizbi"],
    images: [
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];
