import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'devops-companion-storage',
  encryptionKey: 'hunter2', // In a real app, use a more secure key or omit
});

export const StorageKeys = {
  USER_SESSION: 'user_session',
  SETTINGS: 'app_settings',
  THEME: 'app_theme',
};

// Helper methods
export const setItem = (key, value) => {
  const jsonValue = typeof value === 'object' ? JSON.stringify(value) : value;
  storage.set(key, jsonValue);
};

export const getItem = (key) => {
  return storage.getString(key);
};

export const getObject = (key) => {
  const value = storage.getString(key);
  try {
    return value ? JSON.parse(value) : null;
  } catch (e) {
    return null;
  }
};

export const removeItem = (key) => {
  storage.delete(key);
};

export const clearAll = () => {
  storage.clearAll();
};
