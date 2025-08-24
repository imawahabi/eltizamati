import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'medium',
  style 
}: BadgeProps) {
  const { colors } = useTheme();
  const { isRTL } = useLayout();
  
  const styles = createStyles(colors, isRTL);
  
  return (
    <View style={[
      styles.badge,
      styles[variant],
      styles[size],
      style
    ]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {children}
      </Text>
    </View>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Variants
    default: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
    },
    success: {
      backgroundColor: colors.successLight,
      borderWidth: 1,
      borderColor: colors.success,
    },
    warning: {
      backgroundColor: colors.warningLight,
      borderWidth: 1,
      borderColor: colors.warning,
    },
    error: {
      backgroundColor: colors.errorLight,
      borderWidth: 1,
      borderColor: colors.error,
    },
    info: {
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    
    // Sizes
    small: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    medium: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    large: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    
    // Text styles
    text: {
      fontFamily: 'Cairo-SemiBold',
      textAlign: isRTL ? 'right' : 'left',
    },
    defaultText: {
      color: colors.text,
      fontSize: 12,
    },
    successText: {
      color: colors.success,
      fontSize: 12,
    },
    warningText: {
      color: colors.warning,
      fontSize: 12,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
    },
    infoText: {
      color: colors.primary,
      fontSize: 12,
    },
    
    // Size text
    smallText: {
      fontSize: 10,
    },
    mediumText: {
      fontSize: 12,
    },
    largeText: {
      fontSize: 14,
    },
  });
}
