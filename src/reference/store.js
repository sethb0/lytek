export default {
  namespaced: true,
  state: {
    currentTab: 0,
  },
  mutations: {
    currentTab (state, value) {
      if (!value) {
        state.currentTab = 0;
        return;
      }
      if (typeof value !== 'number' || value < 0 || Math.floor(value) !== value) {
        throw new TypeError('Invalid value type in mutation reference/currentTab');
      }
      state.currentTab = value;
    },
  },
  actions: {
    async setCurrentTab ({ commit }, payload) {
      commit('currentTab', payload);
    },
  },
};
