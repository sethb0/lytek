<script>
import Markdown from 'markdown-it';
import MarkdownDeflist from 'markdown-it-deflist';
import { mapState } from 'vuex';

import { formatDescription } from '@/charms/make-md';

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
            formatDescription(charm, variant, this.charmGroup)
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
    <div class="markdown" v-html="html"></div>
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
