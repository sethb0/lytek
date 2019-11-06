<script>
/* eslint-disable node/no-unpublished-import */
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSyncAlt } from '@fortawesome/pro-duotone-svg-icons/faSyncAlt';
/* eslint-enable node/no-unpublished-import */

export default {
  inject: ['authService', 'toaster'],
  components: { FaI },
  props: {
    serviceName: {
      type: String,
      required: true,
    },
    serviceConstructor: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      canInitialize: true,
      initializing: true,
      initialized: false,
      faReload: faSyncAlt,
    };
  },
  created () {
    this.initService();
  },
  methods: {
    async initService () {
      if (this.initialized || !this.canInitialize) {
        return;
      }
      this.initializing = true;
      if (this.authService) {
        try {
          // eslint-disable-next-line babel/new-cap
          const service = new this.serviceConstructor(::this.authService.getAccessToken);
          this.$emit('initialized', service);
          this.initialized = true;
          this.initializing = false;
        } catch (err) {
          this.$nextTick(() => {
            this.initializing = false;
            this.$bvToast.toast(err.message, {
              title: `Failed to initialize ${this.serviceName} service`,
              variant: 'danger',
              toaster: this.toaster,
            });
          });
        }
      } else {
        this.canInitialize = false;
        this.initializing = false;
      }
    },
  },
};
</script>

<template>
  <div>
    <slot v-if="initialized"></slot>
    <b-card v-else-if="canInitialize" :title="`The ${serviceName} service failed to start.`"
      text-variant="white" bg-variant="warning" class="message-card mx-auto"
    >
      <b-button @click="initService" size="lg" variant="primary">
        <fa-i :icon="faReload" class="mr-2"></fa-i>
        Try again?
      </b-button>
    </b-card>
    <b-card v-else title="The authentication service failed to start."
      text-variant="white" bg-variant="danger" class="message-card mx-auto"
    >
      Final death. Oblivion. I suggest you contact the administrator.
    </b-card>
  </div>
</template>

<style scoped>
.message-card {
  width: var(--breakpoint-sm);
}
</style>
