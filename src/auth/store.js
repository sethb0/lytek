const CLAIM_NAMESPACE = 'https://lytek.sharpcla.ws';

export default {
  namespaced: true,
  state: {
    disableAdmin: false,
    inProgress: false,
    initialized: false,
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
      return state.capabilities.includes('admin') && !state.disableAdmin;
    },
    isGm (state) {
      return state.capabilities.includes('gm');
    },
    isUser (state) {
      return state.capabilities.includes('user');
    },
  },
  mutations: {
    disableAdmin (state, value) {
      if (typeof value !== 'boolean') {
        throw new TypeError('Incorrect value type in mutation auth/disableAdmin');
      }
      state.disableAdmin = value;
    },
    displayName (state, value) {
      if (typeof value !== 'string') {
        throw new TypeError('Incorrect value type in mutation auth/displayName');
      }
      if (value && !state.sub) {
        throw new Error('Cannot invoke mutation auth/displayName when no user profile set');
      }
      state.displayName = value;
    },
    inProgress (state, value) {
      if (typeof value !== 'boolean') {
        throw new TypeError('Incorrect value type in mutation auth/inProgress');
      }
      state.inProgress = value;
    },
    initialized (state, value) {
      if (!value) {
        throw new Error(
          'Cannot invoke mutation auth/initialized with a falsy value after startup'
        );
      }
      if (typeof value !== 'boolean') {
        throw new TypeError('Incorrect value type in mutation auth/initialized');
      }
      state.initialized = value;
    },
    user (state, value) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('Incorrect value type in mutation auth/user');
      }
      if (value.sub) {
        if (typeof value.capabilities !== 'object' || !Array.isArray(value.capabilities)) {
          throw new TypeError('Incorrect value type (capabilities) in mutation auth/user');
        }
        if (!value.capabilities.every((x) => typeof x === 'string')) {
          throw new TypeError('Incorrect element type (capabilities) in mutation auth/user');
        }
        if (typeof value.displayName !== 'string') {
          throw new TypeError('Incorrect value type (displayName) in mutation auth/user');
        }
        if (typeof value.email !== 'string') {
          throw new TypeError('Incorrect value type (email) in mutation auth/user');
        }
        if (typeof value.name !== 'string') {
          throw new TypeError('Incorrect value type (name) in mutation auth/user');
        }
        if (typeof value.pictureUrl !== 'string') {
          throw new TypeError('Incorrect value type (pictureUrl) in mutation auth/user');
        }
        if (typeof value.sub !== 'string') {
          throw new TypeError('Incorrect value type (sub) in mutation auth/user');
        }
        state.capabilities = value.capabilities.slice();
        state.displayName = value.displayName;
        state.email = value.email;
        state.name = value.name;
        state.pictureUrl = value.pictureUrl;
        state.sub = value.sub;
        state.disableAdmin = false;
      } else {
        state.capabilities = [];
        state.displayName = '';
        state.email = '';
        state.name = '';
        state.pictureUrl = '';
        state.sub = '';
        state.disableAdmin = false;
      }
    },
  },
  actions: {
    async setDisableAdmin ({ commit }, payload) {
      commit('disableAdmin', payload);
    },
    async setDisplayName ({ commit, getters }, payload) {
      if (getters.authenticated) {
        commit('displayName', payload);
      }
    },
    async setInProgress ({ commit }, payload) {
      commit('inProgress', payload);
    },
    async setInitialized ({ commit }, payload) {
      commit('initialized', payload);
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
