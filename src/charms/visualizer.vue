<script>
/* eslint no-console: off */
import Viz from 'viz.js/viz.es';
import vizWorkerFile from 'viz.js/lite.render';
import { mapGetters, mapState } from 'vuex';

import { getTitle, makeGv } from '@/charms/make-gv';

export default {
  inject: ['toaster'],
  data () {
    return { renderedType: '', gv: '', svg: '' };
    // gvWorker and viz are deliberately not reactive properties
  },
  computed: {
    //  ...mapState('characters', ['selectedCharacter']),
    ...mapState('charms', ['charms', 'selectedGroup', 'selectedType', 'gvTopdown', 'gvPack']),
    ...mapGetters('charms', ['valid']),
  },
  watch: {
    charms () {
      this.render();
    },
    gvTopdown () {
      this.render();
    },
    gvPack () {
      this.render();
    },
  },
  created () {
    try {
      this.viz = new Viz({ workerURL: vizWorkerFile });
    } catch (err) {
      this.$bvToast.toast(err.message, {
        title: 'Unable to initialize Charm visualizer',
        variant: 'danger',
        toaster: this.toaster,
      });
    }
  },
  methods: {
    async render () {
      const type = this.selectedType;
      const group = this.selectedGroup;
      if (!type || !group) {
        return;
      }
      const when = Date.now();
      const title = getTitle(type, group);
      let g = group;
      if (/\s/u.test(g)) {
        g = g.replace(/\s+(\S?)/gu, (match, p1) => p1.toUpperCase());
      }
      let gv;
      try {
        gv = makeGv(this.charms, g, { title, topdown: this.gvTopdown, pack: this.gvPack });
      } catch (err) {
        this.$nextTick(() => {
          this.$bvToast.toast(err.message, {
            title: 'Visualization failed',
            variant: 'warning',
            toaster: this.toaster,
          });
        });
        return;
      }
      console.debug(`GV generation took ${Date.now() - when} ms`);
      if (process.env.NODE_ENV !== 'production') { // eslint-disable-line no-process-env
        this.gv = gv; // for debugging
      }
      const when2 = Date.now();
      let svgElement;
      try {
        svgElement = await this.viz.renderSVGElement(gv, { engine: 'dot' });
      } catch (err) {
        this.$nextTick(() => {
          this.$bvToast.toast(err.message, {
            title: 'Visualization failed',
            variant: 'warning',
            toaster: this.toaster,
          });
        });
        this.viz = new Viz({ workerURL: vizWorkerFile });
        return;
      }
      console.debug(`SVG generation took ${Date.now() - when2} ms`);
      this.$nextTick(() => {
        if (type !== this.selectedType || group !== this.selectedGroup) {
          console.info('user changed selection during rendering');
          return;
        }
        const svgHolder = this.$refs.svgHolder;
        if (!svgHolder) {
          console.warn('new SVG arrived with nowhere to put it!');
          return;
        }
        if (process.env.NODE_ENV !== 'production') { // eslint-disable-line no-process-env
          this.svg = svgElement.outerHTML; // for debugging
        }
        postprocess(svgElement, ::this.onSvgClick);
        if (svgHolder.childElementCount) {
          svgHolder.removeChild(svgHolder.firstElementChild);
        }
        svgHolder.appendChild(svgElement);
        this.renderedType = type;
        this.$emit('rendered', { type, group, title });
      });
    },
    async onSvgClick (evt) {
      evt.preventDefault();
      try {
        let element = evt.target;
        while (!element.id || element.id.startsWith('a_')) {
          element = element.parentElement;
        }
        this.$nextTick(() => {
          this.$emit('click', { id: element.id });
        });
      } catch (err) {
        console.error(err);
      }
    },
  },
};

function postprocess (svgElement, handler) {
  svgElement.getElementById('a_graph0').remove();
  for (const el of svgElement.querySelectorAll('title')) {
    el.remove();
  }
  for (const el of svgElement.querySelectorAll('[fill]')) {
    if (el.getAttribute('fill') !== 'none') {
      el.removeAttribute('fill');
    }
  }
  for (const el of svgElement.querySelectorAll('[stroke]')) {
    if (el.getAttribute('stroke') !== 'none') {
      el.removeAttribute('stroke');
    }
  }
  for (const el of svgElement.querySelectorAll('g.node a, g.cluster a')) {
    el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#');
    el.onclick = handler;
  }
}
</script>

<template>
  <div class="colorizer" :class="renderedType">
    <div ref="svgHolder" class="svg-holder"></div>
  </div>
</template>

<style>
@media screen {
  .colorizer {
    background-color: var(--visualizer-background-color);
  }
}

.colorizer .svg-holder {
  stroke-linecap: round;
}

.colorizer .svg-holder text {
  fill: var(--visualizer-edge-color);
}
.colorizer .svg-holder .edge *|path, .colorizer .svg-holder *|polygon,
  .colorizer .svg-holder *|ellipse {
  stroke: var(--visualizer-edge-color);
}
.colorizer .svg-holder .edge *|path, .colorizer .svg-holder .edge *|polygon {
  stroke-width: var(--visualizer-edge-width);
}
.colorizer .svg-holder .edge *|polygon {
  fill: var(--visualizer-edge-color);
}
.colorizer .svg-holder .node *|polygon, .colorizer .svg-holder .node *|ellipse {
  fill: var(--visualizer-charm-color);
}
.colorizer .svg-holder .cluster *|polygon {
  fill: var(--visualizer-cluster-color);
}
</style>
