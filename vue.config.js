const RENDER_REGEXP = /\.render\.js$/u;

const production = process.env.NODE_ENV === 'production';

module.exports = {
  assetsDir: 'assets',
  crossorigin: 'anonymous',
  css: {
    extract: true,
    sourceMap: !production,
  },
  integrity: false, // Not serving from a CDN, and there's that Chrome preload bug
  lintOnSave: !production,
  // productionSourceMap: false,

  chainWebpack (config) {
    config
      .resolve
      .alias
      .merge({
        'vue-router$': 'vue-router/dist/vue-router.esm.js',
        vuex$: 'vuex/dist/vuex.esm.js',
      });

    config
      .module
      .rule('yaml')
      .test(/\.ya?ml$/u)
      .use('json-loader')
      .loader('json-loader')
      .end()
      .use('yaml-loader')
      .loader('yaml-loader');

    config
      .module
      .rule('misc-files')
      .test(/\.pdf$/u)
      .use('file-loader')
      .loader('file-loader')
      .options({ name: '[name].[contenthash:8].[ext]', outputPath: 'assets/misc' });

    config
      .module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((options) => {
        options.transformAssetUrls = {
          video: ['src', 'poster'],
          source: 'src',
          img: 'src',
          image: 'xlink:href',
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'img-src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src',
        };
        return options;
      });

    config
      .module
      .rule('js')
      .exclude
      .add(RENDER_REGEXP);

    config
      .module
      .rule('render')
      .test(RENDER_REGEXP)
      .use('file-loader')
      .loader('file-loader')
      .options({ name: '[name].[contenthash:8].[ext]', outputPath: 'assets/js' });

    if (production) {
      config
        .optimization
        .minimizer('terser')
        .tap((options) => {
          if (!options.terserOptions) {
            options.terserOptions = {};
          }
          // if (!options.terserOptions.compress) {
          //   options.terserOptions.compress = {};
          // }
          // options.terserOptions.compress.unsafe = true;
          if (!options.terserOptions.mangle) {
            options.terserOptions.mangle = {};
          }
          options.terserOptions.mangle.safari10 = false;
          return options;
        });
    } else {
      config.devtool('inline-source-map');
    }
  },
};
