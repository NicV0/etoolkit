import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { getOnboardingComplete } from '../../lib/auth/onboarding';

export default function AuthIndex() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    (async () => {
      const complete = await getOnboardingComplete();
      setDone(complete);
      setReady(true);
    })();
  }, []);
  if (!ready) return null;
  return <Redirect href={done ? '/(auth)/sign-in' : '/(auth)/onboarding'} />;
}
