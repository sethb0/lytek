<script>
import MfLoading from '../toplevel/loading.vue';

export default {
  inject: ['authService', 'authToast'],
  components: { MfLoading },
  beforeRouteEnter (to, from, next) {
    next(async (vm) => {
      vm.$store.dispatch('auth/setInProgress', true);
      try {
        await vm.authService.login({ route: from.meta?.auth ? '/' : from.fullPath });
      } catch (err) {
        vm.authToast(err);
        vm.$router.replace({ name: 'home' });
      }
    });
  },
};
</script>

<template>
  <mf-loading></mf-loading>
</template>
