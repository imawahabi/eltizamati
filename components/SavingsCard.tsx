import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { PiggyBank } from 'lucide-react-native';
import { formatCurrency } from '@/lib/money';

interface SavingsCardProps {
  target: number;
}

export function SavingsCard({ target }: SavingsCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <PiggyBank size={20} color={colors.success} />
        </View>
        <Text style={styles.title}>{t('savings')}</Text>
      </View>
      
      <Text style={styles.amount}>{formatCurrency(target)}</Text>
      
      <Text style={styles.subtitle}>
        {target > 0 ? t('savingsTarget') : 'غير محدد'}
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
      backgroundColor: colors.success + '20',
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