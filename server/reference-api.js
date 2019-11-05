/* eslint require-atomic-updates: off */
import { NotAcceptedError, NotFoundError, ParameterError, identity, wrap } from './utils';

export const COLLECTION = 'reference';

const PERMISSION = 'read:reference';
// eslint-disable-next-line unicorn/no-unsafe-regex
const TITLE_REGEXP = /^\S+( \S+)*$/u;
// eslint-disable-next-line unicorn/no-unsafe-regex
const ID_REGEXP = /^[a-z]+(-[a-z]+)*(:[a-z]+(-[a-z]+)*)*$/u;

export const tabs = wrap(
  async (ctx) => {
    const titles = await ctx.mongo.collection(COLLECTION)
      .distinct('tabs', getQueryFilter(ctx));
    ctx.status = 200;
    ctx.body = titles;
  },
  PERMISSION,
);

export const cards = wrap(
  async (ctx) => {
    const ids = (
      await ctx.mongo.collection(COLLECTION)
        .find(getQueryFilter(ctx), { projection: { id: 1 } })
        .toArray()
    )
      .map((x) => x.id)
      .filter(identity);
    ctx.status = 200;
    ctx.body = ids;
  },
  PERMISSION,
);

export const index = wrap(
  async (ctx) => {
    const title = ctx.params?.title;
    if (typeof title !== 'string' || !TITLE_REGEXP.test(title)) {
      throw new ParameterError('invalid reference tab title');
    }
    const ids = (
      await ctx.mongo.collection(COLLECTION)
        .find(
          { tabs: title, ...getQueryFilter(ctx) },
          { projection: { id: 1 } },
        )
        .toArray()
    )
      .map((x) => x.id)
      .filter(identity);
    if (!ids.length) {
      throw new NotFoundError('reference tab title not found');
    }
    ctx.status = 200;
    ctx.body = ids;
  },
  PERMISSION,
);

export const singleCard = wrap(
  async (ctx) => {
    const id = ctx.params?.card;
    if (typeof id !== 'string' || !ID_REGEXP.test(id)) {
      throw new ParameterError('invalid reference card ID');
    }
    const body = (
      await ctx.mongo.collection(COLLECTION)
        .findOne(
          { id, ...getQueryFilter(ctx) },
          { projection: { markdown: 1 } },
        )
    )
      ?.markdown;
    if (!body) {
      throw new NotFoundError('card ID not found');
    }
    const responseType = ctx.accepts('text/markdown', 'json');
    if (responseType === 'text/markdown') {
      if (!ctx.acceptsCharsets('utf-8')) {
        throw new NotAcceptedError('client does not accept UTF-8');
      }
      ctx.status = 200;
      ctx.body = body;
      ctx.type = 'text/markdown; charset=utf-8';
    } else if (responseType === 'json') {
      ctx.status = 200;
      ctx.body = JSON.stringify(body);
    } else {
      throw new NotAcceptedError('client accepts neither Markdown nor JSON');
    }
  },
  PERMISSION,
);

export const quick = wrap(
  async (ctx) => {
    const title = ctx.params?.title;
    if (typeof title !== 'string' || !TITLE_REGEXP.test(title)) {
      throw new ParameterError('invalid reference tab title');
    }
    const data = (
      await ctx.mongo.collection(COLLECTION)
        .find(
          { tabs: title, ...getQueryFilter(ctx) },
          { projection: { id: 1, markdown: 1 } },
        )
        .toArray()
    )
      .filter((x) => x.markdown);
    if (!data.length) {
      throw new NotFoundError('tab title not found');
    }
    ctx.status = 200;
    ctx.body = data.map((x) => ({ id: x.id, text: x.markdown }));
  },
  PERMISSION,
);

function getQueryFilter ({ state: { auth: { player, gm } } }) {
  const filter = { $or: [{ chronicles: { $exists: 0 } }] };
  if (player.length) {
    filter.$or.push({ 'chronicles.player': { $in: player } });
  }
  if (gm.length) {
    filter.$or.push({ 'chronicles.gm': { $in: gm } });
  }
  return filter;
}
