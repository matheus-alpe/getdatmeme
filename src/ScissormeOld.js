const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ytdl = require("ytdl-core");
const { cut } = require("mp3-cutter");
const { unlink, resolve } = require("fs");
const { mkdirIfNotExists } = require("./helpers/file-system");

ffmpeg.setFfmpegPath(ffmpegPath);

class ScissorsMe {
  /**
   *
   * @param {string} url
   * @param {number} start
   * @param {number} end
   * @param {string} id
   */
  constructor(url, start = 0, end, id) {
    if (!url) {
      // ! Throw an error, maybe?
      // throw new Error("A url was not provided");
      console.error("Missing `URL` parameter.");
      return;
    }

    this._id = id;
    this._url = url;
    this._startTime = start;
    this._endTime = end;
    this._tempPath = resolve(__dirname, "temp");
    this._memesPath = resolve(__dirname, "memes_audio");

    this.makeDirectories();
    this.getVideo();
  }

  makeDirectories() {
    mkdirIfNotExists(this._tempPath, this._memesPath);
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
    const audioPathname = resolve(this._tempPath, `${this._id}.mp3`);

    await ffmpeg(stream)
      .audioBitrate(128)
      .save(audioPathname)
      .on("end", this.audioCutter);
  }

  /**
   * Cut audio given a start and end time.
   */
  audioCutter() {
    if (this._checkIfStartTimeIsGreaterThanEndTime()) {
      this._swapStartAndEndTime();
    }

    const options = this._audioOptionsFactory();

    cut(options);
    unlink(options.src, (err) => {
      if (err) throw err;
    });
  }

  /**
   * @returns {AudioOptionsType}
   */
  _audioOptionsFactory() {
    const audioFilePath = `${this._id}.mp3`;

    return {
      src: resolve(this._tempPath, audioFilePath),
      target: resolve(this._memesPath, audioFilePath),
      start: this._startTime,
      end: this._endTime ? this._endTime : null,
    };
  }

  _checkIfStartTimeIsGreaterThanEndTime() {
    return this._endTime && this._startTime > this._endTime;
  }

  _swapStartAndEndTime() {
    // This is pretty cool, I didn't know you could do this in JS.
    [this._startTime, this._endTime] = [this._endTime, this._startTime];
  }
}

module.exports = ScissorsMe;
