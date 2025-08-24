import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Calendar } from 'lucide-react-native';

interface InsightData {
  totalDebt: number;
  monthlyPayments: number;
  debtFreeDate: string;
  paymentStrategy: 'avalanche' | 'snowball' | 'hybrid';
  savingsOpportunity: number;
  upcomingPayments: number;
  overduePayments: number;
}

interface SmartInsightsProps {
  data: InsightData;
}

export function SmartInsights({ data }: SmartInsightsProps) {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { isRTL, textAlign } = useLayout();
  
  const styles = createStyles(colors, isRTL);
  
  const debtProgress = Math.max(0, 100 - (data.totalDebt / 10000) * 100); // Mock calculation
  
  const insights = [
    {
      id: 'debt-progress',
      title: t('debtProgress'),
      value: `${Math.round(debtProgress)}%`,
      subtitle: t('towardsDebtFree'),
      icon: <Target size={20} color={colors.primary} />,
      trend: 'up' as const,
      color: 'success' as const,
    },
    {
      id: 'monthly-savings',
      title: t('monthlySavings'),
      value: `${data.savingsOpportunity} ${t('kwd')}`,
      subtitle: t('withOptimization'),
      icon: <TrendingUp size={20} color={colors.success} />,
      trend: 'up' as const,
      color: 'success' as const,
    },
    {
      id: 'debt-free-date',
      title: t('debtFreeDate'),
      value: data.debtFreeDate,
      subtitle: t('currentPace'),
      icon: <Calendar size={20} color={colors.warning} />,
      trend: 'neutral' as const,
      color: 'warning' as const,
    },
  ];
  
  const alerts = [
    ...(data.overduePayments > 0 ? [{
      id: 'overdue',
      type: 'error' as const,
      title: t('overduePayments'),
      message: t('overduePaymentsMessage', { count: data.overduePayments }),
      icon: <AlertTriangle size={16} color={colors.error} />,
    }] : []),
    ...(data.upcomingPayments > 0 ? [{
      id: 'upcoming',
      type: 'warning' as const,
      title: t('upcomingPayments'),
      message: t('upcomingPaymentsMessage', { count: data.upcomingPayments }),
      icon: <Calendar size={16} color={colors.warning} />,
    }] : []),
    {
      id: 'strategy',
      type: 'info' as const,
      title: t('recommendedStrategy'),
      message: t('strategyRecommendation', { strategy: t(data.paymentStrategy) }),
      icon: <CheckCircle size={16} color={colors.primary} />,
    },
  ];
  
  return (
    <View style={styles.container}>
      {/* Progress Overview */}
      <Card style={styles.progressCard}>
        <Text style={styles.sectionTitle}>{t('debtOverview')}</Text>
        <ProgressBar
          progress={debtProgress}
          height={12}
          showLabel={true}
          label={`${Math.round(debtProgress)}% ${t('complete')}`}
          style={styles.progressBar}
        />
        <View style={styles.progressStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{data.totalDebt} {t('kwd')}</Text>
            <Text style={styles.statLabel}>{t('totalDebt')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{data.monthlyPayments} {t('kwd')}</Text>
            <Text style={styles.statLabel}>{t('monthlyPayments')}</Text>
          </View>
        </View>
      </Card>
      
      {/* Key Insights */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.insightsScroll}
        contentContainerStyle={styles.insightsContainer}
      >
        {insights.map((insight) => (
          <Card key={insight.id} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              {insight.icon}
              <Badge variant={insight.color} size="small">
                {insight.trend === 'up' ? '↗' : insight.trend === 'down' ? '↘' : '→'}
              </Badge>
            </View>
            <Text style={styles.insightValue}>{insight.value}</Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightSubtitle}>{insight.subtitle}</Text>
          </Card>
        ))}
      </ScrollView>
      
      {/* Smart Alerts */}
      <View style={styles.alertsContainer}>
        <Text style={styles.sectionTitle}>{t('smartAlerts')}</Text>
        {alerts.map((alert) => (
          <Card key={alert.id} style={[styles.alertCard, styles[`${alert.type}Alert`]]}>
            <View style={styles.alertContent}>
              <View style={styles.alertIcon}>
                {alert.icon}
              </View>
              <View style={styles.alertText}>
                <Text style={[styles.alertTitle, styles[`${alert.type}AlertText`]]}>
                  {alert.title}
                </Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    
    // Progress Card
    progressCard: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    progressBar: {
      marginBottom: 16,
    },
    progressStats: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-around',
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'center',
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    
    // Insights Scroll
    insightsScroll: {
      marginBottom: 16,
    },
    insightsContainer: {
      paddingHorizontal: 0,
      gap: 12,
    },
    insightCard: {
      width: 160,
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    insightHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    insightValue: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: 4,
    },
    insightTitle: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: 2,
    },
    insightSubtitle: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
    },
    
    // Alerts
    alertsContainer: {
      flex: 1,
    },
    alertCard: {
      marginBottom: 8,
      borderLeftWidth: isRTL ? 0 : 4,
      borderRightWidth: isRTL ? 4 : 0,
    },
    errorAlert: {
      borderLeftColor: isRTL ? 'transparent' : colors.error,
      borderRightColor: isRTL ? colors.error : 'transparent',
      backgroundColor: colors.errorLight,
    },
    warningAlert: {
      borderLeftColor: isRTL ? 'transparent' : colors.warning,
      borderRightColor: isRTL ? colors.warning : 'transparent',
      backgroundColor: colors.warningLight,
    },
    infoAlert: {
      borderLeftColor: isRTL ? 'transparent' : colors.primary,
      borderRightColor: isRTL ? colors.primary : 'transparent',
      backgroundColor: colors.primaryLight,
    },
    alertContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    },
    alertIcon: {
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
      marginTop: 2,
    },
    alertText: {
      flex: 1,
    },
    alertTitle: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    errorAlertText: {
      color: colors.error,
    },
    warningAlertText: {
      color: colors.warning,
    },
    infoAlertText: {
      color: colors.primary,
    },
    alertMessage: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
      lineHeight: 16,
    },
  });
}
