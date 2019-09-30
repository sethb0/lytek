<template>
  <b-container fluid class="mb-3">
    <b-row no-gutters>
      <b-col md="3" xl="2">
        <b-img class="logo d-block mx-auto mb-3 mt-sm-3" :src="logo"
          alt="Sol Invictus"
        >
        </b-img>
      </b-col>
      <b-col>
        <b-jumbotron :header-level="headerLevel" :border-variant="variant" class="mx-3">
          <template #header>
            <slot name="header"><em class="brand-font">{{ header }}</em></slot>
          </template>
          <template #lead><slot name="default"></slot></template>
          <template #default>
            <slot name="additional"></slot>
            <template v-if="legalNotice">
              <div :class="`bg-${variant}`" class="fake-hr my-4 w-100"></div>
              <p class="legal-notice">
                Portions of the materials are the copyrights and trademarks of White Wolf
                Entertainment&nbsp;AB, and are used with permission. All rights reserved. For
                more information please visit
                <b-link href="https://www.white-wolf.com" no-prefetch>white-wolf.com</b-link>.
              </p>
              <b-link href="https://www.white-wolf.com/dark-pack" no-prefetch>
                <b-img class="dark-pack" :src="darkpack" alt="White Wolf Dark Pack logo">
                </b-img>
              </b-link>
            </template>
          </template>
        </b-jumbotron>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import darkpack from '@/toplevel/img/darkpack.jpg';
import logo from '@/toplevel/img/logo256.png';

export default {
  props: {
    header: {
      type: String,
      'default': 'Lytek',
    },
    headerLevel: {
      type: Number,
      'default': 3,
      validator (n) {
        return n >= 1 && n <= 4 && n === Math.floor(n);
      },
    },
    legalNotice: {
      type: Boolean,
      'default': false,
    },
    variant: {
      type: String,
      required: true,
    },
  },
  data () {
    return { darkpack, logo };
  },
};
</script>

<style scoped>
img.logo {
  max-width: auto;
  max-height: 14.5rem;
}
img.dark-pack {
  max-width: auto;
  max-height: 8rem;
}
</style>
