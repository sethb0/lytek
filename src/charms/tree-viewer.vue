<script>
import MfInspector from '@/charms/inspector.vue';
import MfTitlebar from '@/charms/titlebar.vue';
import MfToolbar from '@/charms/toolbar.vue';
import MfVisualizer from '@/charms/visualizer.vue';

export default {
  components: {
    MfInspector, MfTitlebar, MfToolbar, MfVisualizer,
  },
  data () {
    return { selectedCharm: '', title: '' };
  },
  methods: {
    selectCharm ({ id }) {
      this.selectedCharm = id;
    },
    setTitle ({ title }) {
      this.title = title;
    },
  },
};
</script>

<template>
  <div>
    <mf-toolbar class="d-print-none my-1" with-topdown></mf-toolbar>
    <div class="tree-viewer-container">
      <div class="visualizer-container">
        <mf-titlebar :title="title" class="titlebar"></mf-titlebar>
        <mf-visualizer class="visualizer" @rendered="setTitle" @click="selectCharm">
        </mf-visualizer>
      </div>
      <mf-inspector :charm-id="selectedCharm" class="inspector"></mf-inspector>
    </div>
  </div>
</template>

<style scoped>
.tree-viewer-container {
  display: flex;
  flex-direction: column;
}

.inspector {
  margin: var(--spacer) auto 0px;
}

.titlebar {
  max-width: 100%;
  margin: 0px 0px var(--spacer);
}

.visualizer-container {
  margin: 0px 0px var(--spacer);
}

.visualizer {
  padding: calc(2 * var(--spacer));
}

@media screen {
  .visualizer-container {
    height: var(--inspector-height);
    max-width: 100%;
  }

  .visualizer {
    height: calc(var(--inspector-height) - var(--titlebar-height) - 3 * var(--spacer));
    width: available;
    overflow: scroll;
  }
}

@media screen and (min-width: 768px) {
  .tree-viewer-container {
    flex-direction: row;
    height: var(--inspector-height);
    width: 100%;
  }

  .inspector {
    flex-grow: 0.5;
    height: calc(var(--inspector-height) + 2 * var(--spacer));
    margin: 0px 0px 0px var(--spacer);
    overflow-y: scroll;
    overscroll-behavior: contain;
  }

  .visualizer-container {
    max-width: calc(100% - var(--inspector-min-width));
    flex-grow: 1;
    flex-shrink: 1;
  }

  .visualizer {
    height: calc(100% - var(--titlebar-height) - 2 * var(--spacer));
    margin: 0px;
    overscroll-behavior: contain;
  }
}

@media print {
  .visualizer, .inspector {
    margin: 0px;
  }
}
</style>
