<template>
  <div id="app" role="application">
    <mf-navbar v-if="!authRoute"></mf-navbar>
    <router-view v-if="authRoute || public_ || authorized"></router-view>
    <mf-private v-else></mf-private>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import MfNavbar from '@/toplevel/navbar.vue';
import MfPrivate from '@/auth/private.vue';

export default {
  components: { MfNavbar, MfPrivate },
  computed: {
    ...mapGetters('auth', ['authorized']),
    authRoute () {
      return this.$route.meta?.auth;
    },
    public_ () {
      return this.$route.matched.every((x) => x.meta?.public);
    },
  },
};
</script>

<style>
body { padding-top: 80px; }
a.disabled { pointer-events: none; }
div.fake-hr { height: 3px; }
</style>
