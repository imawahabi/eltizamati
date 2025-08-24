import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboard } from '@/hooks/useDashboard';
import { MonthlyOverview } from '@/components/MonthlyOverview';
import { PaymentTrends } from '@/components/PaymentTrends';
import { DebtsByCategory } from '@/components/DebtsByCategory';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, AlertTriangle } from 'lucide-react-native';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { 
    salaryAmount, 
    commitmentsThisMonth, 
    savingsTarget, 
    projectedRemaining,
    paydayDay 
  } = useDashboard();

  const styles = createStyles(colors);

  // Calculate smart insights
  const savingsRate = Number(((projectedRemaining / salaryAmount) * 100).toFixed(1));
  const commitmentRate = Number(((commitmentsThisMonth / salaryAmount) * 100).toFixed(1));
  const isHealthyBudget = projectedRemaining > (salaryAmount * 0.2);
  const daysUntilPayday = Math.ceil((paydayDay - new Date().getDate()) % 30);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('analytics')}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Smart Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>{t('smartInsights')}</Text>
          
          <View style={styles.insightCard}>
            <View style={[styles.insightHeader, { backgroundColor: isHealthyBudget ? colors.success + '20' : colors.error + '20' }]}>
              {isHealthyBudget ? 
                <TrendingUp size={20} color={colors.success} /> : 
                <AlertTriangle size={20} color={colors.error} />
              }
              <Text style={[styles.insightTitle, { color: isHealthyBudget ? colors.success : colors.error }]}>
                {isHealthyBudget ? t('healthyBudget') : t('budgetWarning')}
              </Text>
            </View>
            <Text style={styles.insightText}>
              {isHealthyBudget ? 
                t('goodSavingsRate') + ` (${savingsRate}%)` : 
                t('lowSavingsWarning') + ` (${savingsRate}%)`
              }
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <DollarSign size={16} color={colors.primary} />
              <Text style={styles.metricValue}>{commitmentRate}%</Text>
              <Text style={styles.metricLabel}>{t('commitmentRate')}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Target size={16} color={colors.success} />
              <Text style={styles.metricValue}>{savingsRate}%</Text>
              <Text style={styles.metricLabel}>{t('savingsRate')}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Calendar size={16} color={colors.warning} />
              <Text style={styles.metricValue}>{daysUntilPayday}</Text>
              <Text style={styles.metricLabel}>{t('daysToPayday')}</Text>
            </View>
          </View>
        </View>

        <MonthlyOverview />
        <PaymentTrends />
        <DebtsByCategory />
        
        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>{t('recommendations')}</Text>
          
          {commitmentRate > 70 && (
            <View style={styles.recommendationCard}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={styles.recommendationText}>
                {t('highCommitmentWarning')}
              </Text>
            </View>
          )}
          
          {savingsRate < 10 && (
            <View style={styles.recommendationCard}>
              <TrendingDown size={16} color={colors.error} />
              <Text style={styles.recommendationText}>
                {t('lowSavingsRecommendation')}
              </Text>
            </View>
          )}
          
          {isHealthyBudget && (
            <View style={styles.recommendationCard}>
              <TrendingUp size={16} color={colors.success} />
              <Text style={styles.recommendationText}>
                {t('goodBudgetAdvice')}
              </Text>
            </View>
          )}
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
    header: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'right',
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    insightsSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'right',
    },
    insightCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    insightHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 12,
      gap: 8,
    },
    insightTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
    },
    insightText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'right',
      lineHeight: 20,
    },
    metricsRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      gap: 12,
    },
    metricCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    metricValue: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginVertical: 8,
    },
    metricLabel: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    recommendationsSection: {
      marginTop: 24,
      marginBottom: 20,
    },
    recommendationCard: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      gap: 12,
    },
    recommendationText: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      textAlign: 'right',
      lineHeight: 20,
    },
  });
}