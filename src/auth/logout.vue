<script>
import MfLoading from '../toplevel/loading.vue';

export default {
  inject: ['authService', 'authToast'],
  components: { MfLoading },
  beforeRouteEnter (to, from, next) {
    next(async (vm) => {
      vm.$store.dispatch('auth/setInProgress', true);
      try {
        await vm.authService.logout();
      } catch (err) {
        vm.authToast(err, 'Sign-out problem');
        vm.$router.go(-1);
      }
    });
  },
};
</script>

<template>
  <mf-loading></mf-loading>
</template>
