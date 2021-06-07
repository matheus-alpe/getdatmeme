const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const { existsSync, mkdirSync, unlink } = require("fs");
const ytdl = require("ytdl-core");
const { cut } = require("mp3-cutter");



class ScissorsMe {
  constructor(url, start = 0, end, id, emitter) {
    if (!url) {
      console.error("Missing `URL` parameter.");
    }

    this._id = id;
    this._url = url;
    this._startTime = start;
    this._endTime = end;
    this._tempPath = `${__dirname}/../temp`;
    this._memesPath = `${__dirname}/../memes_audio`;
    this._emitter = emitter;

    this.makeDirectories();
    this.getVideo();
  }
  makeDirectories() {
    if (!existsSync(this._tempPath)) {
      mkdirSync(this._tempPath);
    }

    if (!existsSync(this._memesPath)) {
      mkdirSync(this._memesPath);
    }
  }

  async getVideo() {
    try {
      let stream = await ytdl(this._url, {
        quality: "highestaudio",
      });

      this.saveAudio(stream);
    } catch (error) {
      console.error(error);
    }
  }

  async saveAudio(stream) {
    await ffmpeg(stream)
      .audioBitrate(128)
      .save(`${this._tempPath}/${this._id}.mp3`)
      .on("end", () => {
        this.audioCutter();
      });
  }

  /**
   * Cut audio given a start and end time.
   */
  audioCutter() {
    if (this._endTime && this._startTime > this._endTime) {
      [this._startTime, this._endTime] = [this._endTime, this._startTime];
    }

    const options = {
      src: `${this._tempPath}/${this._id}.mp3`,
      target: `${this._memesPath}/${this._id}.mp3`,
      start: this._startTime,
    };

    if (this._endTime) {
      options.end = this._endTime;
    }

    cut(options);
    unlink(options.src, (err) => { if (err) throw err });
    this._emitter.emit('notification', `Comando **?${this._id}** pronto para uso!`)
  }
}

module.exports = {
  ScissorsMe,
};