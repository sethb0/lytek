/* eslint no-console: off */
'use strict';

const fs = require('fs');

console.log(fs.statSync(process.argv[2]).size);
