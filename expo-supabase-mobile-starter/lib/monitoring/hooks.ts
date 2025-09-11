import { useEffect } from 'react';
import { appAnalytics } from './app-analytics';

export const useAppOpenAnalytics = () => {
  useEffect(() => {
    appAnalytics.trackEvent('app_open');
  }, []);
};
