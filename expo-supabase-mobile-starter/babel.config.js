module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@theme/tokens': './expo-supabase-mobile-starter/lib/theme/tokens',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
