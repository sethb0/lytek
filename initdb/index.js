/* eslint no-console: off */
import fs from 'fs';
import path from 'path';
import { default as pgPromise, QueryFile } from 'pg-promise';
import { errors as spexErrors } from 'spex';

const { BatchError } = spexErrors;

const { DATABASE_URL, NODE_ENV } = process.env; // eslint-disable-line no-process-env

const db = pgPromise({ promiseLib: Promise })(DATABASE_URL);

const queryFiles = fs.readdirSync(__dirname)
  .filter((x) => x.endsWith('.sql'))
  .map((x) => ({
    filename: x,
    qf: new QueryFile(
      path.join(__dirname, x),
      {
        minify: 'after',
        params: { schema: NODE_ENV || 'development' },
      },
    ),
  }));

db.task((t) => t.batch(queryFiles.map(({ qf }) => qf).map(::t.multiResult)))
  .then((a) => a.forEach((x, i) => console.info('%s: %O', queryFiles[i].filename, x)))
  .catch((err) => {
    if (err instanceof BatchError) {
      err.data.forEach((x, i) => {
        const { filename } = queryFiles[i];
        if (x.success) {
          console.info('%s: %O', filename, x.result);
        } else {
          console.error('%s: %s', filename, x.result.message);
        }
      });
    } else {
      console.error(err);
    }
  })
  .then(() => db.close())
  .catch(console.warn);
