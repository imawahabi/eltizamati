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
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1E40AF" 
        translucent={false}
        networkActivityIndicatorVisible={false}
      />
      
      {/* Modern Header with Tailwind-inspired design */}
      <LinearGradient 
        colors={['#1E40AF', '#3B82F6']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <CreditCard size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>الإلتزامات المالية</Text>
        </View>
        <View style={styles.headerDecoration} />
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


      {/* Add Commitment FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-commitment')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1E40AF', '#3B82F6']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Commitments List */}
      <ScrollView style={styles.commitmentsList} showsVerticalScrollIndicator={false} contentContainerStyle={styles.commitmentsContent}>
        {filteredCommitments.map((commitment) => (
          <TouchableOpacity key={commitment.id} style={styles.commitmentCard}>
            <View style={styles.commitmentHeader}>
              <View style={styles.commitmentStatus}>
                {getStatusIcon(commitment.status)}
                <Text style={styles.statusText}>
                  {commitment.status === 'active' ? 'نشط' : 
                   commitment.status === 'completed' ? 'مكتمل' : 'متأخر'}
                </Text>
              </View>

              <View style={styles.commitmentInfo}>
                <Text style={styles.commitmentName}>{commitment.name}</Text>
                <Text style={styles.commitmentEntity}>{commitment.entity}</Text>
                <View style={styles.commitmentMeta}>
                  <Text style={styles.metaText}>{commitment.category}</Text>
                  <Text style={styles.metaText}>•</Text>
                  <Text style={styles.metaText}>
                    {commitment.apr > 0 ? `${commitment.apr}% سنوياً` : 'بدون فوائد'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.commitmentIconContainer}>
                {getCommitmentIcon(commitment.type)}
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
    paddingHorizontal: 24,
    paddingBottom: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerActions: {
    position: 'absolute',
    top: 60,
    right: 24,
  },
  eyeButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filtersContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginTop: -15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  filtersScroll: {
    paddingHorizontal: 24,
  },
  filterButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginLeft: 12,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  filterText: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 30,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Cairo-Bold',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  commitmentsList: {
    flex: 1,
  },
  commitmentsContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  commitmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  commitmentHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  commitmentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  commitmentInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  commitmentName: {
    fontSize: 18,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  commitmentEntity: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
    marginBottom: 8,
  },
  commitmentMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  metaText: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
  },
  commitmentStatus: {
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  commitmentDetails: {
    gap: 16,
  },
  amountSection: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  amountLabel: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  amountValue: {
    fontSize: 20,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  progressSection: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  nextPayment: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  nextPaymentText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  urgencyIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  sortContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  sortMenu: {
    position: 'absolute',
    top: 70,
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortMenuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sortMenuItemActive: {
    backgroundColor: '#F0F9FF',
  },
  sortMenuText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    fontFamily: 'Cairo-Medium',
    textAlign: 'right',
  },
  sortMenuTextActive: {
    color: '#1E40AF',
    fontFamily: 'Cairo-Bold',
  },
  sortCheckmark: {
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
