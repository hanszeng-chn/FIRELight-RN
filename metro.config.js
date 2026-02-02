// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 修复 Metro 在 web 平台解析 .js 文件的问题
// 确保 sourceExts 包含 'mjs', 'js', 'jsx', 'ts', 'tsx', 'cjs', 'json'
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

// Add wasm asset support for expo-sqlite
config.resolver.assetExts.push("wasm");

// Add COEP and COOP headers to support SharedArrayBuffer (required for expo-sqlite web)
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    return middleware(req, res, next);
  };
};

module.exports = config;
