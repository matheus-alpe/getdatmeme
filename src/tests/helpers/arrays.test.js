import { getRandomArrayElement } from '@helpers/arrays';

describe('Tests the "src/helpers/arrays" file', () => {
  it('should return a random element of the array', () => {
    const ARRAY = ['hello', 1, 'world'];

    const result = getRandomArrayElement(ARRAY);

    expect(ARRAY.includes(result)).toBe(true);
  });
});
