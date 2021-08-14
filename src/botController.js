const event = require("events");
const emitter = new event.EventEmitter();

const audio_catalog = require("./constants/audio_catalog.json");
const {
  getNormalizedCommand,
  getMemeFile,
  checkAudio,
  setupAudio,
  getMemesFolder,
  extractVideoId,
  saveJson,
  pushCatalog,
} = require("./utils");
const errors = require("./utils/errors");
const ScissorsMe = require("./lib/ScissormeOld");

const WRONG_CMD_MESSAGES = ["erou", "naoconsegue", "taburro"];

class BotController {
  constructor(prefix) {
    this.prefix = prefix;
    this.queue = new Map();
  }

  handleMessage(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(this.prefix)) return;

    const serverQueue = this.queue.get(message.guild.id);

    const normalizedCommand = getNormalizedCommand(message.content);
    const [command, ...args] = normalizedCommand.split(" ");
    if (checkAudio(command)) {
      this._execute(message, serverQueue);
    } else {
      const handler = this._getCommand(command);
      handler({ message, serverQueue, args });
    }
  }

  _getCommand(command) {
    const commandsMap = {
      setup: ({ message }) => setupAudio(message),
      list: ({ message }) => this._listMemes(message),
      skip: ({ message, serverQueue }) => this._skip(message, serverQueue),
      stop: ({ message, serverQueue }) => this._stop(message, serverQueue),
      "20g": () => message.channel.send("Ta brincando com minha cara né?!!!!!"),
      new: ({ message, serverQueue, args }) => this._addNewMeme(message, args),
      default: ({ message, serverQueue }) =>
        this._defaultErrorMessage(message, serverQueue),
    };

    const handler = commandsMap[command];
    return handler ? handler : commandsMap["default"];
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
      const queueConstruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      this.queue.set(message.guild.id, queueConstruct);

      queueConstruct.songs.push(song);

      try {
        const connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        this._play(message.guild, queueConstruct.songs[0]);
      } catch (err) {
        console.log(err);
        this.queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song._id} has been added to the queue!`);
    }
  }

  _skip(message, serverQueue) {
    if (!serverQueue) {
      return;
    }

    if (!message.member.voice.channel) {
      errors.needToBeInAVoiceChannelError(message);
    } else if (!serverQueue) {
      errors.anySongToSkipError(message);
    }
    serverQueue.connection.dispatcher.end();
  }

  _stop(message, serverQueue) {
    if (!serverQueue) {
      return;
    }

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
    serverQueue.textChannel.send(`Start playing: **${song._id}**`);
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
      return audio_catalog.map((audio) => `${this.prefix}${audio._id}`).sort();
    };
    message.channel.send(getAllMemes().join("\n"));
  }

  _defaultErrorMessage(message, serverQueue) {
    const errorMessage =
      WRONG_CMD_MESSAGES[Math.floor(Math.random() * WRONG_CMD_MESSAGES.length)];
    const audio = audio_catalog.find((audio) => audio._id === errorMessage);
    message.content = `?${audio._id}`;
    this._execute(message, serverQueue);
    errors.invalidCommandError(message);
  }

  _addNewMeme(message, args) {
    if (args.length < 3 || args.length < 4) {
      message.channel.send("precisa passar os comandos certos");
      return;
    }

    const [url, command, start, end] = args;
    const id = extractVideoId(url);
    if (!id) {
      message.channel.send("Não encontramos o vídeo");
      return;
    }

    const newMeme = {
      url: id,
      _id: command,
      file: `${command}.mp3`,
      time: {
        start: Number(start),
        end: Number(end),
      },
    };

    emitter.removeAllListeners("notification");
    emitter.on("notification", (data) => message.channel.send(data));

    saveJson(
      `${__basedir}/constants/audio_catalog.json`,
      pushCatalog(audio_catalog, newMeme)
    );
    new ScissorsMe(url, newMeme.time.start, newMeme.time.end, command, emitter);
    message.channel.send("olha o bixo vinu");
  }
}

module.exports = BotController;
