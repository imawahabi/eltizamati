import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

// Database
import {
  getFinancialSummary,
  getUpcomingPayments,
  getUserSettings,
  getRecentPayments,
  getActiveDebts
} from '@/lib/database';

// Components
import { QuickActions } from '@/components/QuickActions';
// import { AlertsList } from '@/components/AlertsList';
// import { MonthlyOverview } from '@/components/MonthlyOverview';
// import { SalaryCard } from '@/components/SalaryCard';
// import { SavingsCard } from '@/components/SavingsCard';
import { SmartInsights } from '@/components/SmartInsights';
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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0B63FF" />
          <Text className="mt-4 text-gray-600 font-cairo-regular text-base">جاري تحميل البيانات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { width: screenWidth } = Dimensions.get('window');

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000000"
            colors={['#000000']}
          />
        }
      >
        {/* Ultra Modern Minimalist Header */}
        <View className="bg-white px-6 pt-6 pb-8">
          {/* Clean Top Navigation */}
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity 
                className="w-12 h-12 rounded-2xl bg-neutral-100 items-center justify-center"
                onPress={() => setBalancesVisible(!balancesVisible)}
              >
                <Ionicons 
                  name={balancesVisible ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#171717" 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-12 h-12 rounded-2xl bg-neutral-100 items-center justify-center"
                onPress={() => router.push('/settings')}
              >
                <Ionicons name="settings-outline" size={20} color="#171717" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center relative">
              <View className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-1 -right-1 z-10" />
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Ultra Minimal Welcome */}
          <View className="mb-8">
            <Text className="text-neutral-500 font-cairo-medium text-base mb-3">
              {new Date().toLocaleDateString('ar-KW', { 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
            <Text className="text-neutral-900 font-cairo-light text-4xl mb-2 leading-tight">
              مرحباً، {userSettings?.name || 'أحمد'}
            </Text>
            <Text className="text-neutral-600 font-cairo-regular text-lg">
              إليك نظرة سريعة على وضعك المالي
            </Text>
          </View>

          {/* Minimal Financial Health Score */}
          <View className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-neutral-900 font-cairo-medium text-lg mb-1">نقاط الصحة المالية</Text>
                <Text className="text-neutral-500 font-cairo-regular text-sm">من 100 نقطة</Text>
              </View>
              <View className="items-end">
                <Text className="text-neutral-900 font-cairo-light text-5xl mb-1">85</Text>
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-emerald-500" />
                  <Text className="text-emerald-600 font-cairo-medium text-sm">ممتاز</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Modern Financial Cards System */}
        <View className="px-6 gap-6">
          {/* Hero Balance Card - Minimal & Elegant */}
          <View className="bg-white rounded-3xl p-8 border border-neutral-100">
            <View className="flex-row items-start justify-between mb-8">
              <View className="flex-1">
                <Text className="text-neutral-500 font-cairo-medium text-sm mb-2">الرصيد المتاح</Text>
                <Text className="text-neutral-900 font-cairo-regular text-lg mb-4">
                  للإنفاق هذا الشهر
                </Text>
              </View>
              <TouchableOpacity
                className="w-10 h-10 rounded-2xl bg-neutral-100 items-center justify-center"
                onPress={() => setBalancesVisible(!balancesVisible)}
              >
                <Ionicons 
                  name={balancesVisible ? "eye-outline" : "eye-off-outline"} 
                  size={18} 
                  color="#525252" 
                />
              </TouchableOpacity>
            </View>
            
            <View className="mb-8">
              {balancesVisible ? (
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-neutral-900 font-cairo-light text-6xl">
                    {formatCurrency(financialSummary?.remainingBalance || 0).split('.')[0]}
                  </Text>
                  <Text className="text-neutral-600 font-cairo-regular text-2xl">
                    .{formatCurrency(financialSummary?.remainingBalance || 0).split('.')[1]}
                  </Text>
                  <Text className="text-neutral-500 font-cairo-medium text-xl">د.ك</Text>
                </View>
              ) : (
                <Text className="text-neutral-900 font-cairo-light text-6xl">••••••</Text>
              )}
            </View>
            
            {/* Clean Progress Indicators */}
            <View className="flex-row gap-8">
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-2 h-2 rounded-full bg-emerald-500" />
                  <Text className="text-neutral-500 font-cairo-medium text-sm">أيام للراتب</Text>
                </View>
                <Text className="text-neutral-900 font-cairo-medium text-2xl">{getDaysUntilPayday()}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-2">
                  <View className="w-2 h-2 rounded-full bg-blue-500" />
                  <Text className="text-neutral-500 font-cairo-medium text-sm">نسبة الراتب</Text>
                </View>
                <Text className="text-neutral-900 font-cairo-medium text-2xl">
                  {Math.round(((financialSummary?.remainingBalance || 0) / (userSettings?.salary || 1)) * 100)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Financial Overview Grid - Ultra Clean */}
          <View className="gap-4">
            <Text className="text-neutral-900 font-cairo-medium text-xl mb-2">نظرة عامة</Text>
            
            <View className="flex-row gap-4">
              {/* Salary Overview */}
              <View className="flex-1 bg-white rounded-2xl p-6 border border-neutral-100">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-8 h-8 rounded-xl bg-neutral-900 items-center justify-center">
                    <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                  </View>
                  <Text className="text-neutral-500 font-cairo-medium text-xs">شهري</Text>
                </View>
                
                {balancesVisible ? (
                  <View>
                    <Text className="text-neutral-900 font-cairo-medium text-2xl mb-1">
                      {formatCurrency(userSettings?.salary || 0).split('.')[0]}
                    </Text>
                    <Text className="text-neutral-500 font-cairo-regular text-sm">الراتب</Text>
                  </View>
                ) : (
                  <View>
                    <Text className="text-neutral-900 font-cairo-medium text-2xl mb-1">••••</Text>
                    <Text className="text-neutral-500 font-cairo-regular text-sm">الراتب</Text>
                  </View>
                )}
              </View>

              {/* Commitments Overview */}
              <View className="flex-1 bg-white rounded-2xl p-6 border border-neutral-100">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-8 h-8 rounded-xl bg-red-500 items-center justify-center">
                    <Ionicons name="remove" size={16} color="#FFFFFF" />
                  </View>
                  <Text className="text-neutral-500 font-cairo-medium text-xs">إجمالي</Text>
                </View>
                
                {balancesVisible ? (
                  <View>
                    <Text className="text-neutral-900 font-cairo-medium text-2xl mb-1">
                      {formatCurrency(financialSummary?.totalDebts || 0).split('.')[0]}
                    </Text>
                    <Text className="text-neutral-500 font-cairo-regular text-sm">الالتزامات</Text>
                  </View>
                ) : (
                  <View>
                    <Text className="text-neutral-900 font-cairo-medium text-2xl mb-1">••••</Text>
                    <Text className="text-neutral-500 font-cairo-regular text-sm">الالتزامات</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Ultra Modern Activity Feed */}
        <View className="px-6 gap-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              className="bg-neutral-900 px-4 py-2 rounded-2xl"
              onPress={() => router.push('/records')}
            >
              <Text className="text-white font-cairo-medium text-sm">عرض الكل</Text>
            </TouchableOpacity>
            <Text className="text-neutral-900 font-cairo-medium text-xl">النشاط الأخير</Text>
          </View>
          
          <View className="gap-3">
            {[
              { id: 1, entity: 'بنك الكويت الوطني', amount: 150.000, date: '2024-01-15', type: 'قسط شهري', category: 'bank' },
              { id: 2, entity: 'شركة زين', amount: 25.500, date: '2024-01-14', type: 'فاتورة', category: 'telecom' },
              { id: 3, entity: 'أحمد محمد', amount: 100.000, date: '2024-01-12', type: 'دين شخصي', category: 'personal' },
            ].map((payment) => (
              <View key={payment.id} className="bg-white rounded-2xl p-4 border border-neutral-100">
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-2xl bg-emerald-100 items-center justify-center">
                    <View className="w-2 h-2 rounded-full bg-emerald-500" />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-cairo-medium text-base mb-1">
                      {payment.entity}
                    </Text>
                    <Text className="text-neutral-500 font-cairo-regular text-sm">
                      {payment.type} • {new Date(payment.date).toLocaleDateString('ar-KW')}
                    </Text>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-neutral-900 font-cairo-medium text-lg">
                      -{formatCurrency(payment.amount).split('.')[0]}
                    </Text>
                    <Text className="text-neutral-500 font-cairo-regular text-xs">د.ك</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Modern Commitments Overview */}
        <View className="px-6 gap-6">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              className="bg-neutral-900 px-4 py-2 rounded-2xl"
              onPress={() => router.push('/commitments')}
            >
              <Text className="text-white font-cairo-medium text-sm">عرض الكل</Text>
            </TouchableOpacity>
            <Text className="text-neutral-900 font-cairo-medium text-xl">الالتزامات النشطة</Text>
          </View>
          
          <View className="gap-4">
            {[
              { id: 1, entity: 'بنك الخليج', type: 'قرض شخصي', remaining: 2500.000, progress: 65 },
              { id: 2, entity: 'شركة الاتصالات', type: 'اشتراك شهري', remaining: 180.000, progress: 30 },
            ].map((commitment) => (
              <View key={commitment.id} className="bg-white rounded-2xl p-6 border border-neutral-100">
                <View className="flex-row justify-between items-start mb-6">
                  <View className="flex-1">
                    <Text className="text-neutral-900 font-cairo-medium text-lg mb-1">
                      {commitment.entity}
                    </Text>
                    <Text className="text-neutral-500 font-cairo-regular text-sm mb-3">
                      {commitment.type}
                    </Text>
                    
                    <Text className="text-neutral-900 font-cairo-light text-3xl">
                      {formatCurrency(commitment.remaining).split('.')[0]}
                      <Text className="text-neutral-600 font-cairo-regular text-lg">
                        .{formatCurrency(commitment.remaining).split('.')[1]} د.ك
                      </Text>
                    </Text>
                    <Text className="text-neutral-500 font-cairo-regular text-sm mt-1">متبقي</Text>
                  </View>
                  
                  <View className="items-end">
                    <Text className="text-neutral-900 font-cairo-medium text-2xl">{commitment.progress}%</Text>
                    <Text className="text-neutral-500 font-cairo-regular text-xs">مكتمل</Text>
                  </View>
                </View>
                
                {/* Clean Progress Bar */}
                <View className="gap-2">
                  <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <View 
                      className={`h-full rounded-full ${
                        commitment.progress > 70 ? 'bg-emerald-500' : 
                        commitment.progress > 40 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${commitment.progress}%` }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <QuickActions />

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

        {/* Enhanced Smart Insights */}
        <SmartInsights 
          data={{
            totalDebt: financialSummary?.totalDebts || 0,
            monthlyPayments: financialSummary?.monthlyPayments || 0,
            completedPayments: financialSummary?.completedPayments || 0,
            overduePayments: financialSummary?.overduePayments || 0,
          }}
        />

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

        {/* Modern Upcoming Payments */}
        <View className="px-6 gap-6">
          <Text className="text-neutral-900 font-cairo-medium text-xl">الدفعات القادمة</Text>
          
          {upcomingPayments.length > 0 ? (
            <View className="gap-3">
              {upcomingPayments.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  className="bg-white rounded-2xl p-4 border border-neutral-100 active:bg-neutral-50"
                  onPress={() => handlePaymentPress(payment.debtId)}
                >
                  <View className="flex-row items-center gap-4">
                    <View className={`w-3 h-3 rounded-full ${
                      payment.status === 'overdue' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    
                    <View className="flex-1">
                      <Text className="text-neutral-900 font-cairo-medium text-base mb-1">
                        {payment.entityName}
                      </Text>
                      <Text className="text-neutral-500 font-cairo-regular text-sm">
                        {new Date(payment.dueDate).toLocaleDateString('ar-KW')} • القسط {payment.installmentNumber}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-neutral-900 font-cairo-medium text-lg">
                        {formatCurrency(payment.amount).split('.')[0]}
                      </Text>
                      <Text className="text-neutral-500 font-cairo-regular text-xs">د.ك</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-16 bg-white rounded-2xl border border-neutral-100">
              <View className="w-16 h-16 rounded-3xl bg-emerald-100 items-center justify-center mb-4">
                <Ionicons name="checkmark-circle-outline" size={24} color="#059669" />
              </View>
              <Text className="text-neutral-900 font-cairo-medium text-lg mb-2">لا توجد دفعات قادمة</Text>
              <Text className="text-neutral-500 font-cairo-regular text-sm text-center">
                جميع التزاماتك محدثة! 🎉
              </Text>
            </View>
          )}
        </View>

        {/* Modern Action Section */}
        <View className="px-6 gap-6 pb-6">
          <TouchableOpacity 
            className="bg-neutral-900 rounded-3xl p-6 active:bg-neutral-800"
            onPress={() => setAddDebtModalVisible(true)}
          >
            <View className="flex-row items-center justify-center gap-4">
              <View className="w-8 h-8 rounded-2xl bg-white items-center justify-center">
                <Ionicons name="add-outline" size={18} color="#171717" />
              </View>
              <Text className="text-white font-cairo-medium text-lg">إضافة التزام جديد</Text>
            </View>
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


