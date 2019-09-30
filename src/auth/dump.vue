<template>
  <b-card class="narrow mx-auto mb-3" header="Current User Info" header-tag="h1"
    header-class="brand-font" border-variant="info"
  >
    <b-card-text>
      <ul>
        <li>capabilities: <code>[{{ capabilities.join(' ') }}]</code></li>
        <li>displayName: <code>"{{ displayName }}"</code></li>
        <li>email: <code>"{{ email }}"</code></li>
        <li>name: <code>"{{ name }}"</code></li>
        <li>pictureUrl: <code>"{{ pictureUrl }}"</code></li>
        <li>sub: <code>"{{ sub }}"</code></li>
      </ul>
      <div class="fake-hr bg-info my-3"></div>
      <ul>
        <li>authenticated: <code>{{ authenticated }}</code></li>
        <li>authorized: <code>{{ authorized }}</code></li>
        <li>friendlyName: <code>"{{ friendlyName }}"</code></li>
        <li>isAdmin: <code>{{ isAdmin }}</code></li>
        <li>isGm: <code>{{ isGm }}</code></li>
        <li>isUser: <code>{{ isUser }}</code></li>
      </ul>
    </b-card-text>
  </b-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex/dist/vuex.esm';

export default {
  computed: {
    ...mapState('auth', ['capabilities', 'displayName', 'email', 'name', 'pictureUrl', 'sub']),
    ...mapGetters('auth', [
      'authenticated', 'authorized', 'friendlyName', 'isAdmin', 'isGm', 'isUser',
    ]),
  },
};
</script>

<style scoped>
.narrow { max-width: var(--breakpoint-sm); }
</style>
