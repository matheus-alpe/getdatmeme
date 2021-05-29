function needToBeInAVoiceChannelError(message) {
  message.channel.send("You need to be in a voice channel to play music!")
}

function botWithoutPermissionError(message) {
  message.channel.send("I need the permissions to join and speak in your voice channel!");
}

function needToBeInAVoiceChannelError(message) {
  message.channel.send("You have to be in a voice channel to stop the music!");
}

function anySongToSkipError(message) {
  message.channel.send("There is no song that I could skip!");
}

function invalidCommandError(message) {
  message.channel.send('You need to pass a valid command.');
}

module.exports = {
  needToBeInAVoiceChannelError,
  botWithoutPermissionError,
  needToBeInAVoiceChannelError,
  anySongToSkipError,
  invalidCommandError
}