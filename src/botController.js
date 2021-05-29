

const audio_catalog = require("./constants/audio_catalog.json");
const { getNormalizedCommand, getMemeFile, checkAudio, downloadAudio,getMemesFolder } = require("./utils")
const errors = require('./utils/errors')

const WRONG_CMD_MESSAGES = [
  's0eP7S3BIxs',
  '6GfqT-HKsY8'
]
module.exports = class BotController {
  constructor(prefix) {
    this.prefix = prefix;
    this.queue = new Map();
  }

  handleMessage(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(this.prefix)) return;

    const serverQueue = this.queue.get(message.guild.id);

    const normalizedCommand = getNormalizedCommand(message.content);

    if (checkAudio(normalizedCommand)) {
      this._execute(message, serverQueue);
    } else {
      var commandsMap = {
        'setup': () => downloadAudio(message),
        'list': () => this._listMemes(message),
        'skip': () => this._skip(message, serverQueue),
        'stop': () => this._stop(message, serverQueue),
        '20g': () => message.channel.send("Ta brincando com minha cara né?!!!!!"),
        'new': () => message.channel.send("isso ainda precisa ser implementado"),
        'default': () => this._defaultErrorMessage(message, serverQueue)
      }

      let handler = commandsMap[normalizedCommand];
      handler = handler ? handler : commandsMap['default'];
      handler();
    }
  }

  async _execute(message, serverQueue) {
    const normalizedCommand = getNormalizedCommand(message.content);

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errors.needToBeInAVoiceChannelError(message);
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      errors.botWithoutPermissionError(message);
    }

    const song = getMemeFile(normalizedCommand);

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      this.queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        this._play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        this.queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(
        `${song.alias} has been added to the queue!`
      );
    }
  }

  _skip(message, serverQueue) {
    if (!message.member.voice.channel) {
      errors.needToBeInAVoiceChannelError(message);
    } else if (!serverQueue) {
      errors.anySongToSkipError(message);
    }
    serverQueue.connection.dispatcher.end();
  }

  _stop(message, serverQueue) {
    if (!message.member.voice.channel) {
      errors.needToBeInAVoiceChannelError(message);
    } else if (!serverQueue) {
      errors.anySongToSkipError(message);
    }

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }

  _play(guild, song) {
    const serverQueue = this.queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      this.queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .play(`${getMemesFolder()}/${song.file}`)
      .on("finish", () => {
        serverQueue.songs.shift();
        this._play(guild, serverQueue.songs[0]);
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.alias}**`);
  }

  /**
   * Send a message showing all memes on Discord.
   */
  _listMemes(message) {
    /**
     * Get all memes of static catalog.
     * @returns {string[]}
     */
    const getAllMemes = () => {
      return audio_catalog
        .map(audio => `${this.prefix}${audio.alias}`)
        .sort();
    }
    message.channel.send(getAllMemes().join('\n'));
  }

  _defaultErrorMessage(message, serverQueue) {
    const errorMessage = WRONG_CMD_MESSAGES[Math.floor(Math.random() * WRONG_CMD_MESSAGES.length)]
    const audio = audio_catalog.find(audio => audio._id === errorMessage);
    message.content = `?${audio.alias}`;
    this._execute(message, serverQueue);
    errors.invalidCommandError(message);
  }
}
