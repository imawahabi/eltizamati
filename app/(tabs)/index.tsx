import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  CreditCard,
  PieChart,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Plus,
  Send,
  Download,
  User,
  MoreHorizontal,
  Zap,
  TrendingDown as ArrowDown,
  Activity,
  Percent,
} from 'lucide-react-native';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const { width: screenWidth } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const quickActions = [
    { id: 1, title: 'إضافة التزام', icon: Plus, color: '#1E40AF', action: () => console.log('Add commitment') },
    { id: 2, title: 'تسجيل دفعة', icon: DollarSign, color: '#0369A1', route: '/commitments' as const },
    { id: 3, title: 'تأجيل قسط', icon: Clock, color: '#0284C7', route: '/commitments' as const },
    { id: 4, title: 'التحليلات', icon: PieChart, color: '#0EA5E9', route: '/analytics' as const },
    { id: 5, title: 'التذكيرات', icon: Bell, color: '#0F766E', route: '/settings' as const },
    { id: 6, title: 'الجهات', icon: User, color: '#0891B2', route: '/settings' as const },
  ];

  const recentCommitments = [
    { id: 1, title: 'قرض NBK', amount: 160.500, type: 'loan', entity: 'National Bank of Kuwait', date: '2025-01-25', status: 'pending', daysLeft: 3 },
    { id: 2, title: 'تقسيط X-cite', amount: 18.750, type: 'bnpl', entity: 'X-cite (Alghanim)', date: '2025-01-15', status: 'completed', daysLeft: 0 },
    { id: 3, title: 'دين محمد', amount: 40.000, type: 'friend', entity: 'محمد أحمد', date: '2025-01-10', status: 'overdue', daysLeft: -15 },
    { id: 4, title: 'تقسيط Tabby', amount: 25.250, type: 'bnpl', entity: 'Tabby', date: '2025-01-28', status: 'pending', daysLeft: 6 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Modern Header with Glass Effect */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modernHeader}
      >
        <View style={styles.headerDecoration} />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <User size={24} color="#FFFFFF" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>مرحباً بك</Text>
                <Text style={styles.userName}>أحمد محمد</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerActionButton}>
                <Eye size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell size={20} color="#FFFFFF" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Balance Display */}
          <View style={styles.balanceDisplay}>
            <Text style={styles.balanceLabel}>إجمالي الرصيد المتاح</Text>
            <View style={styles.balanceRow}>
              <TouchableOpacity 
                style={styles.visibilityButton}
                onPress={() => setBalanceVisible(!balanceVisible)}
              >
                {balanceVisible ? 
                  <Eye size={20} color="rgba(255,255,255,0.8)" /> : 
                  <EyeOff size={20} color="rgba(255,255,255,0.8)" />
                }
              </TouchableOpacity>
              <Text style={styles.balanceAmount}>
                {balanceVisible ? '549.750 د.ك' : '••••••••'}
              </Text>
            </View>
            <View style={styles.balanceChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.changeText}>+2.5% من الشهر الماضي</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions Glass Bar */}
      <View style={styles.quickActionsBar}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
          style={styles.quickActionsGradient}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContent}
          >
            {quickActions.slice(0, 4).map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => action.route ? router.push(action.route) : action.action?.()}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={18} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Glass Morphism Cards */}
        <View style={styles.cardsContainer}>
          {/* Salary Card */}
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.glassGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Wallet size={24} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>الراتب الشهري</Text>
              </View>
              <Text style={styles.cardAmount}>
                {balanceVisible ? '1,200.000 د.ك' : '•••••••'}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#10B981' }]} />
                </View>
                <Text style={styles.progressLabel}>100% مستلم</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Commitments Card */}
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.glassGradient}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <CreditCard size={24} color="#EF4444" />
                </View>
                <Text style={styles.cardTitle}>إجمالي الالتزامات</Text>
              </View>
              <Text style={styles.cardAmount}>
                {balanceVisible ? '650.250 د.ك' : '•••••••'}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '54.2%', backgroundColor: '#EF4444' }]} />
                </View>
                <Text style={styles.progressLabel}>54.2% من الراتب</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Enhanced Overview Section */}
        <View style={styles.overviewSection}>
          {/* Financial Progress Card */}
          <View style={styles.progressCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.92)']}
              style={styles.progressCardGradient}
            >
              <View style={styles.progressHeader}>
                <View style={styles.progressHeaderLeft}>
                  <View style={styles.progressIconContainer}>
                    <PieChart size={24} color="#1E40AF" />
                  </View>
                  <View>
                    <Text style={styles.progressTitle}>النظرة العامة المالية</Text>
                    <Text style={styles.progressSubtitle}>يناير 2025</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <MoreHorizontal size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.enhancedProgressContainer}>
                <View style={styles.circularProgressWrapper}>
                  <View style={styles.enhancedProgressRing}>
                    <View style={styles.progressCenter}>
                      <Text style={styles.progressMainValue}>45.8%</Text>
                      <Text style={styles.progressMainLabel}>متبقي</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.progressStats}>
                  <View style={styles.progressStatItem}>
                    <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
                    <View style={styles.statContent}>
                      <Text style={styles.statTitle}>الراتب الشهري</Text>
                      <Text style={styles.statValue}>1,200.000 د.ك</Text>
                      <Text style={styles.statPercentage}>100%</Text>
                    </View>
                  </View>
                  <View style={styles.progressStatItem}>
                    <View style={[styles.statIndicator, { backgroundColor: '#EF4444' }]} />
                    <View style={styles.statContent}>
                      <Text style={styles.statTitle}>إجمالي الالتزامات</Text>
                      <Text style={styles.statValue}>650.250 د.ك</Text>
                      <Text style={styles.statPercentage}>54.2%</Text>
                    </View>
                  </View>
                  <View style={styles.progressStatItem}>
                    <View style={[styles.statIndicator, { backgroundColor: '#1E40AF' }]} />
                    <View style={styles.statContent}>
                      <Text style={styles.statTitle}>المبلغ المتبقي</Text>
                      <Text style={styles.statValue}>549.750 د.ك</Text>
                      <Text style={styles.statPercentage}>45.8%</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Enhanced Quick Stats */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatCard}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.statCardGradient}
              >
                <View style={styles.statCardIcon}>
                  <CheckCircle size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statCardNumber}>8</Text>
                <Text style={styles.statCardLabel}>مكتمل</Text>
                <View style={styles.statCardBadge}>
                  <Text style={styles.badgeLabel}>+2 هذا الأسبوع</Text>
                </View>
              </LinearGradient>
            </View>
            
            <View style={styles.quickStatCard}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.statCardGradient}
              >
                <View style={styles.statCardIcon}>
                  <Clock size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statCardNumber}>4</Text>
                <Text style={styles.statCardLabel}>معلق</Text>
                <View style={styles.statCardBadge}>
                  <Text style={styles.badgeLabel}>يحتاج متابعة</Text>
                </View>
              </LinearGradient>
            </View>
            
            <View style={styles.quickStatCard}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.statCardGradient}
              >
                <View style={styles.statCardIcon}>
                  <AlertTriangle size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.statCardNumber}>1</Text>
                <Text style={styles.statCardLabel}>متأخر</Text>
                <View style={styles.statCardBadge}>
                  <Text style={styles.badgeLabel}>يحتاج إجراء</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>


        {/* Recent Commitments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الالتزامات الأخيرة</Text>
            <TouchableOpacity onPress={() => router.push('/commitments')}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.commitmentsContainer}>
            {recentCommitments.map((commitment) => (
              <View key={commitment.id} style={styles.commitmentCard}>
                <View style={styles.commitmentLeft}>
                  <View style={[
                    styles.commitmentIcon,
                    { backgroundColor: getCommitmentColor(commitment.type) }
                  ]}>
                    {getCommitmentIcon(commitment.type)}
                  </View>
                  <View style={styles.commitmentInfo}>
                    <Text style={styles.commitmentTitle}>{commitment.title}</Text>
                    <Text style={styles.commitmentEntity}>{commitment.entity}</Text>
                    <Text style={styles.commitmentDate}>{commitment.date}</Text>
                  </View>
                </View>
                <View style={styles.commitmentRight}>
                  <Text style={[
                    styles.commitmentAmount,
                    { color: getCommitmentColor(commitment.type) }
                  ]}>
                    {commitment.amount.toFixed(3)} د.ك
                  </Text>
                  <View style={styles.commitmentMeta}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(commitment.status) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(commitment.status)}
                      </Text>
                    </View>
                    {commitment.daysLeft !== 0 && (
                      <Text style={[styles.daysLeft, { color: commitment.daysLeft < 0 ? '#DC2626' : '#6B7280' }]}>
                        {commitment.daysLeft > 0 ? `${commitment.daysLeft} يوم` : `متأخر ${Math.abs(commitment.daysLeft)} يوم`}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الشهر</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>الراتب الشهري:</Text>
              <Text style={styles.summaryValue}>1,200.000 د.ك</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>إجمالي الأقساط:</Text>
              <Text style={styles.summaryValue}>-650.250 د.ك</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>المتبقي المتوقع:</Text>
              <Text style={[styles.summaryValueBold, { color: '#10B981' }]}>549.750 د.ك</Text>
            </View>
          </View>
        </View>

        {/* Statistics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نظرة عامة</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Target size={20} color="#1E40AF" />
              </View>
              <Text style={styles.statLabel}>الأهداف المحققة</Text>
              <Text style={styles.oldStatValue}>75%</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statLabel}>الالتزامات المعلقة</Text>
              <Text style={styles.oldStatValue}>4</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <Text style={styles.statLabel}>المكتملة هذا الشهر</Text>
              <Text style={styles.oldStatValue}>8</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getCommitmentColor(type: string) {
  switch (type) {
    case 'loan':
      return '#1E40AF';
    case 'bnpl':
      return '#0369A1';
    case 'friend':
      return '#0284C7';
    case 'oneoff':
      return '#0EA5E9';
    default:
      return '#6B7280';
  }
}

function getCommitmentIcon(type: string) {
  switch (type) {
    case 'loan':
      return <CreditCard size={20} color="#FFFFFF" />;
    case 'bnpl':
      return <Wallet size={20} color="#FFFFFF" />;
    case 'friend':
      return <User size={20} color="#FFFFFF" />;
    case 'oneoff':
      return <DollarSign size={20} color="#FFFFFF" />;
    default:
      return <AlertTriangle size={20} color="#FFFFFF" />;
  }
}

function getStatusColor(status: string) {
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
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'مكتمل';
    case 'pending':
      return 'معلق';
    case 'overdue':
      return 'متأخر';
    default:
      return 'غير محدد';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  userSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceDisplay: {
    alignItems: 'flex-end',
    flex: 1,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },
  visibilityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceChange: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  changeText: {
    fontSize: 14,
    color: '#10B981',
    fontFamily: 'Cairo-Medium',
  },
  headerContent: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  userName: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 25,
    gap: 12,
  },
  glassCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  glassGradient: {
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  cardAmount: {
    fontSize: 22,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  summaryGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
  },
  circularProgressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 24,
  },
  circularProgress: {
    width: 120,
    height: 120,
    marginLeft: 24,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E5E7EB',
    borderTopColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  progressPercentage: {
    fontSize: 20,
    color: '#1E40AF',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
  },
  progressLegend: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  legendValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
  },
  quickStatsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  statNumber: {
    fontSize: 20,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  integratedCard: {
    marginHorizontal: 24,
    marginTop: -40,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
    textAlign: 'right',
  },
  oldVisibilityButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 64, 175, 0.1)',
  },
  salarySection: {
    marginBottom: 20,
  },
  salaryHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  salaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
  },
  salaryLabel: {
    flex: 1,
    fontSize: 17,
    color: '#374151',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  salaryAmount: {
    fontSize: 16,
    color: '#10B981',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
  },
  commitmentsSection: {
    marginBottom: 20,
  },
  commitmentsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  commitmentsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
  },
  commitmentsLabel: {
    flex: 1,
    fontSize: 17,
    color: '#374151',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  commitmentsAmount: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
  },
  remainingSection: {
    marginBottom: 16,
  },
  remainingDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  remainingHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 10,
  },
  remainingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 64, 175, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  remainingLabel: {
    flex: 1,
    fontSize: 19,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  remainingAmount: {
    fontSize: 18,
    color: '#1E40AF',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginLeft: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Cairo-Medium',
    minWidth: 60,
    textAlign: 'right',
  },
  quickStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Cairo-Medium',
    marginRight: 8,
    textAlign: 'right',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 15,
    color: '#4F46E5',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  quickActionsBar: {
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 10,
  },
  quickActionsGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  quickActionsContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  quickActionItem: {
    alignItems: 'center',
    minWidth: 75,
    paddingHorizontal: 8,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  quickActionText: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap-reverse',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (screenWidth - 70) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 15,
    color: '#1F2937',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
  },
  commitmentsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  commitmentCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commitmentLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  commitmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  commitmentInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  commitmentTitle: {
    fontSize: 17,
    color: '#1F2937',
    fontFamily: 'Cairo-Medium',
    marginBottom: 6,
    textAlign: 'right',
  },
  commitmentEntity: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Cairo-Medium',
    marginBottom: 3,
    textAlign: 'right',
  },
  commitmentDate: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  commitmentMeta: {
    alignItems: 'flex-start',
  },
  daysLeft: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    marginTop: 5,
    textAlign: 'right',
  },
  commitmentRight: {
    alignItems: 'flex-start',
  },
  commitmentAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    marginBottom: 6,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginBottom: 6,
  },
  oldStatValue: {
    fontSize: 19,
    color: '#1F2937',
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
  },
  overviewSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  progressCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    marginBottom: 20,
  },
  progressCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressHeaderLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  progressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 64, 175, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  progressTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedProgressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 20,
  },
  circularProgressWrapper: {
    alignItems: 'center',
  },
  enhancedProgressRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    borderColor: '#E5E7EB',
    borderTopColor: '#1E40AF',
    borderRightColor: '#10B981',
    borderBottomColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  progressCenter: {
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },
  progressMainValue: {
    fontSize: 22,
    color: '#1E40AF',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
  },
  progressMainLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Medium',
    marginTop: 4,
  },
  progressStats: {
    flex: 1,
    gap: 12,
  },
  progressStatItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  statIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  statValue: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 2,
  },
  statPercentage: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
    marginTop: 1,
  },
  quickStatsContainer: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statCardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'space-between',
  },
  statCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statCardNumber: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Medium',
    textAlign: 'center',
    marginBottom: 12,
  },
  statCardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  summaryValue: {
    fontSize: 15,
    color: '#1F2937',
    fontFamily: 'Cairo-Medium',
    textAlign: 'left',
  },
  summaryLabelBold: {
    fontSize: 17,
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  summaryValueBold: {
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    textAlign: 'left',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
});
