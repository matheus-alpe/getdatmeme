require("dotenv").config();

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const Discord = require("discord.js");

const BotController = require("./botController");
const { prefix, token } = require("./config.json");

// ? Is this necessary?
global.__basedir = __dirname;

ffmpeg.setFfmpegPath(ffmpegPath);
const client = new Discord.Client();
const controller = new BotController(prefix);

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  controller.handleMessage(message);
});

client.login(process.env.TOKEN);
