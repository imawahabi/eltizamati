import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  Eye,
  EyeOff,
  FileText,
  Settings,
  Clock,
  Target,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  PieChart,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Star,
} from 'lucide-react-native';
import Logo from '../../components/Logo';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Enhanced mock data for comprehensive dashboard
  const mockFinancialData = {
    user: {
      name: 'أحمد محمد الكندري',
      salary: 1200.000,
      payday: 25,
      savingsGoal: 300.000,
      currentSavings: 185.500,
    },
    monthlyOverview: {
      totalIncome: 1200.000,
      totalCommitments: 278.500,
      totalExpenses: 450.000,
      remainingBalance: 471.500,
      savingsRate: 15.5,
      commitmentRate: 23.2,
    },
    commitments: [
      {
        id: 1,
        entity: 'NBK',
        type: 'loan',
        name: 'قرض شخصي - البنك الأهلي',
        totalAmount: 5000.000,
        paidAmount: 2840.000,
        remainingAmount: 2160.000,
        monthlyPayment: 160.000,
        nextPaymentDate: '2025-08-25',
        installmentsTotal: 36,
        installmentsPaid: 21,
        installmentsRemaining: 15,
        urgency: 'high',
        category: 'بنك',
        interestRate: 4.5,
      },
      {
        id: 2,
        entity: 'Tabby',
        type: 'bnpl',
        name: 'أقساط تابي - متجر إكسترا',
        totalAmount: 450.000,
        paidAmount: 225.000,
        remainingAmount: 225.000,
        monthlyPayment: 75.000,
        nextPaymentDate: '2025-08-28',
        installmentsTotal: 6,
        installmentsPaid: 3,
        installmentsRemaining: 3,
        urgency: 'medium',
        category: 'تقسيط',
        interestRate: 0,
      },
      {
        id: 3,
        entity: 'Credimax',
        type: 'credit_card',
        name: 'بطاقة كريدي ماكس',
        totalAmount: 850.000,
        paidAmount: 406.500,
        remainingAmount: 443.500,
        monthlyPayment: 43.500,
        nextPaymentDate: '2025-08-30',
        installmentsTotal: 24,
        installmentsPaid: 11,
        installmentsRemaining: 13,
        urgency: 'low',
        category: 'بطاقة ائتمان',
        interestRate: 2.9,
      },
    ],
    recentTransactions: [
      {
        id: 1,
        type: 'payment',
        description: 'دفع قسط البنك الأهلي',
        amount: -160.000,
        date: '2025-08-20',
        status: 'completed',
      },
      {
        id: 2,
        type: 'income',
        description: 'راتب شهر أغسطس',
        amount: 1200.000,
        date: '2025-08-25',
        status: 'completed',
      },
      {
        id: 3,
        type: 'savings',
        description: 'تحويل للادخار',
        amount: -50.000,
        date: '2025-08-26',
        status: 'completed',
      },
    ],
    upcomingPayments: [
      {
        id: 1,
        name: 'قسط تابي',
        amount: 75.000,
        dueDate: '2025-08-28',
        daysLeft: 3,
        urgency: 'medium',
      },
      {
        id: 2,
        name: 'بطاقة كريدي ماكس',
        amount: 43.500,
        dueDate: '2025-08-30',
        daysLeft: 5,
        urgency: 'low',
      },
    ],
  };

  const { user, monthlyOverview, commitments, recentTransactions, upcomingPayments } = mockFinancialData;

  const getCommitmentIcon = (type: string) => {
    switch (type) {
      case 'loan': return <CreditCard size={20} color="#1E40AF" />;
      case 'bnpl': return <Target size={20} color="#059669" />;
      case 'friend': return <DollarSign size={20} color="#7C3AED" />;
      default: return <DollarSign size={20} color="#6B7280" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header Section */}
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#60A5FA']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <Logo size="medium" showText={false} variant="white" />
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>أهلاً وسهلاً</Text>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.currentDate}>
                  {new Date().toLocaleDateString('ar-KW', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Bell size={22} color="#FFFFFF" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setBalanceVisible(!balanceVisible)}
              >
                {balanceVisible ? 
                  <Eye size={22} color="#FFFFFF" /> : 
                  <EyeOff size={22} color="#FFFFFF" />
                }
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Financial Overview Cards */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewGrid}>
            {/* Main Balance Card */}
            <View style={styles.mainBalanceCard}>
              <LinearGradient
                colors={['#059669', '#10B981']}
                style={styles.balanceCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.balanceHeader}>
                  <Wallet size={24} color="#FFFFFF" />
                  <Text style={styles.balanceTitle}>الرصيد المتاح</Text>
                </View>
                <Text style={styles.mainBalanceAmount}>
                  {balanceVisible ? `${monthlyOverview.remainingBalance.toFixed(3)} د.ك` : '••••••'}
                </Text>
                <View style={styles.balanceSubInfo}>
                  <ArrowUpRight size={16} color="#FFFFFF" />
                  <Text style={styles.balanceChange}>+{monthlyOverview.savingsRate}% هذا الشهر</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Income Card */}
            <View style={styles.smallCard}>
              <View style={styles.cardHeader}>
                <TrendingUp size={20} color="#059669" />
                <Text style={styles.cardTitle}>الدخل</Text>
              </View>
              <Text style={styles.cardAmount}>
                {balanceVisible ? `${monthlyOverview.totalIncome.toFixed(3)}` : '••••••'}
              </Text>
              <Text style={styles.cardLabel}>د.ك</Text>
            </View>

            {/* Commitments Card */}
            <View style={styles.smallCard}>
              <View style={styles.cardHeader}>
                <CreditCard size={20} color="#DC2626" />
                <Text style={styles.cardTitle}>الالتزامات</Text>
              </View>
              <Text style={styles.cardAmount}>
                {balanceVisible ? `${monthlyOverview.totalCommitments.toFixed(3)}` : '••••••'}
              </Text>
              <Text style={styles.cardLabel}>د.ك</Text>
            </View>
          </View>

          {/* Savings Progress */}
          <View style={styles.savingsCard}>
            <View style={styles.savingsHeader}>
              <Target size={20} color="#7C3AED" />
              <Text style={styles.savingsTitle}>هدف الادخار الشهري</Text>
              <Text style={styles.savingsPercentage}>
                {((user.currentSavings / user.savingsGoal) * 100).toFixed(0)}%
              </Text>
            </View>
            <View style={styles.savingsProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.savingsProgressFill, 
                    { width: `${(user.currentSavings / user.savingsGoal) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <View style={styles.savingsInfo}>
              <Text style={styles.savingsAmount}>
                {balanceVisible ? `${user.currentSavings.toFixed(3)} د.ك` : '••••••'} من {balanceVisible ? `${user.savingsGoal.toFixed(3)} د.ك` : '••••••'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#059669' }]}>
                <Plus size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>إضافة التزام</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#7C3AED' }]}>
                <CheckCircle size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>تسجيل دفعة</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#DC2626' }]}>
                <AlertTriangle size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>المستحقات</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B' }]}>
                <BarChart3 size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.quickActionText}>التحليلات</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Payments */}
        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المدفوعات القادمة</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentContent}>
                <View style={styles.paymentIcon}>
                  <Clock size={18} color={
                    payment.urgency === 'high' ? '#DC2626' : 
                    payment.urgency === 'medium' ? '#F59E0B' : '#059669'
                  } />
                </View>
                
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{payment.name}</Text>
                  <Text style={styles.paymentDue}>
                    خلال {payment.daysLeft} أيام • {new Date(payment.dueDate).toLocaleDateString('ar-KW')}
                  </Text>
                </View>
                
                <View style={styles.paymentAmount}>
                  <Text style={styles.paymentValue}>
                    {balanceVisible ? `${payment.amount.toFixed(3)} د.ك` : '••••••'}
                  </Text>
                  <View style={[
                    styles.urgencyDot,
                    { backgroundColor: 
                      payment.urgency === 'high' ? '#DC2626' : 
                      payment.urgency === 'medium' ? '#F59E0B' : '#059669'
                    }
                  ]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>النشاط الأخير</Text>
          
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <View style={[
                  styles.activityIcon,
                  { backgroundColor: 
                    transaction.type === 'income' ? '#059669' :
                    transaction.type === 'savings' ? '#7C3AED' : '#DC2626'
                  }
                ]}>
                  {transaction.type === 'income' ? <ArrowUpRight size={16} color="#FFFFFF" /> :
                   transaction.type === 'savings' ? <Target size={16} color="#FFFFFF" /> :
                   <ArrowDownRight size={16} color="#FFFFFF" />}
                </View>
                
                <View style={styles.activityInfo}>
                  <Text style={styles.activityDescription}>{transaction.description}</Text>
                  <Text style={styles.activityDate}>
                    {new Date(transaction.date).toLocaleDateString('ar-KW')}
                  </Text>
                </View>
                
                <Text style={[
                  styles.activityAmount,
                  { color: transaction.amount > 0 ? '#059669' : '#DC2626' }
                ]}>
                  {balanceVisible ? 
                    `${transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(3)} د.ك` : 
                    '••••••'
                  }
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#E0E7FF',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 14,
    color: '#CBD5E1',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  headerActions: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  
  // Overview Section
  overviewSection: {
    padding: 20,
    paddingTop: -10,
  },
  overviewGrid: {
    gap: 16,
    marginBottom: 20,
  },
  mainBalanceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceCardGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Cairo-SemiBold',
  },
  mainBalanceAmount: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  balanceSubInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  balanceChange: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Regular',
  },
  
  // Small Cards
  smallCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-SemiBold',
  },
  cardAmount: {
    fontSize: 24,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  cardLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
    marginTop: 2,
  },
  
  // Savings Card
  savingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savingsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    flex: 1,
    textAlign: 'right',
    marginRight: 8,
  },
  savingsPercentage: {
    fontSize: 18,
    color: '#7C3AED',
    fontFamily: 'Cairo-Bold',
  },
  savingsProgress: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  savingsProgressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  savingsInfo: {
    alignItems: 'flex-end',
  },
  savingsAmount: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'center',
  },
  
  // Upcoming Payments
  upcomingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Cairo-SemiBold',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
    marginBottom: 4,
  },
  paymentDue: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  paymentAmount: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentValue: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Activity Section
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  activityAmount: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: 100,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
});
