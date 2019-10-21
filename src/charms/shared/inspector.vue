<script>
/* eslint-disable node/no-unpublished-import */
import Markdown from 'markdown-it';
import MarkdownDeflist from 'markdown-it-deflist';
import { mapState } from 'vuex';
/* eslint-enable node/no-unpublished-import */

import { formatDescription, getVariantName, spliceVariant } from './make-md';

// eslint-disable-next-line unicorn/no-unsafe-regex
const CHARM_ID_REGEXP = /^([^\s.]+\.[^\s.]+)(?:\.(\S+))?$/u;

const markdownProcessor = new Markdown({ breaks: true })
  .use(MarkdownDeflist);

export default {
  props: {
    charmId: {
      type: String,
      'default': '',
      validator: (x) => !x || CHARM_ID_REGEXP.test(x),
    },
  },
  data () {
    return { html: '' };
  },
  computed: {
    ...mapState('charms', ['charms']),
    charmGroup () {
      return this.defaultCharm?.group || '';
    },
    defaultCharm () {
      return this.charms.find((x) => x.type !== 'generic' && x.type !== 'proxy');
    },
    idDict () {
      const d = Object.fromEntries(this.charms.flatMap((charm) => {
        const values = [[charm.id, charm.name]];
        if (charm.type === 'generic') {
          values.push([
            spliceVariant(charm.id, this.charmGroup),
            charm.name,
          ]);
        }
        values.push(...(charm.variants || []).map((variant) => [
          spliceVariant(charm.id, variant.id),
          getVariantName(charm.name, variant.name || variant.id),
        ]));
        return values;
      }));
      return d;
    },
  },
  watch: {
    charmId () {
      this.updateMarkdown();
    },
    charms () {
      this.updateMarkdown();
    },
  },
  methods: {
    updateMarkdown () {
      if (this.charmId && this.charms.length) {
        const [, id, v] = CHARM_ID_REGEXP.exec(this.charmId);
        const charm = this.charms.find((x) => x.id === id);
        if (charm && charm.type !== 'proxy') {
          const variant = v && charm.variants?.find((x) => x.id === v);
          this.html = markdownProcessor.render(
            formatDescription(charm, { variant, group: this.charmGroup, dict: this.idDict })
          );
        }
      }
    },
  },
};
</script>

<template>
  <div class="body">
    <div class="hstrut"></div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="html" class="markdown"></div>
  </div>
</template>

<style scoped>
.body {
  font-size: 1.1rem;
  min-width: var(--inspector-min-width);
  max-width: var(--inspector-max-width);
}

.markdown {
  padding: calc(3 * var(--spacer)) calc(4 * var(--spacer));
}

@media screen {
  .body {
    background-color: var(--inspector-background-color);
    color: var(--inspector-text-color);
  }
}

@media screen and (min-width: 768px) {
  .hstrut {
    width: var(--inspector-min-width);
  }
}
</style>
