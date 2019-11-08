<script>
/* eslint-disable node/no-unpublished-import */
import { FontAwesomeIcon as FaI } from '@fortawesome/vue-fontawesome';
import { faSignIn } from '@fortawesome/pro-duotone-svg-icons';
import { mapGetters } from 'vuex';
/* eslint-ensable node/no-unpublished-import */

import MfFramework from './framework.vue';

export default {
  components: { FaI, MfFramework },
  data: () => ({ faSignIn }),
  computed: mapGetters('auth', [
    'authenticated',
    'authorized',
    'friendlyName',
    'isAdmin',
    'isGm',
    'isUser',
  ]),
};
</script>

<template>
  <mf-framework :header-level="4" header="Welcome to Lytek!" variant="success">
    <template v-if="authorized">
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
        <span v-if="authenticated">
          contact the website administrator for account approval.
        </span>
        <b-link v-else :to="{ name: 'login' }">sign in. <fa-i :icon="faSignIn"></fa-i></b-link>
      </p>
    </template>
    <template v-if="authorized" #additional>
      <p>
        The navbar above displays links to all of the features of this website
        <span v-if="isAdmin">(including the scary ones).</span>
        <span v-else>that you are authorized to use.</span>
        If it looks a little spartan, it's because
        <span v-if="isUser">not all planned features have been implemented yet.</span>
        <span v-else>you're on restrictions. (Did I mention sad?)</span>
      </p>
    </template>
    <template v-else-if="authenticated" #additional>
      <p>
        If you don't already know who the website administrator is and how to contact them,
        you have no business here. Shoo.
      </p>
    </template>
  </mf-framework>
</template>
