export const randomWord = (array: string[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex];
};
