<template>
  <fa-i :icon="spinner" spin class="spinner"></fa-i>
</template>

<script>
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSun } from '@fortawesome/pro-duotone-svg-icons/faSun';

export default {
  components: { FaI },
  data () {
    return { spinner: faSun };
  },
};
</script>

<style scoped>
.spinner {
  --fa-secondary-opacity: 0.55;
}
</style>
