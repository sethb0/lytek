<template>
  <mf-loading></mf-loading>
</template>

<script>
import MfLoading from '@/toplevel/loading.vue';

export default {
  components: { MfLoading },
  beforeRouteEnter (to, from, next) {
    next(async (vm) => {
      vm.$store.dispatch('auth/setInProgress', false);
      try {
        const fullPath = await vm.$root.auth.handleCallback();
        const userData = await vm.$root.auth.getUserData();
        await vm.$store.dispatch('auth/setUser', userData);
        vm.$router.replace(fullPath);
      } catch (err) {
        vm.$root.authToast(err);
        vm.$router.replace({ name: 'home' });
      }
    });
  },
};
</script>
