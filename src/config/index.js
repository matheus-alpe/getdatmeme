const DEFAULT_CLIENT_OPTIONS = {
  token: null,
  ready: () => console.log('Ready!'),
  reconnecting: () => console.log('Reconnecting!'),
  disconnect: () => console.log('Disconnect!'),
};

/**
 * Configures the discord bot client
 *
 * @param {DiscordClient} client A discord client
 * @param {BotController} controller
 * @param {typeof DEFAULT_CLIENT_OPTIONS} options
 */
export const configureClient = (
  client,
  controller,
  options = DEFAULT_CLIENT_OPTIONS
) => {
  const { token, ready, reconnecting, disconnect } = {
    ...DEFAULT_CLIENT_OPTIONS,
    ...options,
  };

  client.once('ready', ready);

  client.once('reconnecting', reconnecting);

  client.once('disconnect', disconnect);

  client.on('message', message => {
    controller.handleMessage(message);
  });

  client.login(token);
};
