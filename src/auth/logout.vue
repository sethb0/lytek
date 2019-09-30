<template>
  <mf-loading></mf-loading>
</template>

<script>
import MfLoading from '@/toplevel/loading.vue';

export default {
  components: { MfLoading },
  beforeRouteEnter (to, from, next) {
    next(async (vm) => {
      vm.$store.dispatch('auth/setInProgress', true);
      try {
        await vm.$root.auth.logout();
      } catch (err) {
        vm.$root.authToast(err, 'Sign-out problem');
        vm.$router.go(-1);
      }
    });
  },
};
</script>
