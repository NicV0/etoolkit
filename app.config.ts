export default {
  name: "eToolkit",
  slug: "etoolkit",
  scheme: "etoolkit",
  ios: { bundleIdentifier: "com.etoolkit.app", supportsTablet: false },
  android: { package: "com.etoolkit.app" },
  extra: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};
