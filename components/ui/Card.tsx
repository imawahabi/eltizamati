import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: number;
}

export function Card({ children, style, elevated = true, padding = 16 }: CardProps) {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: padding,
      ...(elevated && {
        shadowColor: colors.shadowColor,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }),
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
  });

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}
