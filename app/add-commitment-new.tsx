import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addObligation } from '@/lib/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommitmentForm {
  type: string;
  creditorName: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  installmentAmount: number;
  frequency: string;
  description: string;
  interestRate?: number;
  totalAmount?: number;
  category?: string;
}

const commitmentTypes = [
  { 
    id: 'bank_loan', 
    label: 'قرض بنكي', 
    icon: 'bank',
    color: '#667EEA',
    description: 'قروض شخصية أو عقارية من البنوك'
  },
  { 
    id: 'personal_debt', 
    label: 'دين شخصي', 
    icon: 'account-cash',
    color: '#FF6B6B',
    description: 'مبالغ مستحقة لأفراد'
  },
  { 
    id: 'savings', 
    label: 'ادخار', 
    icon: 'piggy-bank',
    color: '#4ECDC4',
    description: 'خطط ادخار منتظمة'
  },
  { 
    id: 'subscription', 
    label: 'اشتراك', 
    icon: 'calendar-repeat',
    color: '#FFB800',
    description: 'خدمات اشتراك دورية'
  },
  { 
    id: 'bnpl', 
    label: 'تقسيط', 
    icon: 'credit-card-clock',
    color: '#9F7AEA',
    description: 'خدمات الدفع بالتقسيط'
  },
  { 
    id: 'store_installment', 
    label: 'أقساط متجر', 
    icon: 'store',
    color: '#F97316',
    description: 'أقساط مشتريات من المتاجر'
  }
];

const frequencies = [
  { value: 'monthly', label: 'شهري' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'quarterly', label: 'ربع سنوي' },
  { value: 'yearly', label: 'سنوي' },
];

