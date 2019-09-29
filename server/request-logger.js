/* eslint camelcase: off */
import chalk from 'chalk';
import uuid from 'uuid/v4';

export function requestLogger (options) {
  const { heroku, colorize } = options;
  const colorizer = new chalk.constructor({ enabled: colorize, level: 1 });

  return async (ctx, next) => {
    ctx.state.requestId = ctx.headers['x-request-id'] || uuid();
    ctx.state.startTime = Date.now();
    await next();
    const responseTimeMillis = Date.now() - ctx.state.startTime;
    const parts = { level: 'info', message: '' };
    if (heroku) {
      // Heroku's router logs most of what we want to know already.
      parts.request_id = ctx.state.requestId;
    } else {
      const status = String(ctx.status);
      let color = 'red';
      if (ctx.status < 200) {
        color = 'blue';
      } else if (ctx.status < 300) {
        color = 'green';
      } else if (ctx.status < 400) {
        color = 'cyan';
      } else if (ctx.status < 500) {
        color = 'yellow';
      }
      parts.message = colorizer[color](status);
      parts.time = new Date(ctx.state.startTime).toString()
        .replace(/\bGMT\b/u, 'UTC')
        .replace(/ \([^)]+\)$/u, '');
      parts.method = ctx.method;
      parts.length = ctx.length || 0;
      parts.url = ctx.originalUrl;
      parts.protocol = ctx.protocol;
      parts.remote = ctx.ip;
    }
    parts.response = `${responseTimeMillis}ms`;
    if (ctx.request.length) {
      parts.request_length = ctx.request.length;
    }
    const referrer = ctx.headers.referer || ctx.headers.referrer;
    if (referrer) {
      parts.referrer = referrer;
    }
    const userAgent = ctx.headers['user-agent'];
    if (userAgent) {
      parts.user_agent = userAgent;
    }
    ctx.logger.log(parts);
  };
}
