import Vue from 'vue';
import Router from 'vue-router';

import auth from '@/auth/router';

import Home from '@/toplevel/home.vue';
import NotFound from '@/toplevel/not-found.vue';

Vue.use(Router);

const TITLE = 'Lytek';

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
    {
      path: '/profile',
      name: 'profile',
      component: () => import(/* webpackChunkName: "dump" */ '@/dummy.vue'),
      meta: { title: 'profile' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import(/* webpackChunkName: "dump" */ '@/dummy.vue'),
      meta: { title: 'admin' },
    },
    {
      path: '*',
      component: NotFound,
      meta: { 'public': true, title: 'Not Found' },
    },
  ],
});

router.afterEach((to) => {
  let title = TITLE;
  for (const route of Array.from(to.matched).reverse()) {
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
