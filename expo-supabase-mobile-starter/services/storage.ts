import * as SecureStore from 'expo-secure-store'

export const storage = {
  get: (k: string) => SecureStore.getItemAsync(k),
  set: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  remove: (k: string) => SecureStore.deleteItemAsync(k)
}
