import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Alert, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  available: boolean;
  status: 'pending' | 'granted' | 'denied';
  color: string;
}

export default function PermissionsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'notifications',
      name: 'التنبيهات',
      description: 'تذكيرات ذكية قبل مواعيد الدفعات',
      icon: 'notifications',
      required: true,
      available: true,
      status: 'pending',
      color: '#0B63FF',
    },
    {
      id: 'biometric',
      name: 'المصادقة البيومترية',
      description: 'حماية بياناتك ببصمة الإصبع أو الوجه',
      icon: 'finger-print',
      required: false,
      available: Platform.OS !== 'web',
      status: 'pending',
      color: '#10B981',
    },
    {
      id: 'calendar',
      name: 'التقويم',
      description: 'مزامنة المواعيد مع تقويمك الشخصي',
      icon: 'calendar',
      required: false,
      available: false,
      status: 'pending',
      color: '#8B5CF6',
    },
  ]);
  
  const [loading, setLoading] = useState('');
  const [currentStep] = useState(2);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestPermission = async (permissionId: string) => {
    setLoading(permissionId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (permissionId === 'notifications') {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissions(prev =>
          prev.map(p =>
            p.id === permissionId
              ? { ...p, status: status === 'granted' ? 'granted' : 'denied' }
              : p
          )
        );
        
        if (status === 'granted') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
      // Handle other permissions here in the future
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في طلب الإذن');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading('');
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/setup');
  };

  const getPermissionIcon = (permission: Permission) => {
    if (permission.status === 'granted') {
      return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
    } else if (permission.status === 'denied') {
      return <Ionicons name="close-circle" size={24} color="#EF4444" />;
    } else if (!permission.available) {
      return <Ionicons name="time" size={24} color="#9CA3AF" />;
    }
    return null;
  };

  const allRequiredGranted = permissions
    .filter(p => p.required && p.available)
    .every(p => p.status === 'granted');

  return (
    <Container safe className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Progress Indicator */}
          <View className="flex-row items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <View key={step} className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
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
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Header */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mb-8"
          >
            <Typography variant="h1" className="text-gray-900 font-cairo-bold mb-3 text-center">
              صلاحيات التطبيق
            </Typography>
            <Typography variant="body" className="text-gray-600 text-center leading-6">
              نحتاج بعض الصلاحيات لتوفير تجربة مثالية
              وحماية بياناتك المالية
            </Typography>
          </Animated.View>

          {/* Permissions Cards */}
          <View className="space-y-4 mb-8">
            {permissions.map((permission, index) => (
              <Animated.View
                key={permission.id}
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50 * (index % 2 === 0 ? -1 : 1), 0],
                      }),
                    },
                    { scale: scaleAnim },
                  ],
                }}
              >
                <Card 
                  className={`p-5 border-2 ${
                    permission.status === 'granted' 
                      ? 'border-green-200 bg-green-50' 
                      : permission.status === 'denied'
                      ? 'border-red-200 bg-red-50'
                      : !permission.available
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                          !permission.available ? 'bg-gray-200' : ''
                        }`}
                        style={{
                          backgroundColor: permission.available && permission.status === 'pending' 
                            ? permission.color + '20' 
                            : undefined,
                        }}
                      >
                        <Ionicons 
                          name={permission.icon as any} 
                          size={24} 
                          color={permission.available ? permission.color : '#9CA3AF'} 
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Typography variant="h3" className="text-gray-900 font-cairo-semibold">
                            {permission.name}
                          </Typography>
                          {permission.required && permission.available && (
                            <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                              <Typography variant="caption" className="text-blue-700 font-cairo-medium">
                                مطلوب
                              </Typography>
                            </View>
                          )}
                          {!permission.available && (
                            <View className="ml-2 px-2 py-1 bg-gray-100 rounded-full">
                              <Typography variant="caption" className="text-gray-600 font-cairo-medium">
                                قريباً
                              </Typography>
                            </View>
                          )}
                        </View>
                        <Typography variant="caption" className="text-gray-600">
                          {permission.description}
                        </Typography>
                      </View>
                    </View>
                    <View>
                      {getPermissionIcon(permission) || (
                        permission.available && (
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => requestPermission(permission.id)}
                            disabled={loading === permission.id}
                            className="border-2"
                          >
                            {loading === permission.id ? 'جاري...' : 'السماح'}
                          </Button>
                        )
                      )}
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </View>

          {/* Privacy Notice */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <LinearGradient
              colors={['#EFF6FF', '#DBEAFE']}
              className="rounded-2xl p-5 mb-6"
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#0B63FF" />
                </View>
                <View className="flex-1">
                  <Typography variant="h4" className="text-blue-900 font-cairo-bold mb-2">
                    خصوصيتك محمية
                  </Typography>
                  <Typography variant="caption" className="text-blue-700 leading-5">
                    • جميع بياناتك مشفرة ومحمية
                    {"\n"}• لا نشارك معلوماتك مع أي طرف ثالث
                    {"\n"}• يمكنك حذف بياناتك في أي وقت
                  </Typography>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 py-4 bg-white border-t border-gray-100">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleContinue}
          className={allRequiredGranted ? '' : 'bg-primary-400'}
        >
          {allRequiredGranted ? 'التالي' : 'متابعة بدون إشعارات'}
        </Button>
      </View>
    </Container>
  );
}
