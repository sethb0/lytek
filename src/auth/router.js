export default [
  {
    path: '/auth/callback',
    component: () => import(/* webpackChunkName: "auth" */ '@/auth/callback.vue'),
    meta: { 'public': true, auth: true },
  },
  {
    name: 'login',
    path: '/auth/login',
    component: () => import(/* webpackChunkName: "auth" */ '@/auth/login.vue'),
    meta: { 'public': true, auth: true },
  },
  {
    name: 'logout',
    path: '/auth/logout',
    component: () => import(/* webpackChunkName: "auth" */ '@/auth/logout.vue'),
    meta: { 'public': true, auth: true },
  },
  {
    path: '/auth/dump',
    component: () => import(/* webpackChunkName: "dump" */ '@/auth/dump.vue'),
    meta: { 'public': true },
  },
];
