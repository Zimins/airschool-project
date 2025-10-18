const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force disable Hermes completely
config.transformer = {
  ...config.transformer,
  hermesParser: false,
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
      reserved: ['process', 'env', 'EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'],
    },
    compress: {
      // Don't remove process.env references
      pure_getters: false,
    },
  },
  getTransformOptions: () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
      unstable_disableES6Transforms: false,
    },
  }),
};

// Ensure web platform uses correct transformers
config.resolver = {
  ...config.resolver,
  platforms: ['web', 'native', 'ios', 'android'],
};

module.exports = config;