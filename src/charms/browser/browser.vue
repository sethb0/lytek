<script>
import MfInspector from '../shared/inspector.vue';
import MfSelector from './selector.vue';
import MfToolbar from '../shared/toolbar.vue';

export default {
  components: { MfInspector, MfSelector, MfToolbar },
  data () {
    return { charm: '' };
  },
  methods: {
    selectCharm ({ id }) {
      this.charm = id;
    },
  },
};
</script>

<template>
  <div>
    <mf-toolbar class="d-print-none my-1"></mf-toolbar>
    <div class="d-flex flex-column-reverse flex-md-row justify-content-center">
      <mf-selector @click="selectCharm" class="selector d-print-none"></mf-selector>
      <mf-inspector :charm-id="charm" class="inspector"></mf-inspector>
    </div>
  </div>
</template>

<style scoped>
.inspector {
  margin: 0px auto calc(2 * var(--spacer));
}

@media screen {
  .selector {
    height: var(--inspector-height);
    overflow-y: scroll;
  }
}

@media screen and (min-width: 768px) {
  .selector {
    overscroll-behavior: contain;
  }

  .inspector {
    height: var(--inspector-height);
    margin: 0px 0px 0px var(--spacer);
    overflow-y: scroll;
    overscroll-behavior: constrain;
  }
}
</style>
