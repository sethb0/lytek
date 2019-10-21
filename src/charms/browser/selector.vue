<script>
/* eslint-disable node/no-unpublished-import */
import { mapState } from 'vuex';
/* eslint-enable node/no-unpublished-import */

export default {
  data () {
    return { selectedCharm: '' };
  },
  computed: {
    ...mapState('charms', ['charms']),
    sortedCharms () {
      const c = this.charms.slice();
      c.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      return c;
    },
  },
  methods: {
    async selectCharm (charmId) {
      if (this.selectedCharm === charmId) {
        return;
      }
      this.selectedCharm = charmId;
      this.$emit('click', { id: charmId });
    },
  },
};
</script>

<template>
  <div class="charm-selector">
    <b-list-group v-if="charms.length">
      <b-list-group-item v-for="c in sortedCharms" :key="c.id"
        :class="{ active: selectedCharm === c.id }"
        @click.prevent="selectCharm(c.id)" href="#"
      >
        {{ c.name }}
      </b-list-group-item>
    </b-list-group>
    <b-list-group v-else>
      <b-list-group-item disabled>
        Select a type and group from the toolbar to display a list of Charms.
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<style scoped>
.charm-selector {
  min-width: 12rem;
}
</style>
