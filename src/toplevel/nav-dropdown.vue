<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    newRoute: {
      type: String,
      required: true,
    },
    disableNew: {
      type: Boolean,
      'default': false,
    },
    listRoute: {
      type: String,
      required: true,
    },
    detailRoute: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    field: {
      type: String,
      'default': 'name',
    },
  },
};
</script>

<template>
  <b-nav-item-dropdown :text="text">
    <b-dropdown-item v-if="!disableNew" :to="{ name: newRoute }">New…</b-dropdown-item>
    <b-dropdown-item :to="{ name: listRoute }">List All</b-dropdown-item>
    <b-dropdown-divider v-if="items.length"></b-dropdown-divider>
    <b-dropdown-item v-for="x of items" :key="x.id"
      :to="{ name: detailRoute, params: { id: x.id } }"
    >
      {{ x[field] }}
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>
