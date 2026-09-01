import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import theme from '../styles/theme';

interface AppInputProps extends TextInputProps {
  label: string;
}

export default function AppInput({
  label,
  ...textInputProps
}: AppInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...textInputProps}
        style={[styles.input, textInputProps.style]}
        placeholderTextColor={
          textInputProps.placeholderTextColor ?? theme.colors.textMuted
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },

  label: {
    ...theme.typography.captionMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.text,
    ...theme.typography.body,
  },
});