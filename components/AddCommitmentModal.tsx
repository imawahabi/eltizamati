import React, { useState } from 'react';
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
import { addDebt, getEntities, addEntity } from '@/lib/database';

interface AddCommitmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (commitment: CommitmentData) => void;
}

interface CommitmentData {
  type: string;
  creditorName: string;
  principalAmount: string;
  installmentAmount: string;
  interestRate: string;
  startDate: string;
  dueDay: string;
  installmentsCount: string;
}

export default function AddCommitmentModal({ visible, onClose, onSave }: AddCommitmentModalProps) {
  const { colors } = useTheme();
  const { flexDirection, textAlign } = useLayout();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [type, setType] = useState('');
  const [creditorName, setCreditorName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Commitment type options
  const typeOptions = [
    { label: 'قرض بنكي / Bank Loan', value: 'bank_loan', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
    { label: 'اشتر الآن ادفع لاحقاً / BNPL', value: 'bnpl', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
    { label: 'قرض شخصي / Personal Loan', value: 'personal', icon: <Ionicons name="person-outline" size={20} color={colors.primary} /> },
    { label: 'قسط سيارة / Car Loan', value: 'car_loan', icon: <Ionicons name="car-outline" size={20} color={colors.primary} /> },
    { label: 'قرض عقاري / Mortgage', value: 'mortgage', icon: <Ionicons name="home-outline" size={20} color={colors.primary} /> },
    { label: 'بطاقة ائتمان / Credit Card', value: 'credit_card', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
    { label: 'أخرى / Other', value: 'other', icon: <Ionicons name="ellipsis-horizontal-outline" size={20} color={colors.primary} /> },
  ];

  // Creditor options based on type
  const getCreditorOptions = () => {
    switch (type) {
      case 'bank_loan':
      case 'car_loan':
      case 'mortgage':
      case 'credit_card':
        return [
          { label: 'بنك الكويت الوطني (NBK)', value: 'nbk', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
          { label: 'بنك برقان', value: 'burgan', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
          { label: 'بنك الخليج', value: 'gulf_bank', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
          { label: 'بيت التمويل الكويتي (KFH)', value: 'kfh', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
          { label: 'أخرى', value: 'other', icon: <Ionicons name="ellipsis-horizontal-outline" size={20} color={colors.primary} /> },
        ];
      case 'bnpl':
        return [
          { label: 'تابي / Tabby', value: 'tabby', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
          { label: 'تمارا / Tamara', value: 'tamara', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
          { label: 'بوستباي / Postpay', value: 'postpay', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
          { label: 'أخرى', value: 'other', icon: <Ionicons name="ellipsis-horizontal-outline" size={20} color={colors.primary} /> },
        ];
      default:
        return [
          { label: 'أدخل اسم الجهة يدوياً', value: 'custom', icon: <Ionicons name="create-outline" size={20} color={colors.primary} /> },
        ];
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!type) newErrors.type = 'مطلوب';
    if (!creditorName) newErrors.creditorName = 'مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!principalAmount) newErrors.principalAmount = 'مطلوب';
    else if (isNaN(parseFloat(principalAmount))) newErrors.principalAmount = 'مبلغ غير صحيح';
    
    if (!installmentAmount) newErrors.installmentAmount = 'مطلوب';
    else if (isNaN(parseFloat(installmentAmount))) newErrors.installmentAmount = 'مبلغ غير صحيح';
    
    if (!startDate) newErrors.startDate = 'مطلوب';
    if (!dueDay) newErrors.dueDay = 'مطلوب';
    else if (isNaN(parseInt(dueDay)) || parseInt(dueDay) < 1 || parseInt(dueDay) > 31) {
      newErrors.dueDay = 'يوم غير صحيح (1-31)';
    }
    
    if (!installmentsCount) newErrors.installmentsCount = 'مطلوب';
    else if (isNaN(parseInt(installmentsCount)) || parseInt(installmentsCount) < 1) {
      newErrors.installmentsCount = 'عدد غير صحيح';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateStep2()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      
      const commitmentData: CommitmentData = {
        type,
        creditorName,
        principalAmount,
        installmentAmount,
        interestRate,
        startDate,
        dueDay,
        installmentsCount,
      };

      // Save to database
      await addObligation({
        type,
        creditor_name: creditorName,
        principal_amount: parseFloat(principalAmount),
        installment_amount: parseFloat(installmentAmount),
        interest_rate: parseFloat(interestRate) || 0,
        start_date: startDate,
        due_day: parseInt(dueDay),
        installments_count: parseInt(installmentsCount),
        remaining_amount: parseFloat(principalAmount),
        status: 'active'
      });

      onSave(commitmentData);
      handleClose();
      Alert.alert('نجح', 'تم إضافة الالتزام بنجاح');
    } catch (error) {
      console.error('Error saving commitment:', error);
      Alert.alert('خطأ', 'حدث خطأ في حفظ الالتزام');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setType('');
    setCreditorName('');
    setPrincipalAmount('');
    setInstallmentAmount('');
    setInterestRate('');
    setStartDate('');
    setDueDay('');
    setInstallmentsCount('');
    setErrors({});
    onClose();
  };

  const canProceedStep1 = type && creditorName;
  const isLastStep = step === 2;

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
      maxHeight: '95%',
      minHeight: '80%',
    },
    modalHeaderGradient: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontFamily: 'Cairo-Bold',
      textAlign: 'center',
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      fontFamily: 'Cairo-Regular',
      textAlign: 'center',
    },
    modalBody: {
      flex: 1,
      padding: 20,
    },
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: 'Cairo-Bold',
      marginBottom: 16,
      textAlign: textAlign.start,
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      fontFamily: 'Cairo-Regular',
    },
    modalFooter: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    stepText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 8,
      fontFamily: 'Cairo-Regular',
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      flex: 1,
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    buttonRow: {
      flexDirection: flexDirection.row,
      gap: 12,
    },
    backButton: {
      flex: 1,
    },
    nextButton: {
      flex: 1,
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
            colors={['#059669', '#10B981']}
            style={styles.modalHeaderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إضافة التزام جديد</Text>
            <Text style={styles.modalSubtitle}>أضف التزاماً مالياً جديداً لتتبعه</Text>
          </LinearGradient>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>الخطوة 1: نوع الالتزام والجهة</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>نوع الالتزام *</Text>
                  <Select
                    options={typeOptions}
                    value={type}
                    onSelect={setType}
                    placeholder="اختر نوع الالتزام"
                    error={errors.type}
                  />
                </View>

                {type && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>اسم الجهة *</Text>
                    <Select
                      options={getCreditorOptions()}
                      value={creditorName}
                      onSelect={setCreditorName}
                      placeholder="اختر الجهة الدائنة"
                      error={errors.creditorName}
                    />
                  </View>
                )}

                {creditorName === 'custom' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>اسم الجهة *</Text>
                    <Input
                      value={creditorName}
                      onChangeText={setCreditorName}
                      placeholder="أدخل اسم الجهة"
                      error={errors.creditorName}
                    />
                  </View>
                )}
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>الخطوة 2: تفاصيل الالتزام</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>المبلغ الأصلي *</Text>
                  <Input
                    value={principalAmount}
                    onChangeText={setPrincipalAmount}
                    placeholder="0.000"
                    keyboardType="numeric"
                    error={errors.principalAmount}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>مبلغ القسط الشهري *</Text>
                  <Input
                    value={installmentAmount}
                    onChangeText={setInstallmentAmount}
                    placeholder="0.000"
                    keyboardType="numeric"
                    error={errors.installmentAmount}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>معدل الفائدة % (اختياري)</Text>
                  <Input
                    value={interestRate}
                    onChangeText={setInterestRate}
                    placeholder="0.0"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>تاريخ البدء *</Text>
                  <Input
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    error={errors.startDate}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>يوم الاستحقاق الشهري *</Text>
                  <Input
                    value={dueDay}
                    onChangeText={setDueDay}
                    placeholder="1-31"
                    keyboardType="numeric"
                    error={errors.dueDay}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>عدد الأقساط *</Text>
                  <Input
                    value={installmentsCount}
                    onChangeText={setInstallmentsCount}
                    placeholder="12"
                    keyboardType="numeric"
                    error={errors.installmentsCount}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>الخطوة {step} من 2</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              {step > 1 && (
                <Button
                  title="السابق"
                  onPress={() => setStep(step - 1)}
                  variant="outline"
                  style={styles.backButton}
                />
              )}
              
              <Button
                title={isLastStep ? 'حفظ الالتزام' : 'التالي'}
                onPress={isLastStep ? handleSave : () => {
                  if (step === 1 && validateStep1()) {
                    setStep(step + 1);
                  }
                }}
                disabled={step === 1 ? !canProceedStep1 : false}
                loading={loading}
                style={styles.nextButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default AddCommitmentModal;
