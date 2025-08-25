const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Start from Expo's defaults (RN 0.76/0.77+; SDK 52+)
const config = getDefaultConfig(__dirname, {
  // enables CSS-in-RN for web if needed
  isCSSEnabled: true,
});

// ✅ Ensure asset registry path is correct for modern RN/Expo
// (prevents the "missing-asset-registry-path" error if a transformer overrides it)
config.transformer.assetRegistryPath = "@react-native/assets-registry/registry";

// If you're using NativeWind v4 (recommended)
module.exports = withNativeWind(config, { input: "./global.css" });
