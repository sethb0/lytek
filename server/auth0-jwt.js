import compose from 'koa-compose';
import jwt from 'koa-jwt';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { koaJwtSecret, JwksRateLimitError, SigningKeyNotFoundError } from 'jwks-rsa';

export function auth0Jwt (options = {}) {
  const opts = { ...options };
  if (!opts.tenant) {
    throw new Error('no Auth0 tenant name specified');
  }
  if (!opts.audience) {
    throw new Error('no audience URI specified');
  }
  return compose([
    convertErrors(opts.expose),
    jwt({
      key: 'auth',
      secret: koaJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `https://${opts.tenant}.auth0.com/.well-known/jwks.json`,
      }),
      audience: opts.audience,
      issuer: `https://${opts.tenant}.auth0.com/`,
      algorithms: ['RS256'],
      passthrough: opts.fallthrough || opts.fallthru,
    }),
  ]);
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
      } else if (orig instanceof SigningKeyNotFoundError
          || orig instanceof TokenExpiredError
          || orig instanceof JsonWebTokenError) {
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
