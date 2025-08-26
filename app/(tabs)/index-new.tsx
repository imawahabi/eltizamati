import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getFinancialSummary, getUpcomingPayments, getUserData } from '@/lib/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

export default function ModernDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'payments' | 'insights'>('overview');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    loadDashboardData();
    animateEntry();
  }, []);
  
  const animateEntry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const loadDashboardData = async () => {
    try {
      const [summary, payments, user] = await Promise.all([
        getFinancialSummary(),
        getUpcomingPayments(10),
        getUserData()
      ]);
      
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
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 3,
    }).format(amount);
  };
  
  const getDaysUntilPayday = () => {
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
  };
  
  const getHealthScore = () => {
    if (!financialSummary) return { score: 0, color: '#FF4458', label: 'غير محدد' };
    
    const dti = (financialSummary.totalCommitments / (financialSummary.salary || 1)) * 100;
    let score = 100;
    
    if (dti <= 30) score = 100;
    else if (dti <= 40) score = 80;
    else if (dti <= 50) score = 60;
    else if (dti <= 60) score = 40;
    else score = 20;
    
    const getScoreDetails = (score: number) => {
      if (score >= 80) return { color: '#00D4AA', label: 'ممتاز' };
      if (score >= 60) return { color: '#FFB800', label: 'جيد' };
      if (score >= 40) return { color: '#FF8A00', label: 'متوسط' };
      return { color: '#FF4458', label: 'يحتاج تحسين' };
    };
    
    return { score, ...getScoreDetails(score) };
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>جاري تحميل بياناتك المالية</Text>
        </LinearGradient>
      </View>
    );
  }
  
  const healthScore = getHealthScore();
  const daysToPayday = getDaysUntilPayday();
  const commitmentPercentage = financialSummary ? 
    Math.round((financialSummary.totalCommitments / financialSummary.salary) * 100) : 0;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#667EEA"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Modern Header with Glassmorphism */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.headerGradient}
        >
          <BlurView intensity={20} style={styles.headerBlur}>
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.menuButton}>
                <Feather name="menu" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={styles.welcomeText}>مرحباً</Text>
                <Text style={styles.userName}>{userData?.name || 'المستخدم'}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={() => setBalancesVisible(!balancesVisible)}
              >
                <Ionicons 
                  name={balancesVisible ? "eye" : "eye-off"} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Balance Display */}
            <Animated.View style={[styles.balanceContainer, {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }]}>
              <Text style={styles.balanceLabel}>الرصيد المتاح</Text>
              <Text style={styles.balanceAmount}>
                {balancesVisible ? formatCurrency(financialSummary?.remainingBalance || 0) : '• • • • •'}
              </Text>
              
              <View style={styles.balanceStats}>
                <View style={styles.balanceStat}>
                  <Text style={styles.statValue}>
                    {commitmentPercentage}%
                  </Text>
                  <Text style={styles.statLabel}>نسبة الالتزامات</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.balanceStat}>
                  <Text style={styles.statValue}>
                    {daysToPayday || 0}
                  </Text>
                  <Text style={styles.statLabel}>يوم للراتب</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.balanceStat}>
                  <Text style={styles.statValue}>
                    {upcomingPayments.length}
                  </Text>
                  <Text style={styles.statLabel}>دفعات قادمة</Text>
                </View>
              </View>
            </Animated.View>
          </BlurView>
        </LinearGradient>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/add-payment')}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8787']}
              style={styles.actionGradient}
            >
              <Ionicons name="add-circle" size={28} color="#FFFFFF" />
              <Text style={styles.actionText}>دفعة جديدة</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/add-commitment')}
          >
            <LinearGradient
              colors={['#4ECDC4', '#44A3AA']}
              style={styles.actionGradient}
            >
              <MaterialCommunityIcons name="file-document-plus" size={28} color="#FFFFFF" />
              <Text style={styles.actionText}>التزام جديد</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Financial Health Score */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>الصحة المالية</Text>
            <View style={[styles.healthBadge, { backgroundColor: healthScore.color + '20' }]}>
              <Text style={[styles.healthBadgeText, { color: healthScore.color }]}>
                {healthScore.label}
              </Text>
            </View>
          </View>
          
          <View style={styles.healthScoreContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{healthScore.score}</Text>
              <Text style={styles.scoreLabel}>من 100</Text>
            </View>
            
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBarBackground}>
                <Animated.View 
                  style={[
                    styles.scoreBarFill,
                    { 
                      width: `${healthScore.score}%`,
                      backgroundColor: healthScore.color 
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
        
        {/* Financial Summary Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.cardsScroll}
        >
          <View style={styles.summaryCard}>
            <View style={styles.cardIconContainer}>
              <Ionicons name="wallet" size={24} color="#667EEA" />
            </View>
            <Text style={styles.cardLabel}>الراتب الشهري</Text>
            <Text style={styles.cardAmount}>
              {balancesVisible ? formatCurrency(financialSummary?.salary || 0) : '• • •'}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#FF6B6B20' }]}>
              <Ionicons name="trending-down" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.cardLabel}>الالتزامات</Text>
            <Text style={styles.cardAmount}>
              {balancesVisible ? formatCurrency(financialSummary?.totalCommitments || 0) : '• • •'}
            </Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
            </View>
            <Text style={styles.cardLabel}>مدفوعات مكتملة</Text>
            <Text style={styles.cardAmount}>
              {financialSummary?.completedPayments || 0}
            </Text>
          </View>
        </ScrollView>
        
        {/* Upcoming Payments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الدفعات القادمة</Text>
            <TouchableOpacity onPress={() => router.push('/payments')}>
              <Text style={styles.seeAll}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingPayments.length > 0 ? (
            upcomingPayments.slice(0, 3).map((payment) => (
              <TouchableOpacity key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentLeft}>
                  <View style={[
                    styles.paymentIcon,
                    { backgroundColor: payment.status === 'overdue' ? '#FF6B6B20' : '#4ECDC420' }
                  ]}>
                    <Ionicons 
                      name={payment.status === 'overdue' ? 'alert-circle' : 'time'} 
                      size={20} 
                      color={payment.status === 'overdue' ? '#FF6B6B' : '#4ECDC4'} 
                    />
                  </View>
                </View>
                
                <View style={styles.paymentCenter}>
                  <Text style={styles.paymentName}>{payment.creditor_name}</Text>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.due_date).toLocaleDateString('ar-KW')}
                  </Text>
                </View>
                
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(payment.amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-check" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>لا توجد دفعات قادمة</Text>
            </View>
          )}
        </View>
        
        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/add-commitment')}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
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
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Header Styles
  headerGradient: {
    paddingBottom: 30,
  },
  headerBlur: {
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight || 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
  },
  userName: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Balance Container
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  balanceStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -30,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Cairo-SemiBold',
    marginTop: 8,
  },
  
  // Health Card
  healthCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  healthTitle: {
    fontSize: 18,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  healthBadgeText: {
    fontSize: 12,
    fontFamily: 'Cairo-SemiBold',
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 28,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  scoreBarContainer: {
    flex: 1,
  },
  scoreBarBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Summary Cards
  cardsScroll: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 140,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#667EEA20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  
  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  seeAll: {
    fontSize: 14,
    color: '#667EEA',
    fontFamily: 'Cairo-Medium',
  },
  
  // Payment Item
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  paymentLeft: {
    marginRight: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentCenter: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    textAlign: 'right',
  },
  paymentDate: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
    marginTop: 2,
  },
  paymentRight: {
    marginLeft: 12,
  },
  paymentAmount: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    marginTop: 12,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
