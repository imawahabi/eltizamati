import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Building2, User, CreditCard, Receipt } from 'lucide-react-native';
import { formatCurrency } from '@/lib/money';

interface Debt {
  id: number;
  entityName: string;
  kind: string;
  principal: number;
  installmentAmount: number;
  remainingInstallments: number;
  dueDay: number;
  status: string;
  apr: number;
}

interface DebtCardProps {
  debt: Debt;
}

export function DebtCard({ debt }: DebtCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(colors);

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'loan':
        return Building2;
      case 'friend':
        return User;
      case 'bnpl':
        return CreditCard;
      default:
        return Receipt;
    }
  };

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'loan':
        return colors.primary;
      case 'friend':
        return colors.secondary;
      case 'bnpl':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const Icon = getKindIcon(debt.kind);
  const kindColor = getKindColor(debt.kind);

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: kindColor + '20' }]}>
          <Icon size={20} color={kindColor} />
        </View>
        
        <View style={styles.debtInfo}>
          <Text style={styles.entityName}>{debt.entityName}</Text>
          <Text style={styles.debtType}>
            {debt.kind === 'loan' ? 'قرض بنكي' :
             debt.kind === 'bnpl' ? 'تقسيط' :
             debt.kind === 'friend' ? 'دين شخصي' : 'فاتورة'}
          </Text>
        </View>
        
        <View style={styles.amountInfo}>
          <Text style={styles.installmentAmount}>{formatCurrency(debt.installmentAmount)}</Text>
          <Text style={styles.dueDay}>{t('day')} {debt.dueDay}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressInfo}>
          <Text style={styles.remainingText}>
            {debt.remainingInstallments} أقساط متبقية
          </Text>
          {debt.apr > 0 && (
            <Text style={styles.aprText}>APR {debt.apr.toFixed(1)}%</Text>
          )}
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${Math.max(0, 100 - (debt.remainingInstallments / (debt.remainingInstallments + 1)) * 100)}%`,
                backgroundColor: kindColor 
              }
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    debtInfo: {
      flex: 1,
    },
    entityName: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
    },
    debtType: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    amountInfo: {
      alignItems: 'flex-end',
    },
    installmentAmount: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    dueDay: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    footer: {
      gap: 8,
    },
    progressInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    remainingText: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
    aprText: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textMuted,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
  });
}