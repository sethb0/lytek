<script>
/* eslint-disable node/no-unpublished-import */
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSun } from '@fortawesome/pro-duotone-svg-icons/faSun';
/* eslint-enable node/no-unpublished-import */

export default {
  components: { FaI },
  data () {
    return { spinner: faSun };
  },
};
</script>

<template>
  <fa-i :icon="spinner" spin class="spinner"></fa-i>
</template>

<style scoped>
.spinner {
  --fa-secondary-opacity: 0.55;
}
</style>
