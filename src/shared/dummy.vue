<script>
export default {
  computed: {
    route () {
      return this.$route.name || '(no name)';
    },
  },
};
</script>

<template>
  <b-card class="narrow mx-auto mb-3" border-variant="info">
    <b-card-text>{{ route }}</b-card-text>
  </b-card>
</template>

<style scoped>
.narrow { max-width: var(--breakpoint-sm); }
</style>
