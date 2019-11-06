/* eslint require-atomic-updates: off */
import { NotAcceptedError, NotFoundError, ParameterError, identity, wrap } from './utils';
import spexLib from 'spex';

const spex = spexLib(Promise);

export const CARD_COLLECTION = 'refcards';
export const TAB_COLLECTION = 'reftabs';
export const COLLECTIONS = [CARD_COLLECTION, TAB_COLLECTION];

const PERMISSION = 'read:reference';
// eslint-disable-next-line unicorn/no-unsafe-regex
const TITLE_REGEXP = /^\S+( \S+)*$/u;
// eslint-disable-next-line unicorn/no-unsafe-regex
const ID_REGEXP = /^[a-z]+(-[a-z]+)*(:[a-z]+(-[a-z]+)*)*$/u;

export const tabs = wrap(
  async (ctx) => {
    const [titles, order] = await spex.batch([
      ctx.mongo.collection(CARD_COLLECTION)
        .distinct('tabs', getQueryFilter(ctx)),
      ctx.mongo.collection(TAB_COLLECTION)
        .find({}, { projection: { tab: 1 }, sort: [['seq', -1], ['tab', -1]] })
        .toArray(),
    ]);
    const o = order.map((x) => x.tab);
    titles.sort((a, b) => {
      const aIndex = o.indexOf(a);
      const bIndex = o.indexOf(b);
      if (aIndex < bIndex) {
        return 1;
      }
      if (aIndex > bIndex) {
        return -1;
      }
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    ctx.status = 200;
    ctx.body = titles;
  },
  PERMISSION,
);

export const cards = wrap(
  async (ctx) => {
    const ids = (
      await ctx.mongo.collection(CARD_COLLECTION)
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
    const [cardData, order] = await spex.batch([
      ctx.mongo.collection(CARD_COLLECTION)
        .find(
          { tabs: title, ...getQueryFilter(ctx) },
          { projection: { id: 1 } },
        )
        .toArray(),
      ctx.mongo.collection(TAB_COLLECTION)
        .findOne(
          { tab: title },
          { projection: { cards: 1 } },
        ),
    ]);
    const ids = cardData
      .map((x) => x.id)
      .filter(identity);
    if (!ids.length) {
      throw new NotFoundError('reference tab title not found');
    }
    const o = order?.cards || [];
    o.reverse();
    ids.sort((a, b) => {
      const aIndex = o.indexOf(a);
      const bIndex = o.indexOf(b);
      if (aIndex < bIndex) {
        return 1;
      }
      if (aIndex > bIndex) {
        return -1;
      }
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
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
      await ctx.mongo.collection(CARD_COLLECTION)
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
    const [cardData, order] = await spex.batch([
      ctx.mongo.collection(CARD_COLLECTION)
        .find(
          { tabs: title, ...getQueryFilter(ctx) },
          { projection: { id: 1, markdown: 1 } },
        )
        .toArray(),
      ctx.mongo.collection(TAB_COLLECTION)
        .findOne(
          { tab: title },
          { projection: { cards: 1 } },
        ),
    ]);
    const c = cardData.filter((x) => x.markdown);
    if (!c.length) {
      throw new NotFoundError('tab title not found');
    }
    const o = order?.cards || [];
    o.reverse();
    c.sort((a, b) => {
      const aIndex = o.indexOf(a.id);
      const bIndex = o.indexOf(b.id);
      if (aIndex < bIndex) {
        return 1;
      }
      if (aIndex > bIndex) {
        return -1;
      }
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    });
    ctx.status = 200;
    ctx.body = c.map((x) => ({ id: x.id, text: x.markdown }));
  },
  PERMISSION,
);

export const order = wrap(
  async (ctx) => {
    const title = ctx.params?.title;
    if (typeof title !== 'string' || !TITLE_REGEXP.test(title)) {
      throw new ParameterError('invalid reference tab title');
    }
    const data = await ctx.mongo.collection(TAB_COLLECTION)
      .findOne({ tab: title }, { projection: { _id: 0, tab: 0 } });
    if (!data) {
      throw new NotFoundError('tab title not found');
    }
    ctx.status = 200;
    ctx.body = data;
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
