/**
 * @template T Array elements type
 * @param {Array<T>} array
 * @returns {T} Random element of the array
 */
export const getRandomArrayElement = array =>
  array[Math.floor(Math.random() * array.length)];
