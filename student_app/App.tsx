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

export default function App() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [token, user] = await Promise.all([
        getAuthToken(),
        getStoredUser(),
      ]);

      if (token && user) {
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
      const message =
        error?.message || error?.toString?.() || 'Unknown authentication error';
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
