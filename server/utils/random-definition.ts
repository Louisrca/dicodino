import type { Definition } from "../types/definitions.ts";

export const randomDefinition = (array: Definition[]): Definition => {
  const randomIndex = Math.floor(Math.random() * array.length);

  if (!array[randomIndex]) {
    throw new Error("Random index does not exist in the array");
  }

  return array[randomIndex];
};
