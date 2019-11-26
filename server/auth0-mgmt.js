/* eslint require-atomic-updates: off */
import superagent from 'superagent';

import { APP_NAME, MGMT_AUDIENCE, MGMT_CLIENT_ID, MGMT_TOKEN_URL } from './auth-constants';

const TIMEOUT = { response: 1500, deadline: 5000 };

let mgmtToken = '';
let tokenExpires = 0;

async function getMgmtToken () {
  if (Date.now() < tokenExpires) {
    return mgmtToken;
  }
  const result = await superagent.post(MGMT_TOKEN_URL)
    .type('form')
    .accept('json')
    .timeout(TIMEOUT)
    .redirects(0)
    .send({
      /* eslint-disable camelcase */
      grant_type: 'client_credentials',
      client_id: MGMT_CLIENT_ID,
      client_secret: process.env.MGMT_SECRET, // eslint-disable-line no-process-env
      audience: MGMT_AUDIENCE,
      /* eslint-enable camelcase */
    });
  const { access_token: token, expires_in: expires } = result.body;
  mgmtToken = token;
  tokenExpires = Date.now() + ((expires - (5 * 60)) * 1000);
  return token;
}

export async function getUserAppMetadata (user) {
  const token = await getMgmtToken();
  let result;
  try {
    result = await superagent.get(`${MGMT_AUDIENCE}users/${user}`)
      .accept('json')
      .timeout(TIMEOUT)
      .redirects(0)
      .set({ Authorization: `Bearer ${token}` })
      .query({ fields: 'app_metadata' });
  } catch (err) {
    if (err.status === 401) {
      tokenExpires = 0;
    }
    throw new Error(`getUserAppMetadata: management API returned status ${err.status}`);
  }
  const { app_metadata: metadata } = result.body;
  return (metadata || {})[APP_NAME] || {};
}

export async function setUserAppMetadata (user, metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new Error('setUserAppMetadata: metadata must be object');
  }
  const token = await getMgmtToken();
  try {
    await superagent.patch(`${MGMT_AUDIENCE}users/${user}`)
      .type('json')
      .timeout(TIMEOUT)
      .redirects(0)
      .set({ Authorization: `Bearer ${token}` })
      .send({ app_metadata: { [APP_NAME]: metadata } }); // eslint-disable-line camelcase
  } catch (err) {
    if (err.status === 401) {
      tokenExpires = 0;
    }
    throw new Error(`setUserAppMetadata: management API returned status ${err.status}`);
  }
}
