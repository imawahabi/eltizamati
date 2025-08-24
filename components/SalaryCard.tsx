import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { DollarSign } from 'lucide-react-native';
import { formatCurrency } from '@/lib/money';

interface SalaryCardProps {
  amount: number;
  paydayDay: number;
}

export function SalaryCard({ amount, paydayDay }: SalaryCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <DollarSign size={20} color={colors.primary} />
        </View>
        <Text style={styles.title}>{t('salary')}</Text>
      </View>
      
      <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      
      <Text style={styles.subtitle}>
        {t('payday')} {paydayDay}
      </Text>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primaryLight + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.textSecondary,
    },
    amount: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textMuted,
    },
  });
}