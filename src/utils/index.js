import fs from 'fs';
import path from 'path';

import AudioController from '@controllers/audio-controller';
import audioCatalog from '@constants/audio_catalog';

import '../types';

/**
 * Return a string escaping all characters.
 * @param {string} string
 * @returns {string}
 export */
export function getEscapedString(string) {
  let escapedString = '';

  for (const char of string) {
    escapedString += `\\${char}`;
  }

  return escapedString;
}

/**
 * Returns the command without the prefix.
 *
 * @param {string} command
 * @return {string}
 */
export function getNormalizedCommand(command, prefix = process.env.PREFIX) {
  const escapedPrefix = getEscapedString(prefix);
  const regex = new RegExp(`^${escapedPrefix}`, 'g');
  return command.replace(regex, '');
}

/**
 *
 * @param {string} memeId Id of a given meme
 * @returns
 */
export function getMemeFile(memeId, files = audioCatalog) {
  const audio = files.find(({ _id }) => _id === memeId);

  if (!audio?.file) {
    throw new Error('Não existe esse audio de meme');
  }

  return audio;
}

/**
 * Return the meme folder.
 * @returns Memes folder path
 */
export function getMemesFolder() {
  return path.join(process.cwd(), 'memes_audio');
}

/**
 *
 * @returns A list of downloaded audios
 */
export function getDownloadedAudios() {
  const memesFolder = getMemesFolder();
  return fs.readdirSync(memesFolder);
}

/**
 * Checks if the audio catalog has a given audio id
 *
 * @param {string} audioId
 * @returns
 */
export function checkAudio(audioId) {
  return audioCatalog.includes(audioId);
}

/**
 * Returns a YouTube video url key as in '?v=...' for a given url
 *
 * @param {string} url
 * @returns
 */
export function extractVideoId(url) {
  const matches = url.match(/\?v=(.*)/);
  return matches ? matches[1] : null;
}

/**
 * Verifies if has a meme with that id on catalog.
 * If has, replaces it. If don't, than pushes to array.
 *
 * @param {Meme[]} catalog
 * @param {Meme} newMeme
 * @return {Meme[]}
 */
export function pushCatalog(catalog, newMeme) {
  const index = catalog.findIndex(({ _id }) => _id === newMeme._id);
  if (index !== -1) {
    catalog.splice(index, 1, newMeme);
    return catalog;
  }

  catalog.push(newMeme);
  return catalog;
}

/**
 * Creates a file in the directory specified with the past content.
 *
 * @param {string} path
 * @param {string} content
 */
export function saveJson(path, content) {
  fs.writeFileSync(path, JSON.stringify(content, null, 4));
}

/**
 *
 *
 * @param {*} message
 */
export function setupAudio(message) {
  const preDownloadedAudios = getDownloadedAudios();
  audioCatalog.forEach(audio => {
    if (!preDownloadedAudios.includes(audio.file)) {
      console.log(`baixando ${audio._id}`);
      new AudioController(
        `https://www.youtube.com/watch?v=${audio.url}`,
        audio.time.start,
        audio.time.end,
        audio._id
      );
    }
  });
  message.channel.send('fazendo setup');
}
