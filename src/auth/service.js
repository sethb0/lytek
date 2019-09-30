/* eslint camelcase: off */
import createAuth0Client from '@auth0/auth0-spa-js';

const CLIENT_ID = 'qKmlCFgdNi02xeV33lvtMWJ3H1cLFIgV';

export class AuthService {
  constructor () {
    this.auth0 = createAuth0Client({
      audience: 'https://lytek.sharpcla.ws',
      client_id: CLIENT_ID,
      connection: 'Discord',
      domain: 'mfllc.auth0.com',
      leeway: 5,
      max_age: 7 * 24 * 60 * 60,
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
  }

  async getAccessToken (scope) {
    return (await this.auth0).getTokenSilently({ scope });
  }

  async getUserData () {
    return (await this.auth0).getUser();
  }

  async handleCallback () {
    const { appState } = await (await this.auth0).handleRedirectCallback();
    const { route } = appState || {};
    return route || '/';
  }

  async isAuthenticated () {
    return (await this.auth0).isAuthenticated();
  }

  async login (route) {
    return (await this.auth0).loginWithRedirect({
      appState: { route },
    });
  }

  async logout () {
    return (await this.auth0).logout({
      client_id: CLIENT_ID,
      returnTo: window.location.origin,
    });
  }
}
