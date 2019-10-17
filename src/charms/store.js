export default {
  namespaced: true,
  state: {
    charms: [],
    groups: [],
    types: [],
    selectedCharm: '',
    selectedGroup: '',
    selectedType: '',
    loading: false,
    gvTopdown: false,
    gvPack: false,
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
    gvTopdown (state, value) {
      if (!value) {
        state.gvTopdown = false;
        return;
      }
      if (typeof value !== 'boolean') {
        throw new TypeError('Invalid value in mutation charms/gvTopdown');
      }
      state.gvTopdown = value;
    },
    gvPack (state, value) {
      if (!value) {
        state.gvPack = false;
        return;
      }
      if (typeof value !== 'boolean') {
        throw new TypeError('Invalid value in mutation charms/gvPack');
      }
      state.gvPack = true;
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
    async setGvTopdown ({ commit }, payload) {
      commit('gvTopdown', payload);
    },
    async setGvPack ({ commit }, payload) {
      commit('gvPack', payload);
    },
  },
};
