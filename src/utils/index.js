const { prefix } = require("../config.json");
const audio_catalog = require("../constants/audio_catalog.json");
const { cutVideo } = require('./ScissorMe.js');
const { readdirSync, writeFileSync } = require('fs');
const { ScissorsMe } = require('../ScissormeOld')

/**
 * @typedef Meme
 * @property { String } _id
 * @property { String } url
 * @property { String } file
 * @property { MemeTime } [time]
 */

/**
 * @typedef MemeTime
 * @property { Number } start
 * @property { Number } end
 */

/**
 * Return a string escaping all characters.
 * @param { string } string
 * @returns { string }
 */
function getEscapedString (string) {
  let escapedString = '';

  for (char of string) {
    escapedString += `\\${char}`;
  }

  return escapedString;
}

/**
 * Return the command without the prefix.
 * 
 * @param { string } command
 * @return { string }
 */
function getNormalizedCommand (command) {
  const escapedPrefix = getEscapedString(prefix);

  const regex = new RegExp(`^${escapedPrefix}`, 'g')
  return command.replace(regex, '')
}

function getMemeFile (command) {
  const audio = audio_catalog.find(({ _id }) => _id === command);
  if (audio && !audio.file) {
    throw new Error("Não existe esse audio de meme");
  }
  return audio
}

/**
 * Return the meme folder.
 * @returns { string }
 */
function getMemesFolder() {
  return `${__basedir}/memes_audio`;
}

function _getDownloadedAudios() {
  return readdirSync(getMemesFolder());
}

function checkAudio(normalizedCommand) {
  return Boolean(audio_catalog.find(({ _id }) => _id === normalizedCommand));
}

function extractVideoId(url) {
  const matches = url.match(/\?v=(.*)/)
  return matches && matches[1]
}

/**
 * Verifies if has a meme with that id on catalog.
 * If has, replaces it. If don't, than pushes to array.
 * 
 * @param { Meme[] } catalog
 * @param { Meme } newMeme
 * @return { Meme[] } 
 */
function pushCatalog (catalog, newMeme) {
  const index = catalog.findIndex(({ _id }) => _id === newMeme._id)
  if (index !== -1) {
    catalog.splice(index, 1, newMeme)
    return catalog
  }

  catalog.push(newMeme);
  return catalog
}

/**
 * Creates a file in the directory specified with the past content. 
 *
 * @param { string } path
 * @param { string } content
 */
function saveJson (path, content) {
  writeFileSync(path, JSON.stringify(content, null, 4));
}

/**
 *
 *
 * @param {*} message
 */
function setupAudio(message) {
  const preDownloadedAudios = _getDownloadedAudios();
  audio_catalog.forEach(audio => {
    if (!preDownloadedAudios.includes(audio.file)) {
      console.log(`baixando ${audio._id}`);
      new ScissorsMe(`https://www.youtube.com/watch?v=${audio.url}`, audio.time.start, audio.time.end, audio._id);
    }
  });
  message.channel.send("fazendo setup");
}

module.exports = {
  getNormalizedCommand,
  getMemeFile,
  checkAudio,
  setupAudio,
  getMemesFolder,
  extractVideoId,
  pushCatalog,
  saveJson
}