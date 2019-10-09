<script>
import { mapState } from 'vuex';

import MfInspector from '@/charms/inspector.vue';
import MfSelector from '@/charms/selector.vue';
import MfToolbar from '@/charms/toolbar.vue';

export default {
  components: { MfInspector, MfSelector, MfToolbar },
  computed: mapState('charms', ['selectedCharm']),
};
</script>

<template>
  <div>
    <mf-toolbar class="d-print-none my-1"></mf-toolbar>
    <div class="d-flex flex-column-reverse flex-md-row justify-content-center">
      <mf-selector class="charm-selector d-print-none">
      </mf-selector>
      <mf-inspector :id="selectedCharm"
        class="flex-md-grow-1 mb-2 mb-md-0 mx-auto ml-md-1 mr-md-0"
      >
      </mf-inspector>
    </div>
  </div>
</template>
