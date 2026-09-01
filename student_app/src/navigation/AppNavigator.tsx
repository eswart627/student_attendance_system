import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

type Props = {
  token: string | null;
  user: any | null;
  onLogin: (token: string, user: any) => Promise<void>;
  onLogout: () => Promise<void>;
};

export default function AppNavigator({
  token,
  user,
  onLogin,
  onLogout,
}: Props) {
  return (
    <NavigationContainer>
      {token && user ? (
        <MainNavigator token={token} user={user} onLogout={onLogout} />
      ) : (
        <AuthNavigator onLogin={onLogin} />
      )}
    </NavigationContainer>
  );
}
