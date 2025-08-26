import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Alert, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { initializeDatabase } from '@/lib/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SetupData {
  name: string;
  salary: string;
  paydayDay: string;
  currency: string;
}

export default function SetupScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState<SetupData>({
    name: '',
    salary: '',
    paydayDay: '',
    currency: 'KWD',
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  useEffect(() => {
    // Animate step entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: currentStep / totalSteps,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentStep]);

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate step exit
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        // Reset animations for next step
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
      } else {
        handleComplete();
      }
    });
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      // Initialize database
      await initializeDatabase();
      
      // Save user setup data to database
      // This would be implemented with actual database calls
      const userData = {
        name: setupData.name,
        salary: parseFloat(setupData.salary),
        payday_day: parseInt(setupData.paydayDay),
        settings_json: JSON.stringify({ currency: setupData.currency }),
        onboarding_completed: 1,
      };
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return setupData.name.trim().length > 0;
      case 2:
        return setupData.salary.trim().length > 0 && !isNaN(Number(setupData.salary));
      case 3:
        return setupData.paydayDay.trim().length > 0 && 
               Number(setupData.paydayDay) >= 1 && 
               Number(setupData.paydayDay) <= 31;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="flex-1 justify-center"
          >
            <View className="items-center mb-12">
              <LinearGradient
                colors={['#0B63FF', '#2563EB']}
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
              >
                <Ionicons name="person" size={36} color="#FFFFFF" />
              </LinearGradient>
              <Typography variant="h1" className="text-gray-900 font-cairo-bold mb-3 text-center">
                أهلاً وسهلاً! 👋
              </Typography>
              <Typography variant="body" className="text-gray-600 text-center px-4 leading-6">
                دعنا نتعرف عليك أولاً لنقدم لك تجربة مخصصة
              </Typography>
            </View>

            <View className="space-y-4">
              <Input
                label="الاسم الكامل"
                placeholder="أدخل اسمك الكامل"
                value={setupData.name}
                onChangeText={(text) => setSetupData({ ...setupData, name: text })}
                icon={<Ionicons name="person-outline" size={20} color="#9CA3AF" />}
                iconPosition="right"
              />
              
              <Card className="p-4 bg-blue-50 border-blue-200">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={20} color="#0B63FF" />
                  <Typography variant="caption" className="text-blue-700 mr-2 flex-1">
                    سيظهر اسمك في الترحيب والتقارير الشخصية
                  </Typography>
                </View>
              </Card>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="flex-1 justify-center"
          >
            <View className="items-center mb-12">
              <LinearGradient
                colors={['#10B981', '#059669']}
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
              >
                <Ionicons name="wallet" size={36} color="#FFFFFF" />
              </LinearGradient>
              <Typography variant="h1" className="text-gray-900 font-cairo-bold mb-3 text-center">
                الراتب الشهري 💰
              </Typography>
              <Typography variant="body" className="text-gray-600 text-center px-4 leading-6">
                هذا سيساعدنا في حساب نسبة التزاماتك والتخطيط المالي
              </Typography>
            </View>

            <View className="space-y-4">
              <Input
                label="الراتب الشهري (د.ك)"
                placeholder="مثال: 1500.000"
                value={setupData.salary}
                onChangeText={(text) => setSetupData({ ...setupData, salary: text })}
                keyboardType="numeric"
                icon={<Ionicons name="cash-outline" size={20} color="#9CA3AF" />}
                iconPosition="right"
              />

              <Card className="p-4 bg-green-50 border-green-200">
                <View className="flex-row items-start">
                  <Ionicons name="shield-checkmark" size={20} color="#10B981" style={{ marginTop: 2 }} />
                  <View className="mr-2 flex-1">
                    <Typography variant="caption" className="text-green-700 font-cairo-semibold mb-1">
                      خصوصية وأمان
                    </Typography>
                    <Typography variant="caption" className="text-green-600">
                      جميع بياناتك محفوظة محلياً على جهازك ولن يتم مشاركتها مع أي طرف ثالث
                    </Typography>
                  </View>
                </View>
              </Card>
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="flex-1 justify-center"
          >
            <View className="items-center mb-12">
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                className="w-24 h-24 rounded-full items-center justify-center mb-6"
              >
                <Ionicons name="calendar" size={36} color="#FFFFFF" />
              </LinearGradient>
              <Typography variant="h1" className="text-gray-900 font-cairo-bold mb-3 text-center">
                يوم الراتب 📅
              </Typography>
              <Typography variant="body" className="text-gray-600 text-center px-4 leading-6">
                في أي يوم من الشهر تستلم راتبك؟
              </Typography>
            </View>

            <View className="space-y-4">
              <Input
                label="يوم الراتب (1-31)"
                placeholder="مثال: 25"
                value={setupData.paydayDay}
                onChangeText={(text) => setSetupData({ ...setupData, paydayDay: text })}
                keyboardType="numeric"
                icon={<Ionicons name="calendar-outline" size={20} color="#9CA3AF" />}
                iconPosition="right"
                hint="إذا كنت تستلم راتبك في 25 من كل شهر، أدخل 25"
              />

              <Card className="p-4 bg-amber-50 border-amber-200">
                <View className="flex-row items-start">
                  <Ionicons name="bulb" size={20} color="#F59E0B" style={{ marginTop: 2 }} />
                  <View className="mr-2 flex-1">
                    <Typography variant="caption" className="text-amber-700 font-cairo-semibold mb-1">
                      كيف سنستخدم هذه المعلومة؟
                    </Typography>
                    <Typography variant="caption" className="text-amber-600">
                      • حساب الأيام المتبقية للراتب القادم{"\n"}
                      • تنظيم تذكيرات الدفعات حسب دورة راتبك{"\n"}
                      • تحليل التدفق النقدي الشهري
                    </Typography>
                  </View>
                </View>
              </Card>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <Container safe className="bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onPress={handleBack}
          icon={<Ionicons name="arrow-back" size={20} color="#6B7280" />}
        >
          <Typography variant="body" className="text-gray-600 font-cairo-medium">
            رجوع
          </Typography>
        </Button>

        <View className="flex-row items-center">
          {[1, 2, 3].map((step) => (
            <View key={step} className="flex-row items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <Typography 
                  variant="caption" 
                  className={step <= currentStep ? 'text-white font-cairo-bold' : 'text-gray-500'}
                >
                  {step}
                </Typography>
              </View>
              {step < 3 && (
                <View 
                  className={`w-8 h-1 mx-1 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Progress Bar */}
      <View className="px-6 mb-6">
        <View className="bg-gray-200 rounded-full h-2">
          <Animated.View 
            className="bg-primary-600 h-2 rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
        <Typography variant="caption" className="text-gray-500 text-center mt-2">
          الخطوة {currentStep} من {totalSteps}
        </Typography>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 py-6 bg-white border-t border-gray-100">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isStepValid()}
          loading={loading}
          onPress={handleNext}
          className={!isStepValid() ? 'bg-gray-300' : ''}
        >
          {currentStep === totalSteps ? '🎉 إكمال الإعداد' : 'التالي'}
        </Button>
        
        {currentStep === totalSteps && (
          <Typography variant="caption" className="text-gray-500 text-center mt-3">
            بعد الإكمال، ستتمكن من البدء في إدارة التزاماتك المالية
          </Typography>
        )}
      </View>
    </Container>
  );
}
