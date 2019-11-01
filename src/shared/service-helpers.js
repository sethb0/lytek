export class ServiceError extends Error {
  constructor (message) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ServerError extends ServiceError {
  constructor (message) {
    super(message);
    this.name = 'ServerError';
  }
}

export class SchemaError extends ServiceError {
  constructor (message) {
    super(message);
    this.name = 'SchemaError';
  }
}

export async function load (api, token) {
  try {
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
    if (err instanceof ServiceError) {
      throw err;
    }
    const e = new ServiceError(err.message);
    e.originalError = err;
    throw e;
  }
}

export async function loadStringArray (api, token) {
  const json = await load(api, token);
  if (!json || !Array.isArray(json) || !json.every((y) => y && typeof y === 'string')) {
    throw new SchemaError(`API ${decodeURI(api)} returned invalid data`);
  }
  return json;
}
