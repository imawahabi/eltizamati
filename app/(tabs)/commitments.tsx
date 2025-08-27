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
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Database
import { 
  getActiveDebts, 
  getUserSettings
} from '@/lib/database';

// Components
import AddCommitmentModal from '@/components/AddCommitmentModal';
import SmartPaymentModal from '@/components/SmartPaymentModal';

const { width } = Dimensions.get('window');

interface Debt {
  id: number;
  entityId: number;
  entityName: string;
  entityKind: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  nextDueDate: string;
  status: 'active' | 'completed' | 'overdue';
  apr?: number;
}

interface UserSettings {
  name: string;
  salary: number;
  currency: string;
}

export default function CommitmentsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('nextDueDate');
  const [balancesVisible, setBalancesVisible] = useState(true);
  const [addDebtModalVisible, setAddDebtModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<number | null>(null);

  useEffect(() => {
    loadDebtsData();
  }, []);

  const loadDebtsData = async () => {
    try {
      setLoading(true);
      
      const [debtsData, settings] = await Promise.all([
        getActiveDebts(),
        getUserSettings()
      ]);

      setDebts(debtsData);
      setUserSettings(settings);
    } catch (error) {
      console.error('Error loading debts data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDebtsData();
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
        <Text style={[style, { fontSize: style.fontSize || 16 }]}>
          {parts[0]}
        </Text>
        <Text style={[style, {
          fontSize: (style.fontSize || 16) * 0.7,
          opacity: 0.7,
          marginRight: 2
        }]}>
          .{parts[1]}
        </Text>
        <Text style={[style, {
          fontSize: (style.fontSize || 16) * 0.6,
          opacity: 0.6,
          marginRight: 4
        }]}>
          د.ك
        </Text>
      </View>
    );
  };

  const getFilteredAndSortedDebts = () => {
    let filtered = debts.filter(debt => {
      // Filter by status
      if (selectedFilter === 'active' && debt.status !== 'active') return false;
      if (selectedFilter === 'completed' && debt.status !== 'completed') return false;
      if (selectedFilter === 'overdue' && debt.status !== 'overdue') return false;
      
      // Filter by search query
      if (searchQuery && !debt.entityName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    // Sort debts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nextDueDate':
          return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
        case 'amount':
          return b.remainingAmount - a.remainingAmount;
        case 'entityName':
          return a.entityName.localeCompare(b.entityName, 'ar');
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'overdue': return '#EF4444';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'overdue': return 'متأخر';
      case 'completed': return 'مكتمل';
      default: return 'غير محدد';
    }
  };

  const handleDebtPress = (debtId: number) => {
    router.push(`/debt/${debtId}`);
  };

  const handlePaymentPress = (debtId: number) => {
    setSelectedDebtId(debtId);
    setPaymentModalVisible(true);
  };

  const filteredDebts = getFilteredAndSortedDebts();
  const totalDebts = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const activeDebtsCount = debts.filter(d => d.status === 'active').length;
  const overdueDebtsCount = debts.filter(d => d.status === 'overdue').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B63FF" />
          <Text style={styles.loadingText}>جاري تحميل الالتزامات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
              <Text style={styles.headerTitle}>الالتزامات المالية</Text>
              <Text style={styles.headerSubtitle}>إدارة وتتبع جميع التزاماتك</Text>
            </View>
            
            <View style={styles.headerIcon}>
              <Ionicons name="card-outline" size={28} color="#FFFFFF" />
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {balancesVisible ? renderCurrencyAmount(totalDebts, styles.summaryValue) : '***'}
              </Text>
              <Text style={styles.summaryLabel}>إجمالي الديون</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{activeDebtsCount}</Text>
              <Text style={styles.summaryLabel}>التزام نشط</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{overdueDebtsCount}</Text>
              <Text style={styles.summaryLabel}>متأخر</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في الالتزامات..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          {[
            { key: 'all', label: 'الكل', count: debts.length },
            { key: 'active', label: 'نشط', count: activeDebtsCount },
            { key: 'overdue', label: 'متأخر', count: overdueDebtsCount },
            { key: 'completed', label: 'مكتمل', count: debts.filter(d => d.status === 'completed').length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.filterChipTextActive
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>ترتيب حسب:</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortButtonText}>
              {sortBy === 'nextDueDate' ? 'تاريخ الاستحقاق' : 
               sortBy === 'amount' ? 'المبلغ' : 'الاسم'}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Debts List */}
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
        {filteredDebts.length > 0 ? (
          <View style={styles.debtsContainer}>
            {filteredDebts.map((debt) => (
              <TouchableOpacity
                key={debt.id}
                style={styles.debtCard}
                onPress={() => handleDebtPress(debt.id)}
              >
                <View style={styles.debtHeader}>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtEntityName}>{debt.entityName}</Text>
                    <Text style={styles.debtEntityKind}>{debt.entityKind}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(debt.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(debt.status) }
                    ]}>
                      {getStatusText(debt.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.debtAmounts}>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>المبلغ المتبقي</Text>
                    <Text style={styles.amountValue}>
                      {balancesVisible ? renderCurrencyAmount(debt.remainingAmount, styles.amountValue) : '***'}
                    </Text>
                  </View>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>القسط الشهري</Text>
                    <Text style={styles.amountValue}>
                      {balancesVisible ? renderCurrencyAmount(debt.installmentAmount, styles.amountValue) : '***'}
                    </Text>
                  </View>
                </View>

                <View style={styles.debtProgress}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>
                      {debt.paidInstallments} من {debt.totalInstallments} أقساط
                    </Text>
                    <Text style={styles.nextDueDate}>
                      الاستحقاق التالي: {new Date(debt.nextDueDate).toLocaleDateString('en-US')}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${(debt.paidInstallments / debt.totalInstallments) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>

                <View style={styles.debtActions}>
                  <TouchableOpacity
                    style={styles.paymentButton}
                    onPress={() => handlePaymentPress(debt.id)}
                  >
                    <Ionicons name="card-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.paymentButtonText}>دفع قسط</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>التفاصيل</Text>
                    <Ionicons name="chevron-forward-outline" size={16} color="#0B63FF" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyStateText}>لا توجد التزامات</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'لم يتم العثور على نتائج للبحث' : 'ابدأ بإضافة التزاماتك المالية'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addFirstDebtButton}
                onPress={() => setAddDebtModalVisible(true)}
              >
                <Text style={styles.addFirstDebtButtonText}>إضافة التزام جديد</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {filteredDebts.length > 0 && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => setAddDebtModalVisible(true)}
        >
          <LinearGradient
            colors={['#0B63FF', '#1E40AF']}
            style={styles.floatingAddGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Modals */}
      <AddCommitmentModal
        visible={addDebtModalVisible}
        onClose={() => setAddDebtModalVisible(false)}
        onSave={() => {
          setAddDebtModalVisible(false);
          loadDebtsData();
        }}
      />

      <SmartPaymentModal
        visible={paymentModalVisible}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedDebtId(null);
        }}
        onSave={() => {
          setPaymentModalVisible(false);
          setSelectedDebtId(null);
          loadDebtsData();
        }}
      />
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

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 24,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0B63FF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-Medium',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  debtsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },

  // Debt Card
  debtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  debtInfo: {
    flex: 1,
  },
  debtEntityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  debtEntityKind: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
  },
  debtAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  debtProgress: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  nextDueDate: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Cairo-Medium',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  debtActions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B63FF',
    fontFamily: 'Cairo-Bold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    fontFamily: 'Cairo-Bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  addFirstDebtButton: {
    backgroundColor: '#0B63FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  addFirstDebtButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },

  // Floating Button
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingAddGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
