// Expo Router's query-string@7 expects a callable CommonJS export. Keep that
// contract while delegating decoding to the patched, audited upstream package.
module.exports = require('decode-uri-component-fixed').default;
