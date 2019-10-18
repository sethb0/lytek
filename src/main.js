import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import '@/toplevel/style/app.scss';

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';

import Vue from 'vue'; // Auto-aliased by webpack to 'vue/dist/vue-runtime.esm'
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm';

import { AuthService } from '@/auth/service';

import App from '@/toplevel/app.vue';
import router from '@/router';
import store from '@/store';

fontAwesomeConfig.autoAddCss = false;

const authService = new AuthService();

Vue.use(BootstrapVue);

new Vue({
  data: { authService, toaster: 'b-toaster-top-center' },
  router,
  store,
  async created () {
    if (!this.$route.meta?.auth) {
      try {
        if (await this.authService.isAuthenticated()) {
          await this.$store.dispatch('auth/setInProgress', true);
          const userData = await this.authService.getUserData();
          if (userData) {
            await this.$store.dispatch('auth/setUser', userData);
          }
          this.$store.dispatch('auth/setInProgress', false);
        }
      } catch (err) {
        this.authToast(err, 'Unable to restore user info', 'warning');
      } finally {
        this.$store.dispatch('auth/setInitialized', true);
      }
    }
  },
  methods: {
    authToast (msg, title = 'Sign-in problem', variant = 'danger') {
      if (msg.message) {
        msg = msg.message;
      }
      this.$store.dispatch('auth/setInProgress', false);
      this.$nextTick(() => {
        this.$bvToast.toast(msg, {
          title,
          variant,
          toaster: this.toaster,
          keepalive: true,
        });
      });
    },
  },
  render: (h) => h(App),
  provide () {
    return {
      authService: this.authService,
      authToast: ::this.authToast,
      toaster: this.toaster,
    };
  },
}).$mount('#app');
