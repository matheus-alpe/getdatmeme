import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import { cut as cutMP3 } from 'mp3-cutter';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

import { mkdirIfNotExists } from '@helpers/file-system';

ffmpeg.setFfmpegPath(ffmpegPath);

export default class AudioController {
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
      // throw new Error('Missing a "URL" parameter');
      console.error('Missing "URL" parameter.');
      return;
    }

    this._id = id;
    this._url = url;
    this._startTime = start;
    this._endTime = end;
    this._tempPath = path.join(__dirname, 'temp');
    this._memesPath = path.join(__dirname, 'memes_audio');

    this.makeDirectories();
    this.getVideo();
  }

  makeDirectories() {
    mkdirIfNotExists(this._tempPath, this._memesPath);
  }

  async getVideo() {
    try {
      const stream = await ytdl(this._url, {
        quality: 'highestaudio',
      });

      this.saveAudio(stream);
    } catch (error) {
      console.error(error);
    }
  }

  async saveAudio(stream) {
    const audioFilePath = path.join(this._tempPath, `${this._id}.mp3`);

    await ffmpeg(stream)
      .audioBitrate(128)
      .save(audioFilePath)
      .on('end', this.audioCutter);
  }

  /**
   * Cuts an audio given a start and end time.
   */
  audioCutter() {
    if (this._checkIfStartTimeIsGreaterThanEndTime()) {
      this._swapStartAndEndTime();
    }

    const options = this._audioOptionsFactory();

    cutMP3(options);

    fs.unlink(options.src, error => {
      if (error) throw error;
    });
  }

  _audioOptionsFactory() {
    const audioFilePath = `${this._id}.mp3`;

    return {
      src: path.join(this._tempPath, audioFilePath),
      target: path.join(this._memesPath, audioFilePath),
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
