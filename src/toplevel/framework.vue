<script>
import darkpack from './img/darkpack.jpg';
import logo from './img/logo256.png';

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

<template>
  <div class="outer d-flex flex-wrap flex-md-nowrap justify-content-center">
    <div class="mx-auto mx-md-0">
      <b-img :src="logo" class="logo mx-sm-3 mb-3" alt="Sol Invictus">
      </b-img>
    </div>
    <div class="mx-auto mx-md-0">
      <b-jumbotron :header-level="headerLevel" :border-variant="variant" class="mx-sm-3">
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
              <b-link href="https://www.white-wolf.com">white-wolf.com</b-link>.
            </p>
            <b-link href="https://www.white-wolf.com/dark-pack">
              <b-img :src="darkpack" class="dark-pack" alt="White Wolf Dark Pack logo">
              </b-img>
            </b-link>
          </template>
        </template>
      </b-jumbotron>
    </div>
  </div>
</template>

<style scoped>
.jumbotron {
  max-width: 35rem;
}

img.logo {
  height: auto;
  width: 14.5rem;
}

img.dark-pack {
  max-height: 8rem;
  max-width: auto;
}
</style>
