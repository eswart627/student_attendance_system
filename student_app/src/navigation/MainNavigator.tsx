import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import ScanScreen from '../screens/ScanScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import SettingsScreen from '../screens/SettingsScreen';

import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

type Props = {
  token: string;
  user: any;
  onLogout: () => Promise<void>;
};

export default function MainNavigator({ token, user, onLogout }: Props) {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard">
        {navigationProps => (
          <DashboardScreen
            {...navigationProps}
            user={user}
            token={token}
            onScan={() => {
              navigationProps.navigation.navigate('Scan');
            }}
            onAttendance={() => {
              navigationProps.navigation.navigate('Attendance');
            }}
            onSettings={() => {
              navigationProps.navigation.navigate('Settings');
            }}
            onLogout={onLogout}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Scan">
        {navigationProps => <ScanScreen {...navigationProps} token={token} />}
      </Stack.Screen>

      <Stack.Screen name="Attendance">
        {navigationProps => (
          <AttendanceScreen
            {...navigationProps}
            token={token}
            studentId={user.id}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Settings">
        {navigationProps => (
          <SettingsScreen {...navigationProps} onLogout={onLogout} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
