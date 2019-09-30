import 'bootstrap-vue/dist/bootstrap-vue.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import '@/toplevel/style/app.scss';

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';

import Vue from 'vue'; // auto-aliased by webpack to 'vue/dist/vue-runtime.esm'
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm';

import { AuthService } from '@/auth/service';

import App from '@/toplevel/app.vue';
import router from '@/router';
import store from '@/store';

fontAwesomeConfig.autoAddCss = false;

const auth = new AuthService();

Vue.use(BootstrapVue);

new Vue({
  data () {
    return { auth };
  },
  router,
  store,
  methods: {
    authToast (msg, title = 'Sign-in problem', variant = 'danger') {
      if (msg.message) {
        msg = msg.message;
      }
      this.$store.dispatch('auth/setInProgress', false);
      this.$nextTick(() => {
        this.$bvToast.toast(msg, { title, variant, keepalive: true });
      });
    },
  },
  render: (h) => h(App),
}).$mount('#app');
