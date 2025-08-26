import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input, Select } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { addPayment, getObligations, updateObligation } from '@/lib/database';

const { width, height } = Dimensions.get('window');

interface SmartPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  commitmentId?: number | null;
  onSuccess?: () => void;
}

interface PaymentCalculation {
  suggestedAmount: number;
  remainingBalance: number;
  monthsRemaining: number;
  earlyPayoffDate?: string;
  interestSaved?: number;
  newMonthlyAmount?: number;
}

export default function SmartPaymentModal({ visible, onClose, commitmentId, onSuccess }: SmartPaymentModalProps) {
  const { colors } = useTheme();
  const { isRTL } = useLayout();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCommitment, setSelectedCommitment] = useState<any>(null);
  const [commitments, setCommitments] = useState<any[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculations, setCalculations] = useState<PaymentCalculation | null>(null);
  const [paymentType, setPaymentType] = useState<'regular' | 'extra' | 'full'>('regular');

  const paymentMethods = [
    { label: 'نقد', value: 'cash', icon: 'cash-outline', color: '#10B981' },
    { label: 'بطاقة ائتمان', value: 'credit_card', icon: 'card-outline', color: '#3B82F6' },
    { label: 'تحويل بنكي', value: 'bank_transfer', icon: 'swap-horizontal-outline', color: '#8B5CF6' },
    { label: 'محفظة إلكترونية', value: 'ewallet', icon: 'phone-portrait-outline', color: '#F59E0B' },
    { label: 'شيك', value: 'check', icon: 'document-outline', color: '#6B7280' },
  ];

  useEffect(() => {
    if (visible) {
      loadCommitments();
      if (commitmentId) {
        loadSpecificCommitment(commitmentId);
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    }
  }, [visible, commitmentId]);

  useEffect(() => {
    if (selectedCommitment && paymentAmount) {
      calculatePaymentImpact();
    }
  }, [selectedCommitment, paymentAmount, paymentType]);

  const loadCommitments = async () => {
    try {
      const allCommitments = await getObligations();
      const activeCommitments = allCommitments.filter((c: any) => 
        c.status === 'active' && (c.remaining_amount || 0) > 0
      );
      setCommitments(activeCommitments);
    } catch (error) {
      console.error('Error loading commitments:', error);
    }
  };

  const loadSpecificCommitment = async (id: number) => {
    try {
      const allCommitments = await getObligations();
      const commitment = allCommitments.find((c: any) => c.id === id);
      if (commitment) {
        setSelectedCommitment(commitment);
        // Set suggested amount as regular installment
        setPaymentAmount((commitment as any)?.installment_amount?.toString() || '');
        setPaymentType('regular');
      }
    } catch (error) {
      console.error('Error loading commitment:', error);
    }
  };

  const calculatePaymentImpact = () => {
    if (!selectedCommitment || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    const remaining = selectedCommitment.remaining_amount;
    const installment = selectedCommitment.installment_amount || 0;
    const interestRate = (selectedCommitment.interest_rate || 0) / 100 / 12;

    const calculation: PaymentCalculation = {
      suggestedAmount: installment,
      remainingBalance: Math.max(0, remaining - amount),
      monthsRemaining: 0,
    };

    // Calculate months remaining after payment
    if (calculation.remainingBalance > 0 && installment > 0) {
      if (interestRate > 0) {
        // With interest calculation
        calculation.monthsRemaining = Math.ceil(
          Math.log(1 + (calculation.remainingBalance * interestRate) / installment) / 
          Math.log(1 + interestRate)
        );
      } else {
        // Simple division for non-interest bearing debts
        calculation.monthsRemaining = Math.ceil(calculation.remainingBalance / installment);
      }
    }

    // Calculate early payoff benefits
    if (amount > installment && selectedCommitment.interest_rate > 0) {
      const originalMonths = Math.ceil(remaining / installment);
      calculation.interestSaved = (originalMonths - calculation.monthsRemaining) * 
                                 (installment - (remaining * interestRate));
    }

    // Calculate new monthly amount for full payoff suggestions
    if (paymentType === 'full') {
      calculation.newMonthlyAmount = remaining;
      calculation.monthsRemaining = 0;
      calculation.earlyPayoffDate = new Date().toLocaleDateString('ar-KW');
    }

    setCalculations(calculation);
  };

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedCommitment) {
      newErrors.commitment = 'يرجى اختيار الالتزام';
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      newErrors.amount = 'مبلغ الدفعة مطلوب ويجب أن يكون أكبر من صفر';
    } else if (parseFloat(paymentAmount) > selectedCommitment?.remaining_amount) {
      newErrors.amount = 'مبلغ الدفعة أكبر من المبلغ المتبقي';
    }

    if (!paymentMethod) {
      newErrors.method = 'طريقة الدفع مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePayment = async () => {
    if (!validatePayment()) return;

    setIsLoading(true);
    try {
      const paymentData = {
        obligation_id: selectedCommitment.id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        note,
        payment_date: new Date().toISOString(),
        meta_json: JSON.stringify({
          payment_type: paymentType,
          calculation_data: calculations,
          created_via: 'smart_modal'
        })
      };

      await addPayment(paymentData);

      // Update obligation remaining amount
      const newRemainingAmount = Math.max(0, 
        selectedCommitment.remaining_amount - parseFloat(paymentAmount)
      );
      
      await updateObligation(selectedCommitment.id, {
        remaining_amount: newRemainingAmount,
        status: newRemainingAmount === 0 ? 'completed' : 'active'
      });

      Alert.alert(
        'تم بنجاح! 🎉',
        `تم تسجيل دفعة بمبلغ ${paymentAmount} د.ك\n${calculations?.remainingBalance === 0 ? 
          'تم سداد الالتزام بالكامل!' : 
          `المبلغ المتبقي: ${calculations?.remainingBalance.toFixed(2)} د.ك`
        }`,
        [{ text: 'حسناً', style: 'default' }]
      );

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الدفعة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedCommitment(null);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setNote('');
    setPaymentType('regular');
    setCalculations(null);
    setErrors({});
    onClose();
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>اختر الالتزام</Text>
      
      <ScrollView style={styles.commitmentsContainer}>
        {commitments.map((commitment) => (
          <TouchableOpacity
            key={commitment.id}
            style={[
              styles.commitmentCard,
              selectedCommitment?.id === commitment.id && styles.selectedCommitmentCard
            ]}
            onPress={() => {
              setSelectedCommitment(commitment);
              setPaymentAmount(commitment.installment_amount?.toString() || '');
            }}
          >
            <View style={styles.commitmentHeader}>
              <View style={styles.commitmentIcon}>
                <Ionicons 
                  name={getCommitmentIcon(commitment.type) as any} 
                  size={24} 
                  color={getCommitmentColor(commitment.type)} 
                />
              </View>
              <View style={styles.commitmentInfo}>
                <Text style={styles.commitmentName}>{commitment.creditor_name}</Text>
                <Text style={styles.commitmentType}>{getCommitmentTypeLabel(commitment.type)}</Text>
              </View>
              <View style={styles.commitmentAmount}>
                <Text style={styles.remainingAmount}>
                  {commitment.remaining_amount.toFixed(2)} د.ك
                </Text>
                <Text style={styles.installmentAmount}>
                  القسط: {commitment.installment_amount?.toFixed(2) || '0'} د.ك
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {errors.commitment && (
        <Text style={styles.errorText}>{errors.commitment}</Text>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>تفاصيل الدفعة</Text>
      
      {selectedCommitment && (
        <Card style={styles.commitmentSummary}>
          <View style={styles.summaryHeader}>
            <Ionicons 
              name={getCommitmentIcon(selectedCommitment.type)} 
              size={24} 
              color={getCommitmentColor(selectedCommitment.type)} 
            />
            <Text style={styles.summaryTitle}>{selectedCommitment.creditor_name}</Text>
          </View>
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryLabel}>المبلغ المتبقي: {selectedCommitment.remaining_amount.toFixed(2)} د.ك</Text>
            <Text style={styles.summaryLabel}>القسط المعتاد: {selectedCommitment.installment_amount?.toFixed(2) || '0'} د.ك</Text>
          </View>
        </Card>
      )}

      {/* Payment Type Selection */}
      <View style={styles.paymentTypeContainer}>
        <Text style={styles.sectionTitle}>نوع الدفعة</Text>
        <View style={styles.paymentTypeButtons}>
          {[
            { type: 'regular', label: 'قسط عادي', icon: 'calendar-outline' },
            { type: 'extra', label: 'دفعة إضافية', icon: 'trending-up-outline' },
            { type: 'full', label: 'سداد كامل', icon: 'checkmark-circle-outline' }
          ].map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.paymentTypeButton,
                paymentType === option.type && styles.selectedPaymentType
              ]}
              onPress={() => {
                setPaymentType(option.type as any);
                if (option.type === 'regular') {
                  setPaymentAmount(selectedCommitment?.installment_amount?.toString() || '');
                } else if (option.type === 'full') {
                  setPaymentAmount(selectedCommitment?.remaining_amount?.toString() || '');
                }
              }}
            >
              <Ionicons 
                name={option.icon as any} 
                size={20} 
                color={paymentType === option.type ? '#FFFFFF' : colors.primary} 
              />
              <Text style={[
                styles.paymentTypeText,
                paymentType === option.type && styles.selectedPaymentTypeText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>مبلغ الدفعة *</Text>
        <TextInput
          style={[styles.amountInput, errors.amount && styles.inputError]}
          value={paymentAmount}
          onChangeText={setPaymentAmount}
          placeholder="0.00"
          keyboardType="numeric"
          textAlign="center"
        />
        {errors.amount && (
          <Text style={styles.errorText}>{errors.amount}</Text>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>طريقة الدفع *</Text>
        <View style={styles.paymentMethodGrid}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.paymentMethodCard,
                paymentMethod === method.value && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod(method.value)}
            >
              <Ionicons 
                name={method.icon as any} 
                size={24} 
                color={paymentMethod === method.value ? '#FFFFFF' : method.color} 
              />
              <Text style={[
                styles.paymentMethodText,
                paymentMethod === method.value && styles.selectedPaymentMethodText
              ]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.method && (
          <Text style={styles.errorText}>{errors.method}</Text>
        )}
      </View>

      {/* Note */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>ملاحظة (اختيارية)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="أضف ملاحظة..."
          multiline
          numberOfLines={3}
          textAlign="right"
        />
      </View>

      {/* Smart Calculations Display */}
      {calculations && (
        <Card style={styles.calculationsCard}>
          <Text style={styles.calculationsTitle}>تأثير الدفعة 📊</Text>
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>المبلغ المتبقي:</Text>
            <Text style={[styles.calculationValue, { color: calculations.remainingBalance === 0 ? colors.success : colors.text }]}>
              {calculations.remainingBalance.toFixed(2)} د.ك
            </Text>
          </View>
          {calculations.monthsRemaining > 0 && (
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>الأشهر المتبقية:</Text>
              <Text style={styles.calculationValue}>
                {calculations.monthsRemaining} شهر
              </Text>
            </View>
          )}
          {calculations.interestSaved && calculations.interestSaved > 0 && (
            <View style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>توفير الفوائد:</Text>
              <Text style={[styles.calculationValue, { color: colors.success }]}>
                {calculations.interestSaved.toFixed(2)} د.ك
              </Text>
            </View>
          )}
          {calculations.remainingBalance === 0 && (
            <View style={[styles.calculationRow, styles.completionRow]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.calculationValue, { color: colors.success }]}>
                سيتم إكمال السداد! 🎉
              </Text>
            </View>
          )}
        </Card>
      )}
    </View>
  );

  const getCommitmentIcon = (type: string) => {
    const icons: Record<string, string> = {
      bank_loan: 'business-outline',
      personal_debt: 'person-outline',
      savings: 'wallet-outline',
      subscription: 'refresh-outline',
      financing: 'card-outline',
      bnpl: 'bag-outline'
    };
    return icons[type] || 'document-outline';
  };

  const getCommitmentColor = (type: string) => {
    const colors: Record<string, string> = {
      bank_loan: '#3B82F6',
      personal_debt: '#F59E0B',
      savings: '#10B981',
      subscription: '#8B5CF6',
      financing: '#EF4444',
      bnpl: '#F97316'
    };
    return colors[type] || '#6B7280';
  };

  const getCommitmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bank_loan: 'قرض بنكي',
      personal_debt: 'دين شخصي',
      savings: 'هدف ادخار',
      subscription: 'اشتراك',
      financing: 'تمويل',
      bnpl: 'اشتر الآن ادفع لاحقاً'
    };
    return labels[type] || type;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>تسجيل دفعة</Text>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>{currentStep}/2</Text>
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <Button
                  title="السابق"
                  onPress={() => setCurrentStep(currentStep - 1)}
                  variant="outline"
                  style={styles.secondaryButton}
                />
              )}
              <Button
                title={currentStep === 1 ? 'التالي' : 'حفظ الدفعة'}
                onPress={currentStep === 1 ? 
                  () => selectedCommitment && setCurrentStep(2) : 
                  handleSavePayment
                }
                disabled={currentStep === 1 ? !selectedCommitment : isLoading}
                loading={isLoading}
                style={styles.primaryButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.95,
    height: height * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  stepIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  commitmentsContainer: {
    maxHeight: 400,
  },
  commitmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCommitmentCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  commitmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commitmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commitmentInfo: {
    flex: 1,
  },
  commitmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  commitmentType: {
    fontSize: 14,
    color: '#6B7280',
  },
  commitmentAmount: {
    alignItems: 'flex-end',
  },
  remainingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  installmentAmount: {
    fontSize: 12,
    color: '#6B7280',
  },
  commitmentSummary: {
    marginBottom: 20,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
  },
  summaryDetails: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentTypeContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  selectedPaymentType: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  paymentTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  selectedPaymentTypeText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  amountInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentMethodCard: {
    width: (width - 80) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectedPaymentMethod: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 6,
    textAlign: 'center',
  },
  selectedPaymentMethodText: {
    color: '#FFFFFF',
  },
  noteInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  calculationsCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  calculationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  completionRow: {
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 2,
  },
  secondaryButton: {
    flex: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
