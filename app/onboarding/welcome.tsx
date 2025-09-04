import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Container } from '@/components/ui/Container';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 15,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/permissions');
  };

  const features = [
    {
      icon: 'trending-up',
      title: 'تتبع ذكي للالتزامات',
      description: 'نظام متطور لإدارة جميع التزاماتك المالية',
    },
    {
      icon: 'notifications',
      title: 'تذكيرات استباقية',
      description: 'إشعارات ذكية قبل موعد الاستحقاق',
    },
    {
      icon: 'pie-chart',
      title: 'تحليلات متقدمة',
      description: 'رؤى مالية تساعدك على اتخاذ قرارات أفضل',
    },
    {
      icon: 'shield-checkmark',
      title: 'أمان عالي المستوى',
      description: 'بياناتك محمية بأحدث تقنيات التشفير',
    },
  ];

  return (
    <Container safe className="flex-1">
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0B63FF', '#2C9BF0', '#8FD3FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Logo and Title */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            }}
            className="items-center mt-16 mb-8"
          >
            <View className="w-28 h-28 bg-white/10 backdrop-blur-lg rounded-3xl items-center justify-center mb-6 border-2 border-white/20">
              <LinearGradient
                colors={['#FFFFFF', '#E0E7FF']}
                className="w-24 h-24 rounded-2xl items-center justify-center"
              >
                <Ionicons name="wallet" size={48} color="#0B63FF" />
              </LinearGradient>
            </View>

            <Typography variant="display" className="text-white font-cairo-bold text-center mb-3">
              إلتزاماتي
            </Typography>
            
            <Typography variant="h3" className="text-white/90 font-cairo-semibold text-center mb-2">
              مساعدك المالي الذكي
            </Typography>
            
            <Typography variant="body" className="text-white/70 text-center leading-6 px-4">
              احصل على السيطرة الكاملة على التزاماتك المالية
              واتخذ قرارات مالية أفضل
            </Typography>
          </Animated.View>

          {/* Features Grid */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="flex-1 justify-center"
          >
            <View className="space-y-4">
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50 * (index % 2 === 0 ? 1 : -1), 0],
                      }),
                    }],
                  }}
                >
                  <View className="flex-row items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
                      <Ionicons name={feature.icon as any} size={24} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                      <Typography variant="h4" className="text-white font-cairo-semibold mb-1">
                        {feature.title}
                      </Typography>
                      <Typography variant="caption" className="text-white/70">
                        {feature.description}
                      </Typography>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Bottom Actions */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="pb-8"
          >
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="mb-3 bg-white"
              textClassName="text-primary-600 font-cairo-bold"
              onPress={handleGetStarted}
            >
              ابدأ رحلتك المالية
            </Button>
            
            <Button
              variant="ghost"
              size="md"
              fullWidth
              textClassName="text-white/70 font-cairo-medium"
              onPress={() => router.push('/(tabs)')}
            >
              تخطي الآن
            </Button>
          </Animated.View>
        </View>
      </LinearGradient>
    </Container>
  );
}
