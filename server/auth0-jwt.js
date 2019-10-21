import compose from 'koa-compose';
import jwt from 'koa-jwt';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { koaJwtSecret, JwksRateLimitError, SigningKeyNotFoundError } from 'jwks-rsa';

export class AzpError extends JsonWebTokenError {
  constructor (message) {
    super(message);
    this.name = 'AzpError';
  }
}

export function auth0Jwt (options = {}) {
  const { tenant, audience, expose, clientId } = options;
  if (!tenant) {
    throw new Error('no Auth0 tenant name specified');
  }
  if (!audience) {
    throw new Error('no audience URI specified');
  }
  if (!clientId) {
    throw new Error('no Auth0 client ID specified');
  }
  return compose([
    convertErrors(expose),
    jwt({
      key: 'auth',
      secret: koaJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `https://${tenant}.auth0.com/.well-known/jwks.json`,
      }),
      issuer: `https://${tenant}.auth0.com/`,
      algorithms: ['RS256'],
      audience,
    }),
    checkAzp(clientId),
  ]);
}

function checkAzp (azp) {
  return async (ctx, next) => {
    if (ctx.state.auth?.azp !== azp) {
      const err = new AzpError(`azp claim '${ctx.state.auth?.azp}' does not match client ID`);
      err.originalError = err;
      err.status = 401;
      throw err;
    }
    await next();
  };
}

function convertErrors (expose) {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      const orig = err.originalError;
      if (!orig || !orig.status) {
        err.status = 401;
        err.headers = { 'WWW-Authenticate': 'Bearer' };
        if (orig && orig.message) {
          err.message = orig.message;
        }
        err.expose = expose;
        throw err;
      }
      if (orig instanceof JwksRateLimitError) {
        orig.status = 429;
      } else if (
        orig instanceof SigningKeyNotFoundError
        || orig instanceof TokenExpiredError
        || orig instanceof JsonWebTokenError
      ) {
        orig.status = 401;
        orig.expose = expose;
        orig.headers = { 'WWW-Authenticate': 'Bearer error="invalid_token"' };
        if (expose) {
          orig.headers['WWW-Authenticate']
            += `, error_description="${orig.message.replace('"', "'")}"`;
        }
      } else {
        orig.status = 500;
      }
      throw orig;
    }
  };
}
