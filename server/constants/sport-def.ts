import type { Definition } from "../types/definition.ts";

export const SportDef: Definition[] = [
  {
    id: 1,
    name: "football",
    derived: ["football", "soccer"],
    definition:
      "A team sport played with a spherical ball between two teams of 11 players.",
  },
  {
    id: 2,
    name: "basketball",
    derived: ["basketball", "basket ball", "basket"],
    definition:
      "A team sport where two teams, most commonly of five players each, opposing one another on a rectangular court.",
  },
  {
    id: 3,
    name: "tennis",
    derived: ["tennis"],
    definition:
      "A racket sport that can be played individually against a single opponent or between two teams of two players each.",
  },
  {
    id: 4,
    name: "swimming",
    derived: ["swimming"],
    definition:
      "An individual or team racing sport that requires the use of one's entire body to move through water.",
  },
  {
    id: 5,
    name: "running",
    derived: ["running"],
    definition:
      "A method of terrestrial locomotion allowing humans and other animals to move rapidly on foot.",
  },
];
