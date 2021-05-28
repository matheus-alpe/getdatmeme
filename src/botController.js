const { readdirSync } = require('fs');
const { ScissorsMe } = require('./ScissorMe.js');
const audio_catalog = require("./constants/audio_catalog.json");

const WRONG_CMD_MESSAGES = [
  's0eP7S3BIxs',
  '6GfqT-HKsY8'
]

export class BotController {
  queue = new Map();

  constructor(prefix) {
    this.prefix = prefix
  }

  async execute(message, serverQueue) {
    const cmd = message.content.substring(1);

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    const song = getMemeFile(cmd);

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };

      queue.set(message.guild.id, queueContruct);

      queueContruct.songs.push(song);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(
        `${song.alias} has been added to the queue!`
      );
    }
  }

  skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }

  stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );

    if (!serverQueue)
      return message.channel.send("There is no song that I could stop!");

    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }

  play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .play(`${__dirname}/memes_audio/${song.file}`)
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", (error) => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.alias}**`);
  }

  listMemes() {
    return audio_catalog
      .map(audio => `?${audio.alias}`)
      .sort();
  }

  getDownloadedAudios() {
    return readdirSync(`${__dirname}/memes_audio`);
  }

  checkAudio(cmd) {
    const messageAlias = cmd.substring(1);
    return Boolean(audio_catalog.find(({ alias }) => alias === messageAlias));
  }

  downloadAudio() {
    const preDownloadedAudios = getDownloadedAudios();
    audio_catalog.forEach(audio => {
      if (!preDownloadedAudios.includes(audio.file)) {
        console.log(`baixando ${audio.alias}`);
        new ScissorsMe(`https://www.youtube.com/watch?v=${audio._id}`, audio.time.start, audio.time.end);
      }
    });
  }

  getMemeFile(alias) {
    const audio = audio_catalog.find(audio => audio.alias === alias);
    if (audio && !audio.file) {
      throw new Error("Não existe esse audio de meme");
    }
    return audio
  }

  handleMessage(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);
    console.log(message.content);
    console.log(checkAudio(message.content))

    if (checkAudio(message.content)) {
      execute(message, serverQueue);
      return;
    }

    var commandsMap = {
      'skip': () => {
        skip(message, serverQueue)
        return
      },
      'stop': () => {
        stop(message, serverQueue);
        return;
      },
      '20g': () => {
        return message.channel.send("Ta brincando com minha cara né?!!!!!");
      },
      'setup': () => {
        controller.downloadAudio();
        return message.channel.send("fazendo setup");
      },
      'list': () => {
        const audios = controller.listMemes();
        return message.channel.send(audios.join('\n'));
      },
      'new': () => {
        return message.channel.send("isso ainda precisa ser implementado");
      },
      'default': () => {
        const errorMessage = WRONG_CMD_MESSAGES[Math.floor(Math.random() * WRONG_CMD_MESSAGES.length)]
        const audio = audio_catalog.find(audio => audio._id === errorMessage);
        message.content = `?${audio.alias}`;
        controller.execute(message, serverQueue);
        message.channel.send('You need to pass a valid command.');
      }
    }

    const handler = commandsMap[message.content];
    handler = handler ? handler : commandsMap['default']
    handler();
  }
}