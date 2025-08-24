import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

export function MonthlyOverview() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>نظرة عامة شهرية</Text>
      <Text style={styles.subtitle}>قريبًا - إحصائيات مفصلة عن الإنفاق والالتزامات</Text>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
  });
}