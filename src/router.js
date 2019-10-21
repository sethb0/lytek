/* eslint-disable node/no-unpublished-import */
import Vue from 'vue';
import Router from 'vue-router';
/* eslint-enable node/no-unpublished-import */

import auth from './auth/router';
// import characters from '@/characters/router';
import charms from './charms/router';
// import chronicles from '@/chronicles/router';

import Home from './toplevel/home.vue';
import NotFound from './toplevel/not-found.vue';

Vue.use(Router);

export const TITLE = 'Lytek';

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL, // eslint-disable-line no-process-env
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { 'public': true },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '@/toplevel/about.vue'),
      meta: { 'public': true, title: `About ${TITLE}` },
    },
    ...auth,
    // ...characters,
    ...charms,
    // ...chronicles,
    {
      path: '*',
      component: NotFound,
      meta: { 'public': true, title: 'Not Found' },
    },
  ],
});

router.afterEach((to) => {
  let title = TITLE;
  for (const route of to.matched.slice().reverse()) {
    if (route.meta?.title) {
      title = `${route.meta.title} | ${TITLE}`;
      break;
    }
  }
  Vue.nextTick(() => {
    document.title = title;
  });
});

export default router;
