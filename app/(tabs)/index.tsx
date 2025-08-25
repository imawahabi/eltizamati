import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  RefreshControl,
  I18nManager,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Eye,
  EyeOff,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Wallet,
  FileText,
  PieChart,
  Bell,
  Target,
  DollarSign,
  Banknote,
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface FinancialSummary {
  totalCommitments: number;
  monthlyPayments: number;
  completedPayments: number;
  upcomingPayments: number;
  totalDebt: number;
  paidAmount: number;
}

interface RecentActivity {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'payment' | 'debt' | 'commitment';
  status: 'completed' | 'pending' | 'overdue';
  entity: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: any;
  route: string;
  color: string;
  gradientColors: string[];
}

const DashboardScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Mock data - will be replaced with actual data from database
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalCommitments: 12,
    monthlyPayments: 2847.500,
    completedPayments: 8,
    upcomingPayments: 4,
    totalDebt: 18240.750,
    paidAmount: 12560.250,
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      title: 'قسط بنك الكويت الوطني',
      amount: 450.000,
      date: '2025-01-15',
      type: 'payment',
      status: 'completed',
      entity: 'NBK',
    },
    {
      id: '2',
      title: 'قسط X-cite الإلكترونيات',
      amount: 85.500,
      date: '2025-01-20',
      type: 'payment',
      status: 'pending',
      entity: 'X-cite',
    },
    {
      id: '3',
      title: 'دين شخصي - أحمد',
      amount: 200.000,
      date: '2025-01-25',
      type: 'debt',
      status: 'pending',
      entity: 'Personal',
    },
    {
      id: '4',
      title: 'قسط Tabby',
      amount: 45.750,
      date: '2025-01-10',
      type: 'payment',
      status: 'overdue',
      entity: 'Tabby',
    },
  ]);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'إضافة التزام',
      icon: Plus,
      route: '/add-commitment',
      color: '#3B82F6',
      gradientColors: ['#3B82F6', '#60A5FA'],
    },
    {
      id: '2',
      title: 'الالتزامات',
      icon: FileText,
      route: '/(tabs)/commitments',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#A78BFA'],
    },
    {
      id: '3',
      title: 'التحليلات',
      icon: PieChart,
      route: '/(tabs)/analytics',
      color: '#10B981',
      gradientColors: ['#10B981', '#34D399'],
    },
    {
      id: '4',
      title: 'التنبيهات',
      icon: Bell,
      route: '/notifications',
      color: '#F59E0B',
      gradientColors: ['#F59E0B', '#FCD34D'],
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ar-KW', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const getRemainingBalance = () => {
    const salary = 1850.000;
    return salary - financialData.monthlyPayments;
  };

  const getDebtProgress = () => {
    const progress = (financialData.paidAmount / financialData.totalDebt) * 100;
    return Math.round(progress);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'overdue':
        return AlertTriangle;
      default:
        return AlertCircle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قادم';
      case 'overdue':
        return 'متأخر';
      default:
        return 'غير محدد';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#60A5FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>مرحباً بك 👋</Text>
                <Text style={styles.userName}>أحمد المحمد</Text>
              </View>
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
              >
                <Bell size={24} color="#FFFFFF" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>المتبقي لهذا الشهر</Text>
                <TouchableOpacity
                  onPress={() => setBalanceVisible(!balanceVisible)}
                  style={styles.visibilityToggle}
                >
                  {balanceVisible ? (
                    <Eye size={20} color="#64748B" />
                  ) : (
                    <EyeOff size={20} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
              
              <View style={styles.balanceAmount}>
                <Text style={styles.currency}>د.ك</Text>
                <Text style={styles.amount}>
                  {balanceVisible ? formatCurrency(getRemainingBalance()) : '•••.•••'}
                </Text>
              </View>

              <View style={styles.balanceFooter}>
                <View style={styles.balanceItem}>
                  <View style={styles.balanceIndicator}>
                    <ArrowUpRight size={16} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.balanceItemLabel}>الدخل</Text>
                    <Text style={styles.balanceItemValue}>
                      {balanceVisible ? formatCurrency(1850.000) : '•••.•••'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.balanceDivider} />
                
                <View style={styles.balanceItem}>
                  <View style={[styles.balanceIndicator, { backgroundColor: '#FEE2E2' }]}>
                    <ArrowDownRight size={16} color="#EF4444" />
                  </View>
                  <View>
                    <Text style={styles.balanceItemLabel}>المدفوعات</Text>
                    <Text style={styles.balanceItemValue}>
                      {balanceVisible ? formatCurrency(financialData.monthlyPayments) : '•••.•••'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={action.gradientColors as any}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <action.icon size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Financial Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>نظرة مالية عامة</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/analytics')}>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.overviewCards}>
            {/* Total Debt Card */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewCardHeader}>
                <View style={[styles.overviewIconContainer, { backgroundColor: '#EBF5FF' }]}>
                  <Wallet size={20} color="#3B82F6" />
                </View>
                <Text style={styles.overviewCardLabel}>إجمالي الديون</Text>
              </View>
              <Text style={styles.overviewCardValue}>
                {formatCurrency(financialData.totalDebt)} د.ك
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getDebtProgress()}%`, backgroundColor: '#3B82F6' }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{getDebtProgress()}% مسدد</Text>
              </View>
            </View>

            {/* Monthly Payments Card */}
            <View style={styles.overviewCard}>
              <View style={styles.overviewCardHeader}>
                <View style={[styles.overviewIconContainer, { backgroundColor: '#F0FDF4' }]}>
                  <CreditCard size={20} color="#10B981" />
                </View>
                <Text style={styles.overviewCardLabel}>الدفعات الشهرية</Text>
              </View>
              <Text style={styles.overviewCardValue}>
                {formatCurrency(financialData.monthlyPayments)} د.ك
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{financialData.upcomingPayments}</Text>
                  <Text style={styles.statLabel}>قادمة</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{financialData.completedPayments}</Text>
                  <Text style={styles.statLabel}>مكتملة</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Commitments Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconContainer}>
                <Target size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.summaryTitle}>ملخص الالتزامات</Text>
            </View>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>{financialData.totalCommitments}</Text>
                <Text style={styles.summaryStatLabel}>إجمالي الالتزامات</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>{financialData.upcomingPayments}</Text>
                <Text style={styles.summaryStatLabel}>مدفوعات قادمة</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStatItem}>
                <Text style={styles.summaryStatValue}>3</Text>
                <Text style={styles.summaryStatLabel}>تنبيهات نشطة</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>النشاط الأخير</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/commitments')}>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {recentActivities.map((activity, index) => {
              const StatusIcon = getStatusIcon(activity.status);
              return (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index === recentActivities.length - 1 && styles.lastActivityItem
                  ]}
                  onPress={() => router.push('/commitment-details')}
                  activeOpacity={0.7}
                >
                  <View style={styles.activityLeft}>
                    <View 
                      style={[
                        styles.activityIcon,
                        { backgroundColor: `${getStatusColor(activity.status)}15` }
                      ]}
                    >
                      <StatusIcon size={20} color={getStatusColor(activity.status)} />
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <View style={styles.activityMeta}>
                        <Text style={styles.activityEntity}>{activity.entity}</Text>
                        <Text style={styles.activityDot}>•</Text>
                        <Text style={styles.activityDate}>{activity.date}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <Text style={styles.activityAmount}>
                      {formatCurrency(activity.amount)} د.ك
                    </Text>
                    <View 
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(activity.status)}15` }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.statusBadgeText,
                          { color: getStatusColor(activity.status) }
                        ]}
                      >
                        {getStatusText(activity.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توصيات ذكية</Text>
          <View style={styles.insightsCard}>
            <LinearGradient
              colors={['#F3E8FF', '#E9D5FF']}
              style={styles.insightGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.insightIcon}>
                <TrendingUp size={24} color="#8B5CF6" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>توفير محتمل هذا الشهر</Text>
                <Text style={styles.insightDescription}>
                  يمكنك توفير 125.000 د.ك بسداد قسط X-cite مبكراً وتجنب رسوم التأخير
                </Text>
                <TouchableOpacity style={styles.insightAction}>
                  <Text style={styles.insightActionText}>عرض التفاصيل</Text>
                  <ChevronRight size={16} color="#8B5CF6" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Add bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerContent: {
    padding: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#E0E7FF',
    fontFamily: 'Cairo',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo',
  },
  visibilityToggle: {
    padding: 4,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  currency: {
    fontSize: 16,
    color: '#94A3B8',
    marginRight: 8,
    fontFamily: 'Cairo',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo',
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Cairo',
    marginBottom: 2,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Cairo',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickActionCard: {
    width: (screenWidth - 52) / 4,
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 16,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionTitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo',
    textAlign: 'center',
  },
  overviewCards: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  overviewCardLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Cairo',
    flex: 1,
  },
  overviewCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Cairo',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Cairo',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo',
  },
  summaryStatLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Cairo',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityEntity: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo',
  },
  activityDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  activityDate: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Cairo',
  },
  insightsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    fontFamily: 'Cairo',
    marginRight: 4,
  },
});

export default DashboardScreen;
