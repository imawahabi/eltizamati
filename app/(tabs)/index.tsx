import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboard } from '@/hooks/useDashboard';
import { getFinancialSummary, getUpcomingPayments, getUserData } from '@/lib/database';
import SmartPaymentModal from '@/components/SmartPaymentModal';
import AddCommitmentWizard from '@/components/AddCommitmentWizard';
import CommitmentsList from '@/components/CommitmentsList';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Extended Design Tokens with missing shades
const ExtendedColors = {
  ...Colors,
  primary: {
    ...Colors.primary,
    50: '#EFF6FF',
    400: '#60A5FA',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
  },
  success: {
    ...Colors.success,
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    ...Colors.warning,
    600: '#D97706',
  },
  danger: {
    ...Colors.danger,
    400: '#F87171',
    600: '#DC2626',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
  },
  muted: {
    ...Colors.muted,
    200: '#E5E7EB',
    400: '#9CA3AF',
    500: '#6B7280',
  },
  secondary: '#8B5CF6',
  background: Colors.bg,
  white: '#FFFFFF',
};

// Extended Typography with missing sizes
const ExtendedTypography = {
  ...Typography,
  family: {
    regular: Typography.fontFamily,
    medium: 'Cairo-Medium',
    semibold: 'Cairo-SemiBold',
    bold: 'Cairo-Bold',
  },
  sizes: {
    ...Typography.sizes,
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 36,
    '5xl': 40,
  },
};

// Extended Border Radius
const ExtendedBorderRadius = {
  ...BorderRadius,
  full: 9999,
  '2xl': 24,
};

interface FinancialSummary {
  salary: number;
  totalCommitments: number;
  monthlyPayments: number;
  completedPayments: number;
  upcomingPayments: number;
  remainingBalance: number;
  savingsTarget?: number;
  currentSavings?: number;
  debtTotal?: number;
  creditUtilization?: number;
}

interface UpcomingPayment {
  id: number;
  commitment_id?: number;
  creditor_name: string;
  amount: number;
  due_date: string;
  status: string;
  type: string;
  category?: string;
  overdueDays?: number;
}

interface FinancialHealth {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [commitmentsByCategory, setCommitmentsByCategory] = useState<any>({});
  const [userData, setUserData] = useState<any>(null);
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [addPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
  const [addCommitmentWizardVisible, setAddCommitmentWizardVisible] = useState(false);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'payments' | 'analytics'>('overview');
  
  // Animation values
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summary, payments, user] = await Promise.all([
        getFinancialSummary(),
        getUpcomingPayments(10),
        getUserData()
      ]);
      
      
      // Process and enhance data
      const enhancedSummary = {
        ...summary,
        savingsTarget: summary?.salary ? summary.salary * 0.2 : 0,
        currentSavings: summary?.remainingBalance || 0,
        debtTotal: summary?.totalCommitments || 0,
        creditUtilization: summary?.salary ? ((summary?.totalCommitments || 0) / summary.salary) * 100 : 0,
      } as FinancialSummary;
      
      setFinancialSummary(enhancedSummary);
      setUpcomingPayments(payments as UpcomingPayment[]);
      setUserData(user);
      
