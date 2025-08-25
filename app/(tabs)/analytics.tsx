import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
} from 'lucide-react-native';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width: screenWidth } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock financial data
  const financialData = {
    salary: 1200.000,
    totalCommitments: 278.500,
    expectedRemaining: 921.500,
    savingsRate: 23.2,
    commitmentRate: 76.8,
    monthlyTrend: 5.2,
  };

  // Mock theme colors
  const colors = {
    background: '#f8f9fa',
    surface: '#ffffff',
    primary: '#007AFF',
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    text: '#212529',
    textSecondary: '#6c757d',
  };

  const styles = createStyles(colors);

  // Calculate smart insights using mock data
  const salaryAmount = financialData.salary;
  const commitmentsThisMonth = financialData.totalCommitments;
  const projectedRemaining = financialData.expectedRemaining;
  const paydayDay = 25;

  const savingsRate = Number(((projectedRemaining / salaryAmount) * 100).toFixed(1));
  const commitmentRate = Number(((commitmentsThisMonth / salaryAmount) * 100).toFixed(1));
  const isHealthyBudget = projectedRemaining > (salaryAmount * 0.2);
  const daysUntilPayday = Math.ceil((paydayDay - new Date().getDate()) % 30);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>التحليلات</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Smart Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>رؤى ذكية</Text>
          
          <View style={styles.insightCard}>
            <View style={[styles.insightHeader, { backgroundColor: isHealthyBudget ? colors.success + '20' : colors.error + '20' }]}>
              {isHealthyBudget ? 
                <TrendingUp size={20} color={colors.success} /> : 
                <AlertTriangle size={20} color={colors.error} />
              }
              <Text style={[styles.insightTitle, { color: isHealthyBudget ? colors.success : colors.error }]}>
                {isHealthyBudget ? 'ميزانية صحية' : 'تحذير الميزانية'}
              </Text>
            </View>
            <Text style={styles.insightText}>
              {isHealthyBudget ? 
                `معدل ادخار جيد (${savingsRate}%)` : 
                `معدل ادخار منخفض (${savingsRate}%)`
              }
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <DollarSign size={16} color={colors.primary} />
              <Text style={styles.metricValue}>{commitmentRate}%</Text>
              <Text style={styles.metricLabel}>معدل الالتزامات</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Target size={16} color={colors.success} />
              <Text style={styles.metricValue}>{savingsRate}%</Text>
              <Text style={styles.metricLabel}>معدل الادخار</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Calendar size={16} color={colors.warning} />
              <Text style={styles.metricValue}>{daysUntilPayday}</Text>
              <Text style={styles.metricLabel}>أيام للراتب</Text>
            </View>
          </View>
        </View>

        {/* Monthly Trends */}
        <View style={styles.trendsSection}>
          <Text style={styles.sectionTitle}>الاتجاهات الشهرية</Text>
          
          <View style={styles.trendCard}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              style={styles.trendHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <BarChart3 size={20} color="#fff" />
              <Text style={styles.trendHeaderText}>نظرة عامة شهرية</Text>
            </LinearGradient>
            
            <View style={styles.trendContent}>
              <View style={styles.trendRow}>
                <Text style={styles.trendLabel}>إجمالي الراتب</Text>
                <Text style={styles.trendValue}>{salaryAmount.toFixed(3)} د.ك</Text>
              </View>
              <View style={styles.trendRow}>
                <Text style={styles.trendLabel}>إجمالي الالتزامات</Text>
                <Text style={styles.trendValue}>{commitmentsThisMonth.toFixed(3)} د.ك</Text>
              </View>
              <View style={styles.trendRow}>
                <Text style={styles.trendLabel}>المتبقي المتوقع</Text>
                <Text style={[styles.trendValue, { color: colors.success }]}>{projectedRemaining.toFixed(3)} د.ك</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories Breakdown */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>تفصيل الفئات</Text>
          
          <View style={styles.categoryCard}>
            <View style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <CreditCard size={16} color={colors.primary} />
                <Text style={styles.categoryName}>قروض بنكية</Text>
              </View>
              <Text style={styles.categoryAmount}>160.000 د.ك</Text>
            </View>
            
            <View style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Activity size={16} color={colors.warning} />
                <Text style={styles.categoryName}>أقساط BNPL</Text>
              </View>
              <Text style={styles.categoryAmount}>85.500 د.ك</Text>
            </View>
            
            <View style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <DollarSign size={16} color={colors.error} />
                <Text style={styles.categoryName}>ديون شخصية</Text>
              </View>
              <Text style={styles.categoryAmount}>33.000 د.ك</Text>
            </View>
          </View>
        </View>
        
        {/* Recommendations */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>التوصيات</Text>
          
          {commitmentRate > 70 && (
            <View style={styles.recommendationCard}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={styles.recommendationText}>
                معدل الالتزامات مرتفع. يُنصح بمراجعة النفقات وتقليل الالتزامات الجديدة.
              </Text>
            </View>
          )}
          
          {savingsRate < 10 && (
            <View style={styles.recommendationCard}>
              <TrendingDown size={16} color={colors.error} />
              <Text style={styles.recommendationText}>
                معدل الادخار منخفض. حاول زيادة المبلغ المدخر شهرياً.
              </Text>
            </View>
          )}
          
          {isHealthyBudget && (
            <View style={styles.recommendationCard}>
              <TrendingUp size={16} color={colors.success} />
              <Text style={styles.recommendationText}>
                ميزانيتك في حالة جيدة! فكر في استثمار الفائض أو زيادة الادخار.
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
    trendsSection: {
      marginBottom: 24,
    },
    trendCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    trendHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      padding: 16,
      gap: 8,
    },
    trendHeaderText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: '#fff',
    },
    trendContent: {
      padding: 16,
    },
    trendRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    trendLabel: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
    trendValue: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    categoriesSection: {
      marginBottom: 24,
    },
    categoryCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoryRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    categoryInfo: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
    },
    categoryName: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
    },
    categoryAmount: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
  });
}