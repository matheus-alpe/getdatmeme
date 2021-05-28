const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

const Discord = require("discord.js");

const BotController = require("./botController")

const { prefix, token } = require("../config.json");

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
    controller.handleMessage(message)
});

client.login(token);
