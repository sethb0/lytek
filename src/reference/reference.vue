<script>
/* eslint-disable node/no-unpublished-import */
import { mapState } from 'vuex';

import index from '@ven2/refcards/data/index.yml';
/* eslint-enable node/no-unpublished-import */

import MfLoading from '../shared/loading.vue';
import MfMarkdown from './markdown.vue';

export default {
  inject: ['toaster'],
  components: { MfLoading, MfMarkdown },
  data () {
    return { index, cards: [], loading: true };
  },
  computed: {
    ...mapState('reference', ['currentTab']),
  },
  watch: {
    currentTab () {
      this.loadCurrentTab();
    },
  },
  created () {
    this.loadCurrentTab();
  },
  methods: {
    toc (card) {
      const header = /^\s*#\s+(\S[^\n]*)$/mu.exec(card.markdown);
      return header ? header[1].trim() : card.name;
    },
    selectTab (tab) {
      this.$store.commit('reference/currentTab', tab);
    },
    async loadCurrentTab () {
      try {
        this.loading = true;
        this.cards = [];
        const entry = index[this.currentTab].cards;
        const content = await Promise.all(
          entry.map((c) => import(/* webpackMode: "eager" */ `@ven2/refcards/data/${c}.md`))
        );
        this.$nextTick(() => {
          this.loading = false;
          this.cards = content.map(({ 'default': markdown }, i) => ({
            name: entry[i].replace(/\W+/gu, '-'),
            markdown,
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
          <b-card v-if="cards.length" no-body bg-variant="dark" border-variant="success"
            class="reference-toc"
          >
            <b-list-group flush>
              <b-list-group-item v-for="c of cards" :key="c.name" :href="`#${c.name}`">
                {{ toc(c) }}
              </b-list-group-item>
            </b-list-group>
          </b-card>
          <b-card v-for="c of cards" :key="c.name" bg-variant="dark"
            border-variant="info" class="reference-card"
          >
            <mf-markdown :id="c.name" :markdown="c.markdown"></mf-markdown>
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

.reference-card, .reference-toc {
  break-inside: avoid-column;
  margin-bottom: calc(4 * var(--spacer));
}

.reference-card th, .reference-card td {
  padding: calc(0.3 * var(--spacer)) calc(3 * var(--spacer)) calc(0.3 * var(--spacer)) 0px;
}

.reference-card hr {
  border-color: var(--info);
}

.reference-toc hr {
  border-color: var(--success);
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
