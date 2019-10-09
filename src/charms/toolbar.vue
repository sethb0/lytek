<script>
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSyncAlt } from '@fortawesome/pro-duotone-svg-icons/faSyncAlt';
import { mapState } from 'vuex';

import { unKebab } from '@/utils';

export default {
  inject: ['reload'],
  components: { FaI },
  data () {
    return { faReload: faSyncAlt };
  },
  computed: {
    ...mapState('charms', ['loading', 'types', 'groups']),
    selectedGroup: {
      get () {
        const g = this.$store.state.charms.selectedGroup;
        if (this.groups.includes(g)) {
          return g;
        }
        return '';
      },
      set (value) {
        this.$store.commit('charms/selectedGroup', value);
      },
    },
    selectedType: {
      get () {
        const t = this.$store.state.charms.selectedType;
        if (this.types.includes(t)) {
          return t;
        }
        return '';
      },
      set (value) {
        this.$store.commit('charms/selectedType', value);
      },
    },
    typeOptions () {
      return this.types.map((t) => ({ value: t, text: unKebab(t) }));
    },
  },
};
</script>

<template>
  <b-button-toolbar class="bg-light" aria-label="Charm viewer toolbar">
    <b-button-group size="sm" class="mx-2 py-1">
      <b-button title="Reload Charms" :disabled="loading" @click="reload">
        <fa-i :icon="faReload" :spin="loading"></fa-i>
        <span v-if="loading" class="sr-only">Loading…</span>
        <span v-else class="sr-only">Reload Charms</span>
      </b-button>
    </b-button-group>
    <b-input-group prepend="Type:" size="sm" class="type-selector mx-2 py-1">
      <b-form-select v-model="selectedType" :disabled="loading" :options="typeOptions">
        <template #first>
          <option value="" disabled>(select one)</option>
        </template>
      </b-form-select>
    </b-input-group>
    <b-input-group prepend="Group:" size="sm" class="group-selector mx-2 py-1">
      <b-form-select v-model="selectedGroup" :disabled="loading" :options="groups">
        <template #first>
          <option value="" disabled>(select one)</option>
        </template>
      </b-form-select>
    </b-input-group>
  </b-button-toolbar>
</template>

<style scoped>
.type-selector {
  width: 14rem;
}

.group-selector {
  width: 22.5rem;
}
</style>