export default function ModernAddCommitment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [animationValue] = useState(new Animated.Value(0));
  
  const [formData, setFormData] = useState<CommitmentForm>({
    type: '',
    creditorName: '',
    amount: 0,
    startDate: new Date(),
    endDate: new Date(),
    installmentAmount: 0,
    frequency: 'monthly',
    description: '',
  });
  
  const [errors, setErrors] = useState<any>({});
  
  const animateStep = () => {
    Animated.spring(animationValue, {
      toValue: 1,
      tension: 10,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };
  
  const handleTypeSelect = (typeId: string) => {
    setFormData({ ...formData, type: typeId });
    animateStep();
  };
  
  const validateStep = (step: number): boolean => {
    const newErrors: any = {};
    
    switch (step) {
      case 1:
        if (!formData.type) {
          newErrors.type = 'يرجى اختيار نوع الالتزام';
        }
        break;
      case 2:
        if (!formData.creditorName.trim()) {
          newErrors.creditorName = 'يرجى إدخال اسم الدائن';
        }
        if (!formData.amount || formData.amount <= 0) {
          newErrors.amount = 'يرجى إدخال المبلغ الإجمالي';
        }
        break;
      case 3:
        if (!formData.installmentAmount || formData.installmentAmount <= 0) {
          newErrors.installmentAmount = 'يرجى إدخال قيمة القسط';
        }
        if (!formData.frequency) {
          newErrors.frequency = 'يرجى اختيار تكرار الدفع';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        animateStep();
      } else {
        handleSave();
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleSave = async () => {
    try {
      const obligationData = {
        obligation_type: formData.type,
        creditor_name: formData.creditorName,
        original_amount: formData.amount,
        remaining_amount: formData.amount,
        interest_rate: formData.interestRate || 0,
        start_date: formData.startDate.toISOString().split('T')[0],
        end_date: formData.endDate.toISOString().split('T')[0],
        payment_frequency: formData.frequency,
        installment_amount: formData.installmentAmount,
        status: 'active',
        notes: formData.description,
        category: formData.category || formData.type,
      };
      
      await addObligation(obligationData);
      Alert.alert('نجح', 'تم إضافة الالتزام بنجاح', [
        { text: 'حسناً', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving commitment:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الالتزام');
    }
  };
  
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            currentStep >= step && styles.stepCircleActive
          ]}>
            {currentStep > step ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.stepNumber,
                currentStep >= step && styles.stepNumberActive
              ]}>{step}</Text>
            )}
          </View>
          {step < 3 && (
            <View style={[
              styles.stepLine,
              currentStep > step && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );
  
  const renderStep1 = () => (
    <Animated.View style={[
      styles.stepContent,
      {
        opacity: animationValue,
        transform: [{ scale: animationValue }]
      }
    ]}>
      <Text style={styles.stepTitle}>اختر نوع الالتزام</Text>
      <Text style={styles.stepDescription}>
        حدد نوع الالتزام المالي الذي تريد إضافته
      </Text>
      
      <View style={styles.typesGrid}>
        {commitmentTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              formData.type === type.id && styles.typeCardActive
            ]}
            onPress={() => handleTypeSelect(type.id)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                formData.type === type.id 
                  ? [type.color, type.color + 'CC']
                  : ['#FFFFFF', '#FFFFFF']
              }
              style={styles.typeCardGradient}
            >
              <MaterialCommunityIcons 
                name={type.icon as any}
                size={32}
                color={formData.type === type.id ? '#FFFFFF' : type.color}
              />
              <Text style={[
                styles.typeCardTitle,
                formData.type === type.id && styles.typeCardTitleActive
              ]}>
                {type.label}
              </Text>
              <Text style={[
                styles.typeCardDescription,
                formData.type === type.id && styles.typeCardDescriptionActive
              ]}>
                {type.description}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      
      {errors.type && (
        <Text style={styles.errorText}>{errors.type}</Text>
      )}
    </Animated.View>
  );
  
  const renderStep2 = () => (
    <Animated.View style={[
      styles.stepContent,
      {
        opacity: animationValue,
        transform: [{ translateY: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        }) }]
      }
    ]}>
      <Text style={styles.stepTitle}>تفاصيل الالتزام</Text>
      <Text style={styles.stepDescription}>
        أدخل المعلومات الأساسية للالتزام
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>اسم الدائن أو الجهة</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={formData.creditorName}
            onChangeText={(text) => setFormData({ ...formData, creditorName: text })}
            placeholder="مثال: البنك الأهلي"
            placeholderTextColor="#94A3B8"
          />
          <Feather name="user" size={20} color="#94A3B8" style={styles.inputIcon} />
        </View>
        {errors.creditorName && (
          <Text style={styles.errorText}>{errors.creditorName}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>المبلغ الإجمالي</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={formData.amount ? formData.amount.toString() : ''}
            onChangeText={(text) => setFormData({ ...formData, amount: parseFloat(text) || 0 })}
            placeholder="0.000"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
          />
          <Text style={styles.inputSuffix}>د.ك</Text>
        </View>
        {errors.amount && (
          <Text style={styles.errorText}>{errors.amount}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>الوصف (اختياري)</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="أضف وصف أو ملاحظات"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </Animated.View>
  );
  
  const renderStep3 = () => (
    <Animated.View style={[
      styles.stepContent,
      {
        opacity: animationValue,
        transform: [{ translateX: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0]
        }) }]
      }
    ]}>
      <Text style={styles.stepTitle}>خطة السداد</Text>
      <Text style={styles.stepDescription}>
        حدد تفاصيل الأقساط والمواعيد
      </Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>قيمة القسط</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={formData.installmentAmount ? formData.installmentAmount.toString() : ''}
            onChangeText={(text) => setFormData({ ...formData, installmentAmount: parseFloat(text) || 0 })}
            placeholder="0.000"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
          />
          <Text style={styles.inputSuffix}>د.ك</Text>
        </View>
        {errors.installmentAmount && (
          <Text style={styles.errorText}>{errors.installmentAmount}</Text>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>تكرار الدفع</Text>
        <View style={styles.frequencyContainer}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.value}
              style={[
                styles.frequencyButton,
                formData.frequency === freq.value && styles.frequencyButtonActive
              ]}
              onPress={() => setFormData({ ...formData, frequency: freq.value })}
            >
              <Text style={[
                styles.frequencyButtonText,
                formData.frequency === freq.value && styles.frequencyButtonTextActive
              ]}>
                {freq.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowDatePicker('start')}
        >
          <Text style={styles.inputLabel}>تاريخ البداية</Text>
          <View style={styles.dateDisplay}>
            <Feather name="calendar" size={18} color="#667EEA" />
            <Text style={styles.dateText}>
              {formData.startDate.toLocaleDateString('ar-KW')}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => setShowDatePicker('end')}
        >
          <Text style={styles.inputLabel}>تاريخ النهاية</Text>
          <View style={styles.dateDisplay}>
            <Feather name="calendar" size={18} color="#667EEA" />
            <Text style={styles.dateText}>
              {formData.endDate.toLocaleDateString('ar-KW')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>ملخص الالتزام</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>المبلغ الإجمالي:</Text>
          <Text style={styles.summaryValue}>{formData.amount.toFixed(3)} د.ك</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>القسط الشهري:</Text>
          <Text style={styles.summaryValue}>{formData.installmentAmount.toFixed(3)} د.ك</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>عدد الأقساط:</Text>
          <Text style={styles.summaryValue}>
            {formData.installmentAmount > 0 ? Math.ceil(formData.amount / formData.installmentAmount) : 0}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>إضافة التزام جديد</Text>
          
          <View style={styles.placeholder} />
        </View>
        
        {renderStepIndicator()}
      </LinearGradient>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBack}
            >
              <Text style={styles.secondaryButtonText}>رجوع</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>
                {currentStep === 3 ? 'حفظ الالتزام' : 'التالي'}
              </Text>
              <Ionicons 
                name={currentStep === 3 ? 'checkmark' : 'arrow-forward'} 
                size={20} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={showDatePicker === 'start' ? formData.startDate : formData.endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(null);
            if (selectedDate) {
              if (showDatePicker === 'start') {
                setFormData({ ...formData, startDate: selectedDate });
              } else {
                setFormData({ ...formData, endDate: selectedDate });
              }
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  placeholder: {
    width: 40,
  },
  
  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FFFFFF',
  },
  stepNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-SemiBold',
  },
  stepNumberActive: {
    color: '#667EEA',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#FFFFFF',
  },
  
  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Type Selection Grid
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  typeCardActive: {
    elevation: 8,
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  typeCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  typeCardTitle: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    marginTop: 8,
  },
  typeCardTitleActive: {
    color: '#FFFFFF',
  },
  typeCardDescription: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  typeCardDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Form
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Cairo-Medium',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  inputIcon: {
    marginLeft: 12,
  },
  inputSuffix: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    marginLeft: 8,
  },
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  
  // Frequency Selection
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Date Fields
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-Regular',
    marginLeft: 8,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
  },
  
  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Cairo-SemiBold',
  },
  primaryButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Cairo-SemiBold',
  },
  
  // Error
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
    textAlign: 'right',
  },
});
