import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { getLockTimeoutSec, setLockTimeoutSec, setLastBackgroundAt, getLastBackgroundAt } from './lock';

interface LockContextValue {
  locked: boolean;
  setLocked: (v: boolean) => void;
  tryBiometricUnlock: () => Promise<boolean>;
}

const LockContext = createContext<LockContextValue | undefined>(undefined);

export const LockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locked, setLocked] = useState(false);
  const [timeoutSec, setTimeoutSecState] = useState<number>(60);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const sec = await getLockTimeoutSec();
      if (mounted) setTimeoutSecState(sec);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state: AppStateStatus) => {
      if (timeoutSec <= 0) return;
      if (state === 'background') {
        await setLastBackgroundAt(Date.now());
      }
      if (state === 'active') {
        const last = await getLastBackgroundAt();
        if (last && Date.now() - last > timeoutSec * 1000) {
          setLocked(true);
        }
      }
    });
    return () => sub.remove();
  }, [timeoutSec]);

  const tryBiometricUnlock = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
      if (!hasHardware || !enrolled) return false;
      const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock' });
      if (res.success) {
        setLocked(false);
        await setLastBackgroundAt(Date.now());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const value: LockContextValue = { locked, setLocked, tryBiometricUnlock };
  return <LockContext.Provider value={value}>{children}</LockContext.Provider>;
};

export const useLock = () => {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error('useLock must be used within LockProvider');
  return ctx;
};
