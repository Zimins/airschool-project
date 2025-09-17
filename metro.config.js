const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force disable Hermes completely
config.transformer = {
  ...config.transformer,
  hermesParser: false,
  minifierPath: require.resolve('metro-minify-terser'),
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