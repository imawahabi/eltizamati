import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const { colors } = useTheme();
  const { flexDirection } = useLayout();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: iconPosition === 'right' ? flexDirection.rowReverse : flexDirection.row,
    };

    const sizeStyles = {
      small: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
      medium: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
      large: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 52 },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled ? colors.textMuted : colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: disabled ? colors.surface : colors.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? colors.border : colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    return [baseStyle, sizeStyles[size], variantStyles[variant]];
  };

  const getTextStyle = () => {
    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles = {
      primary: { color: disabled ? colors.textSecondary : colors.textInverse },
      secondary: { color: disabled ? colors.textSecondary : colors.textInverse },
      outline: { color: disabled ? colors.textMuted : colors.primary },
      ghost: { color: disabled ? colors.textMuted : colors.text },
    };

    return [
      {
        fontFamily: 'Cairo-SemiBold',
        textAlign: 'center' as const,
      },
      sizeStyles[size],
      variantStyles[variant],
    ];
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' ? colors.textInverse : colors.primary} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <React.Fragment>{icon}</React.Fragment>
          )}
          <Text style={[getTextStyle(), textStyle, icon && { marginHorizontal: 8 }]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <React.Fragment>{icon}</React.Fragment>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
