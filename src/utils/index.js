const { prefix } = require("../config.json");
const audio_catalog = require("../constants/audio_catalog.json");
const { cutVideo } = require('./ScissorMe.js');
const { readdirSync, writeFileSync } = require('fs');
const { ScissorsMe } = require('../ScissormeOld')

/**
 * Return a string escaping all characters.
 * @param {string} string
 * @returns {string}
 */
function getEscapedString(string) {
  let escapedString = '';

  for (char of string) {
    escapedString += `\\${char}`;
  }

  return escapedString;
}

/**
 * Return the command whitout the prefix.
 * @param { string } command
 * @return { string }
 */
function getNormalizedCommand(command) {
  const escapedPrefix = getEscapedString(prefix);

  const regex = new RegExp(`^${escapedPrefix}`, 'g')
  return command.replace(regex, '')
}

function getMemeFile(command) {
  const audio = audio_catalog.find(({ _id }) => _id === command);
  if (audio && !audio.file) {
    throw new Error("Não existe esse audio de meme");
  }
  return audio
}

/**
 * Return the meme folder;
 * @returns {string}
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

function extractVideoId(url){
  const matches = url.match(/\?v=(.*)/)
  return matches && matches[1]
}

function pushCatalog(catalog, newMeme) {
  const index = catalog.findIndex(({ _id }) => _id === newMeme._id)
  if (index !== -1) {
    catalog.splice(index, 1, newMeme)
    return catalog
  }

  catalog.push(newMeme);
  return catalog
}

function saveJson(path, content) {
  console.log(1);
  writeFileSync(path, JSON.stringify(content, null, 4));
}

function downloadAudio(message) {
  const preDownloadedAudios = _getDownloadedAudios();
  audio_catalog.forEach(audio => {
    if (!preDownloadedAudios.includes(audio.file)) {
      console.log(`baixando ${audio._id}`);
      new ScissorsMe(`https://www.youtube.com/watch?v=${audio.url}`, audio.time.start, audio.time.end, audio._id);
      // cutVideo(`https://www.youtube.com/watch?v=${audio._id}`, audio.time.start, audio.time.end, __basedir)
    }
  });
  message.channel.send("fazendo setup");
}

module.exports = {
  getNormalizedCommand,
  getMemeFile,
  checkAudio,
  downloadAudio,
  getMemesFolder,
  extractVideoId,
  pushCatalog,
  saveJson
}