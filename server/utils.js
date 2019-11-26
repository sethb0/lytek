/* eslint require-atomic-updates: off */
import { MongoError } from 'mongodb';
import { BatchError } from 'spex';

export class ForbiddenError extends Error {
  constructor (message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class FoundError extends Error {
  constructor (message) {
    super(message);
    this.name = 'FoundError';
  }
}

export class MediaTypeError extends Error {
  constructor (message) {
    super(message);
    this.name = 'MediaTypeError';
  }
}

export class NotAcceptedError extends Error {
  constructor (message) {
    super(message);
    this.name = 'NotAcceptedError';
  }
}

export class NotFoundError extends Error {
  constructor (message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ParameterError extends Error {
  constructor (message) {
    super(message);
    this.name = 'ParameterError';
  }
}

export function discard () {
  // return undefined;
}

export function identity (x) {
  return x;
}

export function unKebab (str) {
  if (str === 'dragon-blooded') {
    return 'Dragon-Blooded';
  }
  return str.split(/\W+/gu)
    .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1))
    .join(' ');
}

export function wrap (f, perm) {
  return {
    async get (ctx) {
      if (!perm || (ctx.state.auth.permissions || []).includes(perm)) {
        try {
          await f(ctx);
        } catch (err) {
          let errorType;
          let logFunction;
          if (err instanceof ForbiddenError) {
            ctx.status = 403;
            errorType = 'not_permitted';
            logFunction = discard;
          } else if (err instanceof FoundError) {
            ctx.status = 409;
            errorType = 'conflict';
            logFunction = ::ctx.logger.warn;
          } else if (err instanceof MediaTypeError) {
            ctx.status = 415;
            errorType = 'invalid_media_type';
            logFunction = ::ctx.logger.warn;
          } else if (err instanceof NotAcceptedError) {
            ctx.status = 406;
            errorType = 'not_accepted';
            logFunction = ::ctx.logger.warn;
          } else if (err instanceof NotFoundError) {
            ctx.status = 404;
            errorType = 'not_found';
            logFunction = discard;
          } else if (err instanceof ParameterError) {
            ctx.status = 400;
            errorType = 'invalid_parameter';
            logFunction = ::ctx.logger.warn;
          } else {
            ctx.status = 500;
            errorType = err instanceof MongoError || err instanceof BatchError
              ? 'database_error'
              : 'internal_error';
            logFunction = ::ctx.logger.error;
          }
          const body = { error: errorType };
          const msg = `${err.name}${err.message ? ': ' : ''}${err.message || ''}`;
          logFunction(msg);
          if (ctx.mode !== 'production') {
            // eslint-disable-next-line camelcase
            body.error_description = msg;
          }
          ctx.body = body;
        }
      } else {
        ctx.status = 403;
        ctx.body = { error: 'not_permitted' };
      }
    },
  };
}
