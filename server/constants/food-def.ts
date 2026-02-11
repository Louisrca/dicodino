import type { Definition } from "../types/definitions.ts";

export const FoodDef: Definition[] = [
  {
    id: 1,
    name: "pizza",
    derived: ["pizza"],
    definition:
      "A savory dish of Italian origin consisting of a usually round, flattened base of leavened wheat-based dough topped with tomatoes, cheese, and often various other ingredients.",
  },
  {
    id: 2,
    name: "burger",
    derived: ["burger", "hamburger"],
    definition:
      "A sandwich consisting of one or more cooked patties of ground meat, usually beef, placed inside a sliced bread roll or bun.",
  },
  {
    id: 3,
    name: "sushi",
    derived: ["sushi"],
    definition:
      "A Japanese dish consisting of vinegared rice accompanied by various ingredients such as seafood, vegetables, and occasionally tropical fruits.",
  },
  {
    id: 4,
    name: "pasta",
    derived: ["pasta"],
    definition:
      "An Italian type of food typically made from an unleavened dough of wheat flour mixed with water or eggs, and formed into various shapes, then cooked by boiling or baking.",
  },
  {
    id: 5,
    name: "salad",
    derived: ["salad"],
    definition:
      "A dish consisting of a mixture of small pieces of food, usually vegetables or fruit.",
  },
];
