import Discord from 'discord.js'; // stupid package name…
import superagent from 'superagent';
import winston from 'winston';

import { handler } from './handler.js';

export default async function run ({ mode, readConfig }) {
  if (!mode) {
    throw new Error('missing mode');
  }
  // eslint-disable-next-line no-process-env
  const { BOT_API_TOKEN, BOT_API_URL, DISCORD_TOKEN } = process.env;
  if (!BOT_API_TOKEN) {
    throw new Error('missing configuration parameter BOT_API_TOKEN');
  }
  if (!BOT_API_URL) {
    throw new Error('missing configuration parameter BOT_API_URL');
  }
  if (!DISCORD_TOKEN) {
    throw new Error('missing configuration parameter DISCORD_TOKEN');
  }

  const logger = winston.createLogger({
    level: mode === 'production' ? 'info' : 'debug',
    format: mode === 'production'
      ? winston.format.combine(
        winston.format.padLevels(),
        winston.format.simple(),
      )
      : winston.format.combine(
        winston.format.colorize(),
        winston.format.padLevels(),
        winston.format.simple(),
      ),
    transports: [
      new winston.transports.Console({ handleExceptions: true }),
    ],
  });

  const agent = superagent.agent()
    .set({ Authorization: `Bearer ${BOT_API_TOKEN}` })
    .accept('json')
    .redirects(0)
    .timeout({ response: 5000, deadline: 7500 });
  if (mode !== 'production') {
    agent.ca(readConfig('CERTIFICATE', 'cert.pem', 'certificate'));
  }

  const options = {
    agent, logger, mode, url: BOT_API_URL,
  };

  let username = 'bot';

  const client = new Discord.Client({
    disabledEvents: [Discord.Constants.WSEvents.TYPING_START],
  });

  const disconnect = () => {
    logger.info(`${username} shutting down`);
    client.destroy()
      .catch(::logger.warn);
    process.exit(0); // eslint-disable-line no-process-exit
  };

  const p = new Promise((resolve, reject) => {
    try {
      client.on('ready', async () => {
        process
          .on('SIGHUP', disconnect)
          .on('SIGINT', disconnect)
          .on('SIGTERM', disconnect);
        try {
          const app = await client.fetchApplication();
          username = app.bot?.tag || app.name;
        } catch (err) {
          logger.warn(err);
        }
        resolve(`${username} ready`);
      })
        .on('message', (message) => handler(message, options).catch(::logger.error))
        .on('warn', ::logger.warn)
        .on('error', ::logger.error);
    } catch (err) {
      reject(err);
    }
  });

  await client.login(DISCORD_TOKEN);
  return p;
}
