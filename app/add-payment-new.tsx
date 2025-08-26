import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { addPayment, getActiveObligations } from '@/lib/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaymentForm {
  amount: number;
  obligationId?: number;
  paymentDate: Date;
  paymentMethod: string;
  description: string;
  reference?: string;
  category?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
}

interface Obligation {
  id: number;
  creditor_name: string;
  obligation_type: string;
  installment_amount: number;
  remaining_amount: number;
}

const paymentMethods = [
  { id: 'cash', label: 'نقدي', icon: 'cash', color: '#10B981' },
  { id: 'knet', label: 'K-Net', icon: 'credit-card', color: '#667EEA' },
  { id: 'visa', label: 'Visa', icon: 'credit-card-outline', color: '#FF6B6B' },
  { id: 'bank_transfer', label: 'تحويل بنكي', icon: 'bank-transfer', color: '#FFB800' },
  { id: 'app', label: 'تطبيق', icon: 'cellphone', color: '#9F7AEA' },
];

const categories = [
  { id: 'loan', label: 'قرض', color: '#667EEA' },
  { id: 'subscription', label: 'اشتراك', color: '#FFB800' },
  { id: 'bill', label: 'فاتورة', color: '#10B981' },
  { id: 'installment', label: 'قسط', color: '#FF6B6B' },
  { id: 'savings', label: 'ادخار', color: '#4ECDC4' },
  { id: 'other', label: 'أخرى', color: '#94A3B8' },
];

