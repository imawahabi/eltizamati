import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ArrowUp, ArrowDown, DollarSign, Calendar, Percent, Zap } from 'lucide-react-native';

interface Debt {
  id: string;
  name: string;
  balance: number;
  minPayment: number;
  interestRate: number;
  dueDate: string;
  priority: number;
}

interface PaymentPrioritizerProps {
  debts: Debt[];
  availableAmount: number;
  strategy: 'avalanche' | 'snowball' | 'hybrid';
  onStrategyChange: (strategy: 'avalanche' | 'snowball' | 'hybrid') => void;
  onApplyRecommendation: (allocations: { debtId: string; amount: number }[]) => void;
}

export function PaymentPrioritizer({ 
  debts, 
  availableAmount, 
  strategy, 
  onStrategyChange, 
  onApplyRecommendation 
}: PaymentPrioritizerProps) {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { isRTL, textAlign } = useLayout();
  
  const styles = createStyles(colors, isRTL);
  
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate payment allocation based on strategy
  const calculateAllocation = () => {
    const sortedDebts = [...debts].sort((a, b) => {
      switch (strategy) {
        case 'avalanche':
          return b.interestRate - a.interestRate; // Highest interest first
        case 'snowball':
          return a.balance - b.balance; // Lowest balance first
        case 'hybrid':
          // Balanced approach considering both interest and balance
          const aScore = (a.interestRate * 0.6) + ((1 / a.balance) * 1000 * 0.4);
          const bScore = (b.interestRate * 0.6) + ((1 / b.balance) * 1000 * 0.4);
          return bScore - aScore;
        default:
          return 0;
      }
    });
    
    let remainingAmount = availableAmount;
    const allocations: { debtId: string; amount: number; isMinimum: boolean }[] = [];
    
    // First, allocate minimum payments
    sortedDebts.forEach(debt => {
      const minPayment = Math.min(debt.minPayment, remainingAmount);
      allocations.push({
        debtId: debt.id,
        amount: minPayment,
        isMinimum: true
      });
      remainingAmount -= minPayment;
    });
    
    // Then, allocate extra amount to highest priority debt
    if (remainingAmount > 0 && sortedDebts.length > 0) {
      const priorityDebt = sortedDebts[0];
      const existingAllocation = allocations.find(a => a.debtId === priorityDebt.id);
      if (existingAllocation) {
        existingAllocation.amount += remainingAmount;
        existingAllocation.isMinimum = false;
      }
    }
    
    return allocations;
  };
  
  const allocations = calculateAllocation();
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  
  const getStrategyInfo = (strategyType: typeof strategy) => {
    switch (strategyType) {
      case 'avalanche':
        return {
          title: t('avalanche'),
          description: t('avalancheDescription'),
          icon: <ArrowDown size={16} color={colors.error} />,
          color: 'error' as const,
          benefit: t('saveOnInterest')
        };
      case 'snowball':
        return {
          title: t('snowball'),
          description: t('snowballDescription'),
          icon: <ArrowUp size={16} color={colors.success} />,
          color: 'success' as const,
          benefit: t('quickWins')
        };
      case 'hybrid':
        return {
          title: t('hybrid'),
          description: t('hybridDescription'),
          icon: <Zap size={16} color={colors.warning} />,
          color: 'warning' as const,
          benefit: t('balanced')
        };
    }
  };
  
  const currentStrategyInfo = getStrategyInfo(strategy);
  
  return (
    <View style={styles.container}>
      {/* Strategy Selection */}
      <Card style={styles.strategyCard}>
        <Text style={styles.sectionTitle}>{t('paymentStrategy')}</Text>
        
        <View style={styles.strategyOptions}>
          {(['avalanche', 'snowball', 'hybrid'] as const).map((strategyOption) => {
            const info = getStrategyInfo(strategyOption);
            const isSelected = strategy === strategyOption;
            
            return (
              <TouchableOpacity
                key={strategyOption}
                style={[
                  styles.strategyOption,
                  isSelected && styles.selectedStrategy
                ]}
                onPress={() => onStrategyChange(strategyOption)}
              >
                <View style={styles.strategyHeader}>
                  {info.icon}
                  <Text style={[
                    styles.strategyTitle,
                    isSelected && styles.selectedStrategyText
                  ]}>
                    {info.title}
                  </Text>
                </View>
                <Text style={[
                  styles.strategyDescription,
                  isSelected && styles.selectedStrategyDescription
                ]}>
                  {info.description}
                </Text>
                <Badge 
                  variant={isSelected ? 'default' : 'outlined'} 
                  size="small"
                  style={styles.strategyBenefit}
                >
                  {info.benefit}
                </Badge>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>
      
      {/* Payment Allocation */}
      <Card style={styles.allocationCard}>
        <View style={styles.allocationHeader}>
          <Text style={styles.sectionTitle}>{t('recommendedAllocation')}</Text>
          <TouchableOpacity
            onPress={() => setShowDetails(!showDetails)}
            style={styles.detailsToggle}
          >
            <Text style={styles.detailsToggleText}>
              {showDetails ? t('hideDetails') : t('showDetails')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.totalAmount}>
          <DollarSign size={20} color={colors.primary} />
          <Text style={styles.totalAmountText}>
            {totalAllocated} / {availableAmount} {t('kwd')}
          </Text>
        </View>
        
        <ProgressBar
          progress={(totalAllocated / availableAmount) * 100}
          height={8}
          style={styles.allocationProgress}
        />
        
        {showDetails && (
          <View style={styles.debtAllocations}>
            {allocations.map((allocation) => {
              const debt = debts.find(d => d.id === allocation.debtId);
              if (!debt) return null;
              
              const percentage = (allocation.amount / totalAllocated) * 100;
              
              return (
                <View key={debt.id} style={styles.debtAllocation}>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>{debt.name}</Text>
                    <View style={styles.debtMeta}>
                      <Badge 
                        variant={allocation.isMinimum ? 'warning' : 'success'} 
                        size="small"
                      >
                        {allocation.isMinimum ? t('minimum') : t('extra')}
                      </Badge>
                      <Text style={styles.debtRate}>
                        <Percent size={12} color={colors.textSecondary} />
                        {debt.interestRate}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.allocationAmount}>
                    <Text style={styles.allocationValue}>
                      {allocation.amount} {t('kwd')}
                    </Text>
                    <Text style={styles.allocationPercentage}>
                      {Math.round(percentage)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        
        <Button
          title={t('applyRecommendation')}
          variant="primary"
          onPress={() => onApplyRecommendation(allocations)}
          style={styles.applyButton}
          icon={<Zap size={20} color={colors.textInverse} />}
        />
      </Card>
      
      {/* Strategy Benefits */}
      <Card style={styles.benefitsCard}>
        <Text style={styles.sectionTitle}>{t('strategyBenefits')}</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefit}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.benefitText}>
              {t('estimatedPayoffTime')}: {t('calculating')}
            </Text>
          </View>
          <View style={styles.benefit}>
            <DollarSign size={16} color={colors.success} />
            <Text style={styles.benefitText}>
              {t('interestSavings')}: {t('calculating')}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    
    // Strategy Card
    strategyCard: {
      marginBottom: 16,
    },
    strategyOptions: {
      gap: 12,
    },
    strategyOption: {
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    selectedStrategy: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    strategyHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    strategyTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    selectedStrategyText: {
      color: colors.primary,
    },
    strategyDescription: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: 8,
      lineHeight: 20,
    },
    selectedStrategyDescription: {
      color: colors.text,
    },
    strategyBenefit: {
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
    },
    
    // Allocation Card
    allocationCard: {
      marginBottom: 16,
    },
    allocationHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    detailsToggle: {
      padding: 8,
    },
    detailsToggleText: {
      fontSize: 14,
      fontFamily: 'Cairo-Medium',
      color: colors.primary,
    },
    totalAmount: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    totalAmountText: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
    },
    allocationProgress: {
      marginBottom: 16,
    },
    
    // Debt Allocations
    debtAllocations: {
      gap: 12,
      marginBottom: 16,
    },
    debtAllocation: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    debtInfo: {
      flex: 1,
    },
    debtName: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: 4,
    },
    debtMeta: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 8,
    },
    debtRate: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    allocationAmount: {
      alignItems: isRTL ? 'flex-start' : 'flex-end',
    },
    allocationValue: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: isRTL ? 'left' : 'right',
    },
    allocationPercentage: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'left' : 'right',
    },
    
    applyButton: {
      marginTop: 8,
    },
    
    // Benefits Card
    benefitsCard: {
      marginBottom: 16,
    },
    benefitsList: {
      gap: 12,
    },
    benefit: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
    },
    benefitText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      marginLeft: isRTL ? 0 : 8,
      marginRight: isRTL ? 8 : 0,
      textAlign: isRTL ? 'right' : 'left',
    },
  });
}
