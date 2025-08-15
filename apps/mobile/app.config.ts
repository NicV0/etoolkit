import { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  name: 'mobile',
  slug: 'mobile',
  scheme: 'etoolkit',
  ios: {
    bundleIdentifier: 'com.etoolkit.mobile',
    supportsTablet: true,
    deploymentTarget: '16.0',
  },
});
