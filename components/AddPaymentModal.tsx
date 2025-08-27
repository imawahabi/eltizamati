import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { addPayment, getDebtById, updateDebt, getDebts } from '@/lib/database';

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (payment: PaymentData) => void;
  commitmentId?: number | null;
}

interface PaymentData {
  obligationId: number;
  installmentId?: number;
  amount: string;
  paymentMethod: string;
  note: string;
  receiptPath?: string;
}

export default function AddPaymentModal({ visible, onClose, onSave, commitmentId }: AddPaymentModalProps) {
  const { colors, typography } = useTheme();
  const { isRTL } = useLayout();
  const { t } = useTranslation();

  const [obligations, setObligations] = useState<any[]>([]);
  const [selectedObligation, setSelectedObligation] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    obligationId: commitmentId || 0,
    amount: '',
    paymentMethod: 'cash',
    note: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [smartSuggestions, setSmartSuggestions] = useState<any>(null);
  const [paymentImpact, setPaymentImpact] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [note, setNote] = useState('');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [availableObligations, setAvailableObligations] = useState<any[]>([]);
  const [availableInstallments, setAvailableInstallments] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment method options
  const paymentMethodOptions = [
    { label: 'نقد / Cash', value: 'cash', icon: <Ionicons name="cash-outline" size={20} color={colors.primary} /> },
    { label: 'تحويل بنكي / Bank Transfer', value: 'transfer', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
    { label: 'بطاقة ائتمان / Credit Card', value: 'credit_card', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
    { label: 'بطاقة مدين / Debit Card', value: 'debit_card', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
    { label: 'شيك / Check', value: 'check', icon: <Ionicons name="document-outline" size={20} color={colors.primary} /> },
    { label: 'أخرى / Other', value: 'other', icon: <Ionicons name="ellipsis-horizontal-outline" size={20} color={colors.primary} /> },
  ];

  // Load available obligations and installments
  useEffect(() => {
    // TODO: Load from database
    // This should fetch active obligations and their pending installments
    const mockObligations = [
      { id: 1, creditor_name: 'بنك الكويت الوطني', type: 'bank_loan', remaining_amount: 5000 },
      { id: 2, creditor_name: 'تابي', type: 'bnpl', remaining_amount: 150 },
    ];
    setAvailableObligations(mockObligations);
  }, [visible]);

  const getObligationOptions = () => {
    return availableObligations.map(obligation => ({
      label: `${obligation.creditor_name} - ${formatCurrency(obligation.remaining_amount)}`,
      value: obligation.id.toString(),
      icon: <Ionicons name="card-outline" size={20} color={colors.primary} />
    }));
  };

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
    return `د.ك ${formatted}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedObligation) newErrors.selectedObligation = 'يجب اختيار التزام';
    if (!amount) newErrors.amount = 'المبلغ مطلوب';
    else if (isNaN(parseFloat(amount))) newErrors.amount = 'مبلغ غير صحيح';
    else if (parseFloat(amount) <= 0) newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    if (!paymentMethod) newErrors.paymentMethod = 'طريقة الدفع مطلوبة';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const paymentData: PaymentData = {
      obligationId: parseInt(selectedObligation),
      installmentId: selectedInstallment ? parseInt(selectedInstallment) : undefined,
      amount,
      paymentMethod,
      note,
    };

    onSave(paymentData);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedObligation('');
    setSelectedInstallment('');
    setAmount('');
    setPaymentMethod('');
    setNote('');
    setIsPartialPayment(false);
    setErrors({});
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      minHeight: '60%',
    },
    modalHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalHeaderGradient: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontFamily: 'Cairo-Bold',
      textAlign: 'center',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      fontFamily: 'Cairo-Regular',
      textAlign: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBody: {
      flex: 1,
      padding: 20,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    stepDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginHorizontal: 4,
    },
    stepDotActive: {
      backgroundColor: colors.primary,
    },
    stepDotInactive: {
      backgroundColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Cairo-Bold',
      marginBottom: 16,
      textAlign: textAlign.start,
    },
    formCard: {
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: flexDirection.row,
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    button: {
      flex: 1,
    },
    obligationInfo: {
      backgroundColor: '#F0F9FF',
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderLeftWidth: 4,
      borderLeftColor: '#0B63FF',
    },
    obligationInfoText: {
      fontSize: 14,
      color: '#1E40AF',
      fontFamily: 'Cairo-Regular',
      textAlign: 'right',
      lineHeight: 20,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1E40AF', '#3B82F6']}
            style={styles.modalHeaderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>تسجيل دفعة</Text>
            <Text style={styles.modalSubtitle}>سجل دفعة لالتزام موجود - الدفعات هي أجزاء من الالتزامات</Text>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 ? styles.stepDotActive : styles.stepDotInactive]} />
              <View style={[styles.stepDot, step >= 2 ? styles.stepDotActive : styles.stepDotInactive]} />
            </View>

            {step === 1 && (
              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>اختيار الالتزام</Text>
                
                <Select
                  label="الالتزام المراد الدفع له *"
                  placeholder="اختر الالتزام"
                  options={getObligationOptions()}
                  value={selectedObligation}
                  onSelect={setSelectedObligation}
                  error={errors.selectedObligation}
                  required
                />

                {selectedObligation && (
                  <View style={styles.obligationInfo}>
                    <Text style={styles.obligationInfoText}>
                      💡 ستقوم بتسجيل دفعة لهذا الالتزام. الدفعات تقلل من المبلغ المتبقي للالتزام.
                    </Text>
                  </View>
                )}
              </Card>
            )}

            {step === 2 && (
              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>تفاصيل الدفعة</Text>
                
                <Input
                  label="مبلغ الدفعة (د.ك) *"
                  placeholder="0.000"
                  value={amount}
                  onChangeText={setAmount}
                  error={errors.amount}
                  keyboardType="numeric"
                  icon={<Ionicons name="cash-outline" size={20} color={colors.textSecondary} />}
                  required
                />

                <Select
                  label="طريقة الدفع *"
                  placeholder="اختر طريقة الدفع"
                  options={paymentMethodOptions}
                  value={paymentMethod}
                  onSelect={setPaymentMethod}
                  error={errors.paymentMethod}
                  required
                />

                <Input
                  label="ملاحظات (اختياري)"
                  placeholder="أي ملاحظات إضافية"
                  value={note}
                  onChangeText={setNote}
                  icon={<Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />}
                  multiline
                  numberOfLines={3}
                />
              </Card>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            {step === 1 ? (
              <>
                <Button
                  title="إلغاء"
                  onPress={handleClose}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title="التالي"
                  onPress={() => setStep(2)}
                  variant="primary"
                  style={styles.button}
                  disabled={!selectedObligation}
                />
              </>
            ) : (
              <>
                <Button
                  title="السابق"
                  onPress={() => setStep(1)}
                  variant="outline"
                  style={styles.button}
                />
                <Button
                  title="حفظ"
                  onPress={handleSave}
                  variant="primary"
                  style={styles.button}
                  icon={<Ionicons name="checkmark" size={20} color="#FFFFFF" />}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
