import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SmartInsightsProps {
  data: {
    totalDebt: number;
    monthlyPayments: number;
    completedPayments: number;
    overduePayments: number;
  };
}

export function SmartInsights({ data }: SmartInsightsProps) {
  const debtProgress = Math.min(100, (data.completedPayments / Math.max(data.completedPayments + 5, 1)) * 100);
  
  const insights = [
    {
      id: 'progress',
      title: 'تقدم سداد الديون',
      value: `${Math.round(debtProgress)}%`,
      subtitle: 'من إجمالي الالتزامات',
      icon: 'trending-up-outline',
      gradientColors: ['#10B981', '#059669'],
    },
    {
      id: 'efficiency',
      title: 'كفاءة الدفع',
      value: 'ممتازة',
      subtitle: 'معدل الالتزام عالي',
      icon: 'checkmark-circle-outline',
      gradientColors: ['#3B82F6', '#1D4ED8'],
    },
    {
      id: 'savings',
      title: 'إمكانية التوفير',
      value: '150 د.ك',
      subtitle: 'شهرياً مع التحسين',
      icon: 'wallet-outline',
      gradientColors: ['#F59E0B', '#D97706'],
    },
  ];

  const alerts = [
    ...(data.overduePayments > 0 ? [{
      id: 'overdue',
      type: 'error',
      title: 'دفعات متأخرة',
      message: `لديك ${data.overduePayments} دفعة متأخرة تحتاج انتباه فوري`,
      icon: 'alert-circle-outline',
      gradientColors: ['#EF4444', '#DC2626'],
    }] : []),
    {
      id: 'strategy',
      type: 'info',
      title: 'نصيحة ذكية',
      message: 'يمكنك توفير 50 د.ك شهرياً بإعادة ترتيب أولويات الدفع',
      icon: 'bulb-outline',
      gradientColors: ['#3B82F6', '#1D4ED8'],
    },
    {
      id: 'goal',
      type: 'success',
      title: 'هدف قريب',
      message: 'ستكون خالي من الديون خلال 18 شهر بالمعدل الحالي',
      icon: 'flag-outline',
      gradientColors: ['#10B981', '#059669'],
    },
  ];

  return (
    <View className="px-6 gap-6">
      <Text className="text-neutral-900 font-cairo-medium text-xl">إحصائيات ذكية</Text>

      {/* Modern Progress Overview */}
      <View className="bg-white rounded-2xl p-6 border border-neutral-100">
        <View className="mb-6">
          <Text className="text-neutral-900 font-cairo-medium text-lg mb-2">التقدم نحو الحرية المالية</Text>
          <Text className="text-neutral-500 font-cairo-regular text-sm mb-4">
            أنت في طريقك لتحقيق أهدافك المالية
          </Text>
          
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-neutral-500 font-cairo-medium text-sm">التقدم</Text>
            <Text className="text-neutral-900 font-cairo-medium text-2xl">{Math.round(debtProgress)}%</Text>
          </View>
          
          <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <View 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${debtProgress}%` }}
            />
          </View>
        </View>

        <View className="flex-row gap-8">
          <View className="flex-1">
            <Text className="text-neutral-900 font-cairo-light text-2xl">{data.totalDebt}</Text>
            <Text className="text-neutral-500 font-cairo-regular text-sm">إجمالي الديون (د.ك)</Text>
          </View>
          <View className="flex-1">
            <Text className="text-neutral-900 font-cairo-light text-2xl">{data.monthlyPayments}</Text>
            <Text className="text-neutral-500 font-cairo-regular text-sm">دفعات شهرية (د.ك)</Text>
          </View>
        </View>
      </View>

      {/* Clean Key Insights */}
      <View className="gap-3">
        {insights.map((insight) => (
          <View key={insight.id} className="bg-white rounded-2xl p-4 border border-neutral-100">
            <View className="flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-2xl bg-neutral-100 items-center justify-center">
                <Ionicons name={insight.icon as any} size={18} color="#525252" />
              </View>
              
              <View className="flex-1">
                <Text className="text-neutral-900 font-cairo-medium text-base mb-1">{insight.title}</Text>
                <Text className="text-neutral-500 font-cairo-regular text-sm">{insight.subtitle}</Text>
              </View>
              
              <Text className="text-neutral-900 font-cairo-medium text-lg">{insight.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Simplified Smart Alerts */}
      <View className="gap-3">
        {alerts.map((alert) => (
          <View key={alert.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
            <View className="flex-row items-start gap-4">
              <View className="w-6 h-6 rounded-xl bg-neutral-900 items-center justify-center mt-1">
                <Ionicons name={alert.icon as any} size={14} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-900 font-cairo-medium text-base mb-1">
                  {alert.title}
                </Text>
                <Text className="text-neutral-600 font-cairo-regular text-sm leading-5">
                  {alert.message}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
