/* eslint no-console: off, no-process-env: off, no-process-exit: off */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

if (process.argv.length !== 3) {
  console.error('Must specify exactly one command-line argument');
  process.exit(1);
}

const command = process.argv[2];
const configDir = process.env.CONFIG_DIR || __dirname;
const mode = process.env.NODE_ENV || 'development';

const { error } = dotenv.config({ path: path.resolve(configDir, `.env.${mode}`) });
if (error) {
  console.error('%s: %O', command, error);
  process.exit(1);
}

import(path.resolve(__dirname, command, 'start'))
  .then(({ 'default': run }) => run({ mode, readConfig: makeReadConfig(configDir) }))
  .then(console.info)
  .catch((err) => {
    console.error('%s: %O', command, err);
    process.exit(2);
  });

function makeReadConfig (dir) {
  return (envar, defaultFilename, description, parse) => {
    let data = process.env[envar];
    if (!data) {
      const filepath = path.resolve(dir, process.env[`${envar}_FILE`] || defaultFilename);
      try {
        data = fs.readFileSync(filepath, 'utf8');
      } catch (err) {
        console.error(
          `could not read ${description} file ${filepath}: [${err.code}] ${err.message}`
        );
        process.exit(1);
      }
    }
    if (parse) {
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.error(`could not parse ${description} data: ${err.message}`);
        process.exit(1);
      }
    }
    return data;
  };
}
