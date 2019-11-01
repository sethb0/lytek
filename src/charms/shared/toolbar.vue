<script>
/* eslint-disable node/no-unpublished-import */
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSyncAlt } from '@fortawesome/pro-duotone-svg-icons/faSyncAlt';
import { mapState } from 'vuex';
/* eslint-enable node/no-unpublished-import */

import { unKebab } from '../../utils';

const ABILITIES = [
  'Archery', 'Athletics', 'Awareness', 'Bureaucracy', 'Craft', 'Dodge', 'Integrity',
  'Investigation', 'Larceny', 'Linguistics', 'Lore', 'Martial Arts', 'Medicine', 'Melee',
  'Occult', 'Performance', 'Presence', 'Resistance', 'Ride', 'Sail', 'Socialize', 'Stealth',
  'Survival', 'Thrown', 'War',
];
const ATTRIBUTES = [
  'Appearance', 'Charisma', 'Dexterity', 'Intelligence', 'Manipulation', 'Perception',
  'Stamina', 'Strength', 'Wits',
];
const EXALT_TYPES = [
  'solar', 'dragon-blooded', 'lunar', 'knacks', 'sidereal', 'abyssal', 'infernal', 'alchemical',
];
const HERO_STYLES = [
  'Solar Hero', 'Terrestrial Hero', 'Lunar Hero', 'Throne Shadow', 'Dark Messiah',
  'Infernal Monster',
].map((x) => `${x} Style`);
const GRACES = [
  'Heart', 'Cup', 'Staff', 'Ring', 'Sword', 'Way',
];
const JADEBORN_PATTERNS = [
  'Foundation', 'Worker', 'Warrior', 'Artisan', 'Enlightened', 'Chaos',
];
const MARTIAL_ARTS_TYPES = [
  'terrestrial-martial-arts', 'celestial-martial-arts', 'sidereal-martial-arts',
];
const MARTIAL_ARTS_SPECIAL_GROUPS = [
  'Enlightening', 'Universal',
];
const NON_YOZI_GROUPS = [
  'Heretical', 'Martial Arts', 'Occult',
];
const SPECIFIED_TYPES = [...EXALT_TYPES, ...MARTIAL_ARTS_TYPES];
const SPECIFIED_MARTIAL_ARTS_GROUPS = [...HERO_STYLES, ...MARTIAL_ARTS_SPECIAL_GROUPS];

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
    return {
      faReload: faSyncAlt,
      EXALT_TYPES,
      GRACES,
      HERO_STYLES,
      JADEBORN_PATTERNS,
      MARTIAL_ARTS_TYPES,
    };
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
    otherTypes () {
      return this.types.filter((x) => !SPECIFIED_TYPES.includes(x)).sort();
    },
    dragonStyles () {
      return this.groups.filter((x) => x.endsWith(' Dragon Style')).sort();
    },
    heroStyles () {
      return HERO_STYLES.filter((x) => this.groups.includes(x));
    },
    otherStyles () {
      return this.groups.filter(
        (x) => !x.endsWith(' Dragon Style') && !SPECIFIED_MARTIAL_ARTS_GROUPS.includes(x),
      ).sort();
    },
    nonStyleGroups () {
      return MARTIAL_ARTS_SPECIAL_GROUPS.filter((x) => this.groups.includes(x));
    },
    nonAbilityGroups () {
      return this.groups.filter((x) => !ABILITIES.includes(x)).sort();
    },
    nonAttributeGroups () {
      return this.groups.filter((x) => !ATTRIBUTES.includes(x)).sort();
    },
    nonGraceGroups () {
      return this.groups.filter((x) => !GRACES.includes(x)).sort();
    },
    nonMiscellaneousGroups () {
      return this.groups.filter((x) => x !== 'Miscellaneous').sort();
    },
    nonPatternGroups () {
      return this.groups.filter((x) => !JADEBORN_PATTERNS.includes(x)).sort();
    },
    nonYoziGroups () {
      return NON_YOZI_GROUPS.filter((x) => this.groups.includes(x));
    },
    yoziGroups () {
      return this.groups.filter((x) => !NON_YOZI_GROUPS.includes(x)).sort();
    },
    sortedGroups () {
      return this.groups.slice().sort();
    },
  },
  methods: {
    unKebab,
    // splitMartialArts (ma) {
    //   const m = /^([a-z])([a-z]*)-martial-arts$/u.exec(ma);
    //   return m && `${m[1].toUpperCase()}${m[2]}`;
    // },
  },
};
</script>

