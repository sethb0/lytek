<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState('charms', ['charms', 'selectedCharm']),
  },
  methods: {
    async selectCharm (charmId) {
      if (this.selectedCharm === charmId) {
        return;
      }
      try {
        await this.$store.dispatch('charms/setSelectedCharm', charmId);
      } catch (err) {
        this.$nextTick(() => {
          this.$bvToast.toast(err.message, {
            title: 'Failed to set selected Charm',
            variant: 'danger',
            toaster: 'b-toaster-top-center',
          });
        });
      }
    },
  },
};
</script>

<template>
  <div class="charm-selector">
    <b-list-group v-if="charms.length">
      <b-list-group-item v-for="c in charms" :key="c.id" href="#"
        :class="{ active: selectedCharm === c.id }" @click.prevent="selectCharm(c.id)"
      >
        {{ c.name }}
      </b-list-group-item>
    </b-list-group>
    <b-list-group v-else>
      <b-list-group-item>
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
