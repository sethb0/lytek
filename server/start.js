/* eslint callback-return: off */
import Koa from 'koa';
import { MongoClient, Logger as MongoLogger } from 'mongodb';
import bodyParser from 'koa-bodyparser';
import http from 'http';
import https from 'https';
import json from 'koa-json';
import path from 'path';
import router from 'koa-simple-router';
import tls from 'tls';
import winston from 'winston';

// import { dummy as dummyAPI } from './dummy-api';
import { charmTypes as charmTypesAPI, charmGroups as charmGroupsAPI, charmData as charmDataAPI,
  quick as charmQuickDataAPI } from './charms-api';
import { auth0Jwt as jwt } from './auth0-jwt';
import { requestLogger } from './request-logger';

const APP_NAME = 'lytek';
const CLIENT_ID = 'qKmlCFgdNi02xeV33lvtMWJ3H1cLFIgV';
const DEFAULT_CACHE_CONTROL = 'public, max-age=60';
const LONG_TERM_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const STATIC_DIR = path.resolve(__dirname, '..', 'dist');

const DEFAULT_PORT = 5000;

async function server (mode, { BOT_API_TOKEN, /* DATABASE_URL, */ KOA_SECRET, MONGODB_URI }) {
  if (!mode) {
    throw new Error('missing mode');
  }
  if (!BOT_API_TOKEN) {
    throw new Error('missing configuration parameter BOT_API_TOKEN');
  }
  // if (!DATABASE_URL) {
  //   throw new Error('missing configuration parameter DATABASE_URL');
  // }
  if (!KOA_SECRET) {
    throw new Error('missing configuration parameter KOA_SECRET');
  }
  if (!MONGODB_URI) {
    throw new Error('missing configuration parameter MONGODB_URI');
  }

  const app = new Koa();
  app.name = APP_NAME;
  app.proxy = mode === 'production';
  app.keys = [Buffer.from(deUrlSafe(KOA_SECRET), 'base64')];

  app.context.mode = mode;

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
  app.context.logger = logger;

  MongoLogger.setCurrentLogger((msg) => logger.error(msg));
  const mongoClient = await MongoClient.connect(MONGODB_URI, {
    ssl: true,
    sslValidate: true,
    sslCA: tls.rootCertificates,
    reconnectTries: 5,
    promiseLibrary: Promise,
    appname: app.name,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    validateOptions: true,
  });
  app.context.mongo = mongoClient.db();

  app.use(requestLogger({ colorize: mode !== 'production' }));

  if (mode !== 'production') {
    app.use(async (ctx, next) => {
      // eslint-disable-next-line max-len
      ctx.set('Content-Security-Policy', "default-src 'self'; connect-src 'self' https://mfllc.auth0.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://mfllc.auth0.com; img-src 'self' data: https://cdn.discordapp.com; style-src 'self' https://fonts.googleapis.com; form-action 'self'; frame-ancestors 'self'; report-uri https://metalfatigue.report-uri.com/r/d/csp/enforce");
      // eslint-disable-next-line max-len
      ctx.set('Expect-CT', 'enforce, max-age=31536000, report-uri="https://metalfatigue.report-uri.com/r/d/ct/enforce"');
      // eslint-disable-next-line max-len
      ctx.set('Feature-Policy', "autoplay 'none'; camera 'none'; document-write 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; microphone 'none'; midi 'none'; notifications 'self'; payment 'none'; push 'self'; sync-xhr 'self' https://mfllc.auth0.com; usb 'none'; vibrate 'none'; vr 'none'");
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
        audience: `https://${APP_NAME}.sharpcla.ws`,
        clientId: CLIENT_ID,
        expose: mode !== 'production',
      }),
      router(
        { prefix: '/api' },
        (rr) => {
          rr.all('/charms', charmTypesAPI);
          rr.all('/charms/:type', charmGroupsAPI);
          rr.all('/charms/:type/:group', charmDataAPI);
          rr.all('/charms/_quick/:type/:group', charmQuickDataAPI);
        },
      ),
      unrecognizedAPI,
    );

    r.all('/api', unrecognizedAPI);

    // const botApiToken = deUrlSafe(BOT_API_TOKEN);
    // r.all(
    //   '/bot/*',
    //   checkBotToken(botApiToken),
    //   router(
    //     { prefix: '/bot' },
    //     (rr) => {
    //       rr.all('/dummy', dummyAPI);
    //     },
    //   ),
    //   unrecognizedAPI,
    // );
    //
    // r.all('/bot', unrecognizedAPI);
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
  return b64u.replace(/-/gu, '+').replace(/_/gu, '/');
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

// function checkBotToken (token) {
//   const re = new RegExp(`^ *Bearer +${token} *$`, 'u');
//   return async (ctx, next) => {
//     if (!re.test(ctx.headers.authorization)) {
//       ctx.throw(403);
//     }
//     await next();
//   };
// }

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
  let port;
  try {
    // eslint-disable-next-line no-process-env, require-atomic-updates
    port = parseInt(process.env.PORT, 10);
  } catch {
    // Ignore
  }
  if (!port || isNaN(port) || !isFinite(port) || port <= 0 || port !== Math.floor(port)) {
    port = DEFAULT_PORT;
  }

  const cb = await server(mode, process.env); // eslint-disable-line no-process-env

  let hostname;
  let protocol;
  let srv;
  if (mode === 'production') {
    hostname = '::1';
    protocol = 'HTTP';
    srv = http.createServer(cb);
  } else {
    hostname = process.env.LISTEN_HOST || '::'; // eslint-disable-line no-process-env
    protocol = 'HTTPS';
    srv = https.createServer({
      key: readConfig('PRIVATE_KEY', 'private.pem', 'private key'),
      cert: readConfig('CERTIFICATE', 'cert.pem', 'certificate'),
      ciphers: `
TLS_AES_128_GCM_SHA256:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_256_GCM_SHA384:
ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:
ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:
ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305
      `.replace(/\s/gu, ''),
      ecdhCurve: 'X25519:P-256:P-384:P-521',
      honorCipherOrder: false,
      minVersion: 'TLSv1.2',
    }, cb);
  }

  return new Promise((resolve, reject) => {
    srv.on('error', reject); // This is why we can't just use util.promisify
    try {
      srv.listen(port, hostname, (err) => {
        if (err) {
          reject(err);
        } else {
          const h = hostname.includes(':') ? `[${hostname}]` : hostname;
          resolve(`${protocol} server started on ${h}:${port}`);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
