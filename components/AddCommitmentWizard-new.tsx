import React, { useState } from 'react';
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

import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddCommitmentWizardProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CommitmentData {
  creditorName: string;
  totalAmount: string;
  type: string;
  category: string;
  installmentAmount: string;
  installmentCount: string;
  startDate: string;
  frequency: string;
  description: string;
}

const commitmentTypes = [
  { id: 'bank_loan', label: 'قرض بنكي', icon: 'business', color: '#0B63FF' },
  { id: 'personal_loan', label: 'قرض شخصي', icon: 'person', color: '#8B5CF6' },
  { id: 'credit_card', label: 'بطاقة ائتمان', icon: 'card', color: '#EF4444' },
  { id: 'bnpl', label: 'اشتر الآن ادفع لاحقاً', icon: 'storefront', color: '#F59E0B' },
  { id: 'installment', label: 'تقسيط', icon: 'calendar', color: '#10B981' },
  { id: 'subscription', label: 'اشتراك', icon: 'refresh', color: '#06B6D4' },
  { id: 'utility', label: 'فاتورة', icon: 'flash', color: '#84CC16' },
  { id: 'other', label: 'أخرى', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

const frequencies = [
  { id: 'monthly', label: 'شهرياً', icon: 'calendar' },
  { id: 'weekly', label: 'أسبوعياً', icon: 'calendar' },
  { id: 'quarterly', label: 'كل 3 أشهر', icon: 'calendar' },
  { id: 'yearly', label: 'سنوياً', icon: 'calendar' },
];

export default function AddCommitmentWizard({ 
  visible, 
  onClose, 
  onSuccess 
}: AddCommitmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [commitmentData, setCommitmentData] = useState<CommitmentData>({
    creditorName: '',
    totalAmount: '',
    type: '',
    category: '',
    installmentAmount: '',
    installmentCount: '',
    startDate: '',
    frequency: 'monthly',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 4;

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
        if (!commitmentData.creditorName.trim()) {
          newErrors.creditorName = 'اسم الدائن مطلوب';
        }
        if (!commitmentData.type) {
          newErrors.type = 'نوع الالتزام مطلوب';
        }
        break;
      case 2:
        if (!commitmentData.totalAmount) {
          newErrors.totalAmount = 'المبلغ الإجمالي مطلوب';
        } else if (isNaN(parseFloat(commitmentData.totalAmount))) {
          newErrors.totalAmount = 'مبلغ غير صحيح';
        } else if (parseFloat(commitmentData.totalAmount) <= 0) {
          newErrors.totalAmount = 'المبلغ يجب أن يكون أكبر من صفر';
        }
        break;
      case 3:
        if (!commitmentData.installmentAmount) {
          newErrors.installmentAmount = 'مبلغ القسط مطلوب';
        } else if (isNaN(parseFloat(commitmentData.installmentAmount))) {
          newErrors.installmentAmount = 'مبلغ غير صحيح';
        } else if (parseFloat(commitmentData.installmentAmount) <= 0) {
          newErrors.installmentAmount = 'المبلغ يجب أن يكون أكبر من صفر';
        }
        
        if (!commitmentData.installmentCount) {
          newErrors.installmentCount = 'عدد الأقساط مطلوب';
        } else if (isNaN(parseInt(commitmentData.installmentCount))) {
          newErrors.installmentCount = 'عدد غير صحيح';
        } else if (parseInt(commitmentData.installmentCount) <= 0) {
          newErrors.installmentCount = 'العدد يجب أن يكون أكبر من صفر';
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
      // Save commitment to database
      // await addCommitment(commitmentData);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
      handleClose();
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ الالتزام');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setCommitmentData({
      creditorName: '',
      totalAmount: '',
      type: '',
      category: '',
      installmentAmount: '',
      installmentCount: '',
      startDate: '',
      frequency: 'monthly',
      description: '',
    });
    setErrors({});
    onClose();
  };

  const calculateTotalFromInstallments = () => {
    const amount = parseFloat(commitmentData.installmentAmount) || 0;
    const count = parseInt(commitmentData.installmentCount) || 0;
    return amount * count;
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
        معلومات أساسية
      </Typography>

      <Input
        label="اسم الدائن أو الجهة"
        placeholder="مثال: بنك الكويت الوطني، تابي، شركة الكهرباء"
        value={commitmentData.creditorName}
        onChangeText={(text) => setCommitmentData(prev => ({ ...prev, creditorName: text }))}
        error={errors.creditorName}
        icon={<Ionicons name="business" size={20} color="#9CA3AF" />}
        iconPosition="right"
      />

      <Typography variant="body" className="text-text-secondary mb-4 mt-6">
        نوع الالتزام
      </Typography>
      
      <View className="gap-2">
        {commitmentTypes.map((type) => (
          <Card
            key={type.id}
            padding="md"
            onPress={() => setCommitmentData(prev => ({ ...prev, type: type.id }))}
            className={`border-2 ${
              commitmentData.type === type.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-transparent'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${type.color}20` }}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={20} 
                    color={type.color} 
                  />
                </View>
                <Typography variant="body" className={
                  commitmentData.type === type.id ? 'text-primary-600' : 'text-text-primary'
                }>
                  {type.label}
                </Typography>
              </View>
              
              <View className={`w-5 h-5 rounded-full border-2 ${
                commitmentData.type === type.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-muted-300'
              }`}>
                {commitmentData.type === type.id && (
                  <View className="w-1 h-1 bg-white rounded-full self-center mt-1.5" />
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>

      {errors.type && (
        <Typography variant="caption" className="text-danger-500 mt-2">
          {errors.type}
        </Typography>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1">
      <Typography variant="h3" className="text-text-primary font-cairo-bold mb-6 text-center">
        المبلغ الإجمالي
      </Typography>

      <Input
        label="المبلغ الإجمالي للالتزام (د.ك)"
        placeholder="0.000"
        value={commitmentData.totalAmount}
        onChangeText={(text) => setCommitmentData(prev => ({ ...prev, totalAmount: text }))}
        keyboardType="numeric"
        error={errors.totalAmount}
        icon={<Ionicons name="cash" size={20} color="#9CA3AF" />}
        iconPosition="right"
      />

      <Card padding="md" variant="bordered" className="mt-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Typography variant="body" className="text-text-primary font-cairo-medium mr-2">
            نصائح مهمة
          </Typography>
        </View>
        <Typography variant="caption" className="text-text-secondary leading-5">
          • أدخل المبلغ الإجمالي المتبقي عليك دفعه{'\n'}
          • لا تشمل الفوائد أو الرسوم المستقبلية غير المؤكدة{'\n'}
          • يمكنك تعديل هذا المبلغ لاحقاً إذا تغير
        </Typography>
      </Card>
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1">
      <Typography variant="h3" className="text-text-primary font-cairo-bold mb-6 text-center">
        تفاصيل الأقساط
      </Typography>

      <Input
        label="مبلغ القسط الواحد (د.ك)"
        placeholder="0.000"
        value={commitmentData.installmentAmount}
        onChangeText={(text) => setCommitmentData(prev => ({ ...prev, installmentAmount: text }))}
        keyboardType="numeric"
        error={errors.installmentAmount}
        icon={<Ionicons name="cash" size={20} color="#9CA3AF" />}
        iconPosition="right"
      />

      <Input
        label="عدد الأقساط"
        placeholder="12"
        value={commitmentData.installmentCount}
        onChangeText={(text) => setCommitmentData(prev => ({ ...prev, installmentCount: text }))}
        keyboardType="numeric"
        error={errors.installmentCount}
        icon={<Ionicons name="list" size={20} color="#9CA3AF" />}
        iconPosition="right"
      />

      <Typography variant="body" className="text-text-secondary mb-4 mt-6">
        تكرار الدفع
      </Typography>
      
      <View className="gap-2 mb-6">
        {frequencies.map((freq) => (
          <Card
            key={freq.id}
            padding="md"
            onPress={() => setCommitmentData(prev => ({ ...prev, frequency: freq.id }))}
            className={`border-2 ${
              commitmentData.frequency === freq.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-transparent'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons 
                  name={freq.icon as any} 
                  size={20} 
                  color={commitmentData.frequency === freq.id ? '#0B63FF' : '#6B7280'} 
                />
                <Typography variant="body" className={`mr-3 ${
                  commitmentData.frequency === freq.id ? 'text-primary-600' : 'text-text-primary'
                }`}>
                  {freq.label}
                </Typography>
              </View>
              
              <View className={`w-5 h-5 rounded-full border-2 ${
                commitmentData.frequency === freq.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-muted-300'
              }`}>
                {commitmentData.frequency === freq.id && (
                  <View className="w-1 h-1 bg-white rounded-full self-center mt-1.5" />
                )}
              </View>
            </View>
          </Card>
        ))}
      </View>

      {commitmentData.installmentAmount && commitmentData.installmentCount && (
        <Card padding="md" variant="bordered">
          <Typography variant="caption" className="text-text-secondary mb-2">
            إجمالي المبلغ المحسوب من الأقساط
          </Typography>
          <Typography variant="h3" className="text-primary-600 font-cairo-bold">
            {calculateTotalFromInstallments().toLocaleString()} د.ك
          </Typography>
        </Card>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View className="flex-1">
      <Typography variant="h3" className="text-text-primary font-cairo-bold mb-6 text-center">
        تفاصيل إضافية
      </Typography>

      <Input
        label="تاريخ بداية الالتزام"
        placeholder="YYYY-MM-DD"
        value={commitmentData.startDate}
        onChangeText={(text) => setCommitmentData(prev => ({ ...prev, startDate: text }))}
        icon={<Ionicons name="calendar" size={20} color="#9CA3AF" />}
        iconPosition="right"
        hint="مثال: 2024-01-15"
      />

      <Input
        label="وصف أو ملاحظات (اختياري)"
        placeholder="أي تفاصيل إضافية حول هذا الالتزام"
        value={commitmentData.description}
        onChangeText={(text) => setCommitmentData(prev => ({ ...prev, description: text }))}
        multiline
        numberOfLines={4}
        icon={<Ionicons name="document-text" size={20} color="#9CA3AF" />}
        iconPosition="right"
      />

      {/* Summary Card */}
      <Card padding="lg" variant="bordered" className="mt-6">
        <Typography variant="h3" className="text-text-primary font-cairo-bold mb-4">
          ملخص الالتزام
        </Typography>
        
        <View className="gap-3">
          <View className="flex-row justify-between">
            <Typography variant="caption" className="text-text-secondary">الدائن:</Typography>
            <Typography variant="body" className="text-text-primary font-cairo-medium">
              {commitmentData.creditorName || 'غير محدد'}
            </Typography>
          </View>
          
          <View className="flex-row justify-between">
            <Typography variant="caption" className="text-text-secondary">النوع:</Typography>
            <Typography variant="body" className="text-text-primary">
              {commitmentTypes.find(t => t.id === commitmentData.type)?.label || 'غير محدد'}
            </Typography>
          </View>
          
          <View className="flex-row justify-between">
            <Typography variant="caption" className="text-text-secondary">المبلغ الإجمالي:</Typography>
            <Typography variant="body" className="text-text-primary font-cairo-bold">
              {commitmentData.totalAmount ? `${parseFloat(commitmentData.totalAmount).toLocaleString()} د.ك` : 'غير محدد'}
            </Typography>
          </View>
          
          <View className="flex-row justify-between">
            <Typography variant="caption" className="text-text-secondary">القسط الشهري:</Typography>
            <Typography variant="body" className="text-text-primary">
              {commitmentData.installmentAmount ? `${parseFloat(commitmentData.installmentAmount).toLocaleString()} د.ك` : 'غير محدد'}
            </Typography>
          </View>
          
          <View className="flex-row justify-between">
            <Typography variant="caption" className="text-text-secondary">عدد الأقساط:</Typography>
            <Typography variant="body" className="text-text-primary">
              {commitmentData.installmentCount || 'غير محدد'}
            </Typography>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
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
          style={{ maxHeight: SCREEN_HEIGHT * 0.95, minHeight: SCREEN_HEIGHT * 0.7 }}
        >
          {/* Header */}
          <LinearGradient
            colors={['#10B981', '#059669']}
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
                  إضافة التزام جديد
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
                  حفظ الالتزام
                </Button>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
