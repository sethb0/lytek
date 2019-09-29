/* eslint callback-return: off */
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import https from 'https';
import json from 'koa-json';
import path from 'path';
import pgPromise from 'pg-promise';
import router from 'koa-simple-router';
import winston from 'winston';

import { dummyAPI } from './api';
import { auth0JWT as jwt } from './auth0-jwt';
import { requestLogger } from './request-logger';

const DEFAULT_CACHE_CONTROL = 'public, max-age=60';
const LONG_TERM_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const STATIC_DIR = path.resolve(__dirname, '..', 'dist');

async function server (mode, { BOT_API_TOKEN, DATABASE_URL, KOA_SECRET }) {
  if (!mode) {
    throw new Error('missing mode');
  }
  if (!BOT_API_TOKEN) {
    throw new Error('missing BOT_API_TOKEN');
  }
  if (!DATABASE_URL) {
    throw new Error('missing DATABASE_URL');
  }
  if (!KOA_SECRET) {
    throw new Error('missing KOA_SECRET');
  }

  const app = new Koa();
  app.name = 'lytek';
  app.proxy = mode === 'production';

  app.keys = [Buffer.from(deUrlSafe(KOA_SECRET), 'base64')];

  app.context.logger = winston.createLogger({
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

  app.context.db = pgPromise({ promiseLib: Promise })(DATABASE_URL);

  if (mode !== 'production') {
    app.use(requestLogger({ colorize: true }));
  }

  if (mode !== 'production') {
    app.use(async (ctx, next) => {
      // eslint-disable-next-line max-len
      ctx.set('Content-Security-Policy', "default-src 'self'; connect-src 'self'; font-src 'self' https://fonts.gstatic.com; frame-src 'self'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; form-action 'self'; frame-ancestors 'self'; report-uri https://metalfatigue.report-uri.com/r/d/csp/enforce");
      // eslint-disable-next-line max-len
      ctx.set('Expect-CT', 'enforce, max-age=31536000, report-uri="https://metalfatigue.report-uri.com/r/d/ct/enforce"');
      // eslint-disable-next-line max-len
      ctx.set('Feature-Policy', "autoplay 'none'; camera 'none'; document-write 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; microphone 'none'; midi 'none'; notifications 'self'; payment 'none'; push 'self'; sync-xhr 'self'; usb 'none'; vibrate 'none'; vr 'none'");
      ctx.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      ctx.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
      ctx.set('X-Content-Type-Options', 'nosniff');
      ctx.set('X-DNS-Prefetch-Control', 'off');
      ctx.set('X-Permitted-Cross-Domain-Policies', 'none');
      ctx.set('NEL', '{"report_to":"default","max_age":31536000,"include_subdomains":true}');
      // eslint-disable-next-line max-len
      ctx.set('Report-To', '{"group":"default","max_age":31536000,"endpoints":[{"url":"https://metalfatigue.report-uri.com/a/d/g"}],"include_subdomains":true}');
      await next();
    });
  }

  app.use(json({ pretty: false, param: 'pretty' }));

  app.use(handleError(mode));

  app.use(bodyParser());

  app.use(router({}, (r) => {
    r.all(
      '/api/*',
      jwt({
        tenant: 'mfllc',
        audience: 'http://lytek.sharpcla.ws',
        expose: true,
      }),
      router(
        { prefix: '/api' },
        (rr) => {
          rr.all('/dummy/', dummyAPI());
        },
      ),
      unrecognizedAPI,
    );

    r.all('/api', unrecognizedAPI);

    const botApiToken = deUrlSafe(BOT_API_TOKEN);
    r.all(
      '/bot/*',
      checkBotToken(botApiToken),
      router(
        { prefix: '/bot' },
        (rr) => {
          rr.all('/dummy/', dummyAPI());
        },
      ),
      unrecognizedAPI,
    );

    r.all('/bot', unrecognizedAPI);
  }));

  if (mode !== 'production') {
    const { serve } = await import('./file');
    app.use(serve(STATIC_DIR, {
      indexFile: 'index.html',
      cacheControl (ctx) {
        return /[^/.]\.[0-9a-f]{8,}\.[^/]+$/iu.test(ctx.path)
          ? LONG_TERM_CACHE_CONTROL
          : DEFAULT_CACHE_CONTROL;
      },
    }));
  }

  return app.callback();
}

function deUrlSafe (b64u) {
  let out = b64u.replace(/-/gu, '+').replace(/_/gu, '/');
  while (out.length % 4) {
    out += '=';
  }
  return out;
}

function checkScope (scopes) { // eslint-disable-line no-unused-vars
  if (typeof scopes === 'string') {
    scopes = [scopes];
  }
  return async (ctx, next) => {
    const granted = ctx.state.auth.scope?.split(/ +/gu) || [];
    if (!scopes.some((x) => granted.includes(x))) {
      ctx.throw(403, 'insufficient scope');
    }
    await next();
  };
}

function checkBotToken (token) {
  const re = new RegExp(`^ *Bearer +${token} *$`, 'u');
  return async (ctx, next) => {
    if (!re.test(ctx.headers.authorization)) {
      ctx.throw(403);
    }
    await next();
  };
}

async function unrecognizedAPI (ctx) {
  ctx.throw(400, 'unrecognized API request');
}

function handleError (mode) {
  return async (ctx, next) => {
    try {
      await next();
      if (ctx.response.status === 404 && !ctx.response.body) {
        ctx.throw(505);
      }
    } catch (err) {
      ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
      ctx.remove('Vary');
      if (err.isBoom) {
        err.statusCode = err.output.statusCode;
        err.headers = err.output.headers;
        err.expose = !err.isServer;
      }
      if (!err.statusCode) {
        err.statusCode = err.status || 500;
      }
      ctx.response.set(err.headers || {});
      if (mode === 'production') {
        if (typeof err.expose === 'undefined') {
          err.expose = err.statusCode < 500;
        }
      } else {
        err.expose = true;
      }
      const message = (err.expose && err.message) || http.STATUS_CODES[err.statusCode];
      const detail = err.expose && err.detail;
      const accepted = ctx.accepts('json', 'text/plain');
      switch (accepted) {
      case 'json':
        ctx.type = 'application/json';
        // eslint-disable-next-line camelcase
        ctx.body = { error_description: message, status: err.statusCode };
        if (err.code && err.expose) {
          ctx.body.error = err.code;
        }
        break;
      default:
        ctx.type = 'text/plain; charset=utf-8';
        ctx.body = `Error ${err.statusCode}: `;
        if (err.code && err.expose) {
          ctx.body += `[${err.code}] `;
        }
        ctx.body += `${message}\n`;
        if (detail) {
          ctx.body += `${detail}\n`;
        }
      }
      ctx.status = err.statusCode;
    }
  };
}

export default async function run ({ mode, readConfig }) {
  const defaultPort = mode === 'production' ? 18002 : 5000;
  const port = process.env.PORT || defaultPort; // eslint-disable-line no-process-env

  const cb = await server(mode, process.env); // eslint-disable-line no-process-env

  let protocol;
  let srv;
  if (mode === 'production') {
    protocol = 'HTTP';
    srv = http.createServer(cb);
  } else {
    protocol = 'HTTPS';
    srv = https.createServer({
      key: readConfig('PRIVATE_KEY', 'private.pem', 'private key'),
      cert: readConfig('CERTIFICATE_CHAIN', 'cert.pem', 'certificate'),
      ciphers: `
TLS_AES_128_GCM_SHA256:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_256_GCM_SHA384:
ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:
ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:
ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305
      `.replace(/\s/gu, ''),
      ecdhCurve: 'prime256v1:secp384r1:secp521r1',
      honorCipherOrder: false,
      minVersion: 'TLSv1.2',
    }, cb);
  }

  return new Promise((resolve, reject) => {
    srv.on('error', reject); // this is why we can't just use util.promisify
    try {
      srv.listen(port, mode === 'production' && '::1', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(`${protocol} server started on port ${port}`);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