export default function ModernAddPayment() {
  const [formData, setFormData] = useState<PaymentForm>({
    amount: 0,
    paymentDate: new Date(),
    paymentMethod: 'cash',
    description: '',
    isRecurring: false,
  });
  
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  useEffect(() => {
    loadObligations();
    animateEntry();
  }, []);
  
  const animateEntry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 10,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const loadObligations = async () => {
    try {
      const data = await getActiveObligations();
      setObligations(data as Obligation[]);
    } catch (error) {
      console.error('Error loading obligations:', error);
    }
  };
  
  const handleObligationSelect = (obligation: Obligation) => {
    setSelectedObligation(obligation);
    setFormData({
      ...formData,
      obligationId: obligation.id,
      amount: obligation.installment_amount,
    });
  };
  
  const validateForm = (): boolean => {
    const newErrors: any = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'يرجى إدخال المبلغ';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'يرجى اختيار طريقة الدفع';
    }
    if (!selectedObligation && !formData.description) {
      newErrors.description = 'يرجى إضافة وصف للدفعة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      const paymentData = {
        obligation_id: formData.obligationId,
        amount: formData.amount,
        payment_date: formData.paymentDate.toISOString().split('T')[0],
        payment_method: formData.paymentMethod,
        reference_number: formData.reference,
        notes: formData.description,
        status: 'completed',
      };
      
      await addPayment(paymentData);
      Alert.alert('نجح', 'تم إضافة الدفعة بنجاح', [
        { text: 'حسناً', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الدفعة');
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
          
          <Text style={styles.headerTitle}>إضافة دفعة جديدة</Text>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {obligations.length}
            </Text>
            <Text style={styles.statLabel}>التزامات نشطة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formData.amount.toFixed(3)}
            </Text>
            <Text style={styles.statLabel}>د.ك المبلغ</Text>
          </View>
        </View>
      </LinearGradient>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}>
            
            {/* Obligation Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>اختر الالتزام</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.obligationsScroll}
              >
                {obligations.map((obligation) => (
                  <TouchableOpacity
                    key={obligation.id}
                    style={[
                      styles.obligationCard,
                      selectedObligation?.id === obligation.id && styles.obligationCardActive
                    ]}
                    onPress={() => handleObligationSelect(obligation)}
                  >
                    <View style={styles.obligationCardHeader}>
                      <MaterialCommunityIcons
                        name={
                          obligation.obligation_type === 'bank_loan' ? 'bank' :
                          obligation.obligation_type === 'savings' ? 'piggy-bank' :
                          'cash'
                        }
                        size={24}
                        color={selectedObligation?.id === obligation.id ? '#FFFFFF' : '#667EEA'}
                      />
                      {selectedObligation?.id === obligation.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[
                      styles.obligationName,
                      selectedObligation?.id === obligation.id && styles.obligationNameActive
                    ]}>
                      {obligation.creditor_name}
                    </Text>
                    <Text style={[
                      styles.obligationAmount,
                      selectedObligation?.id === obligation.id && styles.obligationAmountActive
                    ]}>
                      {obligation.installment_amount.toFixed(3)} د.ك
                    </Text>
                    <Text style={[
                      styles.obligationRemaining,
                      selectedObligation?.id === obligation.id && styles.obligationRemainingActive
                    ]}>
                      متبقي: {obligation.remaining_amount.toFixed(3)}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {obligations.length === 0 && (
                  <View style={styles.noObligations}>
                    <MaterialCommunityIcons name="file-document-outline" size={48} color="#CBD5E1" />
                    <Text style={styles.noObligationsText}>لا توجد التزامات نشطة</Text>
                  </View>
                )}
              </ScrollView>
            </View>
            
            {/* Payment Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>تفاصيل الدفعة</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>المبلغ</Text>
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={formData.amount ? formData.amount.toString() : ''}
                    onChangeText={(text) => setFormData({ ...formData, amount: parseFloat(text) || 0 })}
                    placeholder="0.000"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.currency}>د.ك</Text>
                </View>
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}
              </View>
              
              {/* Payment Method */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>طريقة الدفع</Text>
                <View style={styles.methodsGrid}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.methodCard,
                        formData.paymentMethod === method.id && styles.methodCardActive
                      ]}
                      onPress={() => setFormData({ ...formData, paymentMethod: method.id })}
                    >
                      <View style={[
                        styles.methodIcon,
                        formData.paymentMethod === method.id && { backgroundColor: method.color }
                      ]}>
                        <MaterialCommunityIcons
                          name={method.icon as any}
                          size={20}
                          color={formData.paymentMethod === method.id ? '#FFFFFF' : method.color}
                        />
                      </View>
                      <Text style={[
                        styles.methodLabel,
                        formData.paymentMethod === method.id && styles.methodLabelActive
                      ]}>
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.paymentMethod && (
                  <Text style={styles.errorText}>{errors.paymentMethod}</Text>
                )}
              </View>
              
              {/* Payment Date */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>تاريخ الدفع</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Feather name="calendar" size={20} color="#667EEA" />
                  <Text style={styles.dateText}>
                    {formData.paymentDate.toLocaleDateString('ar-KW')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Reference Number */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>رقم المرجع (اختياري)</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={formData.reference}
                    onChangeText={(text) => setFormData({ ...formData, reference: text })}
                    placeholder="أدخل رقم المرجع"
                    placeholderTextColor="#94A3B8"
                  />
                  <Feather name="hash" size={20} color="#94A3B8" style={styles.inputIcon} />
                </View>
              </View>
              
              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>الوصف</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    placeholder="أضف وصف للدفعة"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                  />
                </View>
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>
              
              {/* Category Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>الفئة</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        formData.category === category.id && { backgroundColor: category.color }
                      ]}
                      onPress={() => setFormData({ ...formData, category: category.id })}
                    >
                      <Text style={[
                        styles.categoryText,
                        formData.category === category.id && styles.categoryTextActive
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Recurring Toggle */}
              <TouchableOpacity
                style={styles.recurringToggle}
                onPress={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
              >
                <View style={styles.recurringToggleLeft}>
                  <MaterialCommunityIcons name="repeat" size={24} color="#667EEA" />
                  <View>
                    <Text style={styles.recurringTitle}>دفعة متكررة</Text>
                    <Text style={styles.recurringDescription}>
                      تكرار هذه الدفعة تلقائياً
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.switch,
                  formData.isRecurring && styles.switchActive
                ]}>
                  <View style={[
                    styles.switchThumb,
                    formData.isRecurring && styles.switchThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSave}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.primaryButtonGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>حفظ الدفعة</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={formData.paymentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, paymentDate: selectedDate });
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  
  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
    paddingHorizontal: 20,
    textAlign: 'right',
  },
  
  // Obligations
  obligationsScroll: {
    paddingHorizontal: 20,
  },
  obligationCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  obligationCardActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  obligationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  obligationName: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 4,
    textAlign: 'right',
  },
  obligationNameActive: {
    color: '#FFFFFF',
  },
  obligationAmount: {
    fontSize: 16,
    color: '#667EEA',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  obligationAmountActive: {
    color: '#FFFFFF',
  },
  obligationRemaining: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
  },
  obligationRemainingActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  noObligations: {
    width: SCREEN_WIDTH - 40,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  noObligationsText: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    marginTop: 8,
  },
  
  // Form
  formGroup: {
    marginBottom: 20,
    paddingHorizontal: 20,
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
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  
  // Amount Input
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#667EEA',
    paddingHorizontal: 20,
    height: 60,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    textAlign: 'right',
  },
  currency: {
    fontSize: 18,
    color: '#667EEA',
    fontFamily: 'Cairo-Bold',
    marginLeft: 12,
  },
  
  // Payment Methods
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    marginRight: 8,
  },
  methodCardActive: {
    borderColor: '#667EEA',
    backgroundColor: '#F0F4FF',
  },
  methodIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  methodLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  methodLabelActive: {
    color: '#667EEA',
    fontFamily: 'Cairo-SemiBold',
  },
  
  // Date Input
  dateInput: {
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
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-Regular',
    marginLeft: 12,
  },
  
  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    marginBottom: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  
  // Recurring Toggle
  recurringToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recurringToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recurringTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Cairo-SemiBold',
    marginLeft: 12,
    textAlign: 'right',
  },
  recurringDescription: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginLeft: 12,
    textAlign: 'right',
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CBD5E1',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#667EEA',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
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
