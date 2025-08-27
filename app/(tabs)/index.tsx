import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Database
import {
  getFinancialSummary,
  getUpcomingPayments,
  getUserSettings,
  getRecentPayments,
  getActiveDebts
} from '@/lib/database';

// Components - Temporarily commented out to isolate the issue
// import { QuickActions } from '@/components/QuickActions';
// import { AlertsList } from '@/components/AlertsList';
// import { MonthlyOverview } from '@/components/MonthlyOverview';
// import { SalaryCard } from '@/components/SalaryCard';
// import { SavingsCard } from '@/components/SavingsCard';
// import { SmartInsights } from '@/components/SmartInsights';
// import { AddCommitmentModal } from '@/components/AddCommitmentModal';
// import { SmartPaymentModal } from '@/components/SmartPaymentModal';

interface FinancialSummary {
  totalSalary: number;
  totalDebts: number;
  monthlyPayments: number;
  remainingBalance: number;
  completedPayments: number;
  overduePayments: number;
}

interface UpcomingPayment {
  id: number;
  debtId: number;
  entityName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
  installmentNumber: number;
  totalInstallments: number;
}

interface UserSettings {
  name: string;
  salary: number;
  paydayDay: number;
  currency: string;
  language: string;
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [addDebtModalVisible, setAddDebtModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<number | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [summary, payments, settings] = await Promise.all([
        getFinancialSummary(),
        getUpcomingPayments(5),
        getUserSettings()
      ]);

      setFinancialSummary(summary);
      setUpcomingPayments(payments);
      setUserSettings(settings);
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

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);

