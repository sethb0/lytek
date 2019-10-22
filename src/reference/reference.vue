<script>
/* eslint-disable node/no-unpublished-import */
import Markdown from 'markdown-it';
import MarkdownDeflist from 'markdown-it-deflist';
import { mapState } from 'vuex';

import index from '@ven2/refcards/data/index.yml';
/* eslint-enable node/no-unpublished-import */

import MfLoading from '../toplevel/loading.vue';

const markdownProcessor = new Markdown({ breaks: false })
  .use(MarkdownDeflist);

export default {
  inject: ['toaster'],
  components: { MfLoading },
  data () {
    return { index, cards: [], loading: true };
  },
  computed: mapState('reference', ['currentTab']),
  watch: {
    currentTab () {
      this.loadCurrentTab();
    },
  },
  created () {
    this.loadCurrentTab();
  },
  methods: {
    selectTab (tab) {
      this.$store.commit('reference/currentTab', tab);
    },
    async loadCurrentTab () {
      try {
        this.loading = true;
        this.cards = [];
        const entry = index[this.currentTab].cards;
        const content = await Promise.all(
          entry.map((c) => import(
            /* webpackChunkName: "[request]", webpackPrefetch: true */
            `@ven2/refcards/data/${c}.md`
          ))
        );
        this.$nextTick(() => {
          this.loading = false;
          this.cards = content.map(({ 'default': markdown }, i) => ({
            name: entry[i],
            html: markdownProcessor.render(markdown),
          }));
        });
      } catch (err) {
        this.$nextTick(() => {
          this.loading = false;
          this.$bvToast.toast(err.message, {
            title: 'Failed to load reference cards',
            variant: 'danger',
            toaster: this.toaster,
          });
        });
      }
    },
  },
};
</script>

<template>
  <b-card no-body class="reference-container">
    <b-tabs card pills vertical>
      <b-tab v-for="(item, n) of index" :key="item.title" :title="item.title"
        :active="n === currentTab" @click="selectTab(n)"
      >
        <mf-loading v-if="loading"></mf-loading>
        <div v-else class="reference-columns">
          <b-card v-for="c of cards" :key="c.name" bg-variant="dark" text-variant="white"
            border-variant="info" class="reference-card"
          >
            <div v-html="c.html"></div>
          </b-card>
        </div>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<style>
.reference-columns {
  column-width: 25rem;
  column-gap: calc(4 * var(--spacer));
  column-fill: balance;
}

.reference-card {
  break-inside: avoid-column;
  margin-bottom: calc(4 * var(--spacer));
}

@media screen {
  .reference-container {
    height: var(--main-height);
    overflow-y: scroll;
  }

  .reference-container ul[role=tablist] {
    padding: calc(5 * var(--spacer));
  }
}

@media print {
  .reference-container ul[role=tablist] {
    display: none;
  }

  .reference-container, .reference-card {
    background-color: white;
    color: black;
  }
}
</style>
