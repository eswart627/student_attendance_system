import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import { registerAuthFailureHandler } from './src/services/api';

import {
  clearAuthData,
  getAuthToken,
  getStoredUser,
  saveAuthData,
  StoredUser,
} from './src/storage';

type AuthState = {
  token: string | null;
  user: StoredUser | null;
};

/* eslint-disable no-bitwise */
function decodeBase64(base64: string): string {
  if (typeof (globalThis as any).atob === 'function') {
    return (globalThis as any).atob(base64);
  }
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = base64.replace(/[=]+$/, '');
  let output = '';
  for (
    let bc = 0, bs = 0, buffer = 0, idx = 0;
    (buffer = str.charCodeAt(idx++));
  ) {
    const charIndex = chars.indexOf(String.fromCharCode(buffer));
    if (charIndex >= 0) {
      bs = bc % 4 ? bs * 64 + charIndex : charIndex;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
      }
    }
  }
  return output;
}
/* eslint-enable no-bitwise */

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return true;
    }
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decodedJson = decodeBase64(base64);
    const { exp } = JSON.parse(decodedJson);
    if (!exp) {
      return false;
    }
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export default function App() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerAuthFailureHandler(() => {
      handleLogout();
    });

    restoreSession();

    return () => {
      registerAuthFailureHandler(null);
    };
  }, []);

  const restoreSession = async () => {
    try {
      const [token, user] = await Promise.all([
        getAuthToken(),
        getStoredUser(),
      ]);

      if (token && user && !isTokenExpired(token)) {
        setAuth({
          token,
          user,
        });
      } else {
        await clearAuthData();

        setAuth({
          token: null,
          user: null,
        });
      }
    } catch (error: any) {
      Alert.alert('Session Restore Error', error?.message || String(error));

      try {
        await clearAuthData();
      } catch (clearError: any) {
        Alert.alert(
          'Storage Clear Error',
          clearError?.message || String(clearError),
        );
      }

      setAuth({
        token: null,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (
    token: string,
    user: StoredUser,
  ): Promise<void> => {
    try {
      await saveAuthData(token, user);

      setAuth({
        token,
        user,
      });
    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await clearAuthData();

      setAuth({
        token: null,
        user: null,
      });
    } catch (error: any) {
      Alert.alert('Logout Error', error?.message || String(error));

      setAuth({
        token: null,
        user: null,
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#111827" />

          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AppNavigator
      token={auth.token}
      user={auth.user}
      onLogin={handleLogin}
      onLogout={handleLogout}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
});
