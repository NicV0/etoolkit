import React from 'react';
import { useLock } from '../lib/auth/LockProvider';
import LockScreen from '../components/ui/LockScreen';

export const MaybeLock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { locked, setLocked, tryBiometricUnlock } = useLock();
  if (locked) {
    return <LockScreen onUnlock={() => setLocked(false)} tryBiometric={async () => { await tryBiometricUnlock(); }} />;
  }
  return <>{children}</>;
};

export default MaybeLock;
