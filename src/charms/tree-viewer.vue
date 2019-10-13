<script>
import { mapState } from 'vuex';

import MfInspector from '@/charms/inspector.vue';
import MfToolbar from '@/charms/toolbar.vue';
import MfVisualizer from '@/charms/visualizer.vue';

export default {
  components: { MfInspector, MfToolbar, MfVisualizer },
  computed: mapState('charms', ['selectedCharm']),
};
</script>

<template>
  <div>
    <mf-toolbar class="d-print-none my-1" with-topdown></mf-toolbar>
    <div class="tree-viewer-container">
      <mf-visualizer class="visualizer"></mf-visualizer>
      <mf-inspector :id="selectedCharm" class="inspector"></mf-inspector>
    </div>
  </div>
</template>

<style scoped>
.tree-viewer-container {
  display: flex;
  flex-direction: column;
}

.inspector {
  margin: 0px auto;
}

.visualizer {
  margin: 0px 0px var(--spacer);
  padding: calc(2 * var(--spacer));
}

@media screen {
  .visualizer {
    height: calc(var(--inspector-height) - var(--toolbar-height));
    overflow: auto;
    overscroll-behavior: contain;
  }
}

@media screen and (min-width: 768px) {
  .tree-viewer-container {
    flex-direction: row;
    height: var(--inspector-height);
  }

  .inspector {
    height: 100%;
    flex-grow: 0.5;
    margin: 0px var(--spacer) var(--spacer);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .visualizer {
    height: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    margin: 0px 0px var(--spacer) var(--spacer);
  }
}

@media print {
  .visualizer, .inspector {
    margin: 0px;
  }
}
</style>
