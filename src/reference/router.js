export default [
  {
    path: '/reference',
    name: 'reference',
    component: () => import(/* webpackChunkName: "reference" */ '@/reference/reference.vue'),
    meta: { title: 'Reference' },
  },
];
