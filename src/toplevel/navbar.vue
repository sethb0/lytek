<script>
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSignIn } from '@fortawesome/pro-duotone-svg-icons/faSignIn';
import { faSignOut } from '@fortawesome/pro-duotone-svg-icons/faSignOut';
import { faExclamationCircle } from '@fortawesome/pro-regular-svg-icons/faExclamationCircle';
import { mapGetters, mapState } from 'vuex';

export default {
  components: { FaI },
  data () {
    return {
      faSignIn,
      faSignOut,
      faAdmin: faExclamationCircle,
    };
  },
  computed: {
    ...mapState('auth', ['pictureUrl']),
    ...mapGetters('auth', [
      'authenticated',
      // 'authorized',
      'friendlyName',
      'isAdmin',
      // 'isGm',
      'isUser',
    ]),
  },
  methods: {
    disableAdmin () {
      this.$store.dispatch('auth/setDisableAdmin', true);
    },
  },
};
</script>

<template>
  <b-navbar fixed="top" toggleable="md" variant="secondary" type="dark" class="d-print-none">
    <b-navbar-brand :to="{ name: 'home' }" exact class="brand-font">
      Lytek
    </b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav v-if="isUser">
        <b-nav-item-dropdown text="Charms" class="ml-md-3 pb-1">
          <b-dropdown-item :to="{ name: 'charmBrowser' }">Browse</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'charmTrees' }">Tree View</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <b-navbar-nav class="ml-md-auto">
        <template v-if="authenticated">
          <b-nav-item>
            <!-- :to="{ name: 'profile' }" -->
            <span aria-hidden>
              <b-img v-if="pictureUrl" :src="pictureUrl" rounded class="userpic mr-2"></b-img>
              {{ friendlyName }}
            </span>
            <span class="sr-only">User Profile</span>
          </b-nav-item>
          <b-nav-item v-if="isAdmin" class="mx-md-2" @click="disableAdmin">
            <fa-i v-b-tooltip :icon="faAdmin" size="lg" title="Disable administrative controls"
              class="text-warning mr-2"
            ></fa-i>
          </b-nav-item>
          <b-nav-item :to="{ name: 'logout' }" class="ml-md-2">
            Sign Out
            <fa-i :icon="faSignOut" flip="horizontal" class="ml-1"></fa-i>
          </b-nav-item>
        </template>

        <b-nav-item v-else :to="{ name: 'login' }">
          Sign In
          <fa-i :icon="faSignIn" class="ml-1"></fa-i>
        </b-nav-item>

        <b-nav-item :to="{ name: 'about' }" class="ml-md-4">
          About
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<style scoped>
.userpic {
  max-width: 1.5rem;
  max-height: 1.5rem;
}
</style>
