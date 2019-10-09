export default [
  {
    path: '/charms',
    component: () => import(/* webpackChunkName: "charms" */ '@/charms/root.vue'),
    meta: { title: 'Charms' },
    children: [
      {
        path: '',
        redirect: { name: 'charmBrowser' },
      },
      {
        name: 'charmBrowser',
        path: 'browse',
        component: () => import(/* webpackChunkName: "charms" */ '@/charms/browser.vue'),
      },
      // {
      //   name: 'charmTrees',
      //   path: 'trees/:type?/:group?',
      //   props: true,
      //   component: () => import(/* webpackChunkName: "charms" */ '@/charms/tree-viewer.vue'),
      // },
      // {
      //   name: 'charmInspector',
      //   path: 'inspect/:id',
      //   props: true,
      //   component:
      //     () => import(/* webpackChunkName: "charms" */ '@/charms/wrap-inspector.vue'),
      // },
    ],
  },
];
