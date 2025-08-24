import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { formatCurrency } from '@/lib/money';

interface RemainingCardProps {
  amount: number;
}

export function RemainingCard({ amount }: RemainingCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const isPositive = amount >= 0;
  const iconColor = isPositive ? colors.success : colors.error;
  const textColor = isPositive ? colors.success : colors.error;

  const styles = createStyles(colors, textColor);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          {isPositive ? (
            <TrendingUp size={20} color={iconColor} />
          ) : (
            <TrendingDown size={20} color={iconColor} />
          )}
        </View>
        <Text style={styles.title}>{t('remaining')}</Text>
      </View>
      
      <Text style={styles.amount}>{formatCurrency(Math.abs(amount))}</Text>
      
      <Text style={styles.subtitle}>
        {isPositive ? 'متوقع فائض' : 'متوقع عجز'}
      </Text>
    </View>
  );
}

function createStyles(colors: any, textColor: string) {
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
      color: textColor,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textMuted,
    },
  });
}