const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure sourceExts includes 'mjs' and 'cjs'
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Add wasm asset support for expo-sqlite
config.resolver.assetExts.push('wasm');

// Add COEP and COOP headers to support SharedArrayBuffer (required for expo-sqlite web)
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = withNativeWind(config, { input: './global.css' });
