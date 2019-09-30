<template>
  <b-navbar fixed="top" toggleable="md" variant="secondary" type="dark">
    <b-navbar-brand :to="{ name: 'home' }" exact class="brand-font">Lytek</b-navbar-brand>
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    <b-collapse id="nav-collapse" is-nav>
      <!--
      <b-navbar-nav v-if="isUser">
        <mf-nav-dropdown text="Chronicles" new-route="newChronicle" list-route="chronicleList"
          detail-route="chronicleDetail" :items="recentChronicles" :disable-new="!isGm"
        ></mf-nav-dropdown>
        <mf-nav-dropdown text="Characters" new-route="newCharacter" list-route="characterList"
          detail-route="characterDetail" :items="recentCharacters"
        ></mf-nav-dropdown>
        <b-nav-item v-if="isGm" :to="{ name: 'userList' }" class="ml-3">Users</b-nav-item>
      </b-navbar-nav>
      -->

      <b-navbar-nav class="ml-md-auto">
        <template v-if="authenticated">
          <b-nav-item :to="{ name: 'profile' }">
            {{ friendlyName }}
            <span class="sr-only">User Profile</span>
          </b-nav-item>
          <b-nav-item v-if="isAdmin" :to="{ name: 'admin' }" class="ml-md-2">
            <fa-i :icon="faExclamationCircle"></fa-i>
            <span class="sr-only">Administrative Dashboard</span>
          </b-nav-item>
          <b-nav-item :to="{ name: 'logout' }" class="ml-md-3">
            Sign Out
            <fa-i :icon="faSignOut" flip="horizontal" class="ml-1"></fa-i>
          </b-nav-item>
        </template>

        <template v-else>
          <b-nav-text class="mr-md-3">You are not signed in.</b-nav-text>
          <b-nav-item :to="{ name: 'login', query: { next: $route.fullPath } }">
            Sign In
            <fa-i :icon="faSignIn" class="ml-1"></fa-i>
          </b-nav-item>
        </template>

        <b-nav-item :to="{ name: 'about' }" class="ml-md-4">About</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSignIn } from '@fortawesome/pro-duotone-svg-icons/faSignIn';
import { faSignOut } from '@fortawesome/pro-duotone-svg-icons/faSignOut';
import { faExclamationCircle } from '@fortawesome/pro-duotone-svg-icons/faExclamationCircle';
import { mapGetters } from 'vuex';

// import MfNavDropdown from '@/toplevel/nav-dropdown.vue';

export default {
  components: { FaI /* , MfNavDropdown */ },
  data () {
    return {
      faSignIn,
      faSignOut,
      faExclamationCircle,
      recentCharacters: [],
      recentChronicles: [],
    };
  },
  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'friendlyName',
      'isAdmin',
      'isGm',
      'isUser',
    ]),
  },
};
</script>

<style scoped>
.middle {
  vertical-align: middle;
}
.navbar-spinner {
  color: white;
  height: 200%;
}
.user-picture {
  max-width: 32px;
  max-height: 32px;
}
</style>
