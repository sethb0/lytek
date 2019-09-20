const developmentPresets = [
  ['@vue/app', {
    debug: true,
    jsx: false,
    loose: true,
    corejs: { version: '3.2', proposals: true },
  }],
];

const productionPresets = [
  ['@vue/app', {
    jsx: false,
    loose: true,
    corejs: { version: '3.2', proposals: true },
  }],
];

const serverPresets = [
  ['@vue/app', {
    debug: true,
    targets: { node: 'current' },
    modules: 'commonjs',
    jsx: false,
    loose: true,
    corejs: { version: '3.2', proposals: true },
  }],
];

const plugins = [
  '@babel/plugin-proposal-function-bind',
  '@babel/plugin-proposal-logical-assignment-operators',
  ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: true }],
  ['@babel/plugin-proposal-optional-chaining', { loose: true }],
];

module.exports = {
  env: {
    development: {
      presets: developmentPresets,
      plugins,
    },
    test: {
      presets: productionPresets,
      plugins,
    },
    production: {
      presets: productionPresets,
      plugins,
    },
    server: {
      presets: serverPresets,
      plugins,
    },
  },
};
