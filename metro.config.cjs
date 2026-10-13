const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// Secret/configuration files must never become modules or public assets.
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : config.resolver.blockList ? [config.resolver.blockList] : []),
  /[/\\]\.env(?:\.[^/\\]*)?$/,
  /\.(?:p8|pem|key|mobileprovision)$/,
];
module.exports = config;
