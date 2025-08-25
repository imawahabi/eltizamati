import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  Target,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function CommitmentsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [hideAmounts, setHideAmounts] = useState(false);

  const mockCommitments = [
    {
      id: 1,
      entity: 'NBK',
      type: 'loan',
      name: 'قرض شخصي - البنك الأهلي',
      principal: 3200.000,
      installmentAmount: 160.000,
      remainingInstallments: 24,
      totalInstallments: 36,
      dueDay: 25,
      nextDueDate: '2025-08-25',
      apr: 7.0,
      status: 'active',
      urgency: 'high',
      category: 'بنك'
    },
    {
      id: 2,
      entity: 'Eureka',
      type: 'bnpl',
      name: 'تقسيط يوريكا - جهاز كمبيوتر',
      principal: 129.500,
      installmentAmount: 18.500,
      remainingInstallments: 7,
      totalInstallments: 7,
      dueDay: 15,
      nextDueDate: '2025-09-15',
      apr: 0,
      status: 'active',
      urgency: 'medium',
      category: 'إلكترونيات'
    },
    {
      id: 3,
      entity: 'محمد',
      type: 'friend',
      name: 'دين شخصي - محمد',
      principal: 120.000,
      installmentAmount: 40.000,
      remainingInstallments: 2,
      totalInstallments: 3,
      dueDay: 10,
      nextDueDate: '2025-09-10',
      apr: 0,
      status: 'active',
      urgency: 'low',
      category: 'شخصي'
    },
    {
      id: 4,
      entity: 'Tabby',
      type: 'bnpl',
      name: 'تابي - X-cite',
      principal: 240.000,
      installmentAmount: 60.000,
      remainingInstallments: 4,
      totalInstallments: 4,
      dueDay: 5,
      nextDueDate: '2025-09-05',
      apr: 0,
      status: 'active',
      urgency: 'medium',
      category: 'تقسيط'
    },
    {
      id: 5,
      entity: 'KFH',
      type: 'loan',
      name: 'قرض السيارة - بيت التمويل',
      principal: 8500.000,
      installmentAmount: 245.000,
      remainingInstallments: 0,
      totalInstallments: 48,
      dueDay: 20,
      nextDueDate: '2025-07-20',
      apr: 6.5,
      status: 'completed',
      urgency: 'none',
      category: 'سيارة'
    }
  ];

  const getCommitmentIcon = (type: string) => {
    switch (type) {
      case 'loan': return <CreditCard size={24} color="#1E40AF" />;
      case 'bnpl': return <Target size={24} color="#059669" />;
      case 'friend': return <DollarSign size={24} color="#7C3AED" />;
      default: return <DollarSign size={24} color="#6B7280" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      case 'none': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} color="#10B981" />;
      case 'active': return <Clock size={20} color="#F59E0B" />;
      case 'overdue': return <AlertCircle size={20} color="#EF4444" />;
      default: return <Clock size={20} color="#6B7280" />;
    }
  };

  const getSortPriority = (commitment: any) => {
    const urgencyPriority = { high: 3, medium: 2, low: 1, none: 0 };
    const daysToDue = new Date(commitment.nextDueDate).getTime() - new Date().getTime();
    const daysLeft = Math.ceil(daysToDue / (1000 * 60 * 60 * 24));
    
    return {
      urgency: urgencyPriority[commitment.urgency as keyof typeof urgencyPriority] || 0,
      daysLeft: daysLeft,
      amount: commitment.installmentAmount,
      remaining: commitment.remainingInstallments
    };
  };

  const sortCommitments = (commitments: any[]) => {
    return [...commitments].sort((a, b) => {
      const aPriority = getSortPriority(a);
      const bPriority = getSortPriority(b);
      
      switch (sortBy) {
        case 'urgency':
          if (bPriority.urgency !== aPriority.urgency) {
            return bPriority.urgency - aPriority.urgency;
          }
          return aPriority.daysLeft - bPriority.daysLeft;
        
        case 'dueDate':
          return aPriority.daysLeft - bPriority.daysLeft;
        
        case 'amount':
          return bPriority.amount - aPriority.amount;
        
        case 'remaining':
          return aPriority.remaining - bPriority.remaining;
        
        default:
          return 0;
      }
    });
  };

  const filteredCommitments = sortCommitments(
    mockCommitments.filter(commitment => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'active') return commitment.status === 'active';
      if (selectedFilter === 'completed') return commitment.status === 'completed';
      if (selectedFilter === 'urgent') return commitment.urgency === 'high';
      return true;
    })
  );

  const filters = [
    { key: 'all', label: 'الكل', count: mockCommitments.length },
    { key: 'active', label: 'نشط', count: mockCommitments.filter(c => c.status === 'active').length },
    { key: 'urgent', label: 'عاجل', count: mockCommitments.filter(c => c.urgency === 'high').length },
    { key: 'completed', label: 'مكتمل', count: mockCommitments.filter(c => c.status === 'completed').length },
  ];

  const sortOptions = [
    { key: 'urgency', label: 'الأولوية والاستعجال' },
    { key: 'dueDate', label: 'تاريخ الاستحقاق' },
    { key: 'amount', label: 'قيمة القسط' },
    { key: 'remaining', label: 'الأقساط المتبقية' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>الالتزامات المالية</Text>
          <Text style={styles.headerSubtitle}>إدارة جميع التزاماتك المالية</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setHideAmounts(!hideAmounts)}
          >
            {hideAmounts ? (
              <EyeOff size={20} color="#FFFFFF" />
            ) : (
              <Eye size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-commitment')}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
              <View style={[
                styles.filterBadge,
                selectedFilter === filter.key && styles.filterBadgeActive
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  selectedFilter === filter.key && styles.filterBadgeTextActive
                ]}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <ArrowUpDown size={16} color="#6B7280" />
          <Text style={styles.sortButtonText}>
            ترتيب حسب: {sortOptions.find(s => s.key === sortBy)?.label}
          </Text>
          <ChevronDown size={16} color="#6B7280" />
        </TouchableOpacity>
        
        {showSortMenu && (
          <View style={styles.sortMenu}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortMenuItem,
                  sortBy === option.key && styles.sortMenuItemActive
                ]}
                onPress={() => {
                  setSortBy(option.key);
                  setShowSortMenu(false);
                }}
              >
                <Text style={[
                  styles.sortMenuText,
                  sortBy === option.key && styles.sortMenuTextActive
                ]}>
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <View style={styles.sortCheckmark}>
                    <CheckCircle size={16} color="#1E40AF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Commitments List */}
      <ScrollView style={styles.commitmentsList} showsVerticalScrollIndicator={false}>
        {filteredCommitments.map((commitment) => (
          <TouchableOpacity key={commitment.id} style={styles.commitmentCard}>
            <View style={styles.commitmentHeader}>
              <View style={styles.commitmentIconContainer}>
                {getCommitmentIcon(commitment.type)}
              </View>
              
              <View style={styles.commitmentInfo}>
                <Text style={styles.commitmentName}>{commitment.name}</Text>
                <Text style={styles.commitmentEntity}>{commitment.entity}</Text>
                <View style={styles.commitmentMeta}>
                  <Text style={styles.metaText}>
                    {commitment.apr > 0 ? `${commitment.apr}% سنوياً` : 'بدون فوائد'}
                  </Text>
                  <Text style={styles.metaText}>•</Text>
                  <Text style={styles.metaText}>{commitment.category}</Text>
                </View>
              </View>

              <View style={styles.commitmentStatus}>
                {getStatusIcon(commitment.status)}
                <Text style={styles.statusText}>
                  {commitment.status === 'active' ? 'نشط' : 
                   commitment.status === 'completed' ? 'مكتمل' : 'متأخر'}
                </Text>
              </View>
            </View>

            <View style={styles.commitmentDetails}>
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>القسط الشهري</Text>
                <Text style={styles.amountValue}>
                  {hideAmounts ? '••••••' : `${commitment.installmentAmount.toFixed(3)} د.ك`}
                </Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>
                    {commitment.status === 'completed' ? 'مكتمل' : 
                     `${commitment.remainingInstallments} من ${commitment.totalInstallments} أقساط متبقية`}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(((commitment.totalInstallments - commitment.remainingInstallments) / commitment.totalInstallments) * 100)}%
                  </Text>
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${((commitment.totalInstallments - commitment.remainingInstallments) / commitment.totalInstallments) * 100}%`,
                        backgroundColor: commitment.status === 'completed' ? '#10B981' : '#3B82F6'
                      }
                    ]} 
                  />
                </View>
              </View>

              {commitment.status === 'active' && (
                <View style={styles.nextPayment}>
                  <Calendar size={16} color="#6B7280" />
                  <Text style={styles.nextPaymentText}>
                    الدفعة القادمة: {commitment.nextDueDate}
                  </Text>
                  <View style={[
                    styles.urgencyIndicator,
                    { backgroundColor: getUrgencyColor(commitment.urgency) }
                  ]}>
                    <Text style={styles.urgencyText}>
                      {commitment.urgency === 'high' ? 'عاجل' : 
                       commitment.urgency === 'medium' ? 'متوسط' : 'منخفض'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo',
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    fontFamily: 'Cairo',
    textAlign: 'right',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1E40AF',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Cairo',
    fontWeight: 'bold',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  commitmentsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  commitmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  commitmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  commitmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commitmentInfo: {
    flex: 1,
  },
  commitmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Cairo',
    textAlign: 'right',
    marginBottom: 4,
  },
  commitmentEntity: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo',
    textAlign: 'right',
    marginBottom: 6,
  },
  commitmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Cairo',
  },
  commitmentStatus: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Cairo',
    fontWeight: '600',
  },
  commitmentDetails: {
    gap: 12,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Cairo',
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Cairo',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Cairo',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextPaymentText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Cairo',
    textAlign: 'right',
  },
  urgencyIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Cairo',
    fontWeight: '600',
  },
  sortContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    gap: 8,
  },
  sortButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Cairo',
    fontWeight: '500',
    textAlign: 'right',
  },
  sortMenu: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortMenuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortMenuItemActive: {
    backgroundColor: '#F0F9FF',
  },
  sortMenuText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Cairo',
    textAlign: 'right',
  },
  sortMenuTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  sortCheckmark: {
    marginLeft: 8,
  },
});
