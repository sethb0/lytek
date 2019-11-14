<script>
/* eslint-disable node/no-unpublished-import */
import spexLib from 'spex';
import { mapState } from 'vuex';
/* eslint-enable node/no-unpublished-import */

import { ReferenceService } from './service';
import MfLoading from '../shared/loading.vue';
import MfMarkdown from './markdown.vue';
import MfServiceLoader from '../shared/service-loader.vue';

const spex = spexLib(Promise);

export default {
  components: { MfLoading, MfMarkdown, MfServiceLoader },
  data () {
    return {
      ReferenceService,
      index: [],
      cards: [],
      initializing: true,
      loading: true,
    };
    // service is deliberately not a reactive property.
  },
  computed: mapState('reference', ['currentTab']),
  watch: {
    currentTab () {
      this.loadCurrentTab();
    },
    index (nuValue) {
      if (this.currentTab >= nuValue.length) {
        this.selectTab(nuValue.length - 1);
      }
      this.loadCurrentTab();
    },
  },
  methods: {
    toc (card) {
      const header = /^#\s+(\S[^\n]*)$/mu.exec(card.text);
      return header ? header[1].trim() : card.id;
    },
    selectTab (tab) {
      this.$store.commit('reference/currentTab', tab);
    },
    scrollTo (id) {
      document.querySelector(`.active #${id}`).scrollIntoView();
    },
    scrollToToc () {
      document.querySelector('.tab-content').scrollIntoView();
    },
    async serviceInitialized (service) {
      this.service = service;
      let index;
      try {
        index = await service.getTabTitles();
      } catch (err) {
        this.$nextTick(() => {
          this.loading = false;
          this.$bvToast.toast(err.message, {
            title: 'Failed to load reference tab titles',
            variant: 'danger',
            toaster: this.toaster,
          });
        });
        console.error(err); // eslint-disable-line no-console
        return false;
      }
      this.$nextTick(() => {
        this.index = index;
        this.initializing = false;
      });
      return true;
    },
    async loadCurrentTab () {
      if (!this.service) {
        // eslint-disable-next-line no-console
        console.error('cannot load reference tab before service is initialized');
        return false;
      }
      if (this.currentTab < 0 || this.currentTab >= this.index.length) {
        // eslint-disable-next-line no-console
        console.warn('currentTab out of range, not loading');
        return false;
      }
      try {
        this.loading = true;
        this.cards = [];
        const ids = await this.service.getTabContents(this.index[this.currentTab]);
        this.cards = Object.entries(
          await spex.batch(ids.map((id) => this.service.getCardText(id))),
        )
          .map(([n, text]) => ({ id: ids[n].replace(/[:/]/gu, '_'), text }));
        this.$nextTick(() => {
          this.loading = false;
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
  <mf-service-loader service-name="reference" :service-constructor="ReferenceService"
    @initialized="serviceInitialized"
  >
    <b-card no-body class="reference-container">
      <mf-loading v-if="initializing"></mf-loading>
      <b-tabs v-else card pills vertical>
        <b-tab v-for="(item, n) of index" :key="item" :title="item"
          :active="n === currentTab" @click="selectTab(n)"
        >
          <mf-loading v-if="loading"></mf-loading>
          <div v-else class="reference-columns">
            <b-card v-if="cards.length" no-body bg-variant="dark" border-variant="success"
              class="reference-toc"
            >
              <b-list-group flush>
                <b-list-group-item v-for="c of cards" :id="`linkto__${c.id}`" :key="c.id"
                  @click="scrollTo(c.id)"
                >
                  {{ toc(c) }}
                </b-list-group-item>
              </b-list-group>
            </b-card>
            <b-card v-for="c of cards" :key="c.id" bg-variant="dark" border-variant="info"
              class="reference-card"
            >
              <mf-markdown :markdown="c.text" :node-id="c.id" @click="scrollToToc(c.id)">
              </mf-markdown>
            </b-card>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
  </mf-service-loader>
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

.reference-card-markdown-title {
  cursor: pointer;
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

  .reference-container, .reference-columns, .reference-card, .reference-toc {
    background-color: white;
    color: black;
  }
}
</style>
