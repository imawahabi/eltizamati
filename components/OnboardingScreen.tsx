import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { completeOnboarding } from '../lib/database';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [salary, setSalary] = useState('');
  const [payday, setPayday] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: 'مرحباً بك في إلتزاماتي',
      subtitle: 'تطبيقك الشخصي لإدارة الالتزامات المالية',
      icon: 'wallet-outline',
    },
    {
      title: 'ما اسمك؟',
      subtitle: 'سنستخدم اسمك لتخصيص التطبيق',
      icon: 'person-outline',
    },
    {
      title: 'ما راتبك الشهري؟',
      subtitle: 'أدخل راتبك الشهري بالدينار الكويتي',
      icon: 'card-outline',
    },
    {
      title: 'متى يوم صرف راتبك؟',
      subtitle: 'أدخل اليوم من الشهر الذي تستلم فيه راتبك',
      icon: 'calendar-outline',
    },
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      if (!name.trim()) {
        Alert.alert('خطأ', 'يرجى إدخال اسمك');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const salaryNum = parseFloat(salary);
      if (!salary || isNaN(salaryNum) || salaryNum <= 0) {
        Alert.alert('خطأ', 'يرجى إدخال راتب صحيح');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const paydayNum = parseInt(payday);
      if (!payday || isNaN(paydayNum) || paydayNum < 1 || paydayNum > 31) {
        Alert.alert('خطأ', 'يرجى إدخال يوم صحيح (1-31)');
        return;
      }
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeOnboarding(name.trim(), parseFloat(salary), parseInt(payday));
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.welcomeContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="wallet-outline" size={80} color="#0B63FF" />
            </View>
            <Text style={styles.welcomeTitle}>مرحباً بك في إلتزاماتي</Text>
            <Text style={styles.welcomeSubtitle}>
              تطبيقك الشخصي لإدارة الالتزامات المالية بذكاء وسهولة
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#28A745" />
                <Text style={styles.featureText}>تتبع جميع التزاماتك المالية</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#28A745" />
                <Text style={styles.featureText}>تذكيرات ذكية للمستحقات</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color="#28A745" />
                <Text style={styles.featureText}>تحليلات مالية شاملة</Text>
              </View>
            </View>
          </View>
        );
      case 1:
        return (
          <View style={styles.inputContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={60} color="#0B63FF" />
            </View>
            <Text style={styles.stepTitle}>ما اسمك؟</Text>
            <Text style={styles.stepSubtitle}>سنستخدم اسمك لتخصيص التطبيق</Text>
            <TextInput
              style={styles.textInput}
              placeholder="أدخل اسمك"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              textAlign="right"
              autoFocus
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.inputContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="card-outline" size={60} color="#0B63FF" />
            </View>
            <Text style={styles.stepTitle}>ما راتبك الشهري؟</Text>
            <Text style={styles.stepSubtitle}>أدخل راتبك الشهري بالدينار الكويتي</Text>
            <View style={styles.salaryInputContainer}>
              <Text style={styles.currencyLabel}>د.ك</Text>
              <TextInput
                style={styles.salaryInput}
                placeholder="0.000"
                placeholderTextColor="#9CA3AF"
                value={salary}
                onChangeText={setSalary}
                keyboardType="decimal-pad"
                textAlign="center"
                autoFocus
              />
            </View>
            <Text style={styles.helperText}>مثال: 1850.000</Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.inputContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={60} color="#0B63FF" />
            </View>
            <Text style={styles.stepTitle}>متى يوم صرف راتبك؟</Text>
            <Text style={styles.stepSubtitle}>أدخل اليوم من الشهر الذي تستلم فيه راتبك</Text>
            <View style={styles.paydayContainer}>
              <TextInput
                style={styles.paydayInput}
                placeholder="25"
                placeholderTextColor="#9CA3AF"
                value={payday}
                onChangeText={setPayday}
                keyboardType="number-pad"
                textAlign="center"
                maxLength={2}
                autoFocus
              />
              <Text style={styles.paydayLabel}>من كل شهر</Text>
            </View>
            <Text style={styles.helperText}>أدخل رقم من 1 إلى 31</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / steps.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} من {steps.length}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {renderStepContent()}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-forward" size={24} color="#6B7280" />
              <Text style={styles.backButtonText}>السابق</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, loading && styles.disabledButton]}
            onPress={handleNext}
            disabled={loading}
          >
            <LinearGradient
              colors={['#0B63FF', '#2C9BF0']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <Text style={styles.nextButtonText}>جاري الحفظ...</Text>
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentStep === steps.length - 1 ? 'ابدأ الآن' : 'التالي'}
                  </Text>
                  {currentStep < steps.length - 1 && (
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                  )}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0B63FF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Cairo-Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
  },
  inputContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F1724',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Cairo-Bold',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: 'Cairo-Regular',
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginRight: 12,
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Cairo-Regular',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F1724',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Cairo-Bold',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: 'Cairo-Regular',
  },
  textInput: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#0F1724',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontFamily: 'Cairo-Regular',
  },
  salaryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    height: 56,
    marginBottom: 12,
  },
  salaryInput: {
    flex: 1,
    fontSize: 24,
    color: '#0F1724',
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
  },
  currencyLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 12,
    fontFamily: 'Cairo-Regular',
  },
  paydayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paydayInput: {
    width: 80,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    fontSize: 24,
    color: '#0F1724',
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontFamily: 'Cairo-Bold',
  },
  paydayLabel: {
    fontSize: 18,
    color: '#374151',
    marginRight: 16,
    fontFamily: 'Cairo-Regular',
  },
  helperText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Cairo-Regular',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
    fontFamily: 'Cairo-Regular',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'Cairo-Bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
