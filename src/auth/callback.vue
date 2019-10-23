<script>
import MfLoading from '../shared/loading.vue';

export default {
  inject: ['authService', 'authToast'],
  components: { MfLoading },
  beforeRouteEnter (to, from, next) {
    next(async (vm) => {
      try {
        await vm.$store.dispatch('auth/setInProgress', true);
        const { route: fullPath } = await vm.authService.handleCallback();
        const userData = await vm.authService.getUserData();
        await vm.$store.dispatch('auth/setUser', userData);
        vm.$store.dispatch('auth/setInProgress', false);
        vm.$router.replace(fullPath);
      } catch (err) {
        vm.authToast(err);
        vm.$router.replace({ name: 'home' });
      } finally {
        vm.$store.dispatch('auth/setInitialized', true);
      }
    });
  },
};
</script>

<template>
  <mf-loading></mf-loading>
</template>
