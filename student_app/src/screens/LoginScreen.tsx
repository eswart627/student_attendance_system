import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { login } from '../services/authService';

import type { StudentUser } from '../services/authService';

// type User = {
//   id: string | number;
//   firstName?: string;
//   lastName?: string;
//   email: string;
//   MIS?: string;
//   year?: number;
//   semester?: number;
//   department?: string;
//   profilePic?: string | null;
//   role?: string;
//   class?: {
//     classId: string;
//     name: string;
//     code: string;
//     description: string;
//   };
// };

type Props = {
  onLogin: (token: string, user: StudentUser) => Promise<void>;
};

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await login(email.trim(), password);

      if (!response.success || !response.data?.token || !response.data.user) {
        throw new Error(response.message || 'Login failed.');
      }

      await onLogin(response.data.token, response.data.user);
    } catch (error: any) {
      console.error('LOGIN ERROR:', error);

      Alert.alert(
        'Login failed',
        error?.message || 'Could not connect to the server.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Background */}
      <View style={styles.topBackground}>
        <View style={styles.circleOne} />
        <View style={styles.circleTwo} />
        <View style={styles.circleThree} />

        <View style={styles.patternRow}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.patternDot} />
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Institute branding */}
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Image
                source={require('../assets/iiit-pune-logo.webp')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.brandText}>
              <Text style={styles.institute}>IIIT Pune</Text>

              <Text style={styles.instituteSub}>
                Indian Institute of Information Technology
              </Text>
            </View>
          </View>

          {/* Login card */}
          <View style={styles.card}>
            <View style={styles.accent} />

            <Text style={styles.welcome}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Sign in to access your student portal
            </Text>

            <View style={styles.form}>
              <AppInput
                label="College Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@college.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <AppInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
              />

              <View style={styles.button}>
                <AppButton
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </View>
          </View>

          <Text style={styles.footer}>Student Attendance System</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
  },

  /* Background */

  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: 'hidden',
    backgroundColor: '#312E81',
  },

  circleOne: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: '#4F46E5',
    top: -150,
    right: -70,
  },

  circleTwo: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#7C3AED',
    top: 105,
    left: -135,
    opacity: 0.75,
  },

  circleThree: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#06B6D4',
    top: 25,
    right: 35,
    opacity: 0.7,
  },

  patternRow: {
    position: 'absolute',
    right: 25,
    top: 170,
    flexDirection: 'row',
    gap: 8,
    opacity: 0.55,
  },

  patternDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  /* Branding */

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  logoBox: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,

    elevation: 5,

    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 7,
  },

  logo: {
    width: 56,
    height: 56,
  },

  brandText: {
    flex: 1,
  },

  institute: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  instituteSub: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
    lineHeight: 15,
  },

  /* Login card */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    overflow: 'hidden',

    elevation: 8,

    shadowColor: '#312E81',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },

  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#4F46E5',
  },

  welcome: {
    color: '#111827',
    fontSize: 27,
    fontWeight: '800',
  },

  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 22,
  },

  form: {
    width: '100%',
  },

  button: {
    marginTop: 4,
  },

  footer: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 22,
  },
});