    return formatted;
  };

  const renderCurrencyAmount = (amount: number, style: any = {}) => {
    const formatted = formatCurrency(amount);
    const parts = formatted.split('.');

    return (
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={[style, { fontSize: style.fontSize || 18 }]}>
          {parts[0]}
        </Text>
        <Text style={[style, {
          fontSize: (style.fontSize || 18) * 0.7,
          opacity: 0.7,
          marginRight: 2
        }]}>
          .{parts[1]}
        </Text>
        <Text style={[style, {
          fontSize: (style.fontSize || 18) * 0.6,
          opacity: 0.6,
          marginRight: 4
        }]}>
          د.ك
        </Text>
      </View>
    );
  };

  const getDaysUntilPayday = () => {
    if (!userSettings?.paydayDay) return 0;
    
    const today = new Date();
    const currentDay = today.getDate();
    const payday = userSettings.paydayDay;
    
    if (currentDay <= payday) {
      return payday - currentDay;
    } else {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, payday);
      const diffTime = nextMonth.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  };

  const handlePaymentPress = (debtId: number) => {
    setSelectedDebtId(debtId);
    setPaymentModalVisible(true);
  };

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
        {/* Header */}
        <LinearGradient
          colors={['#1E40AF', '#3B82F6']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setBalancesVisible(!balancesVisible)}
                >
                  <Ionicons 
                    name={balancesVisible ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => setAddDebtModalVisible(true)}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={styles.greeting}>مرحباً، {userSettings?.name || 'المستخدم'}</Text>
                <Text style={styles.appTitle}>إلتزاماتي</Text>
              </View>
              
              <View style={styles.appIcon}>
                <Ionicons name="wallet-outline" size={28} color="#FFFFFF" />
              </View>
            </View>

            {/* Financial Health Score */}
            <View style={styles.healthScore}>
              <View style={styles.healthScoreIcon}>
                <Ionicons name="trending-up" size={20} color="#10B981" />
              </View>
              <Text style={styles.healthScoreText}>الصحة المالية: ممتازة</Text>
              <Text style={styles.healthScoreValue}>85%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Financial Summary Cards */}
        <View style={styles.summaryContainer}>
          {/* Main Balance Card */}
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <Ionicons name="wallet" size={24} color="#FFFFFF" />
              <Text style={styles.balanceTitle}>المبلغ المتبقي</Text>
            </View>
            <Text style={styles.balanceAmount}>
              {balancesVisible ? renderCurrencyAmount(financialSummary?.remainingBalance || 0, styles.balanceAmount) : '***'}
            </Text>
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatValue}>{getDaysUntilPayday()}</Text>
                <Text style={styles.balanceStatLabel}>يوم للراتب</Text>
              </View>
              <View style={styles.balanceStatDivider} />
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatValue}>
                  {Math.round(((financialSummary?.remainingBalance || 0) / (userSettings?.salary || 1)) * 100)}%
                </Text>
                <Text style={styles.balanceStatLabel}>من الراتب</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Summary Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trending-up" size={20} color="#0B63FF" />
              </View>
              <Text style={styles.statValue}>
                {balancesVisible ? renderCurrencyAmount(userSettings?.salary || 0, styles.statValue) : '***'}
              </Text>
              <Text style={styles.statLabel}>الراتب الشهري</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEF3F2' }]}>
                <Ionicons name="card" size={20} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>
                {balancesVisible ? renderCurrencyAmount(financialSummary?.totalDebts || 0, styles.statValue) : '***'}
              </Text>
              <Text style={styles.statLabel}>إجمالي الديون</Text>
            </View>
          </View>
        </View>

        {/* Recent Payments History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>سجل المدفوعات الأخيرة</Text>
          </View>
          
          <View style={styles.paymentsHistoryContainer}>
            {[
              { id: 1, entity: 'بنك الكويت الوطني', amount: 150.000, date: '2024-01-15', type: 'قسط شهري' },
              { id: 2, entity: 'شركة زين', amount: 25.500, date: '2024-01-14', type: 'فاتورة' },
              { id: 3, entity: 'أحمد محمد', amount: 100.000, date: '2024-01-12', type: 'دين شخصي' },
            ].map((payment) => (
              <View key={payment.id} style={styles.paymentHistoryCard}>
                <View style={styles.paymentHistoryHeader}>
                  <View style={styles.paymentHistoryAmount}>
                    <Text style={styles.paymentHistoryAmountText}>
                      {renderCurrencyAmount(payment.amount, styles.paymentHistoryAmountText)}
                    </Text>
                    <Text style={styles.paymentHistoryDate}>
                      {new Date(payment.date).toLocaleDateString('en-US')}
                    </Text>
                  </View>
                  <View style={styles.paymentHistoryInfo}>
                    <Text style={styles.paymentHistoryEntity}>{payment.entity}</Text>
                    <Text style={styles.paymentHistoryType}>{payment.type}</Text>
                  </View>
                  <View style={styles.paymentHistoryIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Commitments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => router.push('/commitments')}>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>الالتزامات الحديثة</Text>
          </View>
          
          <View style={styles.recentCommitmentsContainer}>
            {[
              { id: 1, entity: 'بنك الخليج', type: 'قرض شخصي', remaining: 2500.000, progress: 65 },
              { id: 2, entity: 'شركة الاتصالات', type: 'اشتراك شهري', remaining: 180.000, progress: 30 },
            ].map((commitment) => (
              <View key={commitment.id} style={styles.recentCommitmentCard}>
                <View style={styles.recentCommitmentHeader}>
                  <Text style={styles.recentCommitmentAmount}>
                    {renderCurrencyAmount(commitment.remaining, styles.recentCommitmentAmount)}
                  </Text>
                  <View style={styles.recentCommitmentInfo}>
                    <Text style={styles.recentCommitmentEntity}>{commitment.entity}</Text>
                    <Text style={styles.recentCommitmentType}>{commitment.type}</Text>
                  </View>
                </View>
                <View style={styles.recentCommitmentProgress}>
                  <Text style={styles.recentProgressText}>{commitment.progress}%</Text>
                  <View style={styles.recentProgressBar}>
                    <View 
                      style={[
                        styles.recentProgressFill,
                        { width: `${commitment.progress}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions - Temporarily commented out */}
        {/* <QuickActions /> */}

        {/* Financial Cards Row - Temporarily commented out */}
        {/* <View style={styles.financialCardsRow}>
          <SalaryCard 
            amount={userSettings?.salary || 0}
            paydayDay={userSettings?.paydayDay || 25}
          />
          <SavingsCard 
            target={(userSettings?.salary || 0) * 0.2}
          />
        </View> */}

        {/* Monthly Overview - Temporarily commented out */}
        {/* <MonthlyOverview /> */}

        {/* Smart Insights - Temporarily commented out */}
        {/* <SmartInsights 
          data={{
            totalDebt: financialSummary?.totalDebts || 0,
            monthlyPayments: financialSummary?.monthlyPayments || 0,
            completedPayments: financialSummary?.completedPayments || 0,
            overduePayments: financialSummary?.overduePayments || 0,
          }}
        /> */}

        {/* Alerts - Temporarily commented out */}
        {/* <AlertsList 
          alerts={upcomingPayments.slice(0, 3).map(payment => ({
            type: payment.status === 'overdue' ? 'overdue' as const : 'due_soon' as const,
            entity: payment.entityName,
            amount: payment.amount,
            dueDate: payment.dueDate,
            debtId: payment.debtId
          }))}
        /> */}

        {/* Upcoming Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => router.push('/commitments')}>
              <Text style={styles.seeAllText}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>الدفعات القادمة</Text>
          </View>
          
          {upcomingPayments.length > 0 ? (
            <View style={styles.paymentsContainer}>
              {upcomingPayments.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  style={styles.paymentCard}
                  onPress={() => handlePaymentPress(payment.debtId)}
                >
                  <View style={styles.paymentHeader}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: payment.status === 'overdue' ? '#FEF3F2' : '#F0FDF4' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: payment.status === 'overdue' ? '#EF4444' : '#10B981' }
                      ]}>
                        {payment.status === 'overdue' ? 'متأخر' : 'قادم'}
                      </Text>
                    </View>
                    <Text style={styles.paymentEntity}>{payment.entityName}</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentDate}>
                      {new Date(payment.dueDate).toLocaleDateString('en-US')}
                    </Text>
                    <Text style={styles.paymentAmount}>
                      {renderCurrencyAmount(payment.amount, styles.paymentAmount)}
                    </Text>
                  </View>
                  <View style={styles.paymentProgress}>
                    <Text style={styles.progressText}>
                      القسط {payment.installmentNumber} من {payment.totalInstallments}
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${(payment.installmentNumber / payment.totalInstallments) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyStateText}>لا توجد دفعات قادمة</Text>
              <Text style={styles.emptyStateSubtext}>جميع التزاماتك محدثة!</Text>
            </View>
          )}
        </View>

        {/* Main Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setAddDebtModalVisible(true)}
          >
            <LinearGradient
              colors={['#0B63FF', '#1E40AF']}
              style={styles.addButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>إضافة التزام جديد</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals - Temporarily commented out */}
      {/* <AddCommitmentModal
        visible={addDebtModalVisible}
        onClose={() => setAddDebtModalVisible(false)}
        onSuccess={() => {
          setAddDebtModalVisible(false);
          loadDashboardData();
        }}
      />

      <SmartPaymentModal
        visible={paymentModalVisible}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedDebtId(null);
        }}
        debtId={selectedDebtId}
        onSuccess={() => {
          setPaymentModalVisible(false);
          setSelectedDebtId(null);
          loadDashboardData();
        }}
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  healthScoreIcon: {
    marginRight: 8,
  },
  healthScoreText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Medium',
    flex: 1,
  },
  healthScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },

  // Summary
  summaryContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
    gap: 16,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    marginRight: 12,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceStat: {
    alignItems: 'center',
  },
  balanceStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  balanceStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
  balanceStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },

  // Financial Cards
  financialCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },

  // Sections
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
    fontFamily: 'Cairo-Bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0B63FF',
    fontFamily: 'Cairo-Medium',
  },

  // Payments
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
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
  },
  paymentEntity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentDate: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B63FF',
    fontFamily: 'Cairo-Bold',
  },
  paymentProgress: {
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },

  // Recent Payments History
  paymentsHistoryContainer: {
    gap: 8,
  },
  paymentHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentHistoryIcon: {
    marginLeft: 8,
  },
  paymentHistoryInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  paymentHistoryEntity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 2,
  },
  paymentHistoryType: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  paymentHistoryAmount: {
    alignItems: 'flex-start',
  },
  paymentHistoryAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 2,
  },
  paymentHistoryDate: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
  },

  // Recent Commitments
  recentCommitmentsContainer: {
    gap: 8,
  },
  recentCommitmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentCommitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentCommitmentInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  recentCommitmentEntity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 2,
  },
  recentCommitmentType: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  recentCommitmentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'Cairo-SemiBold',
  },
  recentCommitmentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    flex: 1,
  },
  recentProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  recentProgressText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    minWidth: 30,
  },

  // Add Button
  addButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  addButton: {
    borderRadius: 16,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
});
