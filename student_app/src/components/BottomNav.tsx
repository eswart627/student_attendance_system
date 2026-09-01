import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import theme from '../styles/theme';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function BottomNav({
  items,
  activeKey,
  onChange,
}: BottomNavProps) {
  return (
    <View style={styles.container}>
      {items.map(item => {
        const active = item.key === activeKey;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => onChange(item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, active && styles.active]}>
              {item.icon}
            </Text>

            <Text style={[styles.label, active && styles.active]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
  },

  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 21,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textMuted,
  },

  label: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },

  active: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});