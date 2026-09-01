import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

export interface StoredUser {
  id: number | string;
  firstName?: string;
  lastName?: string;
  email: string;
  MIS?: string;
  year?: number;
  semester?: number;
  department?: string;
  profilePic?: string | null;
  role?: 'student' | 'teacher' | string;
  class?: {
    classId: number | string;
    name: string;
    code: string;
    description?: string;
  } | null;
}

export async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export async function removeAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export async function saveUser(user: StoredUser): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.USER);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredUser;
  } catch (error) {
    console.error('INVALID STORED USER:', error);

    await AsyncStorage.removeItem(STORAGE_KEYS.USER);

    return null;
  }
}

export async function removeStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}

export async function saveAuthData(
  token: string,
  user: StoredUser,
): Promise<void> {
  // Use individual operations because the installed
  // AsyncStorage type does not expose multiSet().
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export async function clearAuthData(): Promise<void> {
  // Use individual operations because the installed
  // AsyncStorage type does not expose multiRemove().
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  await AsyncStorage.removeItem(STORAGE_KEYS.USER);
}
