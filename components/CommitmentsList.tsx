import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { getObligations } from '@/lib/database';

interface CommitmentsListProps {
  onPaymentPress: (commitmentId: number) => void;
  onCommitmentPress: (commitment: any) => void;
}

export default function CommitmentsList({ onPaymentPress, onCommitmentPress }: CommitmentsListProps) {
  const { colors } = useTheme();
  const { flexDirection, textAlign } = useLayout();
  const [commitments, setCommitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommitments();
  }, []);

  const loadCommitments = async () => {
    try {
      const data = await getObligations();
      setCommitments(data);
    } catch (error) {
      console.error('Error loading commitments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCommitmentIcon = (type: string) => {
    switch (type) {
      case 'bank_loan':
      case 'financing':
        return 'business-outline';
      case 'personal_debt':
        return 'person-outline';
      case 'savings':
        return 'wallet-outline';
      case 'subscription':
        return 'refresh-outline';
      case 'bnpl':
        return 'card-outline';
      default:
        return 'document-outline';
    }
  };

  const getCommitmentColor = (type: string) => {
    switch (type) {
      case 'bank_loan':
      case 'financing':
        return '#3B82F6';
      case 'personal_debt':
        return '#10B981';
      case 'savings':
        return '#F59E0B';
      case 'subscription':
        return '#8B5CF6';
      case 'bnpl':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getCommitmentTypeLabel = (type: string) => {
    switch (type) {
      case 'bank_loan':
        return 'قرض بنكي';
      case 'financing':
        return 'تمويل';
      case 'personal_debt':
        return 'دين شخصي';
      case 'savings':
        return 'هدف ادخار';
      case 'subscription':
        return 'اشتراك شهري';
      case 'bnpl':
        return 'شراء بالتقسيط';
      default:
        return 'التزام';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'decimal',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const calculateProgress = (commitment: any) => {
    const paid = commitment.principal_amount - commitment.remaining_amount;
    return (paid / commitment.principal_amount) * 100;
  };

  const renderCommitmentItem = ({ item }: { item: any }) => {
    const progress = calculateProgress(item);
    const color = getCommitmentColor(item.type);

    return (
      <Card style={styles.commitmentCard}>
        <TouchableOpacity
          style={styles.commitmentContent}
          onPress={() => onCommitmentPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.commitmentHeader}>
            <View style={styles.commitmentInfo}>
              <View style={[styles.commitmentIcon, { backgroundColor: `${color}20` }]}>
                <Ionicons name={getCommitmentIcon(item.type) as any} size={24} color={color} />
              </View>
              <View style={styles.commitmentDetails}>
                <Text style={styles.commitmentTitle}>{item.creditor_name}</Text>
                <Text style={styles.commitmentType}>{getCommitmentTypeLabel(item.type)}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.addPaymentButton, { backgroundColor: `${color}15`, borderColor: color }]}
              onPress={() => onPaymentPress(item.id)}
            >
              <Ionicons name="add" size={20} color={color} />
            </TouchableOpacity>
          </View>

          <View style={styles.commitmentAmounts}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>المبلغ المتبقي:</Text>
              <Text style={[styles.amountValue, { color: color }]}>
                {formatCurrency(item.remaining_amount)} د.ك
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>القسط الشهري:</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(item.installment_amount)} د.ك
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>التقدم</Text>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%`, backgroundColor: color }
                ]} 
              />
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card style={styles.loadingCard}>
        <Text style={styles.loadingText}>جاري تحميل الالتزامات...</Text>
      </Card>
    );
  }

  if (commitments.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons name="document-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>لا توجد التزامات نشطة</Text>
        <Text style={styles.emptySubtitle}>ابدأ بإضافة التزام جديد لتتبع مدفوعاتك</Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>الالتزامات النشطة</Text>
        <Text style={styles.sectionSubtitle}>{commitments.length} التزام</Text>
      </View>
      
      <FlatList
        data={commitments}
        renderItem={renderCommitmentItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Cairo-Bold',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  commitmentCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  commitmentContent: {
    padding: 16,
  },
  commitmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commitmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commitmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commitmentDetails: {
    flex: 1,
  },
  commitmentTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  commitmentType: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  addPaymentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  commitmentAmounts: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  amountValue: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#1F2937',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: 'Cairo-SemiBold',
    color: '#1F2937',
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
  loadingCard: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
