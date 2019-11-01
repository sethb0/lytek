<script>
/* eslint-disable node/no-unpublished-import */
import { mapState } from 'vuex';

import rawIndex from '@ven2/refcards/data/index.yml';
/* eslint-enable node/no-unpublished-import */

import MfLoading from '../shared/loading.vue';
import MfMarkdown from './markdown.vue';

export default {
  inject: ['toaster'],
  components: { MfLoading, MfMarkdown },
  data () {
    return { cards: [], loading: true };
  },
  computed: {
    ...mapState('reference', ['currentTab']),
    ...mapState('auth', ['capabilities']),
    index () {
      return rawIndex.filter(
        (record) => !record.privilege || this.capabilities.includes(record.privilege),
      );
    },
  },
  watch: {
    currentTab () {
      this.loadCurrentTab();
    },
    index (nuValue) {
      if (this.currentTab >= nuValue.length) {
        this.$store.commit('reference/currentTab', nuValue.length - 1);
      }
      this.loadCurrentTab();
    },
  },
  created () {
    this.loadCurrentTab();
  },
  methods: {
    toc (card) {
      const header = /^#\s+(\S[^\n]*)$/mu.exec(card.markdown);
      return header ? header[1].trim() : card.name;
    },
    selectTab (tab) {
      this.$store.commit('reference/currentTab', tab);
    },
    async loadCurrentTab () {
      if (this.currentTab >= this.index.length) {
        console.warn('currentTab out of range, not loading'); // eslint-disable-line no-console
        return false;
      }
      try {
        this.loading = true;
        this.cards = [];
        const cardNames = this.index[this.currentTab].cards;
        const content = await Promise.all(
          cardNames.map(
            (name) => import(/* webpackMode: "eager" */ `@ven2/refcards/data/${name}.md`),
          ),
        );
        this.$nextTick(() => {
          this.loading = false;
          this.cards = content.map(({ 'default': markdown }, i) => ({
            name: cardNames[i].replace(/\W+/gu, '-'),
            markdown,
          }));
        });
        return true;
      } catch (err) {
        this.$nextTick(() => {
          this.loading = false;
          this.$bvToast.toast(err.message, {
            title: 'Failed to load reference cards',
            variant: 'danger',
            toaster: this.toaster,
          });
        });
        console.error(err); // eslint-disable-line no-console
        return false;
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
          <b-card v-for="c of cards" :key="c.name" bg-variant="dark" border-variant="info"
            class="reference-card"
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
  vertical-align: top;
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
