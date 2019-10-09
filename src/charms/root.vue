<script>
import { mapState } from 'vuex';

import { CharmsService, MissingDataError } from '@/charms/service';
import MfLoading from '@/toplevel/loading.vue';

export default {
  inject: ['getAccessToken', 'toaster'],
  components: { MfLoading },
  data () {
    return { service: new CharmsService(this.getAccessToken) };
  },
  computed: mapState('charms', [
    'initialized', 'types', 'groups', 'charms', 'selectedType', 'selectedGroup',
  ]),
  watch: {
    types () {
      if (this.selectedType && this.types.includes(this.selectedType)) {
        this.loadGroups(this.selectedType);
      } else {
        this.$store.dispatch('charms/setGroups', null);
      }
    },
    groups () {
      if (
        this.selectedType && this.types.includes(this.selectedType)
        && this.selectedGroup && this.groups.includes(this.selectedGroup)
      ) {
        this.loadCharms(this.selectedType, this.selectedGroup);
      } else {
        this.$store.dispatch('charms/setCharms', null);
      }
    },
    charms () {
      this.$store.dispatch('charms/setSelectedCharm', null);
    },
    selectedType () {
      if (this.selectedType && this.types.includes(this.selectedType)) {
        this.loadGroups(this.selectedType);
      } else {
        this.$store.dispatch('charms/setGroups', null);
      }
    },
    selectedGroup () {
      if (
        this.selectedType && this.types.includes(this.selectedType)
        && this.selectedGroup && this.groups.includes(this.selectedGroup)
      ) {
        this.loadCharms(this.selectedType, this.selectedGroup);
      } else {
        this.$store.dispatch('charms/setCharms', null);
      }
    },
  },
  async created () {
    if (!this.initialized) {
      try {
        await this.loadTypes();
      } finally {
        this.$store.dispatch('charms/setInitialized', true);
      }
    }
  },
  methods: {
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
    async reload () {
      this.service.invalidateCache();
      await this.loadTypes();
      await Promise.all([
        this.$store.dispatch('charms/setGroups', null),
        this.$store.dispatch('charms/setCharms', null),
      ]);
    },
  },
  provide () {
    return { reload: ::this.reload };
  },
};
</script>

<template>
  <div>
    <router-view v-if="initialized"></router-view>
    <mf-loading v-else></mf-loading>
  </div>
</template>
