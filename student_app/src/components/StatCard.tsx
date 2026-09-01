import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import theme from '../styles/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}: StatCardProps) {
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.surface,
      iconColor: theme.colors.primary,
    },
    success: {
      backgroundColor: theme.colors.successLight,
      iconColor: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.warningLight,
      iconColor: theme.colors.warning,
    },
    danger: {
      backgroundColor: theme.colors.dangerLight,
      iconColor: theme.colors.danger,
    },
    info: {
      backgroundColor: theme.colors.infoLight,
      iconColor: theme.colors.info,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentVariant.backgroundColor },
      ]}
    >
      <View style={styles.top}>
        <Text style={styles.title}>{title}</Text>

        {icon && (
          <Text
            style={[
              styles.icon,
              { color: currentVariant.iconColor },
            ]}
          >
            {icon}
          </Text>
        )}
      </View>

      <Text style={styles.value}>{value}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 130,
    flex: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
  },

  icon: {
    fontSize: 20,
  },

  value: {
    ...theme.typography.heading,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },

  subtitle: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});