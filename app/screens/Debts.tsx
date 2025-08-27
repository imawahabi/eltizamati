import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Plus,
  Building2,
  CreditCard,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react-native';
import { getDebts, getPayments } from '@/lib/database';
import { formatCurrency } from '@/lib/money';

interface Debt {
  id: number;
  entity_name: string;
  entity_kind: string;
  kind: string;
  principal: number;
  installment_amount: number;
  remaining_installments: number;
  due_day: number;
  status: string;
  apr: number;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const debtsData = await getDebts('active');
      setDebts(debtsData);
    } catch (error) {
      console.error('Error loading debts:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الالتزامات');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDebts();
    setRefreshing(false);
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'bank':
        return <Building2 size={20} color="#0B63FF" />;
      case 'bnpl':
      case 'retailer':
        return <CreditCard size={20} color="#28A745" />;
      case 'person':
        return <Users size={20} color="#FFAA00" />;
      default:
        return <DollarSign size={20} color="#6B7280" />;
    }
  };

  const getKindText = (kind: string) => {
    switch (kind) {
      case 'loan':
        return 'قرض';
      case 'bnpl':
        return 'تقسيط';
      case 'friend':
        return 'دين شخصي';
      case 'oneoff':
        return 'دفعة واحدة';
      default:
        return kind;
    }
  };

  const getEntityKindText = (entityKind: string) => {
    switch (entityKind) {
      case 'bank':
        return 'بنك';
      case 'bnpl':
        return 'تقسيط إلكتروني';
      case 'retailer':
        return 'متجر';
      case 'person':
        return 'شخص';
      case 'finance':
        return 'شركة تمويل';
      case 'telco':
        return 'اتصالات';
      default:
        return entityKind;
    }
  };

  const filteredDebts = debts.filter(debt => {
    if (filter === 'all') return true;
    return debt.entity_kind === filter;
  });

  const renderDebtCard = ({ item }: { item: Debt }) => {
    const totalRemaining = item.installment_amount * item.remaining_installments;
    const progress = ((item.principal - totalRemaining) / item.principal) * 100;

    return (
      <TouchableOpacity
        style={styles.debtCard}
        onPress={() => router.push(`/debt-details/${item.id}`)}
      >
        <View style={styles.debtHeader}>
          <View style={styles.debtInfo}>
            {getKindIcon(item.entity_kind)}
            <View style={styles.debtTitles}>
              <Text style={styles.debtName}>{item.entity_name}</Text>
              <Text style={styles.debtType}>
                {getKindText(item.kind)} • {getEntityKindText(item.entity_kind)}
              </Text>
            </View>
          </View>
          <View style={styles.debtAmount}>
            <Text style={styles.installmentAmount}>
              {formatCurrency(item.installment_amount)}
            </Text>
            <Text style={styles.installmentLabel}>شهرياً</Text>
          </View>
        </View>

        <View style={styles.debtDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>المتبقي:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(totalRemaining)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الأقساط المتبقية:</Text>
            <Text style={styles.detailValue}>
              {item.remaining_installments} قسط
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>يوم الاستحقاق:</Text>
            <Text style={styles.detailValue}>{item.due_day}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}% مكتمل
          </Text>
        </View>

        {item.apr > 0 && (
          <View style={styles.interestBadge}>
            <AlertTriangle size={12} color="#FFAA00" />
            <Text style={styles.interestText}>
              فائدة {item.apr}% سنوياً
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterOptions = [
    { key: 'all', label: 'الكل', count: debts.length },
    { key: 'bank', label: 'البنوك', count: debts.filter(d => d.entity_kind === 'bank').length },
    { key: 'bnpl', label: 'التقسيط', count: debts.filter(d => d.entity_kind === 'bnpl').length },
    { key: 'retailer', label: 'المتاجر', count: debts.filter(d => d.entity_kind === 'retailer').length },
    { key: 'person', label: 'شخصي', count: debts.filter(d => d.entity_kind === 'person').length },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الالتزامات</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-debt')}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === item.key && styles.activeFilterTab
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.key && styles.activeFilterText
                ]}
              >
                {item.label}
              </Text>
              {item.count > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{item.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Debts List */}
      <FlatList
        data={filteredDebts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDebtCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <CreditCard size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>لا توجد التزامات</Text>
            <Text style={styles.emptySubtext}>
              أضف التزاماتك المالية لتتبعها
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-debt')}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>إضافة التزام</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Cairo-Bold',
    color: '#0F1724',
  },
  addButton: {
    backgroundColor: '#0B63FF',
    borderRadius: 12,
    padding: 12,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeFilterTab: {
    backgroundColor: '#0B63FF',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: 'Cairo-Bold',
    color: '#374151',
  },
  listContainer: {
    padding: 20,
  },
  debtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  debtTitles: {
    marginLeft: 12,
    flex: 1,
  },
  debtName: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: '#0F1724',
    marginBottom: 2,
  },
  debtType: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  debtAmount: {
    alignItems: 'flex-end',
  },
  installmentAmount: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#0B63FF',
  },
  installmentLabel: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  debtDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#0F1724',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28A745',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Cairo-SemiBold',
    color: '#28A745',
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  interestText: {
    fontSize: 10,
    fontFamily: 'Cairo-SemiBold',
    color: '#D97706',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Cairo-SemiBold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B63FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#FFFFFF',
  },
});
