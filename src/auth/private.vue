<script>
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSignIn } from '@fortawesome/pro-duotone-svg-icons/faSignIn';
import { faSignOut } from '@fortawesome/pro-duotone-svg-icons/faSignOut';
import { mapGetters } from 'vuex';

export default {
  components: { FaI },
  data: () => ({ faSignIn, faSignOut }),
  computed: mapGetters('auth', ['authenticated']),
};
</script>

<template>
  <b-card title="Authorized users only" variant="warning" class="mx-sm-5 mb-3">
    <b-card-text>
      You are attempting to access a page that is restricted to authorized users. Please
      <span v-if="authenticated">
        <b-link :to="{ name: 'logout' }">
          sign out <fa-i :icon="faSignOut" flip="horizontal"></fa-i>
        </b-link>
        and sign in again with an appropriately authorized account.
      </span>
      <span v-else>
        <b-link :to="{ name: 'login' }">
          sign in <fa-i :icon="faSignIn"></fa-i>
        </b-link>.
      </span>
    </b-card-text>
  </b-card>
</template>