      // Mock recent payments for now
      setRecentPayments([]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculate financial health score
  const calculateFinancialHealth = useCallback((): FinancialHealth => {
    if (!financialSummary) {
      return { score: 0, level: 'poor', recommendations: [] };
    }
    
    const dti = (financialSummary.totalCommitments / (financialSummary.salary || 1)) * 100;
    const savingsRate = ((financialSummary.currentSavings || 0) / (financialSummary.salary || 1)) * 100;
    
    let score = 100;
    const recommendations = [];
    
    // DTI scoring (40 points max)
    if (dti <= 25) score -= 0;
    else if (dti <= 40) score -= 15;
    else if (dti <= 50) score -= 25;
    else score -= 40;
    
    // Savings scoring (30 points max)
    if (savingsRate >= 20) score -= 0;
    else if (savingsRate >= 10) score -= 10;
    else if (savingsRate >= 5) score -= 20;
    else score -= 30;
    
    // Payment history (30 points max)
    const onTimeRate = financialSummary.completedPayments > 0 ? 90 : 100; // Mock for now
    if (onTimeRate >= 95) score -= 0;
    else if (onTimeRate >= 85) score -= 10;
    else if (onTimeRate >= 75) score -= 20;
    else score -= 30;
    
    // Generate recommendations
    if (dti > 40) {
      recommendations.push('نسبة الديون مرتفعة - حاول تقليل الالتزامات الجديدة');
    }
    if (savingsRate < 10) {
      recommendations.push('معدل الادخار منخفض - استهدف توفير 10-20% من الراتب');
    }
    if (upcomingPayments.filter(p => p.status === 'overdue').length > 0) {
      recommendations.push('لديك دفعات متأخرة - أولوية السداد العاجل');
    }
    
    let level: FinancialHealth['level'] = 'poor';
    if (score >= 80) level = 'excellent';
    else if (score >= 65) level = 'good';
    else if (score >= 50) level = 'fair';
    
    return { score, level, recommendations };
  }, [financialSummary, upcomingPayments]);

  const handlePaymentPress = (commitmentId: number) => {
    setSelectedCommitmentId(commitmentId);
    setAddPaymentModalVisible(true);
  };

  const handleCommitmentPress = (commitment: any) => {
    // Navigate to commitments tab with selected item
    router.push('/commitments');
  };

  const formatCurrency = useCallback((amount: number, hideSymbol = false) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
    return hideSymbol ? formatted : `${formatted} د.ك`;
  }, []);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  }, []);
  
  const formatPercentage = useCallback((value: number) => {
    return `${Math.round(value)}%`;
  }, []);

  const getDaysUntilPayday = useCallback(() => {
    if (!userData?.payday_day) return null;
    
    const today = new Date();
    const currentDay = today.getDate();
    const payday = userData.payday_day;
    
    let daysUntil;
    if (currentDay <= payday) {
      daysUntil = payday - currentDay;
    } else {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, payday);
      const diffTime = nextMonth.getTime() - today.getTime();
      daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return daysUntil;
  }, [userData]);

  const getNextPaydayDate = useCallback(() => {
    if (!userData?.payday_day) return null;
    
    const today = new Date();
    const currentDay = today.getDate();
    const payday = userData.payday_day;
    
    let nextPayday;
    if (currentDay <= payday) {
      nextPayday = new Date(today.getFullYear(), today.getMonth(), payday);
    } else {
      nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, payday);
    }
    
    return nextPayday;
  }, [userData]);

  const getStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      'paid': ExtendedColors.success[500],
      'pending': ExtendedColors.warning[500],
      'overdue': ExtendedColors.danger[500],
      'upcoming': ExtendedColors.info[500],
    };
    return colors[status] || ExtendedColors.muted[500];
  }, []);

  const getStatusText = useCallback((status: string) => {
    const texts: Record<string, string> = {
      'paid': 'مدفوع',
      'pending': 'معلق',
      'overdue': 'متأخر',
      'upcoming': 'قادم',
    };
    return texts[status] || 'غير محدد';
  }, []);
  
  const getCategoryIcon = useCallback((category: string): string => {
    const icons: Record<string, string> = {
      'bank': 'business',
      'finance': 'trending-up',
      'personal': 'person',
      'savings': 'wallet',
      'subscription': 'refresh',
      'store': 'storefront',
      'bnpl': 'card',
    };
    return icons[category] || 'receipt';
  }, []);
  
  // Memoized values
  const financialHealth = useMemo(() => calculateFinancialHealth(), [calculateFinancialHealth]);
  const daysToPayday = useMemo(() => getDaysUntilPayday(), [getDaysUntilPayday]);
  const savingsProgress = useMemo(() => {
    if (!financialSummary) return 0;
    return Math.min(100, ((financialSummary.currentSavings || 0) / (financialSummary.savingsTarget || 1)) * 100);
  }, [financialSummary]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B63FF" />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0B63FF"
            colors={['#0B63FF']}
          />
        }
      >
        {/* Enhanced Header */}
        <LinearGradient
          colors={['#1E40AF', '#3B82F6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerDecoration} />
          <View style={styles.headerContent}>
            <View style={styles.headerContainer}>
              <View style={styles.headerLeft}>
                <TouchableOpacity 
                  style={styles.headerIcon}
                  onPress={() => setBalancesVisible(!balancesVisible)}
                >
                  <Ionicons 
                    name={balancesVisible ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerIcon}
                  onPress={() => setAddPaymentModalVisible(true)}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.headerCenter}>
                <Text style={styles.greeting}>مرحباً , {userData?.name || 'بك'}</Text>
                <Text style={styles.appTitle}>إلتزاماتي</Text>
              </View>
              
              <View style={styles.headerRight}>
                <View style={styles.appIcon}>
                  <Ionicons name="wallet-outline" size={28} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Financial Summary Cards - Side by Side Layout */}
        <View style={styles.financialCardsContainer}>
          {/* Top Row - Salary and Commitments */}
          <View style={styles.cardRow}>
            <View style={[styles.compactCard, styles.halfCard]}>
              <View style={styles.compactCardHeader}>
                <Text style={styles.compactCardTitle}>الراتب الشهري</Text>
                <Ionicons name="wallet-outline" size={20} color="#0B63FF" />
              </View>
              <Text style={styles.compactCardAmount}>
                {balancesVisible ? formatCurrency(financialSummary?.salary || 0) : '***'}
              </Text>
              <Text style={styles.compactCardSubtitle}>آخر تحديث: اليوم</Text>
            </View>

            <View style={[styles.compactCard, styles.halfCard]}>
              <View style={styles.compactCardHeader}>
                <Text style={styles.compactCardTitle}>الالتزامات</Text>
                <Ionicons name="card-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.compactCardAmount}>
                {balancesVisible ? formatCurrency(financialSummary?.totalCommitments || 0) : '***'}
              </Text>
              <Text style={styles.compactCardSubtitle}>
                {formatNumber(financialSummary?.upcomingPayments || 0)} دفعة قادمة
              </Text>
            </View>
          </View>

          {/* Remaining Balance Card - Full Width with More Details */}
          <View style={styles.remainingBalanceCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.remainingBalanceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.remainingBalanceHeader}>
                <View style={styles.remainingBalanceIcon}>
                  <Ionicons name="trending-up" size={28} color="#FFFFFF" />
            </View>
                <View style={styles.remainingBalanceInfo}>
                  <Text style={styles.remainingBalanceTitle}>المبلغ المتبقي</Text>
                  <Text style={styles.remainingBalanceSubtitle}>بعد خصم جميع الالتزامات</Text>
                </View>
              </View>
              
              <Text style={styles.remainingBalanceAmount}>
              {balancesVisible ? formatCurrency(financialSummary?.remainingBalance || 0) : '***'}
            </Text>
              
              <View style={styles.remainingBalanceStats}>
                <View style={styles.remainingBalanceStat}>
                  <Text style={styles.remainingBalanceStatValue}>
                    {Math.round(((financialSummary?.remainingBalance || 0) / (financialSummary?.salary || 1)) * 100)}%
            </Text>
                  <Text style={styles.remainingBalanceStatLabel}>من الراتب</Text>
                </View>
                <View style={styles.remainingBalanceStatDivider} />
                <View style={styles.remainingBalanceStat}>
                  <Text style={styles.remainingBalanceStatValue}>
                    {getDaysUntilPayday() || 0}
                  </Text>
                  <Text style={styles.remainingBalanceStatLabel}>يوم للراتب</Text>
                </View>
                <View style={styles.remainingBalanceStatDivider} />
                <View style={styles.remainingBalanceStat}>
                  <Text style={styles.remainingBalanceStatValue}>
                    {formatNumber(financialSummary?.completedPayments || 0)}
                  </Text>
                  <Text style={styles.remainingBalanceStatLabel}>دفعة مكتملة</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Smart Payment Modal */}
        <SmartPaymentModal
          visible={addPaymentModalVisible}
          onClose={() => {
            setAddPaymentModalVisible(false);
            setSelectedCommitmentId(null);
          }}
          commitmentId={selectedCommitmentId}
          onSuccess={() => {
            setAddPaymentModalVisible(false);
            setSelectedCommitmentId(null);
            loadDashboardData();
          }}
        />

        <AddCommitmentWizard
          visible={addCommitmentWizardVisible}
          onClose={() => setAddCommitmentWizardVisible(false)}
          onSuccess={() => {
            setAddCommitmentWizardVisible(false);
            loadDashboardData();
          }}
        />

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>التزامات نشطة</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatNumber(financialSummary?.totalCommitments || 0)}</Text>
              <View style={styles.statIcon}>
                <Ionicons name="list-outline" size={20} color="#0B63FF" />
              </View>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>دفعات مكتملة</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatNumber(financialSummary?.completedPayments || 0)}</Text>
              <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              </View>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>دفعات قادمة</Text>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatNumber(upcomingPayments.length)}</Text>
              <View style={[styles.statIcon, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الدفعات القادمة</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingPayments.length > 0 ? (
            <View style={styles.paymentsContainer}>
              {upcomingPayments.slice(0, 3).map((payment, index) => (
                <View key={payment.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: payment.status === 'pending' ? '#FEF3F2' : '#F0FDF4' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: payment.status === 'pending' ? '#EF4444' : '#22C55E' }
                      ]}>
                        {payment.status === 'pending' ? 'مستحق' : 'مدفوع'}
                      </Text>
                    </View>
                    <Text style={styles.paymentCreditor}>{payment.creditor_name}</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentDate}>
                      {new Date(payment.due_date).toLocaleDateString('ar-KW')}
                    </Text>
                    <Text style={styles.paymentAmount}>
                      {formatCurrency(payment.amount)}
                    </Text>
                  </View>
                </View>
              ))}
              {upcomingPayments.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Ionicons name="chevron-forward" size={16} color="#0B63FF" />
                  <Text style={styles.viewAllText}>
                    عرض {formatNumber(upcomingPayments.length - 3)} دفعات أخرى
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyStateText}>لا توجد دفعات قادمة</Text>
              <Text style={styles.emptyStateSubtext}>جميع التزاماتك محدثة!</Text>
            </View>
          )}
        </View>

        {/* Recent Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>المدفوعات الأخيرة</Text>
          </View>
          
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyStateText}>لا توجد مدفوعات حديثة</Text>
            <Text style={styles.emptyStateSubtext}>ابدأ بتسجيل دفعاتك لتتبع تقدمك</Text>
          </View>
        </View>

        {/* Active Commitments */}
        <CommitmentsList onPaymentPress={handlePaymentPress} onCommitmentPress={handleCommitmentPress} />

        {/* Main Add Commitment Button */}
        <View style={styles.mainActionContainer}>
          <TouchableOpacity 
            style={styles.mainAddButton}
            onPress={() => setAddCommitmentWizardVisible(true)}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.mainAddGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
              <Text style={styles.mainAddText}>إضافة التزام جديد</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ExtendedColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ExtendedColors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: ExtendedTypography.sizes.md,
    color: ExtendedColors.muted[500],
    fontFamily: ExtendedTypography.family.regular,
  },
  
  // Modern Header Styles
  modernHeader: {
    paddingTop: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight || 20,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: ExtendedBorderRadius['2xl'],
    borderBottomRightRadius: ExtendedBorderRadius['2xl'],
    ...Shadows.large,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greetingText: {
    fontSize: ExtendedTypography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: ExtendedTypography.family.regular,
    marginBottom: 4,
  },
  userNameText: {
    fontSize: ExtendedTypography.sizes.xl,
    color: ExtendedColors.white,
    fontFamily: ExtendedTypography.family.bold,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: ExtendedBorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Financial Health Score Badge
  healthScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: ExtendedBorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  healthScoreIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  healthScoreText: {
    fontSize: ExtendedTypography.sizes.sm,
    color: ExtendedColors.white,
    fontFamily: ExtendedTypography.family.medium,
    marginRight: Spacing.xs,
  },
  healthScoreValue: {
    fontSize: ExtendedTypography.sizes.sm,
    color: ExtendedColors.white,
    fontFamily: ExtendedTypography.family.bold,
  },
  
  // Quick Stats Row
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: ExtendedTypography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: ExtendedTypography.family.regular,
    marginTop: 4,
  },
  quickStatValue: {
    fontSize: ExtendedTypography.sizes.md,
    color: ExtendedColors.white,
    fontFamily: ExtendedTypography.family.bold,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Tab Navigation
  tabContainer: {
    backgroundColor: ExtendedColors.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ExtendedColors.muted[200],
  },
  tabScrollView: {
    paddingHorizontal: Spacing.md,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: ExtendedBorderRadius.full,
    backgroundColor: ExtendedColors.background,
  },
  activeTabButton: {
    backgroundColor: ExtendedColors.primary[50],
  },
  tabButtonText: {
    marginLeft: Spacing.xs,
    fontSize: ExtendedTypography.sizes.sm,
    color: ExtendedColors.muted[500],
    fontFamily: ExtendedTypography.family.medium,
  },
  activeTabText: {
    color: ExtendedColors.primary[500],
    fontFamily: ExtendedTypography.family.semibold,
  },
  tabBadge: {
    marginLeft: Spacing.xs,
    backgroundColor: ExtendedColors.danger[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: ExtendedBorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    color: ExtendedColors.white,
    fontFamily: ExtendedTypography.family.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  content: {
    flex: 1,
  },
  // Legacy Header Styles (existing)
  header: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 70,
  },
  headerContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCenter: {
    alignItems: 'flex-end',
    flex: 1,
  },
  headerRight: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginRight: 10,
    marginBottom:20,
  },
  // Compact Cards
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(11, 99, 255, 0.08)',
  },
  compactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
    gap: 8,
  },
  compactCardTitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  compactCardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  compactCardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  financialCardsContainer: {
    paddingHorizontal: 20,
    marginTop: -30,
    gap: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  remainingBalanceCard: {
    marginTop: 4,
  },
  remainingBalanceGradient: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  remainingBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  remainingBalanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  remainingBalanceInfo: {
    flex: 1,
  },
  remainingBalanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  remainingBalanceSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  remainingBalanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  remainingBalanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  remainingBalanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  remainingBalanceStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  remainingBalanceStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  remainingBalanceStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
    marginRight: 10,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(11, 99, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
    flex: 1,
  },
  cardAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'Cairo-Bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  cardProgressContainer: {
    marginTop: 12,
  },
  cardProgressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginBottom: 8,
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  cardProgressText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  
  // Payday Info
  paydayInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paydayText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
    textAlign: 'right',
  },
  daysUntilText: {
    fontSize: 12,
    color: '#0B63FF',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(11, 99, 255, 0.08)',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
    textAlign: 'right',
  },
  
  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  
  // Payments List
  paymentsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(11, 99, 255, 0.08)',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentLeft: {
    alignItems: 'flex-start',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  paymentCreditor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
  },
  paymentDate: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    fontFamily: 'Cairo-Bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Regular',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#0B63FF',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  
  // Payments Section
  paymentsContainer: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(11, 99, 255, 0.08)',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentCardCreditor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B63FF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  paymentCardDate: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Regular',
  },
  
  // Section Headers
  seeAllText: {
    fontSize: 14,
    color: '#0B63FF',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  
  // Empty State
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(11, 99, 255, 0.06)',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'Cairo-Regular',
  },
  
  // Actions Container
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  primaryAction: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  secondaryAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(11, 99, 255, 0.2)',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B63FF',
    marginLeft: 8,
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
  },
  remainingBalanceCardCompact: {
    marginTop: 4,
  },
  mainActionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  mainAddButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mainAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  mainAddText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
});
