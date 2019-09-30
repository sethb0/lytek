const CLAIM_NAMESPACE = 'https://lytek.sharpcla.ws';

export default {
  namespaced: true,
  state: {
    inProgress: true,
    capabilities: [],
    displayName: '',
    email: '',
    name: '',
    pictureUrl: '',
    sub: '',
  },
  getters: {
    authenticated (state) {
      return Boolean(state.sub);
    },
    authorized (state) {
      return Boolean(state.capabilities.length);
    },
    friendlyName (state) {
      return state.displayName || state.name;
    },
    isAdmin (state) {
      return state.capabilities.includes('admin');
    },
    isGm (state) {
      return state.capabilities.includes('gm');
    },
    isUser (state) {
      return state.capabilities.includes('user');
    },
  },
  mutations: {
    displayName (state, value) {
      if (typeof value !== 'string') {
        throw new TypeError('incorrect value type in mutation auth/displayName');
      }
      if (value && !state.sub) {
        throw new Error('cannot invoke mutation auth/displayName when no user profile set');
      }
      state.displayName = value;
    },
    inProgress (state, value) {
      if (typeof value !== 'boolean') {
        throw new TypeError('incorrect value type in mutation auth/inProgress');
      }
      state.inProgress = value;
    },
    user (state, value) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('incorrect value type in mutation auth/user');
      }
      if (value.sub) {
        if (typeof value.capabilities !== 'object' || !Array.isArray(value.capabilities)) {
          throw new TypeError('incorrect value type (capabilities) in mutation auth/user');
        }
        if (!value.capabilities.every((x) => typeof x === 'string')) {
          throw new TypeError('incorrect element type (capabilities) in mutation auth/user');
        }
        if (typeof value.displayName !== 'string') {
          throw new TypeError('incorrect value type (displayName) in mutation auth/user');
        }
        if (typeof value.email !== 'string') {
          throw new TypeError('incorrect value type (email) in mutation auth/user');
        }
        if (typeof value.name !== 'string') {
          throw new TypeError('incorrect value type (name) in mutation auth/user');
        }
        if (typeof value.pictureUrl !== 'string') {
          throw new TypeError('incorrect value type (pictureUrl) in mutation auth/user');
        }
        if (typeof value.sub !== 'string') {
          throw new TypeError('incorrect value type (sub) in mutation auth/user');
        }
        state.capabilities = value.capabilities.slice();
        state.displayName = value.displayName;
        state.email = value.email;
        state.name = value.name;
        state.pictureUrl = value.pictureUrl;
        state.sub = value.sub;
      } else {
        state.capabilities = [];
        state.displayName = '';
        state.email = '';
        state.name = '';
        state.pictureUrl = '';
        state.sub = '';
      }
    },
  },
  actions: {
    async setDisplayName ({ commit, getters }, payload) {
      if (getters.authenticated) {
        commit('displayName', payload);
      }
    },
    async setInProgress ({ commit }, payload) {
      commit('inProgress', payload);
    },
    async setUser ({ commit }, payload) {
      payload ||= {};
      commit('user', {
        capabilities: payload[`${CLAIM_NAMESPACE}/capabilities`] || [],
        displayName: payload[`${CLAIM_NAMESPACE}/displayName`] || '',
        email: payload.email_verified ? payload.email || '' : '',
        name: payload.nickname || '',
        pictureUrl: payload.picture || '',
        sub: payload.sub || '',
      });
    },
  },
};
