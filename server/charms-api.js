/* eslint require-atomic-updates: off */
import { COLLECTIONS as REF_COLLECTIONS } from './reference-api';
import { NotFoundError, ParameterError, discard, identity, unKebab, wrap } from './utils';

const NON_CHARM_COLLECTIONS = [
  'proxies', ...REF_COLLECTIONS,
];
const READ_PERMISSION = 'read:charms';

export const charmTypes = wrap(async (ctx) => {
  const data = await charmTypesLoader(ctx.mongo);
  const body = charmTypesPostprocessor(data, ctx.params);
  ctx.status = 200;
  ctx.body = body;
}, READ_PERMISSION);

export const charmGroups = wrap(async (ctx) => {
  const loader = getCharmGroupsLoader(ctx.params);
  const data = await loader(ctx.mongo);
  const body = charmGroupsPostprocessor(data, ctx.params);
  if (!body.length) {
    throw new NotFoundError('type not found');
  }
  ctx.status = 200;
  ctx.body = body;
}, READ_PERMISSION);

export const charmData = wrap(async (ctx) => {
  const { loaders, postprocessor } = getCharmDataLoadersAndPostprocessor(ctx.params);
  const { mongo } = ctx;
  const data = await Promise.all(loaders.map((f) => f(mongo)));
  const body = postprocessor(data.flat(1), ctx.params);
  if (!body.length) {
    throw new NotFoundError('type or group not found');
  }
  ctx.status = 200;
  ctx.body = body;
}, READ_PERMISSION);

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
  const groups = charmGroupsPostprocessor(data[1], ctx.params);
  if (!groups.length) {
    throw new NotFoundError('type not found');
  }
  const charms = charmDataPostprocessor(data.slice(2).flat(1), ctx.params);
  if (!charms.length) {
    throw new NotFoundError('group not found');
  }
  if (sendTypes) {
    body.types = charmTypesPostprocessor(data[0], ctx.params);
  }
  if (sendGroups) {
    body.groups = groups;
  }
  body.charms = charms;
  ctx.status = 200;
  ctx.body = body;
}, READ_PERMISSION);

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
