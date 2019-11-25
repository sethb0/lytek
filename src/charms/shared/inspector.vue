<script>
/* eslint-disable node/no-unpublished-import */
import Markdown from 'markdown-it';
import MarkdownAbbr from 'markdown-it-abbr';
import MarkdownDeflist from 'markdown-it-deflist';
import MarkdownSubscript from 'markdown-it-sub';
import MarkdownSuperscript from 'markdown-it-sup';
import { mapState } from 'vuex';
/* eslint-enable node/no-unpublished-import */

import { formatDescription, getVariantName, spliceVariant } from './make-md';

// Can't combine markdown processor for inspector with markdown processor for reference cards
// because they have different breaks settings.
const markdownProcessor = new Markdown({ breaks: true })
  .use(MarkdownAbbr)
  .use(MarkdownDeflist)
  .use(MarkdownSubscript)
  .use(MarkdownSuperscript);

// eslint-disable-next-line unicorn/no-unsafe-regex
const CHARM_ID_REGEXP = /^([^\s.]+\.[^\s.]+)(?:\.(\S+))?$/u;

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
            formatDescription(charm, { variant, group: this.charmGroup, dict: this.idDict }),
          );
        }
      }
    },
  },
};
</script>

<template>
  <div class="inspector-body">
    <div class="inspector-hstrut"></div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="inspector-markdown" v-html="html"></div>
  </div>
</template>

<style>
.inspector-body {
  font-size: 1.1rem;
  min-width: var(--inspector-min-width);
  max-width: var(--inspector-max-width);
}

.inspector-markdown {
  padding: calc(3 * var(--spacer)) calc(4 * var(--spacer));
}

.inspector-markdown th, .inspector-markdown td {
  padding: calc(0.3 * var(--spacer)) calc(3 * var(--spacer)) calc(0.3 * var(--spacer)) 0px;
  vertical-align: top;
}

@media screen {
  .inspector-body {
    background-color: var(--inspector-background-color);
    color: var(--inspector-text-color);
  }
}

@media screen and (min-width: 768px) {
  .inspector-hstrut {
    width: var(--inspector-min-width);
  }
}
</style>
