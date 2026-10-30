import * as SecureStore from 'expo-secure-store';
import { isStoredSession, type SessionJournal } from './session';

const key = 'temanbicara.auth.v1';
const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export const sessionStorage = {
  async load(): Promise<SessionJournal> {
    const raw = await SecureStore.getItemAsync(key, options);
    if (!raw) return { active: null, pendingRevocations: [] };
    const value = JSON.parse(raw) as SessionJournal;
    if (!value || (value.active !== null && !isStoredSession(value.active)) ||
      !Array.isArray(value.pendingRevocations) || !value.pendingRevocations.every(isStoredSession))
      throw new Error('Invalid saved account.');
    return value;
  },
  async save(journal: SessionJournal) {
    if (!journal.active && !journal.pendingRevocations.length)
      await SecureStore.deleteItemAsync(key, options);
    else await SecureStore.setItemAsync(key, JSON.stringify(journal), options);
  },
};
