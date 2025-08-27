import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { 
  Plus,
  CreditCard,
  TrendingUp,
  Calendar,
  AlertTriangle,
  DollarSign
} from 'lucide-react-native';
import { getFinancialSummary, getUpcomingPayments, getSettings } from '@/lib/database';
import { formatCurrency } from '@/lib/money';

interface FinancialSummary {
  salary: number;
  monthlyCommitments: number;
  remainingBalance: number;
  activeDebts: number;
  totalPaid: number;
}

interface UpcomingPayment {
  id: number;
  entity_name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'overdue';
}

export default function Dashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryData, paymentsData, settingsData] = await Promise.all([
        getFinancialSummary(),
        getUpcomingPayments(7), // Next 7 days
        getSettings()
      ]);
      
      setSummary(summaryData);
      setUpcomingPayments(paymentsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAddDebt = () => {
    router.push('/add-debt');
  };

  const handleAddPayment = () => {
    router.push('/add-payment');
  };

  const handleViewDebts = () => {
    router.push('/debts');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#E74C3C';
      case 'pending':
        return '#FFAA00';
      default:
        return '#28A745';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'متأخر';
      case 'pending':
        return 'مستحق';
      default:
        return 'مدفوع';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#0B63FF', '#2C9BF0', '#8FD3FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>إلتزاماتي</Text>
        <Text style={styles.headerSubtitle}>
          {settings?.user_name ? `مرحباً ${settings.user_name}` : 'مرحباً بك'}
        </Text>
      </LinearGradient>

      {/* Financial Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.salaryCard]}>
            <DollarSign size={24} color="#28A745" />
            <Text style={styles.summaryValue}>
              {formatCurrency(summary?.salary || 0)}
            </Text>
            <Text style={styles.summaryLabel}>الراتب الشهري</Text>
          </View>

          <View style={[styles.summaryCard, styles.commitmentsCard]}>
            <CreditCard size={24} color="#0B63FF" />
            <Text style={styles.summaryValue}>
              {formatCurrency(summary?.monthlyCommitments || 0)}
            </Text>
            <Text style={styles.summaryLabel}>الالتزامات الشهرية</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, styles.remainingCard]}>
          <TrendingUp size={24} color="#FFAA00" />
          <Text style={styles.summaryValue}>
            {formatCurrency(summary?.remainingBalance || 0)}
          </Text>
          <Text style={styles.summaryLabel}>المتبقي بعد الالتزامات</Text>
          <Text style={styles.summarySubtext}>
            {summary?.activeDebts || 0} التزام نشط
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddDebt}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>إضافة التزام</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleAddPayment}>
            <CreditCard size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>تسجيل دفعة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleViewDebts}>
            <Calendar size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>عرض الالتزامات</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Payments */}
      <View style={styles.paymentsContainer}>
        <Text style={styles.sectionTitle}>المستحقات القادمة</Text>
        {upcomingPayments.length > 0 ? (
          upcomingPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentEntity}>{payment.entity_name}</Text>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(payment.amount)}
                </Text>
                <Text style={styles.paymentDate}>{payment.due_date}</Text>
              </View>
              <View style={styles.paymentStatus}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(payment.status) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(payment.status)}
                  </Text>
                </View>
                {payment.status === 'overdue' && (
                  <AlertTriangle size={16} color="#E74C3C" />
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>لا توجد مستحقات قادمة</Text>
            <Text style={styles.emptySubtext}>
              أضف التزاماتك لتتبع المستحقات
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Cairo-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  summaryContainer: {
    padding: 20,
    marginTop: -20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  salaryCard: {
    flex: 1,
  },
  commitmentsCard: {
    flex: 1,
  },
  remainingCard: {
    width: '100%',
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: '#0F1724',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#6B7280',
    textAlign: 'center',
  },
  summarySubtext: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#0F1724',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0B63FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#FFFFFF',
  },
  paymentsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentEntity: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#0F1724',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 14,
    fontFamily: 'Cairo-Bold',
    color: '#0B63FF',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  paymentStatus: {
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Cairo-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
