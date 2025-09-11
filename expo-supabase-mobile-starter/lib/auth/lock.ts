import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_LOCK_TIMEOUT = 'security.lock_timeout_sec';
const KEY_LAST_BACKGROUND = 'security.last_bg_at';

export async function getLockTimeoutSec(): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(KEY_LOCK_TIMEOUT);
    if (!v) return 60;
    const n = Number(v);
    return Number.isFinite(n) ? n : 60;
  } catch {
    return 60;
  }
}

export async function setLockTimeoutSec(sec: number) {
  await AsyncStorage.setItem(KEY_LOCK_TIMEOUT, String(sec));
}

export async function setLastBackgroundAt(ts: number) {
  await AsyncStorage.setItem(KEY_LAST_BACKGROUND, String(ts));
}
export async function getLastBackgroundAt(): Promise<number | null> {
  try {
    const v = await AsyncStorage.getItem(KEY_LAST_BACKGROUND);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
