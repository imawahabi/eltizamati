import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input, Select } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { addObligation } from '@/lib/database';

 

export default function AddCommitmentScreen() {
  const { colors } = useTheme();
  const { flexDirection, textAlign } = useLayout();
  const { t } = useTranslation();
  // Form state
  const [step, setStep] = useState(1);
  const [obligationType, setObligationType] = useState('');
  const [creditorName, setCreditorName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Bank loan specific fields
  const [loanAccountNumber, setLoanAccountNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [loanOfficer, setLoanOfficer] = useState('');
  
  // Personal debt specific fields
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [repaymentType, setRepaymentType] = useState('');
  
  // Savings specific fields
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  
  // Subscription specific fields
  const [serviceName, setServiceName] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [autoRenewal, setAutoRenewal] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Commitment type options with enhanced categorization
  const commitmentTypeOptions = [
    { 
      label: 'قرض بنكي / Bank Loan', 
      value: 'bank_loan', 
      icon: <Ionicons name="business-outline" size={20} color={colors.primary} />,
      description: 'قروض من البنوك والمؤسسات المالية'
    },
    { 
      label: 'دين شخصي / Personal Debt', 
      value: 'personal_debt', 
      icon: <Ionicons name="person-outline" size={20} color={colors.primary} />,
      description: 'ديون من الأشخاص والأصدقاء والعائلة'
    },
    { 
      label: 'هدف ادخار / Savings Goal', 
      value: 'savings', 
      icon: <Ionicons name="wallet-outline" size={20} color={colors.primary} />,
      description: 'أهداف ادخار لمشاريع أو مشتريات مستقبلية'
    },
    { 
      label: 'اشتراك شهري / Subscription', 
      value: 'subscription', 
      icon: <Ionicons name="refresh-outline" size={20} color={colors.primary} />,
      description: 'اشتراكات شهرية في الخدمات والتطبيقات'
    },
    { 
      label: 'تمويل / Financing', 
      value: 'financing', 
      icon: <Ionicons name="card-outline" size={20} color={colors.primary} />,
      description: 'تمويل من شركات التمويل'
    },
    { 
      label: 'اشتر الآن ادفع لاحقاً / BNPL', 
      value: 'bnpl', 
      icon: <Ionicons name="card-outline" size={20} color={colors.primary} />,
      description: 'مشتريات بنظام الدفع المؤجل'
    },
  ];
  
  // Creditor options based on project documentation
  const getCreditorOptions = () => {
    const defaultCreditors = [
      { label: 'بنك الكويت الوطني (NBK)', value: 'nbk', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
      { label: 'بنك برقان', value: 'burgan', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
      { label: 'بنك الخليج', value: 'gulf_bank', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
      { label: 'بيت التمويل الكويتي (KFH)', value: 'kfh', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
      { label: 'الملا للتمويل', value: 'almulla', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
      { label: 'الأمانة للتمويل', value: 'alamana', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
      { label: 'رساميل للتمويل', value: 'rasameel', icon: <Ionicons name="business-outline" size={20} color={colors.primary} /> },
      { label: 'X-cite', value: 'xcite', icon: <Ionicons name="storefront-outline" size={20} color={colors.primary} /> },
      { label: 'Eureka', value: 'eureka', icon: <Ionicons name="storefront-outline" size={20} color={colors.primary} /> },
      { label: 'Best Al-Yousifi', value: 'best_alyousifi', icon: <Ionicons name="storefront-outline" size={20} color={colors.primary} /> },
      { label: 'أخرى', value: 'other', icon: <Ionicons name="create-outline" size={20} color={colors.primary} /> },
    ];
    return defaultCreditors;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!obligationType) newErrors.obligationType = 'نوع الالتزام مطلوب';
    
    // Common validations
    if (!startDate) newErrors.startDate = 'تاريخ البدء مطلوب';
    
    // Type-specific validations
    switch (obligationType) {
      case 'bank_loan':
      case 'financing':
        if (!creditorName) newErrors.creditorName = 'اسم البنك/الجهة مطلوب';
        if (!principalAmount) newErrors.principalAmount = 'مبلغ القرض مطلوب';
        else if (isNaN(parseFloat(principalAmount))) newErrors.principalAmount = 'مبلغ غير صحيح';
        if (!installmentAmount) newErrors.installmentAmount = 'مبلغ القسط مطلوب';
        else if (isNaN(parseFloat(installmentAmount))) newErrors.installmentAmount = 'مبلغ غير صحيح';
        if (!installmentsCount) newErrors.installmentsCount = 'عدد الأقساط مطلوب';
        else if (isNaN(parseInt(installmentsCount))) newErrors.installmentsCount = 'عدد غير صحيح';
        if (!dueDay) newErrors.dueDay = 'يوم الاستحقاق مطلوب';
        else if (isNaN(parseInt(dueDay)) || parseInt(dueDay) < 1 || parseInt(dueDay) > 31) {
          newErrors.dueDay = 'يوم غير صحيح (1-31)';
        }
        break;
        
      case 'personal_debt':
        if (!personName) newErrors.personName = 'اسم الشخص مطلوب';
        if (!principalAmount) newErrors.principalAmount = 'مبلغ الدين مطلوب';
        else if (isNaN(parseFloat(principalAmount))) newErrors.principalAmount = 'مبلغ غير صحيح';
        if (!repaymentType) newErrors.repaymentType = 'نوع السداد مطلوب';
        break;
        
      case 'savings':
        if (!targetAmount) newErrors.targetAmount = 'المبلغ المستهدف مطلوب';
        else if (isNaN(parseFloat(targetAmount))) newErrors.targetAmount = 'مبلغ غير صحيح';
        if (!targetDate) newErrors.targetDate = 'تاريخ الهدف مطلوب';
        if (!monthlySavings) newErrors.monthlySavings = 'المبلغ الشهري مطلوب';
        else if (isNaN(parseFloat(monthlySavings))) newErrors.monthlySavings = 'مبلغ غير صحيح';
        break;
        
      case 'subscription':
        if (!serviceName) newErrors.serviceName = 'اسم الخدمة مطلوب';
        if (!installmentAmount) newErrors.installmentAmount = 'تكلفة الاشتراك مطلوبة';
        else if (isNaN(parseFloat(installmentAmount))) newErrors.installmentAmount = 'مبلغ غير صحيح';
        if (!renewalDate) newErrors.renewalDate = 'تاريخ التجديد مطلوب';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCommitment = async () => {
    if (!validateForm()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      let obligationData: any = {
        type: obligationType,
        start_date: startDate,
        status: 'active'
      };

      // Build data based on commitment type
      switch (obligationType) {
        case 'bank_loan':
        case 'financing':
          obligationData = {
            ...obligationData,
            creditor_name: creditorName,
            principal_amount: parseFloat(principalAmount),
            installment_amount: parseFloat(installmentAmount),
            interest_rate: parseFloat(interestRate) || 0,
            due_day: parseInt(dueDay),
            installments_count: parseInt(installmentsCount),
            remaining_amount: parseFloat(principalAmount),
            meta_json: JSON.stringify({
              account_number: loanAccountNumber,
              branch: bankBranch,
              loan_officer: loanOfficer
            })
          };
          break;
          
        case 'personal_debt':
          obligationData = {
            ...obligationData,
            creditor_name: personName,
            principal_amount: parseFloat(principalAmount),
            installment_amount: repaymentType === 'installments' ? parseFloat(installmentAmount) : parseFloat(principalAmount),
            installments_count: repaymentType === 'installments' ? parseInt(installmentsCount) : 1,
            remaining_amount: parseFloat(principalAmount),
            due_day: parseInt(dueDay) || 1,
            meta_json: JSON.stringify({
              person_phone: personPhone,
              relationship: relationshipType,
              repayment_type: repaymentType
            })
          };
          break;
          
        case 'savings':
          obligationData = {
            ...obligationData,
            creditor_name: 'هدف ادخار',
            principal_amount: parseFloat(targetAmount),
            installment_amount: parseFloat(monthlySavings),
            remaining_amount: parseFloat(targetAmount),
            installments_count: Math.ceil(parseFloat(targetAmount) / parseFloat(monthlySavings)),
            due_day: parseInt(dueDay) || 1,
            meta_json: JSON.stringify({
              target_date: targetDate,
              savings_goal: savingsGoal
            })
          };
          break;
          
        case 'subscription':
          obligationData = {
            ...obligationData,
            creditor_name: serviceName,
            installment_amount: parseFloat(installmentAmount),
            principal_amount: parseFloat(installmentAmount) * 12, // Annual cost
            remaining_amount: parseFloat(installmentAmount) * 12,
            installments_count: 12,
            due_day: new Date(renewalDate).getDate(),
            meta_json: JSON.stringify({
              subscription_plan: subscriptionPlan,
              auto_renewal: autoRenewal,
              renewal_date: renewalDate
            })
          };
          break;
      }

      await addObligation(obligationData);

      Alert.alert('نجح', 'تم حفظ الالتزام بنجاح', [
        { text: 'موافق', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving commitment:', error);
      Alert.alert('خطأ', 'حدث خطأ في حفظ الالتزام');
    }
  };

  const handleNLPInput = () => {
    Alert.alert(t('nlpInput'), 'Feature coming soon!');
  };

  const handleBankSnapshot = () => {
    Alert.alert(t('bankSnapshot'), 'Feature coming soon!');
  };

  // Render dynamic form based on commitment type
  const renderDynamicForm = () => {
    switch (obligationType) {
      case 'bank_loan':
      case 'financing':
        return renderBankLoanForm();
      case 'personal_debt':
        return renderPersonalDebtForm();
      case 'savings':
        return renderSavingsForm();
      case 'subscription':
        return renderSubscriptionForm();
      case 'bnpl':
        return renderBNPLForm();
      default:
        return null;
    }
  };

  const renderBankLoanForm = () => (
    <>
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>معلومات البنك والقرض</Text>
        
        <Select
          label="البنك أو الجهة المالية *"
          placeholder="اختر البنك"
          options={getCreditorOptions()}
          value={creditorName}
          onSelect={setCreditorName}
          error={errors.creditorName}
          required
        />

        <Input
          label="رقم حساب القرض (اختياري)"
          placeholder="مثال: 4123000045"
          value={loanAccountNumber}
          onChangeText={setLoanAccountNumber}
          icon={<Ionicons name="card-outline" size={20} color={colors.textSecondary} />}
        />

        <Input
          label="الفرع (اختياري)"
          placeholder="مثال: فرع السالمية"
          value={bankBranch}
          onChangeText={setBankBranch}
          icon={<Ionicons name="business-outline" size={20} color={colors.textSecondary} />}
        />
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>تفاصيل القرض المالية</Text>
        
        <Input
          label="مبلغ القرض الإجمالي (د.ك) *"
          placeholder="0.000"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
          error={errors.principalAmount}
          keyboardType="numeric"
          icon={<Ionicons name="cash-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="مبلغ القسط الشهري (د.ك) *"
          placeholder="0.000"
          value={installmentAmount}
          onChangeText={setInstallmentAmount}
          error={errors.installmentAmount}
          keyboardType="numeric"
          icon={<Ionicons name="card-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="عدد الأقساط *"
          placeholder="36"
          value={installmentsCount}
          onChangeText={setInstallmentsCount}
          error={errors.installmentsCount}
          keyboardType="numeric"
          icon={<Ionicons name="list-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="معدل الفائدة % (اختياري)"
          placeholder="7.5"
          value={interestRate}
          onChangeText={setInterestRate}
          keyboardType="numeric"
          icon={<Ionicons name="trending-up-outline" size={20} color={colors.textSecondary} />}
        />
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>جدولة الدفعات</Text>
        
        <Input
          label="تاريخ بداية القرض *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          error={errors.startDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="يوم الاستحقاق الشهري (1-31) *"
          placeholder="15"
          value={dueDay}
          onChangeText={setDueDay}
          error={errors.dueDay}
          keyboardType="numeric"
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />
      </Card>
    </>
  );

  const renderPersonalDebtForm = () => (
    <>
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>معلومات الشخص</Text>
        
        <Input
          label="اسم الشخص *"
          placeholder="مثال: أحمد محمد"
          value={personName}
          onChangeText={setPersonName}
          error={errors.personName}
          icon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="رقم الهاتف (اختياري)"
          placeholder="+965 XXXX XXXX"
          value={personPhone}
          onChangeText={setPersonPhone}
          keyboardType="phone-pad"
          icon={<Ionicons name="call-outline" size={20} color={colors.textSecondary} />}
        />

        <Select
          label="نوع العلاقة"
          placeholder="اختر نوع العلاقة"
          options={[
            { label: 'صديق', value: 'friend', icon: <Ionicons name="people-outline" size={20} color={colors.primary} /> },
            { label: 'أحد أفراد العائلة', value: 'family', icon: <Ionicons name="home-outline" size={20} color={colors.primary} /> },
            { label: 'زميل عمل', value: 'colleague', icon: <Ionicons name="briefcase-outline" size={20} color={colors.primary} /> },
            { label: 'أخرى', value: 'other', icon: <Ionicons name="ellipsis-horizontal-outline" size={20} color={colors.primary} /> },
          ]}
          value={relationshipType}
          onSelect={setRelationshipType}
        />
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>تفاصيل الدين</Text>
        
        <Input
          label="مبلغ الدين (د.ك) *"
          placeholder="0.000"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
          error={errors.principalAmount}
          keyboardType="numeric"
          icon={<Ionicons name="cash-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Select
          label="طريقة السداد *"
          placeholder="اختر طريقة السداد"
          options={[
            { label: 'دفعة واحدة', value: 'lump_sum', icon: <Ionicons name="cash-outline" size={20} color={colors.primary} /> },
            { label: 'أقساط شهرية', value: 'installments', icon: <Ionicons name="calendar-outline" size={20} color={colors.primary} /> },
          ]}
          value={repaymentType}
          onSelect={setRepaymentType}
          error={errors.repaymentType}
          required
        />

        {repaymentType === 'installments' && (
          <>
            <Input
              label="مبلغ القسط الشهري (د.ك) *"
              placeholder="0.000"
              value={installmentAmount}
              onChangeText={setInstallmentAmount}
              keyboardType="numeric"
              icon={<Ionicons name="card-outline" size={20} color={colors.textSecondary} />}
              required
            />

            <Input
              label="عدد الأقساط *"
              placeholder="6"
              value={installmentsCount}
              onChangeText={setInstallmentsCount}
              keyboardType="numeric"
              icon={<Ionicons name="list-outline" size={20} color={colors.textSecondary} />}
              required
            />

            <Input
              label="يوم الاستحقاق الشهري (1-31)"
              placeholder="15"
              value={dueDay}
              onChangeText={setDueDay}
              keyboardType="numeric"
              icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
            />
          </>
        )}

        <Input
          label="تاريخ بداية الدين *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          error={errors.startDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />
      </Card>
    </>
  );

  const renderSavingsForm = () => (
    <>
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>هدف الادخار</Text>
        
        <Input
          label="وصف الهدف"
          placeholder="مثال: شراء سيارة جديدة"
          value={savingsGoal}
          onChangeText={setSavingsGoal}
          icon={<Ionicons name="flag-outline" size={20} color={colors.textSecondary} />}
        />

        <Input
          label="المبلغ المستهدف (د.ك) *"
          placeholder="0.000"
          value={targetAmount}
          onChangeText={setTargetAmount}
          error={errors.targetAmount}
          keyboardType="numeric"
          icon={<Ionicons name="wallet-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="المبلغ الشهري للادخار (د.ك) *"
          placeholder="0.000"
          value={monthlySavings}
          onChangeText={setMonthlySavings}
          error={errors.monthlySavings}
          keyboardType="numeric"
          icon={<Ionicons name="card-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="التاريخ المستهدف *"
          placeholder="YYYY-MM-DD"
          value={targetDate}
          onChangeText={setTargetDate}
          error={errors.targetDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="تاريخ بداية الادخار *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          error={errors.startDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="يوم الادخار الشهري (1-31)"
          placeholder="1"
          value={dueDay}
          onChangeText={setDueDay}
          keyboardType="numeric"
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
        />
      </Card>
    </>
  );

  const renderSubscriptionForm = () => (
    <>
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>معلومات الاشتراك</Text>
        
        <Input
          label="اسم الخدمة *"
          placeholder="مثال: Netflix, Spotify, OSN"
          value={serviceName}
          onChangeText={setServiceName}
          error={errors.serviceName}
          icon={<Ionicons name="tv-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="نوع الاشتراك"
          placeholder="مثال: Premium, Basic, Family"
          value={subscriptionPlan}
          onChangeText={setSubscriptionPlan}
          icon={<Ionicons name="star-outline" size={20} color={colors.textSecondary} />}
        />

        <Input
          label="التكلفة الشهرية (د.ك) *"
          placeholder="0.000"
          value={installmentAmount}
          onChangeText={setInstallmentAmount}
          error={errors.installmentAmount}
          keyboardType="numeric"
          icon={<Ionicons name="card-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="تاريخ التجديد القادم *"
          placeholder="YYYY-MM-DD"
          value={renewalDate}
          onChangeText={setRenewalDate}
          error={errors.renewalDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="تاريخ بداية الاشتراك *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          error={errors.startDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <View style={styles.dynamicSwitchContainer}>
          <Text style={styles.dynamicSwitchLabel}>تجديد تلقائي</Text>
          <Switch
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={autoRenewal ? colors.background : colors.textSecondary}
            ios_backgroundColor={colors.border}
            onValueChange={setAutoRenewal}
            value={autoRenewal}
          />
        </View>
      </Card>
    </>
  );

  const renderBNPLForm = () => (
    <>
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>معلومات الشراء بالتقسيط</Text>
        
        <Select
          label="منصة الدفع المؤجل *"
          placeholder="اختر المنصة"
          options={[
            { label: 'تابي / Tabby', value: 'tabby', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
            { label: 'تمارا / Tamara', value: 'tamara', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
            { label: 'بوستباي / Postpay', value: 'postpay', icon: <Ionicons name="card-outline" size={20} color={colors.primary} /> },
            { label: 'أخرى', value: 'other', icon: <Ionicons name="ellipsis-horizontal-outline" size={20} color={colors.primary} /> },
          ]}
          value={creditorName}
          onSelect={setCreditorName}
          error={errors.creditorName}
          required
        />

        <Input
          label="إجمالي المبلغ (د.ك) *"
          placeholder="0.000"
          value={principalAmount}
          onChangeText={setPrincipalAmount}
          error={errors.principalAmount}
          keyboardType="numeric"
          icon={<Ionicons name="cash-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="مبلغ القسط (د.ك) *"
          placeholder="0.000"
          value={installmentAmount}
          onChangeText={setInstallmentAmount}
          error={errors.installmentAmount}
          keyboardType="numeric"
          icon={<Ionicons name="card-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="عدد الأقساط *"
          placeholder="4"
          value={installmentsCount}
          onChangeText={setInstallmentsCount}
          error={errors.installmentsCount}
          keyboardType="numeric"
          icon={<Ionicons name="list-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="تاريخ الشراء *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          error={errors.startDate}
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />

        <Input
          label="يوم الاستحقاق الشهري (1-31) *"
          placeholder="15"
          value={dueDay}
          onChangeText={setDueDay}
          error={errors.dueDay}
          keyboardType="numeric"
          icon={<Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />}
          required
        />
      </Card>
    </>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: flexDirection.row,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: textAlign.start,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    quickActionsCard: {
      marginTop: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: textAlign.start,
    },
    quickActions: {
      flexDirection: flexDirection.row,
      gap: 12,
    },
    quickActionButton: {
      flex: 1,
    },
    formCard: {
      marginBottom: 16,
    },
    switchContainer: {
      flexDirection: flexDirection.row,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
    },
    actionCard: {
      marginBottom: 32,
    },
    saveButton: {
      width: '100%',
    },
    headerGradient: {
      borderRadius: 16,
      padding: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontFamily: 'Cairo-Bold',
      textAlign: 'right',
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      fontFamily: 'Cairo-Regular',
      textAlign: 'right',
      lineHeight: 20,
    },
    typeSelectionContainer: {
      gap: 12,
    },
    typeCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: 'transparent',
      marginBottom: 8,
    },
    typeCardSelected: {
      backgroundColor: '#EBF4FF',
      borderColor: colors.primary,
    },
    typeCardIcon: {
      alignItems: 'center',
      marginBottom: 12,
    },
    typeCardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      fontFamily: 'Cairo-SemiBold',
      textAlign: 'right',
      marginBottom: 8,
    },
    typeCardTitleSelected: {
      color: colors.primary,
    },
    typeCardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Cairo-Regular',
      textAlign: 'right',
      lineHeight: 20,
    },
    typeCardDescriptionSelected: {
      color: colors.primary,
    },
    errorText: {
      fontSize: 14,
      color: '#EF4444',
      fontFamily: 'Cairo-Regular',
      textAlign: 'right',
      marginTop: 8,
    },
    dynamicSwitchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 4,
    },
    dynamicSwitchLabel: {
      fontSize: 16,
      color: colors.text,
      fontFamily: 'Cairo-Regular',
      textAlign: 'right',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>إضافة التزام جديد</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <Card style={styles.quickActionsCard}>
          <LinearGradient
            colors={['#059669', '#10B981']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.headerTitle}>إضافة التزام مالي جديد</Text>
            <Text style={styles.headerSubtitle}>الالتزامات هي المبالغ المالية التي تدين بها والتي تتطلب دفعات منتظمة</Text>
          </LinearGradient>
        </Card>

        {/* Commitment Type Selection */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>نوع الالتزام</Text>
          
          <View style={styles.typeSelectionContainer}>
            {commitmentTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.typeCard,
                  obligationType === option.value && styles.typeCardSelected
                ]}
                onPress={() => setObligationType(option.value)}
              >
                <View style={styles.typeCardIcon}>
                  {option.icon}
                </View>
                <Text style={[
                  styles.typeCardTitle,
                  obligationType === option.value && styles.typeCardTitleSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.typeCardDescription,
                  obligationType === option.value && styles.typeCardDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {errors.obligationType && (
            <Text style={styles.errorText}>{errors.obligationType}</Text>
          )}
        </Card>

        {/* Dynamic Forms Based on Type */}
        {obligationType && renderDynamicForm()}


        <Card style={styles.actionCard}>
          <Button
            title="حفظ الالتزام"
            onPress={handleSaveCommitment}
            variant="primary"
            size="large"
            icon={<Ionicons name="checkmark" size={20} color={colors.textInverse} />}
            style={styles.saveButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
