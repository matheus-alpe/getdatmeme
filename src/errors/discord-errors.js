export const handleDiscordError = (messageChannel, message) => {
  messageChannel.channel.send(message);
};

export const needToBeInAVoiceChannelToPlayError = messageChannel => {
  handleDiscordError(
    messageChannel,
    'You need to be in a voice channel to play music!'
  );
};

export const needToBeInAVoiceChannel = messageChannel => {
  handleDiscordError(
    messageChannel,
    'You need to be in a voice channel to run commands!'
  );
};

export const needToBeInAVoiceChannelToStopError = messageChannel => {
  handleDiscordError(
    messageChannel,
    'You have to be in a voice channel to stop the music!'
  );
};

export const noSongToSkipError = messageChannel => {
  handleDiscordError(messageChannel, 'There is no song that I could skip!');
};

export const invalidCommandError = messageChannel => {
  handleDiscordError(messageChannel, 'You need to pass a valid command.');
};

export const botWithoutPermissionError = messageChannel => {
  handleDiscordError(
    messageChannel,
    'I need the permissions to join and speak in your voice channel!'
  );
};
