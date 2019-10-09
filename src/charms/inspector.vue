<script>
import Markdown from 'markdown-it';
import MarkdownDeflist from 'markdown-it-deflist';
import { mapState } from 'vuex';

const CHARM_ID_REGEXP = /^([^\s.]+\.[^\s.]+)(?:\.(\S+))?$/u;

const markdownProcessor = new Markdown({ breaks: true })
  .use(MarkdownDeflist);

export default {
  props: {
    id: {
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
    id () {
      this.updateMarkdown();
    },
    charms () {
      this.updateMarkdown();
    },
  },
  methods: {
    updateMarkdown () {
      if (this.id && this.charms.length) {
        const [, id, v] = CHARM_ID_REGEXP.exec(this.id);
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

function formatDescription (charm, variant, group) {
  let name = charm.name;
  if (variant?.name) {
    if (name.includes('{')) {
      name = name.replace(/\{.*\}/u, variant.name);
    } else {
      name = `${name}: ${variant.name}`;
    }
  }
  let description = reformatLineBreaks(charm.description);
  if (variant?.description) {
    description = `${description}
### ${variant.name}
${reformatLineBreaks(variant.description)}`;
  }
  const p = charm.prerequisites;
  const minEssence = Math.max(p?.essence || 0, variant?.prerequisites?.essence || 0);
  const minTraits = { ...p?.traits || {}, ...variant?.prerequisites?.traits || {} };
  const minima = [];
  for (const [k, v] of Object.entries(minTraits)) {
    minima.push(`${k === '_' ? group : k} ${v}`);
  }
  if (minEssence) {
    minima.push(`Essence ${minEssence}`);
  }
  let details = [];
  if (charm.type !== 'knack') {
    const keywords = Object.entries(charm.keywords || {}).map(([k, v]) => {
      if (v === true) {
        return k;
      }
      return `${k} ${v}`;
    });
    if (charm.martial) {
      keywords.push(`Martial (${Object.keys(charm.martial).sort().join(', ')})`);
    }
    if (charm['martial-ready']) {
      keywords.push('Martial-Ready');
    }
    if (charm.virtue) {
      const keys = Object.keys(charm.virtue);
      keys.sort();
      keywords.push(...keys.map((v) => `Virtue (${v})`));
    }
    keywords.sort();
    details = [
      `\n**Keywords:** ${keywords.length ? keywords.join(', ') : '\u2014'}`,
      `\n**Cost:** ${charm.cost || '\u2014'}`,
      `\n**Action:** ${charm.action}`,
    ];
    if (charm.duration) {
      details.push(`\n**Duration:** ${charm.duration}`);
    }
  }
  return `## ${name}
**Minima:** ${minima.length ? minima.join(', ') : '(see below)'}${details.join('')}

${description}`;
}

function reformatLineBreaks (description) {
  description = (description || '')
    .replace(/\n([^-|])/gu, '\n\n$1')
    .replace(/(\n- [^\n]+)\n\n([^-])/gu, '$1\n$2')
    .replace(/\n+$/u, '');
  return description;
}
</script>

<template>
  <div class="inspector-body">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="markdown-body px-4 py-3" v-html="html"></div>
  </div>
</template>

<style scoped>
@media screen {
  .inspector-body {
    background-color: var(--inspector-background-color);
    min-width: 20rem;
  }

  .markdown-body {
    color: var(--inspector-text-color);
    overflow-y: scroll;
    overscroll-behavior: contain;
  }
}

.inspector-body {
  max-width: 40rem;
}

.markdown-body {
  font-size: var(--inspector-font-size);
}
</style>
