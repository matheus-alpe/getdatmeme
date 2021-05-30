const { prefix } = require("../config.json");
const audio_catalog = require("../constants/audio_catalog.json");
const { cutVideo } = require('./ScissorMe.js');
const { readdirSync } = require('fs');
const { ScissorsMe } = require('../ScissormeOld')

function extractVideoId(url){
  const matches = url.match(/\?v=(.*)/)
  return matches && matches[1]
}

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

function downloadAudio(message) {
  const preDownloadedAudios = _getDownloadedAudios();
  audio_catalog.forEach(audio => {
    if (!preDownloadedAudios.includes(audio.file)) {
      console.log(`baixando ${audio.alias}`);
      new ScissorsMe(`https://www.youtube.com/watch?v=${audio._id}`, audio.time.start, audio.time.end);
      // cutVideo(`https://www.youtube.com/watch?v=${audio._id}`, audio.time.start, audio.time.end, __basedir)
    }
  });
  message.channel.send("fazendo setup");
}

module.exports = {
  downloadAudio,
  getMemesFolder,
  extractVideoId,
  getNormalizedCommand
}