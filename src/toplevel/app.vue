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
  <div id="app" role="application">
    <template v-if="initialized">
      <mf-navbar v-if="!authRoute"></mf-navbar>
      <router-view v-if="showRouterView">
      </router-view>
      <mf-private v-else></mf-private>
    </template>
    <mf-loading v-else></mf-loading>
  </div>
</template>

<style>
a.disabled { pointer-events: none; }
div.fake-hr { height: 3px; }
</style>
