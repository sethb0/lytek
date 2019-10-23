<script>
import MfSpinner from './spinner.vue';

export default {
  components: { MfSpinner },
};
</script>

<template>
  <b-card class="mx-sm-3 my-3">
    <b-card-text class="h1 display-3 brand-font text-center py-4">
      <mf-spinner class="double mr-2"></mf-spinner><br>
      Loading…
    </b-card-text>
  </b-card>
</template>

<style scoped>
.double {
  height: 200%;
}
</style>
