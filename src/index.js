import './config/path-aliases';

import discord from 'discord.js';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';

import BotController from '@controllers/bot-controller';
import { configureClient } from '@config/index';

// ? Is this necessary?
global.__basedir = __dirname;

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath);

const client = new discord.Client();
const controller = new BotController(process.env.PREFIX);

configureClient(client, controller, {
  token: process.env.TOKEN,
});
