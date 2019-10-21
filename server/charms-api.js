/* eslint require-atomic-updates: off */
import { unKebab } from './utils';

class ParameterError extends Error {
  constructor (message) {
    super(message);
    this.name = 'ParameterError';
  }
}

const NON_CHARM_COLLECTIONS = ['proxies', 'dice', 'characters', 'chronicles'];

export const charmTypes = wrap(async (ctx) => {
  const data = await charmTypesLoader(ctx.mongo);
  const body = charmTypesPostprocessor(data, ctx.params);
  ctx.status = 200;
  ctx.body = body;
});

export const charmGroups = wrap(async (ctx) => {
  const loader = getCharmGroupsLoader(ctx.params);
  const data = await loader(ctx.mongo);
  const body = charmGroupsPostprocessor(data, ctx.params);
  ctx.status = 200;
  ctx.body = body;
});

export const charmData = wrap(async (ctx) => {
  const { loaders, postprocessor } = getCharmDataLoadersAndPostprocessor(ctx.params);
  const { mongo } = ctx;
  const data = await Promise.all(loaders.map((f) => f(mongo)));
  const body = postprocessor([].concat(...data), ctx.params);
  ctx.status = 200;
  ctx.body = body;
});

export const quick = wrap(async (ctx) => {
  const { types: sendTypes, groups: sendGroups } = ctx.query || {};
  const { loaders: charmDataLoaders, postprocessor: charmDataPostprocessor }
    = getCharmDataLoadersAndPostprocessor(ctx.params);
  const loaders = [
    sendTypes ? charmTypesLoader : discard,
    sendGroups ? getCharmGroupsLoader(ctx.params) : discard,
    ...charmDataLoaders,
  ];
  const { mongo } = ctx;
  const data = await Promise.all(loaders.map((f) => f(mongo)));
  const body = {};
  if (sendTypes) {
    body.types = charmTypesPostprocessor(data[0], ctx.params);
  }
  if (sendGroups) {
    body.groups = charmGroupsPostprocessor(data[1], ctx.params);
  }
  body.charms = charmDataPostprocessor([].concat(...data.slice(2)), ctx.params);
  ctx.status = 200;
  ctx.body = body;
});

function wrap (f) {
  return {
    async get (ctx) {
      const { state = {} } = ctx;
      const { auth = {} } = state;
      const { permissions = [] } = auth;
      if (permissions.includes('read:charms')) {
        try {
          await f(ctx);
        } catch (err) {
          if (err instanceof ParameterError) {
            ctx.status = 400;
            ctx.body = { error: 'invalid_parameter' };
            return;
          }
          ctx.status = 500;
          const body = { error: 'database_error' };
          if (ctx.mode === 'production') {
            ctx.logger.error(err.message);
          } else {
            // eslint-disable-next-line camelcase
            body.error_description = err.message;
          }
          ctx.body = body;
        }
      } else {
        ctx.status = 403;
        ctx.body = { error: 'not_permitted' };
      }
    },
  };
}

function charmTypesLoader (mongo) {
  return mongo
    .listCollections({}, { nameOnly: true })
    .toArray();
}

function charmTypesPostprocessor (data) {
  return data.map(({ name }) => name)
    .filter((x) => x && !NON_CHARM_COLLECTIONS.includes(x));
}

function getCharmGroupsLoader ({ type }) {
  if (!type || typeof type !== 'string') {
    throw new ParameterError();
  }
  return (mongo) => mongo.collection(type)
    .distinct('group', {});
}

function charmGroupsPostprocessor (data) {
  return data.filter(identity);
}

function getCharmDataLoadersAndPostprocessor (params) {
  const { type, group } = params;
  if (!type || typeof type !== 'string' || !group || typeof group !== 'string') {
    throw new ParameterError();
  }
  const omitGenerics
    = ['Heretical', 'Martial Arts', 'Occult'].includes(group)
      && ['alchemical', 'infernal', 'lunar'].includes(type);
  const getLoaderOptionsSet = omitGenerics
    ? getLoaderOptionsSetWithProxies
    : getLoaderOptionsSetWithProxiesAndGenerics;
  const postprocessor = omitGenerics ? identity : rewriteGenerics;
  return {
    loaders: getLoaderOptionsSet(params).map(getCharmDataLoader),
    postprocessor,
  };
}

function getLoaderOptionsSetWithProxies (params) {
  const opt1 = { ...params, proxies: false };
  const opt2 = { ...params, proxies: true };
  return [opt1, opt2];
}

function getLoaderOptionsSetWithProxiesAndGenerics (params) {
  const opt1 = { ...params, proxies: false };
  const opt2 = { ...params, proxies: false, group: '' };
  const opt3 = { ...params, proxies: true };
  return [opt1, opt2, opt3];
}

function getCharmDataLoader ({ type, group, proxies }) {
  const groupFilter = group || { $exists: 0 };
  const filter = proxies
    ? { 'for.exalt': unKebab(type), 'for.group': groupFilter }
    : { group: groupFilter };
  return (mongo) => mongo.collection(proxies ? 'proxies' : type)
    .find(filter, { projection: { _id: 0 } })
    .toArray();
}

function rewriteGenerics (charms, { group }) {
  return charms.map((charm) => {
    if (charm.type !== 'generic') {
      return charm;
    }
    let g = group;
    if (g.includes(' ')) {
      g = g.replace(/ (\S?)/gu, (match, p1) => p1.toUpperCase());
    }
    if (
      (charm.id === 'Infernal.2ndExcellency' && g === 'EbonDragon')
      || (
        charm.id === 'Abyssal.RaveningMouthOf'
        && !['Archery', 'MartialArts', 'Melee', 'Thrown'].includes(g)
      )
    ) {
      return null;
    }
    if (charm.variants) {
      const variant = charm.variants.find((v) => v.id === g);
      let { description } = charm;
      if (variant?.description) {
        const gTxt = group === 'Ebon Dragon' ? 'The Ebon Dragon' : group;
        description = `${description}\n### ${gTxt}\n${variant.description}`;
      }
      const ch = { ...charm, name: renameCharm(charm, group, variant), description };
      delete ch.variants;
      return ch;
    }
    return { ...charm, name: renameCharm(charm, group) };
  }).filter(identity);
}

function renameCharm (charm, group, variant) {
  if (variant?.name) {
    return variant.name;
  }
  if (charm.name.includes('{')) {
    return charm.name.replace(/\{.*\}/u, group);
  }
  return `${charm.name}: ${group}`;
}

function identity (x) {
  return x;
}

function discard () {
  // return undefined;
}
