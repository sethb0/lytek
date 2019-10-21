export default [
  {
    path: '/charms',
    component: () => import(/* webpackChunkName: "charms" */ '@/charms/shared/root.vue'),
    meta: { title: 'Charms' },
    children: [
      {
        path: '',
        redirect: { name: 'charmTrees' },
      },
      {
        name: 'charmBrowser',
        path: 'browse',
        component:
          () => import(/* webpackChunkName: "charms" */ '@/charms/browser/browser.vue'),
        meta: { title: 'Charm Browser' },
      },
      {
        name: 'charmTrees',
        path: 'trees',
        component:
          () => import(/* webpackChunkName: "charms" */ '@/charms/tree/tree-viewer.vue'),
        meta: { title: 'Charm Tree Viewer' },
      },
    ],
  },
];
