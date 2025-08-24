import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Plus, CreditCard, TrendingUp, FileText } from 'lucide-react-native';
import { router } from 'expo-router';

export function QuickActions() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = createStyles(colors);

  const actions = [
    {
      icon: Plus,
      label: 'إضافة التزام',
      color: colors.primary,
      onPress: () => router.push('/add-debt'),
    },
    {
      icon: CreditCard,
      label: 'تسجيل دفعة',
      color: colors.success,
      onPress: () => router.push('/add-payment'),
    },
    {
      icon: TrendingUp,
      label: 'توقع الشهر',
      color: colors.secondary,
      onPress: () => router.push('/prediction'),
    },
    {
      icon: FileText,
      label: 'من النص',
      color: colors.warning,
      onPress: () => router.push('/nlp-input'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إجراءات سريعة</Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
              <action.icon size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginBottom: 16,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    actionLabel: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: 'center',
    },
  });
}