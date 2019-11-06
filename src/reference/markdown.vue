<script>
/* eslint no-console: off, node/no-unpublished-import: off */
import Markdown from 'markdown-it';
import MarkdownAbbr from 'markdown-it-abbr';
import MarkdownDeflist from 'markdown-it-deflist';
import MarkdownSubscript from 'markdown-it-sub';
import MarkdownSuperscript from 'markdown-it-sup';
/* eslint-enable node/no-unpublished-import */

// Can't combine markdown processor for inspector with markdown processor for reference cards
// because they have different breaks settings.
const markdownProcessor = new Markdown({ breaks: true })
  .use(MarkdownAbbr)
  .use(MarkdownDeflist)
  .use(MarkdownSubscript)
  .use(MarkdownSuperscript);

export default {
  props: {
    markdown: {
      type: String,
      required: true,
    },
    nodeId: {
      type: String,
      'default': '',
    },
  },
  watch: {
    markdown () {
      this.processMarkdown().catch(console.error);
    },
  },
  created () {
    this.$nextTick(() => this.processMarkdown().catch(console.error));
  },
  methods: {
    async processMarkdown () {
      const html = markdownProcessor.render(this.markdown);
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.tagName === 'A') {
          const href = node.getAttribute('href');
          if (href) {
            const { 'default': asset }
              = await import(/* webpackMode: "eager" */ `./assets/${href}`);
            node.setAttribute('href', asset);
            node.setAttribute('download', href.replace(/^.*\//u, ''));
          }
        }
      }
      const node = this.$refs.content;
      if (!node) {
        console.warn('content container node not found in markdown.vue#processMarkdown');
        return;
      }
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
      const b = doc.body;
      while (b.firstChild) {
        node.append(b.firstChild);
      }
      if (this.nodeId) {
        const target = node.firstChild;
        target.setAttribute('id', this.nodeId);
        target.classList.add('markdown-clickable');
        target.innerHTML
          = `<span class="markdown-clickable-affordance">${target.innerHTML}</span>`;
        target.addEventListener('click', (evt) => {
          evt.preventDefault();
          this.$emit('click');
        });
      }
    },
  },
};
</script>

<template>
  <div ref="content"></div>
</template>

<style>
.markdown-clickable {
  cursor: pointer;
}

.markdown-clickable-affordance::after {
  content: '\2002\25B5';
  font-size: 1.4rem;
}
</style>