<template>
  <b-button-toolbar class="bg-light toolbar" aria-label="Charm viewer toolbar">
    <b-button-group size="sm" class="mx-2 py-1">
      <b-button :disabled="loading" @click="reloadCharms" title="Reload Charms">
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
      <b-form-select v-model="selectedType" :disabled="loading">
        <option value="" disabled>(select one)</option>
        <optgroup label="Exalted">
          <template v-for="exalt of EXALT_TYPES">
            <option v-if="types.includes(exalt)" :key="exalt" :value="exalt">
              {{ unKebab(exalt) }}
            </option>
          </template>
        </optgroup>
        <optgroup label="Martial Arts">
          <template v-for="ma of MARTIAL_ARTS_TYPES">
            <option v-if="types.includes(ma)" :key="ma" :value="ma">
              <!-- {{ splitMartialArts(ma) }} -->
              {{ unKebab(ma) }}
            </option>
          </template>
        </optgroup>
        <template v-for="type of otherTypes">
          <option :key="type" :value="type">
            {{ unKebab(type) }}
          </option>
        </template>
      </b-form-select>
    </b-input-group>
    <b-input-group prepend="Group:" size="sm" class="group-selector mx-2 py-1">
      <b-form-select v-model="selectedGroup" :disabled="loading">
        <option value="" disabled>(select one)</option>
        <template v-if="selectedType.endsWith('-martial-arts')">
          <optgroup label="Hero Styles">
            <template v-for="g of HERO_STYLES">
              <option v-if="groups.includes(g)" :key="g" :value="g">{{ g }}</option>
            </template>
          </optgroup>
          <optgroup v-if="dragonStyles.length" label="Glorious Dragon Styles">
            <option v-for="g of dragonStyles" :key="g" :value="g">{{ g }}</option>
          </optgroup>
          <optgroup v-if="otherStyles.length" label="Other Styles">
            <option v-for="g of otherStyles" :key="g" :value="g">{{ g }}</option>
          </optgroup>
          <optgroup v-if="nonStyleGroups.length" label="Non-Style Charms">
            <option v-for="g of nonStyleGroups" :key="g" :value="g">{{ g }}</option>
          </optgroup>
        </template>
        <template v-else-if="selectedType === 'solar'">
          <optgroup label="Dawn">
            <option value="Archery">Archery</option>
            <option value="Martial Arts">Martial Arts</option>
            <option value="Melee">Melee</option>
            <option value="Thrown">Thrown</option>
            <option value="War">War</option>
          </optgroup>
          <optgroup label="Zenith">
            <option value="Integrity">Integrity</option>
            <option value="Performance">Performance</option>
            <option value="Presence">Presence</option>
            <option value="Resistance">Resistance</option>
            <option value="Survival">Survival</option>
          </optgroup>
          <optgroup label="Twilight">
            <option value="Craft">Craft</option>
            <option value="Investigation">Investigation</option>
            <option value="Lore">Lore</option>
            <option value="Medicine">Medicine</option>
            <option value="Occult">Occult</option>
          </optgroup>
          <optgroup label="Night">
            <option value="Athletics">Athletics</option>
            <option value="Awareness">Awareness</option>
            <option value="Dodge">Dodge</option>
            <option value="Larceny">Larceny</option>
            <option value="Stealth">Stealth</option>
          </optgroup>
          <optgroup label="Eclipse">
            <option value="Bureaucracy">Bureaucracy</option>
            <option value="Linguistics">Linguistics</option>
            <option value="Ride">Ride</option>
            <option value="Sail">Sail</option>
            <option value="Socialize">Socialize</option>
          </optgroup>
          <optgroup v-if="nonAbilityGroups.length" label="Other">
            <option v-for="g of nonAbilityGroups" :key="g" :value="g">{{ g }}</option>
          </optgroup>
        </template>
        <template v-else-if="selectedType === 'dragon-blooded'">
          <optgroup label="Air">
            <option value="Linguistics">Linguistics</option>
            <option value="Lore">Lore</option>
            <option value="Occult">Occult</option>
            <option value="Stealth">Stealth</option>
            <option value="Thrown">Thrown</option>
          </optgroup>
          <optgroup label="Earth">
            <option value="Awareness">Awareness</option>
            <option value="Craft">Craft</option>
            <option value="Integrity">Integrity</option>
            <option value="Resistance">Resistance</option>
            <option value="War">War</option>
          </optgroup>
          <optgroup label="Fire">
            <option value="Athletics">Athletics</option>
            <option value="Dodge">Dodge</option>
            <option value="Melee">Melee</option>
            <option value="Presence">Presence</option>
            <option value="Socialize">Socialize</option>
          </optgroup>
          <optgroup label="Water">
            <option value="Bureaucracy">Bureaucracy</option>
            <option value="Investigation">Investigation</option>
            <option value="Larceny">Larceny</option>
            <option value="Martial Arts">Martial Arts</option>
            <option value="Sail">Sail</option>
          </optgroup>
          <optgroup label="Wood">
            <option value="Archery">Archery</option>
            <option value="Medicine">Medicine</option>
            <option value="Performance">Performance</option>
            <option value="Ride">Ride</option>
            <option value="Survival">Survival</option>
          </optgroup>
          <optgroup v-if="nonAbilityGroups.length" label="Other">
            <option v-for="g of nonAbilityGroups" :key="g" :value="g">{{ g }}</option>
          </optgroup>
        </template>
        <template v-else-if="selectedType === 'lunar'">
          <optgroup label="Physical">
            <option value="Strength">Strength</option>
            <option value="Dexterity">Dexterity</option>
            <option value="Stamina">Stamina</option>
          </optgroup>
          <optgroup label="Social">
            <option value="Charisma">Charisma</option>
            <option value="Manipulation">Manipulation</option>
            <option value="Appearance">Appearance</option>
          </optgroup>
          <optgroup label="Mental">
            <option value="Perception">Perception</option>
            <option value="Intelligence">Intelligence</option>
            <option value="Wits">Wits</option>
          </optgroup>
          <optgroup v-if="nonAttributeGroups.length" label="Other">
            <option v-for="g of nonAttributeGroups" :key="g" :value="g">{{ g }}</option>
          </optgroup>
        </template>
        <template v-else-if="selectedType === 'knacks'">
          <option v-for="g of nonMiscellaneousGroups" :key="g" :value="g">{{ g }}</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </template>
        <template v-else-if="selectedType === 'infernal'">
          <option v-for="g of yoziGroups" :key="g" :value="g">
            {{ g === 'Ebon Dragon' ? 'the Ebon Dragon' : g }}
          </option>
          <option v-for="g of nonYoziGroups" :key="g" :value="g">{{ g }}</option>
        </template>
        <template v-else-if="selectedType === 'jadeborn'">
          <template v-for="g of JADEBORN_PATTERNS">
            <option v-if="groups.includes(g)" :key="g" :value="g">{{ g }}</option>
          </template>
          <option v-for="g of nonPatternGroups" :key="g" :value="g">{{ g }}</option>
        </template>
        <template v-else-if="selectedType === 'raksha'">
          <template v-for="g of GRACES">
            <option v-if="groups.includes(g)" :key="g" :value="g">{{ g }}</option>
          </template>
          <option v-for="g of nonGraceGroups" :key="g" :value="g">{{ g }}</option>
        </template>
        <template v-else>
          <option v-for="g of sortedGroups" :key="g" :value="g">{{ g }}</option>
        </template>
      </b-form-select>
    </b-input-group>
  </b-button-toolbar>
</template>

<style scoped>
.toolbar {
  max-height: calc(2 * var(--toolbar-height));
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
  .toolbar {
    max-height: var(--toolbar-height);
  }
}
</style>
