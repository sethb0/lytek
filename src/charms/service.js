import { ServiceError, ServerError, SchemaError, load, loadStringArray }
  from '../shared/service-helpers';

export class MissingDataError extends ServiceError {
  constructor (message) {
    super(message);
    this.name = 'MissingDataError';
  }
}

export class CharmsService {
  constructor (getAccessToken) {
    this._getAccessToken = getAccessToken;
    this._cache = null;
  }

  invalidateCache () {
    this._cache = null;
  }

  async getTypes () {
    return Object.keys(await this._readCache());
  }

  async getGroups (type) {
    return Object.keys(await this._readCachedType(type));
  }

  async getCharms (type, group) {
    const data = await this._readCachedType(type);
    if (!(group in data)) {
      throw new MissingDataError(`Unknown Charm group '${group}' in type '${type}'`);
    }
    if (!data[group]) {
      data[group] = await this._loadCharms(type, group);
    }
    return data[group];
  }

  async _readCachedType (type) {
    const cache = await this._readCache();
    if (!(type in cache)) {
      throw new MissingDataError(`Unknown Charm type '${type}'`);
    }
    if (!cache[type]) {
      cache[type] = await this._loadGroups(type);
    }
    return cache[type];
  }

  async _readCache () {
    if (!this._cache) {
      this._cache = await this._loadTypes();
    }
    return this._cache;
  }

  async _loadTypes () {
    const a = await loadStringArray('charms', await this._getToken());
    return Object.fromEntries(a.map((x) => [x, null]));
  }

  async _loadGroups (type) {
    const a = await loadStringArray(
      `charms/${encodeURIComponent(type)}`,
      await this._getToken(),
    );
    return Object.fromEntries(a.map((x) => [x, null]));
  }

  async _loadCharms (type, group) {
    const api = `charms/${encodeURIComponent(type)}/${encodeURIComponent(group)}`;
    const json = await load(api, await this._getToken());
    if (!json || !Array.isArray(json) || !json.every(
      (y) => y && typeof y === 'object' && !Array.isArray(y)
        && y.id && typeof y.id === 'string',
    )) {
      throw new SchemaError(`API ${decodeURI(api)} returned invalid data`);
    }
    return json;
  }

  async _getToken () {
    try {
      return this._getAccessToken('read:charms');
    } catch (err) {
      const e = new ServerError(err.message);
      e.originalError = err;
      throw e;
    }
  }
}
