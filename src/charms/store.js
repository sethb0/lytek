export default {
  namespaced: true,
  state: {
    charms: [],
    groups: [],
    types: [],
    selectedCharm: '',
    selectedGroup: '',
    selectedType: '',
    initialized: false,
    loading: false,
  },
  mutations: {
    charms (state, value) {
      if (!value) {
        state.charms = [];
        return;
      }
      if (
        !Array.isArray(value)
        || value.some((x) => !x || typeof x !== 'object' || Array.isArray(x))
      ) {
        throw new TypeError('Invalid value in mutation charms/charms');
      }
      // there is no feasible way to check individual Charms for well-formedness
      state.charms = JSON.parse(JSON.stringify(value));
    },
    groups (state, value) {
      if (!value) {
        state.groups = [];
        return;
      }
      if (!Array.isArray(value) || value.some((x) => !x || typeof x !== 'string')) {
        throw new TypeError('Invalid value in mutation charms/groups');
      }
      state.groups = value.slice();
    },
    types (state, value) {
      if (!value) {
        state.types = [];
        return;
      }
      if (!Array.isArray(value) || value.some((x) => !x || typeof x !== 'string')) {
        throw new TypeError('Invalid value in mutation charms/types');
      }
      state.types = value.slice();
    },
    selectedCharm (state, value) {
      if (!value) {
        state.selectedCharm = '';
        return;
      }
      if (typeof value !== 'string') {
        throw new TypeError('Invalid value in mutation charms/selectedCharm');
      }
      if (!state.charms.some((x) => x.id === value)) {
        throw new Error('Cannot find match for value in mutation charms/selectedCharm');
      }
      state.selectedCharm = value;
    },
    selectedGroup (state, value) {
      if (!value) {
        state.selectedGroup = '';
        return;
      }
      if (typeof value !== 'string') {
        throw new TypeError('Invalid value in mutation charms/selectedGroup');
      }
      if (!state.groups.includes(value)) {
        throw new Error('Cannot find match for value in mutation charms/selectedGroup');
      }
      state.selectedGroup = value;
    },
    selectedType (state, value) {
      if (!value) {
        state.selectedType = '';
        return;
      }
      if (typeof value !== 'string') {
        throw new TypeError('Invalid value in mutation charms/selectedType');
      }
      if (!state.types.includes(value)) {
        throw new Error('Cannot find match for value in mutation charms/selectedType');
      }
      state.selectedType = value;
    },
    loading (state, value) {
      if (!value) {
        state.loading = false;
        return;
      }
      if (typeof value !== 'boolean') {
        throw new TypeError('Invalid value in mutation charms/loading');
      }
      state.loading = value;
    },
    initialized (state, value) {
      if (!value) {
        throw new Error('Cannot mutate charms/initialized to falsy value');
      }
      if (typeof value !== 'boolean') {
        throw new TypeError('Invalid value in mutation charms/initialized');
      }
      state.initialized = value;
    },
  },
  actions: {
    async setCharms ({ commit }, payload) {
      commit('charms', payload);
    },
    async setGroups ({ commit }, payload) {
      commit('groups', payload);
    },
    async setTypes ({ commit }, payload) {
      commit('types', payload);
    },
    async setSelectedCharm ({ commit }, payload) {
      commit('selectedCharm', payload);
    },
    async setSelectedGroup ({ commit }, payload) {
      commit('selectedGroup', payload);
    },
    async setSelectedType ({ commit }, payload) {
      commit('selectedType', payload);
    },
    async setLoading ({ commit }, payload) {
      commit('loading', payload);
    },
    async setInitialized ({ commit }, payload) {
      commit('initialized', payload);
    },
  },
};
