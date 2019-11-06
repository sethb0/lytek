import { SchemaError, ServerError, load, loadStringArray } from '../shared/service-helpers';

export class ReferenceService {
  constructor (getAccessToken) {
    this._getAccessToken = getAccessToken;
    this._tabList = null;
    this._tabCache = {};
    this._cardCache = {};
  }

  invalidateCache () {
    this._tabList = null;
    this._tabCache = {};
    this._cardCache = {};
  }

  async getTabTitles () {
    if (!this._tabList) {
      this._tabList = await loadStringArray('reference/tabs', await this._getToken());
    }
    return this._tabList;
  }

  async getTabContents (title) {
    if (!this._tabCache[title]) {
      const json = await load(
        `reference/tab/${encodeURIComponent(title)}`,
        await this._getToken(),
      );
      if (
        !json || !Array.isArray(json)
          || json.some((x) => typeof x?.id !== 'string' || typeof x?.text !== 'string')
      ) {
        throw new SchemaError(`API reference/tab returned invalid data for ${title}`);
      }
      this._tabCache[title] = json.map((x) => x.id);
      for (const x of json) {
        this._cardCache[x.id] = x.text;
      }
    }
    return this._tabCache[title];
  }

  async getCardText (id) {
    if (!this._cardCache[id]) {
      const json = await load(
        `reference/card/${encodeURIComponent(id)}`,
        await this._getToken(),
      );
      if (!json || typeof json !== 'string') {
        throw new SchemaError(`API reference/card returned invalid data for ${id}`);
      }
      this._cardCache[id] = json;
    }
    return this._cardCache[id];
  }

  async _getToken () {
    try {
      return this._getAccessToken('read:reference');
    } catch (err) {
      const e = new ServerError(err.message);
      e.originalError = err;
      throw e;
    }
  }
}
