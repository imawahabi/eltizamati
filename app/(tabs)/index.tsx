import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Animated, Image, StatusBar } from 'react-native';
 
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import TabNavigation from '@/components/TabNavigation';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CreditCard, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  DollarSign,
  PieChart,
  BarChart3,
  FileText,
  PiggyBank,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react-native';
import { router } from 'expo-router';
import { formatCurrency, formatNumber, getCurrency, formatAmountWithDecimals } from '@/lib/formatting';
import AppIcon from '@/assets/images/icon.png';

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useTranslation();
  const { isRTL, textAlign, flexDirection } = useLayout();
  const { 
    salaryAmount, 
    commitmentsThisMonth, 
    savingsTarget, 
    projectedRemaining, 
    alerts,
    paydayDay 
  } = useDashboard();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  // Used only for initial entrance of list/grid items
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  // Used for balance reveal animation to avoid moving other sections
  const balanceAnim = React.useRef(new Animated.Value(0)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleBalanceVisibility = () => {
    Animated.timing(balanceAnim, {
      toValue: showBalance ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
    setShowBalance(!showBalance);
  };

  useEffect(() => {
    // Run entrance animation for grid items
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true
    }).start();
    // Set initial balance animation state corresponding to showBalance
    balanceAnim.setValue(showBalance ? 1 : 0);
  }, []);

  // Enhanced financial data
  const financialData = {
    totalDebt: 5000,
    monthlyPayments: 800,
    debtFreeDate: '2025-12-15',
    paymentStrategy: 'avalanche' as const,
    savingsOpportunity: 150,
    upcomingPayments: 3,
    overduePayments: 1,
    monthlyIncome: salaryAmount,
    monthlyExpenses: commitmentsThisMonth,
    savingsRate: ((salaryAmount - commitmentsThisMonth) / salaryAmount) * 100,
    debtToIncomeRatio: (800 / salaryAmount) * 100,
  };

  const quickStats = [
    {
      id: 'income',
      title: t('monthlyIncome'),
      value: salaryAmount,
      change: '+2.5%',
      trend: 'up' as const,
      icon: <Wallet size={20} color={colors.success} />,
      color: colors.success
    },
    {
      id: 'expenses',
      title: t('monthlyExpenses'),
      value: commitmentsThisMonth,
      change: '-1.2%',
      trend: 'down' as const,
      icon: <CreditCard size={20} color={colors.warning} />,
      color: colors.warning
    },
    {
      id: 'savings',
      title: t('monthlySavings'),
      value: projectedRemaining,
      change: '+5.8%',
      trend: 'up' as const,
      icon: <PiggyBank size={20} color={colors.primary} />,
      color: colors.primary
    },
    {
      id: 'debt',
      title: t('totalDebt'),
      value: financialData.totalDebt,
      change: '-3.4%',
      trend: 'down' as const,
      icon: <TrendingDown size={20} color={colors.error} />,
      color: colors.error
    }
  ];

  const smartInsights = [
    {
      id: 'savings-rate',
      title: t('savingsRate'),
      value: `${Math.round(financialData.savingsRate)}%`,
      description: t('savingsRateDesc'),
      status: financialData.savingsRate > 20 ? 'excellent' : financialData.savingsRate > 10 ? 'good' : 'needs-improvement',
      icon: <Target size={24} color={colors.primary} />
    },
    {
      id: 'debt-ratio',
      title: t('debtToIncomeRatio'),
      value: `${Math.round(financialData.debtToIncomeRatio)}%`,
      description: t('debtRatioDesc'),
      status: financialData.debtToIncomeRatio < 20 ? 'excellent' : financialData.debtToIncomeRatio < 36 ? 'good' : 'needs-improvement',
      icon: <AlertTriangle size={24} color={colors.warning} />
    },
    {
      id: 'payment-efficiency',
      title: t('paymentEfficiency'),
      value: '87%',
      description: t('paymentEfficiencyDesc'),
      status: 'good',
      icon: <CheckCircle size={24} color={colors.success} />
    }
  ];

  const styles = createStyles(colors, isRTL);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.primary}
        translucent={false}
      />
      
      {/* Header with S-curve design inspired by the blog */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={styles.iconWrapper}>
              <Image source={AppIcon} style={styles.appIcon} />
            </View>
            <View style={styles.appTitleContainer}>
              <Text style={styles.appName}>التزاماتي</Text>
              <Text style={styles.appSlogan}>إدارة ذكية للأموال</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => router.push('/(tabs)/operations')}
          >
            <FileText size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main content with curved design */}
      <View style={styles.mainContent}>
        <View style={styles.fixedRight} />
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: 12, paddingTop: 0 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Integrated Header with Balance */}
        <Card style={styles.headerCard}>
          {/* Header Section */}
          <View style={styles.headerContent}>
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <View style={styles.iconWrapper}>
                  <Image 
                    source={AppIcon}
                    style={styles.appIcon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.appTitleContainer}>
                  <View style={styles.appTitleWithIcon}>
                    <CreditCard size={24} color={colors.primary} />
                    <Text style={styles.appName}>التزاماتي</Text>
                  </View>
                  <Text style={styles.appSlogan}>نظم التزاماتك المالية بذكاء</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.balanceVisibilityToggle}
                onPress={toggleBalanceVisibility}
              >
                {showBalance ? 
                  <Eye size={22} color={colors.primary} /> : 
                  <EyeOff size={22} color={colors.textSecondary} />
                }
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfoWithIcon}>
                <View style={styles.balanceIconContainer}>
                  <Wallet size={20} color={colors.primary} />
                </View>
                <Text style={styles.balanceTitle}>الرصيد المتاح</Text>
                <View style={styles.balanceValueWrapper}>
                  <View style={styles.balanceAmountContainer}>
                    <View style={styles.numericGroup}>
                      <Text style={[styles.balanceAmount, !showBalance && styles.invisibleText]}>
                        {formatNumber(Math.floor(projectedRemaining), language)}
                      </Text>
                      {(projectedRemaining % 1) !== 0 ? (
                        <Text style={[styles.balanceDecimal, !showBalance && styles.invisibleText]}>
                          .{Math.round((projectedRemaining % 1) * 100).toString().padStart(2, '0')}
                        </Text>
                      ) : (
                        <Text style={[styles.balanceDecimal, styles.invisibleText]}>.00</Text>
                      )}
                    </View>
                    <Text style={[styles.balanceCurrency, !showBalance && styles.invisibleText]}>د.ك</Text>
                  </View>
                  {!showBalance && (
                    <View style={styles.balanceMaskOverlay}>
                      <Text style={styles.balanceAmount}>••••••••</Text>
                      <Text style={styles.balanceCurrency}>د.ك</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <Animated.View style={{
              transform: [{
                scale: balanceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1]
                })
              }]
            }}>
              <View style={styles.balanceProgress}>
                <ProgressBar
                  progress={(projectedRemaining / salaryAmount) * 100}
                  height={6}
                  color={colors.primary}
                  backgroundColor={colors.border}
                />
              </View>
            </Animated.View>
          </View>
        </Card>

        {/* Financial Metrics */}
        <View style={styles.financialOverview}>

          {/* Financial Metrics Grid */}
          <View style={styles.metricsRow}>
            {/* Monthly Commitments */}
            <Card style={styles.metricCard}>
              <LinearGradient
                colors={[colors.warning + '15', colors.warning + '08']}
                style={styles.metricGradient}
              >
                <View style={styles.centeredMetricContent}>
                  <View style={styles.metricIconWrapper}>
                    <Calendar size={24} color={colors.warning} />
                  </View>
                  <View style={styles.metricValueWrapper}>
                    <View style={styles.metricValueContainer}>
                      <View style={styles.numericGroup}>
                        <Text style={[styles.metricValue, !showBalance && styles.invisibleText]}>
                          {formatNumber(commitmentsThisMonth, language)}
                        </Text>
                      </View>
                      <Text style={[styles.metricCurrency, !showBalance && styles.invisibleText]}>د.ك</Text>
                    </View>
                    {!showBalance && (
                      <View style={styles.metricMaskOverlay}>
                        <Text style={styles.metricValue}>••••</Text>
                        <Text style={styles.metricCurrency}>د.ك</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.metricTitle}>الأقساط الشهرية</Text>
                  <View style={styles.metricIndicator}>
                    <View style={[styles.indicatorDot, { backgroundColor: colors.warning }]} />
                    <Text style={styles.indicatorText}>مستحق هذا الشهر</Text>
                  </View>
                </View>
              </LinearGradient>
            </Card>

            {/* Total Debt */}
            <Card style={styles.metricCard}>
              <LinearGradient
                colors={[colors.error + '15', colors.error + '08']}
                style={styles.metricGradient}
              >
                <View style={styles.centeredMetricContent}>
                  <View style={styles.metricIconWrapper}>
                    <CreditCard size={24} color={colors.error} />
                  </View>
                  <View style={styles.metricValueWrapper}>
                    <View style={styles.metricValueContainer}>
                      <View style={styles.numericGroup}>
                        <Text style={[styles.metricValue, !showBalance && styles.invisibleText]}>
                          {formatNumber(financialData.totalDebt, language)}
                        </Text>
                      </View>
                      <Text style={[styles.metricCurrency, !showBalance && styles.invisibleText]}>د.ك</Text>
                    </View>
                    {!showBalance && (
                      <View style={styles.metricMaskOverlay}>
                        <Text style={styles.metricValue}>••••</Text>
                        <Text style={styles.metricCurrency}>د.ك</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.metricTitle}>إجمالي الديون</Text>
                  <View style={styles.metricIndicator}>
                    <View style={[styles.indicatorDot, { backgroundColor: colors.error }]} />
                    <Text style={styles.indicatorText}>المبلغ الكلي</Text>
                  </View>
                </View>
              </LinearGradient>
            </Card>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.quickStatsGrid}>
          {quickStats.map((stat, index) => (
            <Animated.View
              key={stat.id}
              style={[
                styles.quickStatCard,
                {
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0]
                    })
                  }]
                }
              ]}
            >
              <Card style={styles.statCard}>
                <View style={styles.statHeader}>
                  {stat.icon}
                  <Badge 
                    variant={stat.trend === 'up' ? 'success' : 'error'} 
                    size="small"
                    style={styles.trendBadge}
                  >
                    {stat.change}
                  </Badge>
                </View>
                <View style={styles.statValueWrapper}>
                  <View style={styles.statValueContainer}>
                    <View style={styles.numericGroup}>
                      <Text style={[styles.statValue, !showBalance && styles.invisibleText]}>
                        {formatNumber(Math.floor(stat.value), language)}
                      </Text>
                      {(stat.value % 1 !== 0) ? (
                        <Text style={[styles.statDecimal, !showBalance && styles.invisibleText]}>
                          .{Math.round((stat.value % 1) * 100).toString().padStart(2, '0')}
                        </Text>
                      ) : (
                        <Text style={[styles.statDecimal, styles.invisibleText]}>.00</Text>
                      )}
                    </View>
                    <Text style={[styles.statCurrency, !showBalance && styles.invisibleText]}>د.ك</Text>
                  </View>
                  {!showBalance && (
                    <View style={styles.maskOverlay}>
                      <Text style={styles.statValue}>••••••</Text>
                      <Text style={styles.statCurrency}>د.ك</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.statLabel}>{stat.title}</Text>
                <View style={styles.statProgress}>
                  <ProgressBar
                    progress={Math.random() * 100}
                    height={4}
                    color={stat.color}
                  />
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>

        {/* Financial Intelligence Section */}
        <View style={styles.insightsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithIcon}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>الذكاء المالي</Text>
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/analytics')}
            >
              <Text style={styles.seeAllText}>{t('seeAll')}</Text>
              {isRTL ? 
                <ArrowLeft size={16} color={colors.primary} /> :
                <ArrowRight size={16} color={colors.primary} />
              }
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.insightsScroll}
          >
            {smartInsights.map((insight) => (
              <Card key={insight.id} style={styles.enhancedInsightCard}>
                <LinearGradient
                  colors={[
                    insight.status === 'excellent' ? colors.success + '10' : 
                    insight.status === 'good' ? colors.warning + '10' : colors.error + '10',
                    'transparent'
                  ]}
                  style={styles.insightGradient}
                >
                  <View style={styles.insightHeader}>
                    <View style={styles.insightIconContainer}>
                      {insight.icon}
                    </View>
                    <Badge 
                      variant={insight.status === 'excellent' ? 'success' : 
                              insight.status === 'good' ? 'warning' : 'error'}
                      size="small"
                    >
                      {t(insight.status)}
                    </Badge>
                  </View>
                  <Text style={styles.insightValue}>{insight.value}</Text>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                  <View style={styles.insightProgressBar}>
                    <ProgressBar
                      progress={insight.status === 'excellent' ? 90 : insight.status === 'good' ? 65 : 35}
                      height={4}
                      color={insight.status === 'excellent' ? colors.success : 
                             insight.status === 'good' ? colors.warning : colors.error}
                    />
                  </View>
                </LinearGradient>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Recent & Upcoming Payments */}
        <View style={styles.paymentsSection}>
          {/* Recent Payments */}
          <Card style={styles.recentPaymentsCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWithIcon}>
                <Clock size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>أخر المدفوعات</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/operations')}>
                <Text style={[styles.seeAllText, { fontFamily: 'Cairo-Medium' }]}>عرض الكل</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.paymentsList}>
              {[
                { name: 'بنك الكويت الوطني', amount: 250, date: '2024/09/15', status: 'paid' },
                { name: 'تابي', amount: 150, date: '2024/09/12', status: 'paid' }
              ].map((payment, index) => (
                <View key={index} style={styles.paymentItem}>
                  <View style={[styles.paymentIcon, { backgroundColor: colors.success + '20' }]}>
                    <CheckCircle size={16} color={colors.success} />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{payment.name}</Text>
                    <Text style={styles.paymentDate}>تم الدفع في {payment.date}</Text>
                  </View>
                  <View style={styles.paymentAmountContainer}>
                    <Text style={styles.paymentAmount}>
                      {formatNumber(payment.amount, language)}
                    </Text>
                    <Text style={styles.paymentCurrency}>د.ك</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Upcoming Payments */}
          <Card style={styles.upcomingCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleWithIcon}>
                <Clock size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>الأقساط القادمة</Text>
              </View>
              <Badge variant="warning" size="small">
                3 مستحقة
              </Badge>
            </View>
            
            <View style={styles.paymentsList}>
              {[
                { name: 'بطاقة ائتمان NBK', amount: 300, daysLeft: 2, priority: 'high' },
                { name: 'تقسيط السيارة', amount: 450, daysLeft: 5, priority: 'medium' },
                { name: 'تابي - متجر إكسترا', amount: 120, daysLeft: 7, priority: 'low' }
              ].map((payment, index) => (
                <View key={index} style={styles.paymentItem}>
                  <View style={[
                    styles.paymentIcon, 
                    { backgroundColor: payment.priority === 'high' ? colors.error + '20' : colors.warning + '20' }
                  ]}>
                    <Clock size={16} color={payment.priority === 'high' ? colors.error : colors.warning} />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{payment.name}</Text>
                    <Text style={[
                      styles.paymentDate,
                      { color: payment.priority === 'high' ? colors.error : colors.textSecondary }
                    ]}>
                      مستحق خلال {payment.daysLeft} أيام
                    </Text>
                  </View>
                  <View style={styles.paymentAmountContainer}>
                    <Text style={styles.paymentAmount}>
                      {formatNumber(payment.amount, language)}
                    </Text>
                    <Text style={styles.paymentCurrency}>د.ك</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <Button
                  // ... (rest of the code remains the same)
              title="عرض جميع العمليات"
              variant="outlined"
              size="medium"
              onPress={() => router.push('/(tabs)/operations')}
              style={styles.viewAllButton}
            />
          </Card>
        </View>

        {/* Tabbed Navigation Section for Records */}
        <Card style={styles.tabNavigationCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWithIcon}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>السجلات المالية</Text>
            </View>
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => {
                // Navigate to full TabNavigation screen
                router.push({
                  pathname: '/(tabs)/records',
                  params: { tab: 'payments' }
                });
              }}
            >
              <Text style={styles.expandButtonText}>عرض الكل</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <TabNavigation />
        </Card>

        {/* Financial Summary Footer */}
        <Card style={styles.summaryFooterCard}>
          <LinearGradient
            colors={[colors.primary + '08', colors.primary + '15', colors.primary + '08']}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconContainer}>
                <Star size={24} color={colors.primary} />
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryTitle}>ملخص مالي ذكي</Text>
                <Text style={styles.summarySubtitle}>نظرة شاملة على وضعك المالي</Text>
              </View>
            </View>
            
            <View style={styles.summaryMetrics}>
              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>{Math.round(financialData.savingsRate)}%</Text>
                <Text style={styles.summaryMetricLabel}>معدل الادخار</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>{financialData.upcomingPayments}</Text>
                <Text style={styles.summaryMetricLabel}>أقساط قادمة</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>87%</Text>
                <Text style={styles.summaryMetricLabel}>كفاءة الدفع</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.summaryActionButton}
              onPress={() => router.push('/(tabs)/analytics')}
            >
              <Text style={styles.summaryActionText}>عرض التحليل التفصيلي</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </Card>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      </View>
      </View>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerAction: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    mainContent: {
      flex: 1,
      position: 'relative',
    },
    fixedRight: {
      backgroundColor: colors.primary,
      position: 'absolute',
      right: 0,
      height: 40,
      width: 40,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopRightRadius: 30,
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    tabNavigationCard: {
      marginBottom: 24,
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    expandButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.primary + '15',
    },
    expandButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      fontFamily: 'Cairo-SemiBold',
    },
    sectionTitleWithIcon: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 8,
    },
    
    // Header Card Styles
    headerCard: {
      marginTop: 8,
      marginBottom: 20,
      padding: 24,
      borderRadius: 20,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    balanceSection: {
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    headerContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    logoSection: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      flex: 1,
    },
    logoContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 16,
      marginLeft: isRTL ? 16 : 0,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    appIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
    },
    appTitleContainer: {
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    appTitleWithIcon: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 8,
    },
    appName: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      fontFamily: 'Cairo-ExtraBold',
      textAlign: isRTL ? 'right' : 'left',
    },
    appSlogan: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
      marginTop: 2,
      textAlign: isRTL ? 'right' : 'left',
    },
    appSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
      marginTop: 2,
      textAlign: isRTL ? 'right' : 'left',
    },
    headerActions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 12,
    },
    balanceDecimal: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.textSecondary,
      fontFamily: 'Cairo-Bold',
    },
    balanceCurrency: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Cairo-SemiBold',
      marginLeft: 6,
    },
    statCard: {
      padding: 20,
      borderRadius: 18,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    },
    balanceHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    balanceInfoWithIcon: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 12,
    },
    balanceInfoBlock: {
      marginLeft: 12,
    },
    balanceLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
      marginTop: 2,
    },
    balanceTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Cairo-Bold',
      textAlign: isRTL ? 'right' : 'left',
    },
    balanceSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
      marginTop: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
    balanceVisibilityToggle: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.primary + '15',
    },
    balanceIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    balanceAmount: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      fontFamily: 'Cairo-ExtraBold',
    },
    balanceProgress: {
      marginTop: 12,
    },
    
    // Financial Metrics Styles
    financialOverview: {
      marginBottom: 24,
    },
    metricsRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
    },
    metricCard: {
      width: (screenWidth - 56) / 2,
      padding: 0,
      overflow: 'hidden',
    },
    metricGradient: {
      padding: 20,
      borderRadius: 16,
      height: 190,
    },
    metricIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    centeredMetricContent: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    metricValueContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: 8,
      gap: 4,
      flexWrap: 'nowrap',
    },
    metricValueWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 32,
    },
    metricMaskOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricValue: {
      fontSize: 24,
      lineHeight: 28,
      fontWeight: '800',
      color: colors.text,
      fontFamily: 'Cairo-ExtraBold',
      textAlign: 'center',
    },
    metricCurrency: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Cairo-SemiBold',
    },
    metricTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Cairo-SemiBold',
      textAlign: 'center',
      marginBottom: 8,
    },
    metricIndicator: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    indicatorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    indicatorText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
    },
    trendBadge: {
      minWidth: 50,
    },
    
    // Payment Items
    paymentItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 8,
      marginHorizontal: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    paymentIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Cairo-SemiBold',
      marginBottom: 2,
      textAlign: isRTL ? 'right' : 'left',
    },
    paymentSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
      textAlign: isRTL ? 'right' : 'left',
    },
    paymentAmount: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Cairo-Bold',
      textAlign: isRTL ? 'left' : 'right',
    },
    paymentCurrency: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Cairo-SemiBold',
    },
    statValueContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: 4,
      gap: 4,
      minHeight: 24,
      flexWrap: 'nowrap',
    },
    balanceValueWrapper: {
      position: 'relative',
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceMaskOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceAmountContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 6,
    },
    numericGroup: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    invisibleText: {
      opacity: 0,
    },
    // Quick Stats Styles
    quickStatsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    quickStatCard: {
      width: (screenWidth - 56) / 2,
      marginBottom: 16,
    },
    statCard: {
      padding: 20,
      borderRadius: 18,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
      minHeight: 180,
      justifyContent: 'space-between',
    },
    statHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValueWrapper: {
      position: 'relative',
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    maskOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 22,
      lineHeight: 28,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    statDecimal: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    statCurrency: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      fontFamily: 'Cairo-SemiBold',
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    statProgress: {
      marginTop: 8,
    },
    
    // Section Spacing
    paymentsSection: {
      marginBottom: 32,
    },

    // Insights Section
    insightsSection: {
      marginBottom: 24,
      paddingHorizontal: isRTL ? 0 : 0,
    },
    insightCard: {
      marginBottom: 12,
      marginHorizontal: 8,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    insightGradient: {
      padding: 20,
      borderRadius: 16,
    },
    insightHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    insightIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    insightContent: {
      flex: 1,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Cairo-Bold',
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    insightDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
      lineHeight: 18,
      textAlign: isRTL ? 'right' : 'left',
    },
    insightProgress: {
      marginTop: 12,
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    insightProgressFill: {
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 3,
    },
    sectionHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      fontFamily: 'Cairo-Bold',
      textAlign: isRTL ? 'right' : 'left',
    },
    viewAllButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.primary + '15',
    },
    viewAllText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      fontFamily: 'Cairo-SemiBold',
      marginRight: isRTL ? 0 : 4,
      marginLeft: isRTL ? 4 : 0,
    },
    seeAllText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      fontFamily: 'Cairo-SemiBold',
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    seeAllButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 4,
      amountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
      },
      currencyText: {
        fontSize: 12,
        fontFamily: 'Cairo-Medium',
        color: colors.textSecondary,
      },
      decimalText: {
        fontSize: 14,
        fontFamily: 'Cairo-Bold',
        color: colors.text,
      },
    },
    insightsScroll: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    insightCard: {
      width: 200,
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
      padding: 16,
    },
    enhancedInsightCard: {
      width: 220,
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
      padding: 0,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    insightGradient: {
      padding: 20,
      borderRadius: 16,
    },
    insightIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    insightProgressBar: {
      marginTop: 12,
    },
    insightHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    insightValue: {
      fontSize: 28,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    insightTitle: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    insightDescription: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
      lineHeight: 16,
    },

    // Upcoming Payments
    upcomingCard: {
      marginTop: 24,
      marginBottom: 24,
      padding: 16,
    },
    paymentsList: {
      gap: 12,
      marginBottom: 16,
    },
    paymentItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
    },
    paymentIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.warningLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentName: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    paymentDate: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
    },
    paymentAmountContainer: {
      alignItems: 'center',
    },
    paymentAmount: {
      fontSize: 14,
      fontFamily: 'Cairo-Bold',
      color: colors.warning,
      textAlign: 'center',
    },
    paymentCurrency: {
      fontSize: 10,
      fontFamily: 'Cairo-Medium',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 2,
    },
    viewAllButton: {
      marginTop: 8,
    },

    // Quick Actions
    quickActionsCard: {
      marginBottom: 32,
      padding: 20,
      borderRadius: 16,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginTop: 16,
    },
    quickActionButton: {
      width: (screenWidth - 72) / 2,
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontFamily: 'Cairo-Medium',
      color: colors.text,
      textAlign: 'center',
    },

    bottomSpacing: {
      height: 0,
    },
    
    // Quick Actions (if needed)
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    quickActionItem: {
      width: (screenWidth - 72) / 4,
      alignItems: 'center',
      padding: 12,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontFamily: 'Cairo-Medium',
      color: colors.text,
      textAlign: 'center',
    },

    // Summary Footer Styles
    summaryFooterCard: {
      marginBottom: 12,
      padding: 0,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
      borderRadius: 20,
    },
    summaryGradient: {
      padding: 24,
      borderRadius: 20,
    },
    summaryHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    summaryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 16,
      marginLeft: isRTL ? 16 : 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    summaryTextContainer: {
      flex: 1,
    },
    summaryTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    summarySubtitle: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
    },
    summaryMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    summaryMetric: {
      alignItems: 'center',
      flex: 1,
    },
    summaryMetricValue: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 4,
    },
    summaryMetricLabel: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    summaryDivider: {
      width: 1,
      height: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginHorizontal: 16,
    },
    summaryActionButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      gap: 8,
    },
    summaryActionText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.primary,
    },
  });
}
