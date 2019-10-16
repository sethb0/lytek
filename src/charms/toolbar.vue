<script>
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSyncAlt } from '@fortawesome/pro-duotone-svg-icons/faSyncAlt';
import { mapState } from 'vuex';

import { unKebab } from '@/utils';

const ATTRIBUTES_REV = [
  'Wits', 'Intelligence', 'Perception',
  'Appearance', 'Manipulation', 'Charisma',
  'Stamina', 'Dexterity', 'Strength',
];
const EXALT_TYPES_REV
  = ['alchemical', 'infernal', 'abyssal', 'sidereal', 'lunar', 'dragon-blooded', 'solar'];
const MA_TYPES_REV
  = ['sidereal-martial-arts', 'celestial-martial-arts', 'terrestrial-martial-arts'];
const JADEBORN_GROUPS_REV
  = ['Chaos', 'Artisan', 'Enlightened', 'Warrior', 'Worker', 'Foundation'];

const sortJadebornGroups = makeGroupSorter(JADEBORN_GROUPS_REV);
const sortAttributes = makeGroupSorter(ATTRIBUTES_REV);

export default {
  inject: ['reloadCharms'],
  components: { FaI },
  props: {
    withTopdown: {
      type: Boolean,
      'default': false,
    },
    withPack: {
      type: Boolean,
      'default': false,
    },
  },
  data () {
    return { faReload: faSyncAlt };
  },
  computed: {
    ...mapState('charms', ['loading', 'types', 'groups']),
    gvPack: {
      get () {
        return this.$store.state.charms.gvPack;
      },
      set (value) {
        this.$store.commit('charms/gvPack', value);
      },
    },
    gvTopdown: {
      get () {
        return this.$store.state.charms.gvTopdown;
      },
      set (value) {
        this.$store.commit('charms/gvTopdown', value);
      },
    },
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
      return this.types
        .slice()
        .sort(sortTypes)
        .map((t) => ({ value: t, text: unKebab(t) }));
    },
    groupOptions () {
      if (this.selectedType === 'jadeborn') {
        return this.groups
          .slice()
          .sort(sortJadebornGroups);
        // Not going to just return a JADEBORN_GROUPS constant because I might add other
        // Patterns and I'd prefer not to have to come in here every time.
        // Eh, it's an excuse.
      }
      if (this.selectedType === 'lunar') {
        return this.groups
          .slice()
          .sort(sortAttributes);
        // This accommodates Martial Arts, Occult, and any other widgets that may end up
        // alongside the attributes in the Lunar Charm set.
      }
      return this.groups;
    },
  },
};

function sortTypes (a, b) {
  const aExalt = EXALT_TYPES_REV.indexOf(a);
  const bExalt = EXALT_TYPES_REV.indexOf(b);
  if (aExalt >= 0 || bExalt >= 0) {
    return bExalt - aExalt;
  }
  const aMA = MA_TYPES_REV.indexOf(a);
  const bMA = MA_TYPES_REV.indexOf(b);
  if (aMA >= 0 || bMA >= 0) {
    return bMA - aMA;
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function makeGroupSorter (revGroups) {
  return (a, b) => {
    const aGroup = revGroups.indexOf(a);
    const bGroup = revGroups.indexOf(b);
    if (aGroup >= 0 || bGroup >= 0) {
      return bGroup - aGroup;
    }
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  };
}
</script>

<template>
  <b-button-toolbar class="bg-light charm-toolbar" aria-label="Charm viewer toolbar">
    <b-button-group size="sm" class="mx-2 py-1">
      <b-button title="Reload Charms" :disabled="loading" @click="reloadCharms">
        <fa-i :icon="faReload" :spin="loading"></fa-i>
        <span v-if="loading" class="sr-only">Loading…</span>
        <span v-else class="sr-only">Reload Charms</span>
      </b-button>
      <div v-if="withTopdown" class="bg-dark ml-2 pr-2">
        <b-form-checkbox v-model="gvTopdown" size="sm" switch class="switchbox pt-1">
          Top-down?
        </b-form-checkbox>
      </div>
      <div v-if="withPack" class="bg-dark ml-2 pr-2">
        <b-form-checkbox v-model="gvPack" size="sm" switch class="switchbox pt-1">
          Packed?
        </b-form-checkbox>
      </div>
    </b-button-group>
    <b-input-group prepend="Type:" size="sm" class="type-selector mb-md-0 py-1">
      <b-form-select v-model="selectedType" :disabled="loading" :options="typeOptions">
        <template #first>
          <option value="" disabled>(select one)</option>
        </template>
      </b-form-select>
    </b-input-group>
    <b-input-group prepend="Group:" size="sm" class="group-selector mx-2 pt-md-1 pb-1">
      <b-form-select v-model="selectedGroup" :disabled="loading" :options="groupOptions">
        <template #first>
          <option value="" disabled>(select one)</option>
        </template>
      </b-form-select>
    </b-input-group>
  </b-button-toolbar>
</template>

<style scoped>
.charm-toolbar {
  height: calc(2 * var(--toolbar-height));
}

.switchbox {
  padding-left: 2.5rem;
}

.type-selector {
  width: 14rem;
}

.group-selector {
  min-width: 22rem;
  max-width: 24rem;
}

@media screen and (min-width: 768px) {
  .charm-toolbar {
    height: var(--toolbar-height);
  }
}
</style>
