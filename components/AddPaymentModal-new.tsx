import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getObligations, recordPayment, getDatabase } from '@/lib/database';

import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  commitmentId?: number | null;
}

interface PaymentData {
  obligationId: number;
  amount: string;
  paymentMethod: string;
  note: string;
}

interface Obligation {
  id: number;
  creditor_name: string;
  type: string;
  remaining_amount: number;
  next_payment_amount?: number;
  due_date?: string;
}

const paymentMethods = [
  { id: 'cash', label: 'نقد', icon: 'cash' },
  { id: 'transfer', label: 'تحويل بنكي', icon: 'card' },
  { id: 'credit_card', label: 'بطاقة ائتمان', icon: 'card' },
  { id: 'debit_card', label: 'بطاقة مدين', icon: 'card' },
  { id: 'check', label: 'شيك', icon: 'document-text' },
  { id: 'other', label: 'أخرى', icon: 'ellipsis-horizontal' },
];

export default function AddPaymentModal({ 
  visible, 
  onClose, 
  onSuccess, 
  commitmentId 
}: AddPaymentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [selectedObligation, setSelectedObligation] = useState<Obligation | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    obligationId: commitmentId || 0,
    amount: '',
    paymentMethod: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  useEffect(() => {
    if (visible) {
      loadObligations();
    }
  }, [visible]);

  useEffect(() => {
    if (commitmentId && obligations.length > 0) {
      const obligation = obligations.find(o => o.id === commitmentId);
      if (obligation) {
        setSelectedObligation(obligation);
        setPaymentData(prev => ({ ...prev, obligationId: commitmentId }));
        setCurrentStep(2);
      }
    }
  }, [commitmentId, obligations]);

  const loadObligations = async () => {
    try {
      const db = getDatabase();
      const list = await getObligations();
      const withNext = await Promise.all(
        (list as any[]).map(async (o) => {
          try {
            const next = await (db as any).getFirstAsync(
              'SELECT amount, due_date FROM installments WHERE obligation_id = ? AND status = "pending" ORDER BY due_date ASC LIMIT 1',
              [o.id]
            );
            return {
              id: o.id,
              creditor_name: o.creditor_name,
              type: o.type,
              remaining_amount: o.remaining_amount ?? 0,
              next_payment_amount: next?.amount,
              due_date: next?.due_date,
            } as Obligation;
          } catch (e) {
            return {
              id: o.id,
              creditor_name: o.creditor_name,
              type: o.type,
              remaining_amount: o.remaining_amount ?? 0,
            } as Obligation;
          }
        })
      );
      setObligations(withNext);
    } catch (error) {
      console.error('Error loading obligations:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} د.ك`;
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!selectedObligation) {
          newErrors.obligation = 'يجب اختيار التزام';
        }
        break;
      case 2:
        if (!paymentData.amount) {
          newErrors.amount = 'المبلغ مطلوب';
        } else if (isNaN(parseFloat(paymentData.amount))) {
          newErrors.amount = 'مبلغ غير صحيح';
        } else if (parseFloat(paymentData.amount) <= 0) {
          newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
        } else if (selectedObligation && parseFloat(paymentData.amount) > selectedObligation.remaining_amount) {
          newErrors.amount = 'المبلغ أكبر من المبلغ المتبقي';
        }
        break;
      case 3:
        if (!paymentData.paymentMethod) {
          newErrors.paymentMethod = 'طريقة الدفع مطلوبة';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      // Determine next pending installment for this obligation (if any)
      const db = getDatabase();
      const obligationId = selectedObligation?.id || paymentData.obligationId;
      const next = await (db as any).getFirstAsync(
        'SELECT id FROM installments WHERE obligation_id = ? AND status = "pending" ORDER BY due_date ASC LIMIT 1',
        [obligationId]
      );

      // Persist payment
      await recordPayment({
        obligation_id: obligationId,
        installment_id: next?.id || null,
        amount: parseFloat(paymentData.amount),
        date: new Date().toISOString().split('T')[0],
        method: paymentData.paymentMethod,
        note: paymentData.note,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
      handleClose();
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الدفعة');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedObligation(null);
    setPaymentData({
      obligationId: 0,
      amount: '',
      paymentMethod: '',
      note: '',
    });
    setErrors({});
    onClose();
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center items-center mb-6">
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} className="flex-row items-center">
          <View className={`w-8 h-8 rounded-full items-center justify-center ${
            index + 1 <= currentStep ? 'bg-primary-500' : 'bg-muted-200'
          }`}>
            <Typography variant="caption" className={
              index + 1 <= currentStep ? 'text-white font-cairo-bold' : 'text-muted-500'
            }>
              {index + 1}
            </Typography>
          </View>
          {index < totalSteps - 1 && (
            <View className={`w-8 h-0.5 mx-2 ${
              index + 1 < currentStep ? 'bg-primary-500' : 'bg-muted-200'
            }`} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View className="flex-1">
      <Typography variant="h3" className="text-text-primary font-cairo-bold mb-6 text-center">
        اختيار الالتزام
      </Typography>

      <View className="gap-3">
        {obligations.map((obligation) => (
          <Card
            key={obligation.id}
            padding="md"
            onPress={() => setSelectedObligation(obligation)}
            className={`border-2 ${
              selectedObligation?.id === obligation.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-transparent'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Typography variant="body" className="text-text-primary font-cairo-medium mb-1">
                  {obligation.creditor_name}
                </Typography>
                <Typography variant="caption" className="text-text-secondary mb-2">
                  المبلغ المتبقي: {formatCurrency(obligation.remaining_amount)}
                </Typography>
                {obligation.next_payment_amount && (
                  <Typography variant="caption" className="text-primary-600">
                    الدفعة القادمة: {formatCurrency(obligation.next_payment_amount)}
                  </Typography>
                )}
              </View>
              
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                selectedObligation?.id === obligation.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-muted-300'
              }`}>
                {selectedObligation?.id === obligation.id && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>

      {errors.obligation && (
        <Typography variant="caption" className="text-danger-500 mt-2">
          {errors.obligation}
        </Typography>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1">
      <Typography variant="h3" className="text-text-primary font-cairo-bold mb-6 text-center">
        مبلغ الدفعة
      </Typography>

      {selectedObligation && (
        <Card padding="md" variant="bordered" className="mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Typography variant="body" className="text-text-primary font-cairo-medium mr-2">
              {selectedObligation.creditor_name}
            </Typography>
          </View>
          <Typography variant="caption" className="text-text-secondary">
            المبلغ المتبقي: {formatCurrency(selectedObligation.remaining_amount)}
          </Typography>
          {selectedObligation.next_payment_amount && (
            <Typography variant="caption" className="text-primary-600 mt-1">
              الدفعة المقترحة: {formatCurrency(selectedObligation.next_payment_amount)}
            </Typography>
          )}
        </Card>
      )}

      <Input
        label="مبلغ الدفعة (د.ك)"
        placeholder="0.000"
        value={paymentData.amount}
        onChangeText={(text) => setPaymentData(prev => ({ ...prev, amount: text }))}
        keyboardType="numeric"
        error={errors.amount}
        icon={<Ionicons name="cash" size={20} color="#9CA3AF" />}
        iconPosition="right"
      />

      {selectedObligation?.next_payment_amount && (
        <View className="flex-row gap-2 mt-4">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => setPaymentData(prev => ({ 
              ...prev, 
              amount: selectedObligation.next_payment_amount!.toString() 
            }))}
          >
            الدفعة المقترحة
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => setPaymentData(prev => ({ 
              ...prev, 
              amount: selectedObligation.remaining_amount.toString() 
            }))}
          >
            المبلغ كاملاً
          </Button>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1">
      <Typography variant="h3" className="text-text-primary font-cairo-bold mb-6 text-center">
        طريقة الدفع والتفاصيل
      </Typography>

      <Typography variant="body" className="text-text-secondary mb-4">
        طريقة الدفع
      </Typography>
      
      <View className="gap-2 mb-6">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            padding="md"
            onPress={() => setPaymentData(prev => ({ ...prev, paymentMethod: method.id }))}
            className={`border-2 ${
              paymentData.paymentMethod === method.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-transparent'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons 
                  name={method.icon as any} 
                  size={20} 
                  color={paymentData.paymentMethod === method.id ? '#0B63FF' : '#6B7280'} 
                />
                <Typography variant="body" className={`mr-3 ${
                  paymentData.paymentMethod === method.id ? 'text-primary-600' : 'text-text-primary'
                }`}>
                  {method.label}
                </Typography>
              </View>
              
              <View className={`w-5 h-5 rounded-full border-2 ${
                paymentData.paymentMethod === method.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-muted-300'
              }`}>
                {paymentData.paymentMethod === method.id && (
                  <View className="w-1 h-1 bg-white rounded-full self-center mt-1.5" />
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>

      {errors.paymentMethod && (
        <Typography variant="caption" className="text-danger-500 mb-4">
          {errors.paymentMethod}
        </Typography>
      )}

      <Input
        label="ملاحظات (اختياري)"
        placeholder="أي ملاحظات إضافية حول الدفعة"
        value={paymentData.note}
        onChangeText={(text) => setPaymentData(prev => ({ ...prev, note: text }))}
        multiline
        numberOfLines={3}
        icon={<Ionicons name="document-text" size={20} color="#9CA3AF" />}
        iconPosition="right"
      />
    </View>
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View 
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: SCREEN_HEIGHT * 0.9, minHeight: SCREEN_HEIGHT * 0.6 }}
        >
          {/* Header */}
          <LinearGradient
            colors={['#0B63FF', '#2C9BF0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-t-3xl px-5 py-6"
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View className="flex-1 items-center">
                <Typography variant="h3" className="text-white font-cairo-bold">
                  تسجيل دفعة
                </Typography>
                <Typography variant="caption" className="text-white/80">
                  الخطوة {currentStep} من {totalSteps}
                </Typography>
              </View>
              
              <View className="w-8" />
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
            {renderStepIndicator()}
            {renderCurrentStep()}
          </ScrollView>

          {/* Bottom Actions */}
          <View className="px-5 py-4 bg-muted-50 border-t border-muted-200">
            <View className="flex-row gap-3">
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  size="lg"
                  onPress={handleBack}
                  className="flex-1"
                >
                  السابق
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleNext}
                  disabled={!validateCurrentStep()}
                  className="flex-1"
                >
                  التالي
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSave}
                  loading={loading}
                  className="flex-1"
                  icon={<Ionicons name="checkmark" size={20} color="#FFFFFF" />}
                >
                  حفظ الدفعة
                </Button>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
