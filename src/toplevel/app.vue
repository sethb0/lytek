<script>
import { mapGetters, mapState } from 'vuex';

import MfLoading from '@/toplevel/loading.vue';
import MfNavbar from '@/toplevel/navbar.vue';
import MfPrivate from '@/auth/private.vue';

export default {
  components: { MfLoading, MfNavbar, MfPrivate },
  computed: {
    ...mapState('auth', ['initialized']),
    ...mapGetters('auth', ['authorized']),
    authRoute () {
      return this.$route.meta?.auth;
    },
    'public' () {
      return this.$route.matched.every((x) => x.meta?.public);
    },
    showRouterView () {
      return this.authRoute || this.public || this.authorized;
    },
  },
};
</script>

<template>
  <div id="app" role="application" class="app-root-container">
    <template v-if="initialized">
      <mf-navbar v-if="!authRoute" class="app-navbar"></mf-navbar>
      <router-view v-if="showRouterView" class="app-main-view">
      </router-view>
      <mf-private v-else class="app-main-view"></mf-private>
    </template>
    <mf-loading v-else></mf-loading>
  </div>
</template>

<style>
a.disabled { pointer-events: none; }
div.fake-hr { height: 3px; }

:root {
  --navbar-height: 3rem;
  --body-margin: calc(var(--navbar-height) + var(--spacer) * 2);
  --main-height: calc(100vh - var(--body-margin));
}
.app-navbar { height: var(--navbar-height); }
.app-main-view {
  height: var(--main-height);
  margin-top: var(--body-margin);
}
</style>
