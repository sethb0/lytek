/* eslint-disable max-len */
const HELP_TEXT = `**Help:**

Capital letters in the following examples are meant to be replaced with numbers. Lower-case letters and punctuation should be typed verbatim.

• Roll a single d10 and don’t count successes: \`/roll\`

• Standard dice pool (target number 7, double 10s): \`/roll N\` where \`N\` is the number of dice

• Damage or non-Exalted dice pool (no double 10s): \`/roll n N\`

• Dice pool that’s been messed with by Sidereals or Infernals or someone: \`/roll t T N\` where \`T\` is the target number

• Dice pool where 9s count double because magic: \`/roll d D N\` (\`D\` would be 9 in this case)

• Dice pool where 2s count as 1s because magic: \`/roll b B N\` (\`B\` would be 2 in this case)

• Result in a DM instead of a public response: \`/roll p N\` (think \`p\` for private)

• All the above can be combined in any order (except \`n\` with \`d\`): \`/roll p t T b B d D N\` (the number of dice \`N\` has to come last)

• You can add a comment at the end of the command with \`#\``;

const ERROR_MESSAGES = [
  'Huh?',
  '`idgi`',
  'No comprende.',
  'Ça ne moi veut rien dire.',
  'Das bedeutet nichts.',
  'Nihil significat.',
  'You’re tripping balls, aren’t you?',
  'The Great Maker disdains such frivolity!',
  'Is such nonsense worthy of a Prince of the Earth? I think not.',
  'By you you’re Exalted. And by me, bubbeleh, of *course* you’re Exalted. But tell me, by *the Exalted* are you Exalted?',
  'I visited the Jade Pleasure Dome and all I got was this lousy error message.',
  'The Ebon Dragon approves.',
  'I swear by the Unconquered Sun, you will rue the day you typed that command!',
  'I swear by the Empyreal Chaos, you will rue the day you typed that command!',
  'Cecelyne be my witness, you will rue the day you typed that command!',
  'The result of that command was lost in the Three Spheres Cataclysm.',
  'Metagaos rotted that command before it reached me.',
  'Elloge withdrew all sense from that command.',
  'Oramus, the Dragon Beyond the World, rules over things that are so conceptually strange they don’t even *not* exist. Like that command.',
  'Nowhere in the Five Directions can a result be found.',
  'That command requires special approval from the Solar Deliberative.',
  'That command sacrificed its result to the Neverborn. It is doomed.',
  'You type like a Wyld mutant!',
  'Only the Maiden of Secrets knows how many successes you rolled.',
  'Your request has been denied by Oversight.',
  'Just promise me you won’t try to run that command on the Eye of Autochthon.',
  'Please recalibrate your I AM glyph reader.',
  'That command was so sad, the Heptarchs of Tragedy stole it and sealed it in a casque to await the end of the present Age.',
  'I die. My bits rot. Their remains fall into the sky. They black out the stars and smash the Loom of Fate. All die. Oh, the embarrassment.',
  'Rook had too much fun making up error messages.',
];
/* eslint-enable max-len */

function errorReply (msg) {
  return msg.reply(ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]);
}

export async function handler (message, { logger }) {
  if (message.system) {
    return null;
  }
  const { cleanContent: content } = message;
  if (/^\/help(?:\s|$)/iu.test(content)) {
    return message.reply(HELP_TEXT);
  }
  const matches
    = /^\/roll((?:\s+(?:[a-z]+|\d+))*)\s*(?:#\s*(\S(?:.*\S)?)\s*)?$/iu.exec(content);
  if (!matches) {
    if (content.startsWith('/')) {
      logger.info('unrecognized command');
      return errorReply(message);
    }
    return null;
  }
  const command = matches[1]
    .trim()
    .split(/\s+/gu)
    .filter((x) => x)
    .map((n) => /^\d+$/u.test(n) ? parseInt(n, 10) : n);
  const comment = matches[2] ? ` # ${matches[2].trim()}` : '';
  logger.debug(`${message.author.tag}: /roll ${command.join(' ')}${comment}`);
  let result;
  let privateReply;
  if (command.length) {
    let botch = -1;
    let dice = 0;
    let double = 0;
    let target = 0;
    for (let i = 0; i < command.length; i += 1) {
      const x = command[i];
      if (typeof x === 'number') {
        if (dice || x < 1 || i < command.length - 1) {
          logger.info('bad dice');
          return errorReply(message);
        }
        dice = x;
      } else if (x === 'n') {
        if (double) {
          logger.info('double already set (n)');
          return errorReply(message);
        }
        double = 11;
      } else if (x === 'p') {
        if (privateReply) {
          logger.info('private already set');
          return errorReply(message);
        }
        privateReply = true;
      } else {
        if (i === command.length - 1) {
          logger.info('no room for arg');
          return errorReply(message);
        }
        const n = command[i += 1];
        if (typeof n !== 'number') {
          logger.info('arg not numeric');
          return errorReply(message);
        }
        if (x === 'b') {
          if (botch >= 0 || n < 0 || n > 9) {
            logger.info('bad botch');
            return errorReply(message);
          }
          botch = n;
        } else if (x === 'd') {
          if (double || n < 2 || n > 10) {
            logger.info('bad double');
            return errorReply(message);
          }
          double = n;
        } else if (x === 't') {
          if (target || n < 2 || n > 10) {
            logger.info('bad target');
            return errorReply(message);
          }
          target = n;
        } else {
          logger.info('unrecognized option');
          return errorReply(message);
        }
      }
    }
    if (dice) {
      if (botch < 0) {
        botch = 1;
      }
      if (!double) {
        double = 10;
      }
      if (!target) {
        target = 7;
      }
      if (botch >= target || target > double) {
        logger.info('inequalities violated');
        return errorReply(message);
      }
      result = roll(dice, { botch, double, target }, logger);
    } else {
      if (botch || double || target) {
        logger.info('options set but no dice');
        return errorReply(message);
      }
      result = d10();
    }
  } else {
    result = d10();
  }
  return message[privateReply ? 'author' : 'channel'].send(
    `${result}${comment}`,
    { reply: message.author }
  );
}

function d10 () {
  return Math.floor(Math.random() * 10) + 1;
}

function roll (dice, { botch, double, target }, logger = console) {
  const raw = [];
  for (let i = 0; i < dice; i += 1) {
    raw.push(d10());
  }
  const botches = raw.filter((n) => n <= botch).length;
  const successes = raw.filter((n) => n >= target).length
    + raw.filter((n) => n >= double).length;
  let result;
  if (successes) {
    const es = successes === 1 ? '' : 'es';
    result = `${successes} success${es}`;
  } else {
    result = botches ? 'botch' : 'failure';
  }
  const bOption = botch === 1 ? '' : ` b=${botch}`;
  const dOption = double < 10 ? ` d=${double}` : '';
  const nOption = double > 10 ? ' n' : '';
  const tOption = target === 7 ? '' : ` t=${target}`;
  const withText = bOption || dOption || nOption || tOption ? ' with' : '';
  logger.debug(`${dice}: raw = [${raw.join(', ')}]`);
  const sorted = raw.slice().sort((a, b) => b - a);
  const out
    = `**${result}** [${sorted.join(', ')}]${withText}${nOption}${tOption}${dOption}${bOption}`;
  logger.debug(out);
  return out;
}
