import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../lib/design-tokens';

// Extended design tokens for missing colors
const ExtendedColors = {
  ...Colors,
  primary: {
    ...Colors.primary,
    50: '#E3F2FD',
    100: '#BBDEFB',
    400: '#42A5F5',
    600: '#1E88E5',
    700: '#1976D2',
  },
  success: {
    ...Colors.success,
    50: '#E8F5E9',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
  },
  info: {
    ...Colors.info,
    50: '#E3F2FD',
    600: '#1E88E5',
  },
  muted: {
    ...Colors.muted,
    200: '#E0E0E0',
    400: '#9E9E9E',
    500: '#757575',
  },
  warning: {
    ...Colors.warning,
    600: '#FB8C00',
  },
  secondary: '#9C27B0',
  textLight: '#757575',
  border: '#E0E0E0',
  cardBg: Colors.surface,
};

const ExtendedTypography = {
  ...Typography,
  fontFamily: {
    arabic: 'Cairo',
  },
  sizes: {
    ...Typography.sizes,
    xs: 10,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
};

const ExtendedSpacing = {
  ...Spacing,
  xxs: 2,
};

const ExtendedBorderRadius = {
  ...BorderRadius,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

const ExtendedShadows = {
  ...Shadows,
  md: Shadows.medium,
};
import { updateUserSalary, initializeDatabase } from '../lib/database';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [salary, setSalary] = useState('');
  const [payday, setPayday] = useState('25');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [salaryFocused, setSalaryFocused] = useState(false);
  const [paydayFocused, setPaydayFocused] = useState(false);
  
  // Salary suggestions based on common ranges
  const salarySuggestions = [
    { label: 'مبتدئ', value: '800' },
    { label: 'متوسط', value: '1500' },
    { label: 'متقدم', value: '2500' },
    { label: 'خبير', value: '4000' },
  ];
  
  useEffect(() => {
    // Animate step transitions
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const validateSalary = () => {
    const salaryNum = parseFloat(salary);
    if (!salary || isNaN(salaryNum)) {
      return { valid: false, message: 'يرجى إدخال الراتب' };
    }
    if (salaryNum <= 0) {
      return { valid: false, message: 'الراتب يجب أن يكون أكبر من صفر' };
    }
    if (salaryNum > 100000) {
      return { valid: false, message: 'يرجى التحقق من المبلغ المدخل' };
    }
    return { valid: true };
  };
  
  const validatePayday = () => {
    const day = parseInt(payday);
    if (!payday || isNaN(day)) {
      return { valid: false, message: 'يرجى إدخال يوم الصرف' };
    }
    if (day < 1 || day > 31) {
      return { valid: false, message: 'اليوم يجب أن يكون بين 1 و 31' };
    }
    return { valid: true };
  };
  
  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      const salaryValidation = validateSalary();
      const paydayValidation = validatePayday();
      
      if (!salaryValidation.valid) {
        Alert.alert('تنبيه', salaryValidation.message, [{ text: 'حسناً', style: 'default' }]);
        return;
      }
      if (!paydayValidation.valid) {
        Alert.alert('تنبيه', paydayValidation.message, [{ text: 'حسناً', style: 'default' }]);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      await initializeDatabase();
      await updateUserSalary(parseFloat(salary), parseInt(payday));
      
      // Animate out before navigation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)');
      });
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'خطأ', 
        'حدث خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى.',
        [{ text: 'حسناً', style: 'default' }]
      );
    }
  };

  const renderStep0 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.logoCard}>
        <LinearGradient
          colors={[ExtendedColors.primary[600], ExtendedColors.primary[400]]}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoIconContainer}>
            <Ionicons name="wallet" size={48} color={ExtendedColors.bg} />
          </View>
        </LinearGradient>
        <Text style={styles.logoTitle}>إلتزاماتي</Text>
        <Text style={styles.logoSubtitle}>مدير التزاماتك الذكي</Text>
      </View>
      
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>أهلاً بك في رحلتك المالية</Text>
        <Text style={styles.welcomeDescription}>
          تطبيق ذكي وآمن لإدارة التزاماتك المالية بكل سهولة وخصوصية
        </Text>
        
        <View style={styles.featuresGrid}>
          {[
            { icon: 'card-outline', title: 'إدارة الأقساط', desc: 'تتبع جميع أقساطك' },
            { icon: 'notifications-outline', title: 'تذكيرات ذكية', desc: 'لن تفوتك مدفوعات' },
            { icon: 'stats-chart', title: 'تحليلات مالية', desc: 'رؤى مالية واضحة' },
            { icon: 'lock-closed', title: 'خصوصية كاملة', desc: 'بياناتك على جهازك' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={[ExtendedColors.primary[50], ExtendedColors.primary[100]]}
                style={styles.featureIconBg}
              >
                <Ionicons name={feature.icon as any} size={24} color={ExtendedColors.primary[600]} />
              </LinearGradient>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.formCard}>
        <View style={styles.formHeader}>
          <LinearGradient
            colors={[ExtendedColors.primary[500], ExtendedColors.primary[600]]}
            style={styles.formIconBg}
          >
            <Ionicons name="cash-outline" size={32} color={ExtendedColors.bg} />
          </LinearGradient>
          <Text style={styles.stepTitle}>معلوماتك المالية</Text>
          <Text style={styles.stepDescription}>
            هذه المعلومات تساعدنا في حساب ميزانيتك المتاحة بدقة
          </Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Ionicons name="wallet-outline" size={16} color={ExtendedColors.primary[600]} />
            {' '}الراتب الشهري (د.ك)
          </Text>
          <View style={[styles.inputWrapper, salaryFocused && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.textInput}
              value={salary}
              onChangeText={setSalary}
              placeholder="0.000"
              placeholderTextColor={ExtendedColors.muted[400]}
              keyboardType="decimal-pad"
              textAlign="right"
              onFocus={() => setSalaryFocused(true)}
              onBlur={() => setSalaryFocused(false)}
            />
            <View style={styles.inputIcon}>
              <Text style={styles.currencyText}>د.ك</Text>
            </View>
          </View>
          
          {/* Salary suggestions */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
            <View style={styles.suggestionsContainer}>
              {salarySuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.value}
                  style={styles.suggestionChip}
                  onPress={() => setSalary(suggestion.value)}
                >
                  <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
                  <Text style={styles.suggestionValue}>{suggestion.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            <Ionicons name="calendar-outline" size={16} color={ExtendedColors.primary[600]} />
            {' '}يوم صرف الراتب
          </Text>
          <View style={[styles.inputWrapper, paydayFocused && styles.inputWrapperFocused]}>
            <TextInput
              style={styles.textInput}
              value={payday}
              onChangeText={(text) => {
                // Only allow numbers
                const cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned.length <= 2) setPayday(cleaned);
              }}
              placeholder="25"
              placeholderTextColor={ExtendedColors.muted[400]}
              keyboardType="number-pad"
              textAlign="right"
              onFocus={() => setPaydayFocused(true)}
              onBlur={() => setPaydayFocused(false)}
              maxLength={2}
            />
            <View style={styles.inputIcon}>
              <Ionicons name="today" size={20} color={ExtendedColors.primary[500]} />
            </View>
          </View>
          <Text style={styles.inputHint}>
            <Ionicons name="information-circle-outline" size={14} color={ExtendedColors.muted[500]} />
            {' '}اليوم من كل شهر (مثال: 25 يعني يوم 25 من كل شهر)
          </Text>
        </View>
        
        {/* Smart insights */}
        <View style={styles.insightCard}>
          <Ionicons name="bulb-outline" size={20} color={ExtendedColors.warning[600]} />
          <Text style={styles.insightText}>
            نصيحة: احرص أن يكون يوم الصرف صحيحاً لحساب دقيق للمتبقي
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.notificationCard}>
        <View style={styles.formHeader}>
          <LinearGradient
            colors={[ExtendedColors.secondary, ExtendedColors.secondary]}
            style={styles.formIconBg}
          >
            <Ionicons name="notifications" size={32} color={ExtendedColors.bg} />
          </LinearGradient>
          <Text style={styles.stepTitle}>التنبيهات الذكية</Text>
          <Text style={styles.stepDescription}>
            لن تفوتك أي مدفوعات مع نظام التذكيرات المتقدم
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.notificationOption,
            notificationsEnabled && styles.notificationOptionActive
          ]}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationHeader}>
            <View style={styles.notificationToggle}>
              <Animated.View
                style={[
                  styles.notificationSwitch,
                  notificationsEnabled && styles.notificationSwitchActive
                ]}
              />
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>
                {notificationsEnabled ? 'التنبيهات مفعلة' : 'تفعيل التنبيهات'}
              </Text>
              <Text style={styles.notificationSubtitle}>
                تذكيرات ذكية قبل مواعيد الاستحقاق
              </Text>
            </View>
            <View style={styles.notificationIconContainer}>
              <Ionicons 
                name={notificationsEnabled ? 'notifications' : 'notifications-off'} 
                size={24} 
                color={notificationsEnabled ? ExtendedColors.primary[600] : ExtendedColors.muted[400]} 
              />
            </View>
          </View>
          
          {notificationsEnabled && (
            <View style={styles.notificationDetails}>
              {[
                { days: '7', label: 'أسبوع', icon: 'calendar' },
                { days: '3', label: '3 أيام', icon: 'time' },
                { days: '1', label: 'يوم واحد', icon: 'alert-circle' },
              ].map((reminder, index) => (
                <View key={index} style={styles.reminderItem}>
                  <Ionicons name={reminder.icon as any} size={16} color={ExtendedColors.primary[500]} />
                  <Text style={styles.reminderText}>قبل {reminder.label}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
        
        {/* Privacy card */}
        <LinearGradient
          colors={[ExtendedColors.cardBg, '#F9FAFB']}
          style={styles.privacyCard}
        >
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={24} color={ExtendedColors.success[600]} />
            <Text style={styles.privacyTitle}>خصوصيتك محمية</Text>
          </View>
          <Text style={styles.privacyText}>
            جميع بياناتك محفوظة محلياً على جهازك فقط • لا نقوم بجمع أو مشاركة أي معلومات • تشفير كامل للبيانات الحساسة
          </Text>
        </LinearGradient>
        
        {/* Ready message */}
        <View style={styles.readyCard}>
          <Ionicons name="information-circle" size={14} color={ExtendedColors.info[600]} />
          <Text style={styles.readyTitle}>كل شيء جاهز!</Text>
          <Text style={styles.readyText}>
            اضغط على "البدء الآن" للانتقال إلى لوحة التحكم
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={ExtendedColors.primary[500]} barStyle="light-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress header */}
          <View style={styles.progressHeader}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[ExtendedColors.primary[500], ExtendedColors.primary[700]]}
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / 3) * 100}%` }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <View style={styles.stepIndicators}>
              {[0, 1, 2].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.stepIndicator,
                    step <= currentStep && styles.stepIndicatorActive,
                    step < currentStep && styles.stepIndicatorComplete
                  ]}
                >
                  {step < currentStep ? (
                    <Ionicons name="checkmark" size={16} color={ExtendedColors.bg} />
                  ) : (
                    <Text style={[
                      styles.stepNumber,
                      step <= currentStep && styles.stepNumberActive
                    ]}>
                      {step + 1}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.progressText}>
              الخطوة {currentStep + 1} من 3
            </Text>
          </View>
          
          {/* Step content */}
          <View style={styles.contentWrapper}>
            {currentStep === 0 && renderStep0()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
          </View>
          
          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(currentStep - 1)}
                disabled={isLoading}
              >
                <Ionicons name="arrow-forward" size={20} color={ExtendedColors.primary[500]} />
                <Text style={styles.backButtonText}>السابق</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
              onPress={handleNext}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  currentStep === 2 
                    ? [ExtendedColors.success[600], ExtendedColors.success[700]]
                    : [ExtendedColors.primary[500], ExtendedColors.primary[700]]
                }
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={ExtendedColors.bg} size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.nextButtonText}>
                      {currentStep === 0 ? 'ابدأ الآن' : currentStep === 2 ? 'البدء الآن' : 'التالي'}
                    </Text>
                    <Ionicons 
                      name={currentStep === 2 ? 'checkmark-circle' : 'arrow-back'} 
                      size={20} 
                      color={ExtendedColors.bg} 
                    />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
    backgroundColor: ExtendedColors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: ExtendedSpacing.lg,
    paddingBottom: ExtendedSpacing.xxl,
  },
  progressContainer: {
    paddingTop: ExtendedSpacing.xl,
    paddingBottom: ExtendedSpacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: ExtendedColors.border,
    borderRadius: ExtendedBorderRadius.small,
    marginBottom: ExtendedSpacing.md,
    overflow: 'hidden',
  },
  // ... (rest of the code remains the same)
  logoSubtitle: {
    fontSize: ExtendedTypography.sizes.xs,
    color: ExtendedColors.primary[700],
    fontWeight: '600' as any,
    fontFamily: ExtendedTypography.fontFamily.arabic,
  },
  stepNumber: {
    fontSize: ExtendedTypography.sizes.xs,
    color: ExtendedColors.primary[700],
    fontWeight: '600' as any,
    fontFamily: ExtendedTypography.fontFamily.arabic,
  },
  // ... (rest of the code remains the same)
  welcomeDescription: {
    fontSize: ExtendedTypography.sizes.md,
    color: ExtendedColors.textLight,
    textAlign: 'center',
    marginTop: ExtendedSpacing.xs,
    fontFamily: ExtendedTypography.fontFamily.arabic,
  },
  privacyNote: {
    fontSize: ExtendedTypography.sizes.sm,
    color: ExtendedColors.textLight,
    textAlign: 'center',
    fontStyle: 'italic' as any,
    marginTop: ExtendedSpacing.md,
    fontFamily: ExtendedTypography.fontFamily.arabic,
  },
  // Additional missing styles for notification step
  notificationInfo: {
    backgroundColor: ExtendedColors.cardBg,
    padding: ExtendedSpacing.md,
    borderRadius: ExtendedBorderRadius.md,
    marginTop: ExtendedSpacing.md,
  },
  notificationSubtitle: {
    fontSize: ExtendedTypography.sizes.sm,
    color: ExtendedColors.textLight,
    fontFamily: ExtendedTypography.fontFamily.arabic,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ExtendedSpacing.md,
  },
  notificationDetails: {
    flex: 1,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ExtendedSpacing.sm,
  },
  stepIndicatorComplete: {
    backgroundColor: ExtendedColors.primary[500],
    borderColor: ExtendedColors.primary[500],
  },
  stepText: {
    fontSize: ExtendedTypography.sizes.xs,
    color: ExtendedColors.textLight,
    fontFamily: ExtendedTypography.fontFamily.arabic,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ExtendedSpacing.lg,
    backgroundColor: ExtendedColors.cardBg,
    borderRadius: ExtendedBorderRadius.full,
    marginBottom: ExtendedSpacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: ExtendedBorderRadius.full,
    marginBottom: ExtendedSpacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepIndicatorActive: {
    borderColor: ExtendedColors.primary[500],
    backgroundColor: ExtendedColors.primary[50],
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ExtendedSpacing.lg,
    backgroundColor: ExtendedColors.cardBg,
    borderRadius: ExtendedBorderRadius.lg,
  },
  stepNumberActive: {
    color: ExtendedColors.bg,
  },
  nextButtonText: {
    fontSize: ExtendedTypography.sizes.md,
    fontWeight: '600' as any,
    color: ExtendedColors.bg,
    fontFamily: ExtendedTypography.fontFamily.arabic,
  },
});

export default OnboardingScreen;
