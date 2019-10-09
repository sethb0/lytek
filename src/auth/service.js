/* eslint camelcase: off */
import createAuth0Client from '@auth0/auth0-spa-js';

const AUDIENCE = 'https://lytek.sharpcla.ws';
const CLIENT_ID = 'qKmlCFgdNi02xeV33lvtMWJ3H1cLFIgV';
const REDIRECT_URI = `${window.location.origin}/auth/callback`;
export class AuthService {
  constructor () {
    this.auth0 = createAuth0Client({
      audience: AUDIENCE,
      client_id: CLIENT_ID,
      connection: 'Discord',
      domain: 'mfllc.auth0.com',
      leeway: 5,
      max_age: 7 * 24 * 60 * 60,
      redirect_uri: REDIRECT_URI,
    });
  }

  async getAccessToken (scope, audience = AUDIENCE) {
    return (await this.auth0).getTokenSilently({ audience, scope });
  }

  async getUserData () {
    return (await this.auth0).getUser();
  }

  async handleCallback () {
    const { appState } = await (await this.auth0).handleRedirectCallback();
    if (!appState.route) {
      appState.route = '/';
    }
    return appState;
  }

  async isAuthenticated () {
    return (await this.auth0).isAuthenticated();
  }

  async login (appState) {
    return (await this.auth0).loginWithRedirect({ appState });
  }

  async logout () {
    return (await this.auth0).logout({
      client_id: CLIENT_ID,
      returnTo: window.location.origin,
    });
  }
}
