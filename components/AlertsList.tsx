import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { TriangleAlert as AlertTriangle, Clock } from 'lucide-react-native';
import { formatCurrency } from '@/lib/money';
import dayjs from 'dayjs';

interface Alert {
  type: 'due_soon' | 'overdue';
  entity: string;
  amount: number;
  dueDate: string;
  debtId: number;
}

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {alerts.map((alert, index) => (
        <View key={index} style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: alert.type === 'overdue' ? colors.error + '20' : colors.warning + '20' }
            ]}>
              {alert.type === 'overdue' ? (
                <AlertTriangle size={16} color={alert.type === 'overdue' ? colors.error : colors.warning} />
              ) : (
                <Clock size={16} color={colors.warning} />
              )}
            </View>
            
            <View style={styles.alertInfo}>
              <Text style={styles.entityName}>{alert.entity}</Text>
              <Text style={styles.alertAmount}>{formatCurrency(alert.amount)}</Text>
            </View>
            
            <View style={styles.alertActions}>
              <Text style={[
                styles.alertDate,
                { color: alert.type === 'overdue' ? colors.error : colors.warning }
              ]}>
                {alert.type === 'overdue' ? t('overdue') : 
                 `${dayjs(alert.dueDate).diff(dayjs(), 'days')} أيام`}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.actionButtonText}>{t('payNow')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.textSecondary }]}>
              <Text style={styles.actionButtonText}>{t('postpone')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    alertCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    alertHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alertInfo: {
      flex: 1,
    },
    entityName: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
    },
    alertAmount: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      marginTop: 2,
    },
    alertActions: {
      alignItems: 'flex-end',
    },
    alertDate: {
      fontSize: 12,
      fontFamily: 'Cairo-SemiBold',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    actionButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
    },
  });
}