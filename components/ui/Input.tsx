import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { useTranslation } from '@/hooks/useTranslation';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({ 
  label, 
  error, 
  icon, 
  containerStyle, 
  required = false,
  ...props 
}: InputProps) {
  const { colors } = useTheme();
  const { flexDirection, textAlign } = useLayout();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    labelContainer: {
      flexDirection: flexDirection.row,
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: textAlign.start,
    },
    required: {
      color: colors.error,
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: flexDirection.rowReverse,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: error ? colors.error : colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 48,
    },
    inputContainerFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.cardBackground,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      textAlign: textAlign.start,
      paddingVertical: 0,
    },
    icon: {
      marginLeft: 12,
    },
    errorText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.error,
      marginTop: 4,
      textAlign: textAlign.start,
    },
  });

  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused
      ]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
