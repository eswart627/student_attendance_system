import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import theme from '../styles/theme';

interface AttendanceCardProps {
  subject: string;
  date: string;
  time?: string;
  status: 'present' | 'absent' | 'late';
}

export default function AttendanceCard({
  subject,
  date,
  time,
  status,
}: AttendanceCardProps) {
  const statusConfig = {
    present: {
      label: 'Present',
      backgroundColor: theme.colors.successLight,
      color: theme.colors.success,
    },

    absent: {
      label: 'Absent',
      backgroundColor: theme.colors.dangerLight,
      color: theme.colors.danger,
    },

    late: {
      label: 'Late',
      backgroundColor: theme.colors.warningLight,
      color: theme.colors.warning,
    },
  };

    const normalizedStatus = String(status ?? '').toLowerCase().trim();

    const config =
    statusConfig[normalizedStatus as keyof typeof statusConfig] ??
    statusConfig.absent;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.subject}>{subject}</Text>

        <Text style={styles.date}>{date}</Text>

        {time && (
          <Text style={styles.time}>{time}</Text>
        )}
      </View>

      <View
        style={[
          styles.status,
          { backgroundColor: config.backgroundColor },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: config.color },
          ]}
        >
          {config.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  info: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },

  subject: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },

  date: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },

  time: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  status: {
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  statusText: {
    ...theme.typography.smallBold,
  },
});