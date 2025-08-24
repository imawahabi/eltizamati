import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboard } from '@/hooks/useDashboard';
import { SalaryCard } from '@/components/SalaryCard';
import { CommitmentsCard } from '@/components/CommitmentsCard';
import { SavingsCard } from '@/components/SavingsCard';
import { RemainingCard } from '@/components/RemainingCard';
import { AlertsList } from '@/components/AlertsList';
import { QuickActions } from '@/components/QuickActions';
import { Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { formatCurrency, formatNumber, getCurrency } from '@/lib/formatting';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useTranslation();
  const { 
    salaryAmount, 
    commitmentsThisMonth, 
    savingsTarget, 
    projectedRemaining, 
    alerts,
    paydayDay 
  } = useDashboard();

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>{t('appName')}</Text>
          <Text style={styles.monthLabel}>
            {t('currentMonth')} - {t('payday')} {paydayDay}
          </Text>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <DollarSign size={16} color={colors.primary} />
            <View style={styles.amountContainer}>
              <Text style={styles.quickStatValue}>{formatNumber(Math.floor(salaryAmount), language)}</Text>
              {salaryAmount % 1 !== 0 && (
                <Text style={styles.decimalText}>.{formatNumber(Math.round((salaryAmount % 1) * 100), language)}</Text>
              )}
              <Text style={styles.currencyText}> {getCurrency(language)}</Text>
            </View>
            <Text style={styles.quickStatLabel}>{language === 'ar' ? 'الراتب' : 'Salary'}</Text>
          </View>
          <View style={styles.quickStat}>
            <TrendingUp size={16} color={colors.success} />
            <View style={styles.amountContainer}>
              <Text style={styles.quickStatValue}>{formatNumber(Math.floor(projectedRemaining), language)}</Text>
              {projectedRemaining % 1 !== 0 && (
                <Text style={styles.decimalText}>.{formatNumber(Math.round((projectedRemaining % 1) * 100), language)}</Text>
              )}
            </View>
            <Text style={styles.quickStatLabel}>{language === 'ar' ? 'المتبقي' : 'Remaining'}</Text>
          </View>
          <View style={styles.quickStat}>
            <Calendar size={16} color={colors.warning} />
            <View style={styles.amountContainer}>
              <Text style={styles.quickStatValue}>{formatNumber(Math.floor(commitmentsThisMonth), language)}</Text>
              {commitmentsThisMonth % 1 !== 0 && (
                <Text style={styles.decimalText}>.{formatNumber(Math.round((commitmentsThisMonth % 1) * 100), language)}</Text>
              )}
            </View>
            <Text style={styles.quickStatLabel}>{language === 'ar' ? 'الالتزامات' : 'Commitments'}</Text>
          </View>
        </View>

        {/* Main Cards Grid */}
        <View style={styles.cardsGrid}>
          <View style={styles.cardRow}>
            <View style={styles.cardContainer}>
              <SalaryCard amount={salaryAmount} paydayDay={paydayDay} />
            </View>
            <View style={styles.cardContainer}>
              <RemainingCard amount={projectedRemaining} />
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.cardContainer}>
              <CommitmentsCard amount={commitmentsThisMonth} />
            </View>
            <View style={styles.cardContainer}>
              <SavingsCard target={savingsTarget} />
            </View>
          </View>
        </View>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('alerts')}</Text>
            <AlertsList alerts={alerts} />
          </View>
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/add-payment')}
          >
            <Plus size={20} color="white" />
            <Text style={styles.buttonText}>
              {language === 'ar' ? 'إضافة دفعة' : 'Add Payment'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/add-commitment')}
          >
            <Plus size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>
              {language === 'ar' ? 'إضافة التزام' : 'Add Commitment'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    appTitle: {
      fontSize: 28,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 4,
    },
    monthLabel: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
    quickStatsRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 20,
    },
    quickStat: {
      alignItems: 'center',
      flex: 1,
    },
    quickStatValue: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginVertical: 4,
    },
    quickStatLabel: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontFamily: 'Cairo-Medium',
      color: colors.primary,
    },
    currencyText: {
      fontSize: 12,
      fontFamily: 'Cairo-Medium',
      color: colors.textSecondary,
    },
    decimalText: {
      fontSize: 10,
      fontFamily: 'Cairo-Medium',
      color: colors.textSecondary,
    },
    cardsGrid: {
      gap: 12,
      marginBottom: 24,
    },
    cardRow: {
      flexDirection: 'row-reverse',
      gap: 12,
      marginBottom: 12,
    },
    cardContainer: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'right',
    },
    actionButtons: {
      flexDirection: 'column',
      gap: 12,
      marginVertical: 20,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 8,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
    },
  });
}