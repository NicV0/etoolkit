import AsyncStorage from '@react-native-async-storage/async-storage';


const KEY_COMPLETE = 'onboarding.complete';
const KEY_TRADE = 'onboarding.trade_type';
const KEY_PRIVACY = 'onboarding.accept.privacy';
const KEY_DISCLAIMER = 'onboarding.accept.disclaimer';

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY_COMPLETE);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(done: boolean) {
  await AsyncStorage.setItem(KEY_COMPLETE, done ? 'true' : 'false');
}

export async function setTradeType(trade: string) {
  await AsyncStorage.setItem(KEY_TRADE, trade);
}

export async function getTradeType(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(KEY_TRADE)) as string | null;
  } catch {
    return null;
  }
}

export async function setPrivacyAccepted(v: boolean) {
  await AsyncStorage.setItem(KEY_PRIVACY, v ? 'true' : 'false');
}

export async function getPrivacyAccepted(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY_PRIVACY);
    return v === 'true';
  } catch {
    return false;
  }
}

export async function setDisclaimerAccepted(v: boolean) {
  await AsyncStorage.setItem(KEY_DISCLAIMER, v ? 'true' : 'false');
}

export async function getDisclaimerAccepted(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY_DISCLAIMER);
    return v === 'true';
  } catch {
    return false;
  }
}
