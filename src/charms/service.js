export class CharmsServiceError extends Error {}
export class MissingDataError extends CharmsServiceError {}
export class ServerError extends CharmsServiceError {}
export class SchemaError extends ServerError {}

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
    const a = await this._loadStringArray('charms');
    return Object.fromEntries(a.map((x) => [x, null]));
  }

  async _loadGroups (type) {
    const a = await this._loadStringArray(`charms/${encodeURIComponent(type)}`);
    return Object.fromEntries(a.map((x) => [x, null]));
  }

  async _loadCharms (type, group) {
    const api = `charms/${encodeURIComponent(type)}/${encodeURIComponent(group)}`;
    const json = await this._load(api);
    if (!json || !Array.isArray(json) || !json.every(
      (y) => y && typeof y === 'object' && !Array.isArray(y) && y.id && typeof y.id === 'string'
    )) {
      throw new SchemaError(`API ${decodeURI(api)} returned invalid data`);
    }
    return json;
  }

  async _loadStringArray (api) {
    const json = await this._load(api);
    if (!json || !Array.isArray(json) || !json.every((y) => y && typeof y === 'string')) {
      throw new SchemaError(`API ${decodeURI(api)} returned invalid data`);
    }
    return json;
  }

  async _load (api) {
    try {
      const token = await this._getAccessToken('read:charms');
      const response = await window.fetch(`${window.location.origin}/api/${api}`, {
        mode: 'same-origin',
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
        keepalive: true,
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!response.ok) {
        let msg = `Server returned error ${response.status}`;
        // eslint-disable-next-line camelcase
        const e = json?.error_description || json?.error || json?.error_code;
        if (e) {
          msg = `${msg}: ${e}`;
        }
        throw new ServerError(msg);
      }
      return json;
    } catch (err) {
      if (err instanceof CharmsServiceError) {
        throw err;
      }
      const e = new ServerError(err.message);
      e.originalError = err;
      throw e;
    }
  }
}
