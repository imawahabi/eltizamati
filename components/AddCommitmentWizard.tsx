import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { addDebt, getEntities, addEntity } from '@/lib/database';

const { width, height } = Dimensions.get('window');

interface AddCommitmentWizardProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCommitmentWizard({ visible, onClose, onSuccess }: AddCommitmentWizardProps) {
  const { colors } = useTheme();
  const { flexDirection, textAlign } = useLayout();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);
  
  // Form data
  const [obligationType, setObligationType] = useState('');
  const [creditorType, setCreditorType] = useState('');
  const [creditorName, setCreditorName] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [persons, setPersons] = useState<any[]>([]);
  
  // Commitment details
  const [principalAmount, setPrincipalAmount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDay, setDueDay] = useState('');
  
  // Personal debt specific
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [repaymentType, setRepaymentType] = useState('');
  
  // Savings specific
  const [monthlySavings, setMonthlySavings] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  
  // Subscription specific
  const [renewalDate, setRenewalDate] = useState('');
  const [autoRenewal, setAutoRenewal] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const commitmentTypes = [
    { 
      label: 'قرض بنكي', 
      value: 'bank_loan', 
      icon: 'business-outline',
      description: 'قروض من البنوك والمؤسسات المالية',
      color: '#3B82F6'
    },
    { 
      label: 'دين شخصي', 
      value: 'personal_debt', 
      icon: 'person-outline',
      description: 'ديون من الأشخاص والأصدقاء والعائلة',
      color: '#10B981'
    },
    { 
      label: 'هدف ادخار', 
      value: 'savings', 
      icon: 'wallet-outline',
      description: 'أهداف ادخار لمشاريع مستقبلية',
      color: '#F59E0B'
    },
    { 
      label: 'اشتراك شهري', 
      value: 'subscription', 
      icon: 'refresh-outline',
      description: 'اشتراكات في الخدمات والتطبيقات',
      color: '#8B5CF6'
    }
  ];

  const resetWizard = () => {
    setCurrentStep(1);
    setObligationType('');
    setCreditorType('');
    setCreditorName('');
    setSelectedPerson(null);
    setPrincipalAmount('');
    setInstallmentAmount('');
    setInstallmentsCount('');
    setInterestRate('');
    setStartDate('');
    setDueDay('');
    setPersonName('');
    setPersonPhone('');
    setRelationshipType('');
    setRepaymentType('');
    setErrors({});
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            { backgroundColor: index + 1 <= currentStep ? colors.primary : colors.border }
          ]}>
            <Text style={[
              styles.stepNumber,
              { color: index + 1 <= currentStep ? colors.background : colors.textSecondary }
            ]}>
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: index + 1 < currentStep ? colors.primary : colors.border }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>اختر نوع الالتزام</Text>
      <Text style={styles.stepSubtitle}>حدد نوع الالتزام المالي الذي تريد إضافته</Text>
      
      <View style={styles.typeGrid}>
        {commitmentTypes.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeCard,
              obligationType === type.value && { borderColor: type.color, backgroundColor: `${type.color}15` }
            ]}
            onPress={() => setObligationType(type.value)}
          >
            <View style={[styles.typeIcon, { backgroundColor: `${type.color}20` }]}>
              <Ionicons name={type.icon as any} size={32} color={type.color} />
            </View>
            <Text style={styles.typeTitle}>{type.label}</Text>
            <Text style={styles.typeDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {obligationType === 'personal_debt' ? 'اختر أو أضف شخص' : 'اختر الجهة الدائنة'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {obligationType === 'personal_debt' 
          ? 'اختر من الأشخاص المحفوظين أو أضف شخص جديد'
          : 'حدد البنك أو الجهة التي تدين لها'
        }
      </Text>
      
      {obligationType === 'personal_debt' ? renderPersonSelection() : renderCreditorSelection()}
    </View>
  );

  const renderPersonSelection = () => (
    <View>
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>إضافة شخص جديد</Text>
        <Input
          label="اسم الشخص *"
          placeholder="أحمد محمد"
          value={personName}
          onChangeText={setPersonName}
          icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
        />
        <Input
          label="رقم الهاتف"
          placeholder="+965 XXXX XXXX"
          value={personPhone}
          onChangeText={setPersonPhone}
          keyboardType="phone-pad"
          icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
        />
        <Select
          label="نوع العلاقة *"
          placeholder="اختر نوع العلاقة"
          options={[
            { label: 'صديق', value: 'friend' },
            { label: 'أحد أفراد العائلة', value: 'family' },
            { label: 'زميل عمل', value: 'colleague' },
            { label: 'أخرى', value: 'other' }
          ]}
          value={relationshipType}
          onSelect={setRelationshipType}
        />
      </Card>
    </View>
  );

  const renderCreditorSelection = () => (
    <View>
      <Select
        label="اختر الجهة الدائنة *"
        placeholder="اختر البنك أو الجهة"
        options={[
          { label: 'بنك الكويت الوطني (NBK)', value: 'nbk' },
          { label: 'بنك برقان', value: 'burgan' },
          { label: 'بنك الخليج', value: 'gulf_bank' },
          { label: 'بيت التمويل الكويتي (KFH)', value: 'kfh' },
          { label: 'أخرى', value: 'other' }
        ]}
        value={creditorName}
        onSelect={setCreditorName}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>تفاصيل الالتزام</Text>
      <Text style={styles.stepSubtitle}>أدخل التفاصيل المالية للالتزام</Text>
      
      <Card style={styles.formCard}>
        <Input
          label="المبلغ الإجمالي (د.ك) *"
          placeholder="0.000"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
          keyboardType="numeric"
          icon={<Ionicons name="cash-outline" size={20} color={colors.textSecondary} />}
        />
        
        {obligationType !== 'savings' && (
          <>
            <Input
              label="مبلغ القسط الشهري (د.ك) *"
              placeholder="0.000"
              value={installmentAmount}
              onChangeText={setInstallmentAmount}
              keyboardType="numeric"
              icon={<Ionicons name="card-outline" size={20} color={colors.textSecondary} />}
            />
            
            <Input
              label="عدد الأقساط *"
              placeholder="36"
              value={installmentsCount}
              onChangeText={setInstallmentsCount}
              keyboardType="numeric"
              icon={<Ionicons name="list-outline" size={20} color={colors.textSecondary} />}
            />
          </>
        )}
        
        <Input
          label="تاريخ البدء *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
        />
      </Card>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>مراجعة وحفظ</Text>
      <Text style={styles.stepSubtitle}>تأكد من صحة البيانات قبل الحفظ</Text>
      
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>ملخص الالتزام</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>النوع:</Text>
          <Text style={styles.summaryValue}>
            {commitmentTypes.find(t => t.value === obligationType)?.label}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>الجهة:</Text>
          <Text style={styles.summaryValue}>
            {obligationType === 'personal_debt' ? personName : creditorName}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>المبلغ:</Text>
          <Text style={styles.summaryValue}>{principalAmount} د.ك</Text>
        </View>
      </Card>
    </View>
  );

  const validateStepData = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!obligationType) {
          newErrors.obligationType = 'يرجى اختيار نوع الالتزام';
          setErrors(newErrors);
          return false;
        }
        break;
      case 2:
        if (obligationType === 'personal_debt') {
          if (!personName.trim()) {
            newErrors.personName = 'اسم الشخص مطلوب';
          }
          if (!relationshipType) {
            newErrors.relationshipType = 'نوع العلاقة مطلوب';
          }
        } else {
          if (!creditorName) {
            newErrors.creditorName = 'اختيار الجهة الدائنة مطلوب';
          }
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return false;
        }
        break;
      case 3:
        if (!principalAmount || parseFloat(principalAmount) <= 0) {
          newErrors.principalAmount = 'المبلغ الإجمالي مطلوب ويجب أن يكون أكبر من صفر';
        }
        if (obligationType !== 'savings') {
          if (!installmentAmount || parseFloat(installmentAmount) <= 0) {
            newErrors.installmentAmount = 'مبلغ القسط مطلوب ويجب أن يكون أكبر من صفر';
          }
          if (!installmentsCount || parseInt(installmentsCount) <= 0) {
            newErrors.installmentsCount = 'عدد الأقساط مطلوب ويجب أن يكون أكبر من صفر';
          }
          // Smart validation: check if installment calculation makes sense
          if (installmentAmount && installmentsCount && principalAmount) {
            const totalCalculated = parseFloat(installmentAmount) * parseInt(installmentsCount);
            const principalValue = parseFloat(principalAmount);
            const difference = Math.abs(totalCalculated - principalValue);
            const tolerance = principalValue * 0.1; // 10% tolerance for interest
            
            if (difference > tolerance && totalCalculated < principalValue) {
              newErrors.installmentAmount = 'مجموع الأقساط أقل من المبلغ الأصلي بشكل كبير';
            }
          }
        }
        if (!startDate) {
          newErrors.startDate = 'تاريخ البدء مطلوب';
        } else {
          const startDateObj = new Date(startDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (startDateObj < today) {
            newErrors.startDate = 'تاريخ البدء لا يمكن أن يكون في الماضي';
          }
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return false;
        }
        break;
    }
    
    setErrors({});
    return true;
  };

  const calculateSmartDefaults = () => {
    if (obligationType === 'savings' && principalAmount && startDate) {
      const targetDate = new Date(startDate);
      targetDate.setFullYear(targetDate.getFullYear() + 1); // Default to 1 year
      setTargetDate(targetDate.toISOString().split('T')[0]);
      
      const monthsToTarget = 12;
      const suggestedMonthlySavings = Math.ceil(parseFloat(principalAmount) / monthsToTarget);
      setMonthlySavings(suggestedMonthlySavings.toString());
    }
    
    if ((obligationType === 'bank_loan' || obligationType === 'financing') && principalAmount) {
      // Suggest due day as 28th (safe for all months)
      if (!dueDay) {
        setDueDay('28');
      }
      
      // Calculate estimated installment if not provided
      if (!installmentAmount && installmentsCount) {
        const months = parseInt(installmentsCount);
        const principal = parseFloat(principalAmount);
        const estimatedRate = 0.05; // 5% estimated annual rate
        const monthlyRate = estimatedRate / 12;
        
        if (monthlyRate > 0) {
          const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                                (Math.pow(1 + monthlyRate, months) - 1);
          setInstallmentAmount(Math.ceil(monthlyPayment).toString());
        }
      }
    }
  };

  const handleSave = async () => {
    if (!validateStepData(4)) return;

    try {
      let personId = null;
      
      // Smart person management for personal debts
      if (obligationType === 'personal_debt' && personName) {
        // Check if person already exists
        const existingPerson = await getPersonByName(personName.trim()) as any;
        if (existingPerson) {
          personId = existingPerson.id;
          // Update person info if phone or relationship changed
          if (personPhone !== existingPerson.phone || relationshipType !== existingPerson.relationship_type) {
            await updatePerson(existingPerson.id, {
              name: personName.trim(),
              phone: personPhone,
              relationship_type: relationshipType
            });
          }
        } else {
          // Create new person
          personId = await addPerson({
            name: personName.trim(),
            phone: personPhone,
            relationship_type: relationshipType
          });
        }
      }

      // Build smart obligation data
      const obligationData: any = {
        type: obligationType,
        creditor_name: obligationType === 'personal_debt' ? personName.trim() : creditorName,
        principal_amount: parseFloat(principalAmount),
        start_date: startDate,
        status: 'active',
        meta_json: JSON.stringify({
          person_id: personId,
          created_via: 'wizard',
          creation_timestamp: new Date().toISOString()
        })
      };

      // Type-specific data
      switch (obligationType) {
        case 'bank_loan':
        case 'financing':
        case 'bnpl':
          obligationData.installment_amount = parseFloat(installmentAmount);
          obligationData.installments_count = parseInt(installmentsCount);
          obligationData.interest_rate = parseFloat(interestRate) || 0;
          obligationData.due_day = parseInt(dueDay) || 1;
          obligationData.remaining_amount = parseFloat(principalAmount);
          break;
          
        case 'personal_debt':
          obligationData.installment_amount = repaymentType === 'installments' ? 
            parseFloat(installmentAmount) : parseFloat(principalAmount);
          obligationData.installments_count = repaymentType === 'installments' ? 
            parseInt(installmentsCount) : 1;
          obligationData.due_day = parseInt(dueDay) || 1;
          obligationData.remaining_amount = parseFloat(principalAmount);
          break;
          
        case 'savings':
          obligationData.installment_amount = parseFloat(monthlySavings);
          obligationData.target_amount = parseFloat(targetAmount || principalAmount);
          obligationData.target_date = targetDate;
          obligationData.due_day = parseInt(dueDay) || 1;
          obligationData.remaining_amount = parseFloat(principalAmount);
          break;
          
        case 'subscription':
          obligationData.installment_amount = parseFloat(installmentAmount);
          obligationData.installments_count = 12; // Default to 12 months
          obligationData.renewal_date = renewalDate;
          obligationData.auto_renewal = autoRenewal;
          obligationData.due_day = parseInt(dueDay) || 1;
          obligationData.remaining_amount = parseFloat(installmentAmount) * 12;
          break;
      }

      await addObligation(obligationData);
      
      Alert.alert('تم بنجاح! 🎉', 
        `تم حفظ ${getCommitmentTypeLabel(obligationType)} بنجاح.\nسيتم إشعارك قبل موعد الدفعات.`,
        [{ text: 'حسناً', style: 'default' }]
      );
      
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving commitment:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الالتزام. يرجى المحاولة مرة أخرى.');
    }
  };

  const getCommitmentTypeLabel = (type: string) => {
    const typeObj = commitmentTypes.find(t => t.value === type);
    return typeObj?.label || 'الالتزام';
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: width * 0.95,
      height: height * 0.85,
      backgroundColor: colors.background,
      borderRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    stepContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepNumber: {
      fontSize: 14,
      fontFamily: 'Cairo-Bold',
    },
    stepLine: {
      width: 40,
      height: 2,
      marginHorizontal: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'space-between',
    },
    typeCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
    },
    typeIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    typeTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    typeDescription: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    formCard: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
    },
    summaryTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryLabel: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButton: {
      flex: 1,
      marginHorizontal: 8,
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>إضافة التزام جديد</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {currentStep > 1 && (
              <Button
                title="السابق"
                onPress={prevStep}
                variant="secondary"
                style={styles.footerButton}
              />
            )}
            
            {currentStep < totalSteps ? (
              <Button
                title="التالي"
                onPress={nextStep}
                variant="primary"
                style={styles.footerButton}
                disabled={
                  (currentStep === 1 && !obligationType) ||
                  (currentStep === 2 && obligationType === 'personal_debt' && !personName) ||
                  (currentStep === 2 && obligationType !== 'personal_debt' && !creditorName)
                }
              />
            ) : (
              <Button
                title="حفظ الالتزام"
                onPress={handleSave}
                variant="primary"
                style={styles.footerButton}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
