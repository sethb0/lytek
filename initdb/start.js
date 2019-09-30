/* eslint no-console: off */
import fs from 'fs';
import path from 'path';
import { default as pgPromise, QueryFile } from 'pg-promise';
import { errors as spexErrors } from 'spex';

const { BatchError } = spexErrors;

export default async function run ({ mode }) {
  const { DATABASE_URL } = process.env; // eslint-disable-line no-process-env
  const pgLib = pgPromise({ promiseLib: Promise });
  const db = pgLib(DATABASE_URL);

  const queryFiles = fs.readdirSync(__dirname)
    .filter((x) => x.endsWith('.sql'))
    .map((x) => ({
      filename: x,
      qf: new QueryFile(
        path.join(__dirname, x),
        {
          minify: 'after',
          params: { schema: mode },
        },
      ),
    }));

  try {
    const a
      = await db.task((t) => t.batch(queryFiles.map(({ qf }) => qf).map(::t.multiResult)));
    a.forEach((x, i) => console.info('%s: %O', queryFiles[i].filename, x));
    return '';
  } catch (err) {
    if (err instanceof BatchError) {
      const bad = [];
      err.data.forEach((x, i) => {
        const { filename } = queryFiles[i];
        if (x.success) {
          console.info('%s: %O', filename, x.result);
        } else {
          bad.push(`${filename}: ${x.result.message}`);
        }
      });
      throw new Error(`BatchError returned failures:\n${bad.join('\n')}`);
    } else {
      throw err;
    }
  } finally {
    try {
      pgLib.end();
    } catch (err) {
      console.warn(err);
    }
  }
}
