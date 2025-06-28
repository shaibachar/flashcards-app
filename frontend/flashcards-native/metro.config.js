const {getDefaultConfig, mergeConfig} = require('metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 */
module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const config = {};
  return mergeConfig(defaultConfig, config);
})();
