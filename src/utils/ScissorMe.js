
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const { existsSync, mkdirSync, unlink } = require("fs");
const ytdl = require("ytdl-core");
const { cut } = require("mp3-cutter");

function cutVideo(url, start = 0, end, basePath) {
  const makeDirectories = () => {
    if (!existsSync(_tempPath)) {
      mkdirSync(_tempPath);
    }

    if (!existsSync(_memesPath)) {
      mkdirSync(_memesPath);
    }
  }

  const getVideo = async () => {
    try {
      let stream = await ytdl(_id, {
        quality: "highestaudio",
      });

      saveAudio(stream);
    } catch (error) {
      console.error(error);
    }
  }

  const saveAudio = async (stream) => {
    await ffmpeg(stream)
      .audioBitrate(128)
      .save(`${_tempPath}/${_id}.mp3`)
      .on("end", () => {
        audioCutter();
      });
  }

  /**
   * Cut audio given a start and end time.
   */
  const audioCutter = () => {
    if (_endTime && _startTime > _endTime) {
      [_startTime, _endTime] = [_endTime, _startTime];
    }

    const options = {
      src: `${_tempPath}/${_id}.mp3`,
      target: `${_memesPath}/${_id}.mp3`,
      start: _startTime,
    };

    if (_endTime) {
      options.end = _endTime;
    }

    cut(options);
    unlink(options.src, (err) => { if (err) throw err });
  }

  if (!url) {
    console.error("Missing `URL` parameter.");
  }

  let _id = url.split("?v=")[1];
  let _startTime = start;
  let _endTime = end;
  let _tempPath = `${basePath}/temp`;
  let _memesPath = `${basePath}/memes_audio`;

  makeDirectories();
  getVideo();
}

module.exports = {
  cutVideo
}