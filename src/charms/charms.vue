<script>
/* eslint-disable node/no-unpublished-import */
import { mapState } from 'vuex';
/* eslint-enable node/no-unpublished-import */

import { CharmsService, MissingDataError } from './service';
import MfServiceLoader from '../shared/service-loader.vue';

export default {
  inject: ['toaster'],
  components: { MfServiceLoader },
  data () {
    return { CharmsService };
    // service is deliberately not a reactive property.
  },
  computed: mapState('charms', ['types', 'groups', 'charms', 'selectedType', 'selectedGroup']),
  watch: {
    types () {
      this.typesChanged();
    },
    groups () {
      this.groupsChanged();
    },
    selectedType () {
      this.typesChanged();
    },
    selectedGroup () {
      this.groupsChanged();
    },
  },
  methods: {
    typesChanged () {
      if (this.selectedType && this.types.includes(this.selectedType)) {
        this.loadGroups(this.selectedType);
      } else {
        this.$store.dispatch('charms/setGroups', null);
      }
    },
    groupsChanged () {
      if (
        this.selectedType && this.types.includes(this.selectedType)
        && this.selectedGroup && this.groups.includes(this.selectedGroup)
      ) {
        this.loadCharms(this.selectedType, this.selectedGroup);
      } else {
        this.$store.dispatch('charms/setCharms', null);
      }
    },
    async loadTypes () {
      try {
        await this.$store.dispatch('charms/setLoading', true);
        const types = await this.service.getTypes();
        await this.$store.dispatch('charms/setTypes', types);
      } catch (err) {
        this.$nextTick(() => {
          this.$bvToast.toast(err.message, {
            title: 'Failed to load Charm types',
            variant: 'danger',
            toaster: this.toaster,
          });
        });
      } finally {
        this.$store.dispatch('charms/setLoading', false);
      }
    },
    async loadGroups (type) {
      try {
        await this.$store.dispatch('charms/setLoading', true);
        const groups = await this.service.getGroups(type);
        await this.$store.dispatch('charms/setGroups', groups);
      } catch (err) {
        if (err instanceof MissingDataError) {
          this.service.invalidateCache();
        }
        this.$nextTick(() => {
          this.$bvToast.toast(err.message, {
            title: 'Failed to load Charm groups',
            variant: 'danger',
            toaster: this.toaster,
          });
        });
      } finally {
        this.$store.dispatch('charms/setLoading', false);
      }
    },
    async loadCharms (type, group) {
      try {
        await this.$store.dispatch('charms/setLoading', true);
        const charmData = await this.service.getCharms(type, group);
        await this.$store.dispatch('charms/setCharms', charmData);
      } catch (err) {
        if (err instanceof MissingDataError) {
          this.service.invalidateCache();
        }
        this.$nextTick(() => {
          this.$bvToast.toast(err.message, {
            title: 'Failed to load Charm data',
            variant: 'danger',
            toaster: this.toaster,
          });
        });
      } finally {
        this.$store.dispatch('charms/setLoading', false);
      }
    },
    serviceInitialized (service) {
      this.service = service;
      return this.loadTypes();
    },
    async reload () {
      this.service.invalidateCache();
      await this.$store.dispatch('charms/setTypes', null);
      this.loadTypes();
    },
  },
  provide () {
    return { reloadCharms: ::this.reload };
  },
};
</script>

<template>
  <mf-service-loader :service-constructor="CharmsService" service-name="Charms"
    @initialized="serviceInitialized"
  >
    <router-view></router-view>
  </mf-service-loader>
</template>

<style>
:root {
  --toolbar-height: 2.5rem;
  --titlebar-height: 1.75rem;
  --inspector-height: calc(var(--main-height) - var(--toolbar-height) - 2 * var(--spacer));
  --inspector-min-width: 25rem;
  --inspector-max-width: 50rem;

  --inspector-background-color: floralwhite;
  --inspector-text-color: var(--named-color-kobicha);

  --visualizer-background-color: ghostwhite;
  --visualizer-edge-color: black;
  --visualizer-edge-width: 1px;
}

.abyssal, .ghosts {
  --visualizer-charm-color: darkgray;
  --visualizer-cluster-color: gainsboro;
}
.alchemical {
  --visualizer-charm-color: darkorange;
  --visualizer-cluster-color: navajowhite;
}
.celestial-martial-arts {
  --visualizer-charm-color: thistle;
  --visualizer-cluster-color: lightsteelblue;
}
.dragon-blooded, .terrestrial-martial-arts {
  --visualizer-charm-color: indianred;
  --visualizer-cluster-color: rosybrown;
}
.infernal {
  --visualizer-charm-color: lightgreen;
  --visualizer-cluster-color: darkseagreen;
}
.jadeborn {
  --visualizer-charm-color: peru;
  --visualizer-cluster-color: burlywood;
}
.lunar, .knacks {
  --visualizer-charm-color: lightskyblue;
  --visualizer-cluster-color: dodgerblue;
}
.raksha {
  --visualizer-charm-color: forestgreen;
  --visualizer-cluster-color: yellowgreen;
}
.sidereal, .sidereal-martial-arts {
  --visualizer-charm-color: plum;
  --visualizer-cluster-color: mediumpurple;
}
.solar {
  --visualizer-charm-color: gold;
  --visualizer-cluster-color: goldenrod;
}
</style>
