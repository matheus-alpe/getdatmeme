import path from 'path';
import * as utils from '@utils/index';

describe('Tests the "src/utils/index" file', () => {
  it('should return a valid escaped string', () => {
    const result = utils.getEscapedString('Hello, world!');
    const EXPECTED_RESULT = '\\H\\e\\l\\l\\o\\,\\ \\w\\o\\r\\l\\d\\!';

    expect(result).toBe(EXPECTED_RESULT);
  });

  it("should return a string without it's prefix command", () => {
    const result = utils.getNormalizedCommand('?hello world', '?');
    const EXPECTED_RESULT = 'hello world';

    expect(result).toBe(EXPECTED_RESULT);
  });

  it('should return an audio object', () => {
    const AUDIOS = [
      {
        _id: 1,
        file: 'ree',
      },
    ];

    const result = utils.getMemeFile(1, AUDIOS);
    const EXPECTED_RESULT = AUDIOS[0];

    expect(result).toBe(EXPECTED_RESULT);
  });

  it('should return the path to the memes folder', () => {
    const EXPECTED_RESULT = path.join(process.cwd(), 'memes_audio');
    const result = utils.getMemesFolder();

    expect(result).toBe(EXPECTED_RESULT);
  });
});
