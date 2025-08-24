const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push('db');

// Configure transformer for better performance
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
  },
};

// Increase memory limit for large projects
config.maxWorkers = 2;

module.exports = config;
