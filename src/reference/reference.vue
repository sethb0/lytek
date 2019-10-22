<script>
/* eslint-disable node/no-unpublished-import */
import Markdown from 'markdown-it';
import MarkdownDeflist from 'markdown-it-deflist';
import { mapState } from 'vuex';
/* eslint-enable node/no-unpublished-import */

import MfLoading from '../toplevel/loading.vue';
import index from './data/index.yml';

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
            `./data/${c}.md`
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
        <div :class="{ 'reference-contents': !loading }">
          <mf-loading v-if="loading"></mf-loading>
          <template v-else>
            <b-card v-for="c of cards" :key="c.name" bg-variant="dark"
              border-variant="info" class="reference-card"
            >
              <div v-html="c.html"></div>
            </b-card>
          </template>
        </div>
      </b-tab>
    </b-tabs>
  </b-card>
</template>

<style>
.reference-contents {
  display: flex;
  flex-direction: column;
}

.reference-card {
  flex-basis: calc(100% - 4 * var(--spacer));
  margin: calc(2 * var(--spacer));
}

@media screen {
  .reference-container {
    height: var(--main-height);
    overflow-y: hidden;
  }

  .reference-container ul[role=tablist] {
    height: var(--main-height) !important;
  }

  .reference-contents {
    height: calc(var(--main-height) - 10 * var(--spacer));
    overflow-y: auto;
  }
}

@media screen and (min-width: 768px) {
  .reference-contents {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .reference-card {
    flex-basis: auto;
  }
}

@media print {
  .reference-container ul[role=tablist] {
    display: none;
  }

  .reference-card {
    page-break-inside: avoid;
  }
}
</style>
