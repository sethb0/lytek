<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<template>
  <div class="titlebar"><h5 class="brand-font">{{ title }}</h5></div>
</template>

<style scoped>
.titlebar {
  height: var(--toolbar-height);
  padding-top: calc(2.5 * var(--spacer));
  text-align: center;
}

@media screen {
  .titlebar {
    background-color: var(--dark);
  }
}
</style>
