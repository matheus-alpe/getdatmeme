import events from 'events';

import {
  getNormalizedCommand,
  getMemeFile,
  checkAudio,
  setupAudio,
  getMemesFolder,
  extractVideoId,
  saveJson,
  pushCatalog,
} from '@utils/index';
import * as discordErrors from '@errors/discord-errors';
import audioCatalog from '@constants/audio_catalog.json';
import AudioController from '@controllers/audio-controller';
import { getRandomArrayElement } from '@helpers/arrays';

const emitter = new events.EventEmitter();
const WRONG_CMD_MESSAGES = ['erou', 'naoconsegue', 'taburro'];

export default class BotController {
  /**
   * Generates a new bot controller
   *
   * @param {string} prefix Bot controller prefix, the standard prefix is "?".
   */
  constructor(prefix = '?') {
    this.prefix = prefix;
    this.queue = new Map();
  }

  /**
   * Handles the user command
   *
   * @param {string} message
   * @returns
   */
  handleMessage(message) {
    if (!this._isAValidCommand(message)) return;

    const serverQueue = this.queue.get(message.guild.id);

    const normalizedCommand = getNormalizedCommand(message.content);
    const [command, ...args] = normalizedCommand.split(' ');

    if (checkAudio(command)) {
      this._execute(message, serverQueue);
      return;
    }

    const handler = this._getCommand(command);
    handler({ message, serverQueue, args });
  }

  /**
   * @param {DiscordMessageType} message
   * @returns A boolean value indicating if the command is valid or not
   */
  _isAValidCommand(message) {
    // If the message author is the bot itself or it doesn't start with
    // the predefined prefix
    return !message.author.bot || message.content.startsWith(this.prefix);
  }

  _getCommand(command) {
    const commandsMap = {
      setup: ({ message }) => setupAudio(message),
      list: ({ message }) => this._listMemes(message),
      skip: ({ message, serverQueue }) => this._skip(message, serverQueue),
      stop: ({ message, serverQueue }) => this._stop(message, serverQueue),
      '20g': () => message.channel.send('Ta brincando com minha cara né?!!!!!'),
      new: ({ message, serverQueue, args }) => this._addNewMeme(message, args),
      default: ({ message, serverQueue }) =>
        this._defaultErrorMessage(message, serverQueue),
    };

    const handler = commandsMap[command];
    return handler ? handler : commandsMap['default'];
  }

  async _execute(message, serverQueue) {
    const normalizedCommand = getNormalizedCommand(message.content);

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      discordErrors.needToBeInAVoiceChannelError(message);
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      discordErrors.botWithoutPermissionError(message);
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
      discordErrors.needToBeInAVoiceChannelError(message);
    } else if (!serverQueue) {
      discordErrors.anySongToSkipError(message);
    }
    serverQueue.connection.dispatcher.end();
  }

  _stop(message, serverQueue) {
    if (!serverQueue) {
      return;
    }

    if (!message.member.voice.channel) {
      discordErrors.needToBeInAVoiceChannelError(message);
    } else if (!serverQueue) {
      discordErrors.anySongToSkipError(message);
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
      .on('finish', () => {
        serverQueue.songs.shift();
        this._play(guild, serverQueue.songs[0]);
      })
      .on('error', error => console.error(error));
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
      return audioCatalog.map(audio => `${this.prefix}${audio._id}`).sort();
    };
    message.channel.send(getAllMemes().join('\n'));
  }

  _defaultErrorMessage(message, serverQueue) {
    const errorMessage = getRandomArrayElement(WRONG_CMD_MESSAGES);
    const audio = audioCatalog.find(audio => audio._id === errorMessage);
    message.content = `?${audio._id}`;
    this._execute(message, serverQueue);
    discordErrors.invalidCommandError(message);
  }

  _addNewMeme(message, args) {
    if (args.length < 3 || args.length < 4) {
      message.channel.send('precisa passar os comandos certos');
      return;
    }

    const [url, command, start, end] = args;
    const id = extractVideoId(url);
    if (!id) {
      message.channel.send('Não encontramos o vídeo');
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

    emitter.removeAllListeners('notification');
    emitter.on('notification', data => message.channel.send(data));

    saveJson(
      `${__basedir}/constants/audio_catalog.json`,
      pushCatalog(audioCatalog, newMeme)
    );
    new AudioController(
      url,
      newMeme.time.start,
      newMeme.time.end,
      command,
      emitter
    );
    message.channel.send('olha o bixo vinu');
  }
}
