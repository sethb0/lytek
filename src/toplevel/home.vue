<template>
  <mf-framework header="Welcome to Lytek!" :header-level="4" variant="success">
    <template v-if="authenticated">
      <p>
        Hello, {{ friendlyName }}! You are
        <span v-if="isAdmin">
          an Administrator. The Great Maker Himself would be jealous of your power!
        </span>
        <span v-else-if="isGm">
          a Game Master. The Princes of the Earth quiver in fear of your Viking hat!
        </span>
        <span v-else-if="isUser">an approved user. Game on!</span>
        <span v-else>a restricted user. Sad!</span>
      </p>
    </template>
    <template v-else>
      <p>
        This website is for authorized users only. Please
        <b-link :to="{ name: 'login' }">sign in&nbsp;<fa-i :icon="faSignIn"></fa-i></b-link>
        or contact the website administrator to register an account.
      </p>
    </template>
    <template v-if="authenticated" #additional>
      <p>
        The navbar above displays links to all of the features of this website
        <span v-if="isAdmin">(including the scary ones).</span>
        <span v-else>that you are authorized to use.</span>
      </p>
    </template>
    <template v-else #additional>
      <p>
        If you don't already know who the website administrator is and how to contact them,
        you have no business here. Shoo.
      </p>
    </template>
  </mf-framework>
</template>

<script>
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSignIn } from '@fortawesome/pro-duotone-svg-icons';
import { mapGetters } from 'vuex';

import MfFramework from '@/toplevel/framework.vue';

export default {
  components: { FaI, MfFramework },
  data: () => ({ faSignIn }),
  computed: mapGetters('auth', [
    'authenticated',
    'friendlyName',
    'isAdmin',
    'isGm',
    'isUser',
  ]),
};
</script>
