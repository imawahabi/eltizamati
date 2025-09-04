import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export function QuickActions() {
  const actions = [
    {
      icon: 'add-outline',
      label: 'إضافة التزام',
      color: '#171717',
      onPress: () => router.push('/add-commitment'),
    },
    {
      icon: 'card-outline',
      label: 'تسجيل دفعة',
      color: '#059669',
      onPress: () => router.push('/add-payment'),
    },
    {
      icon: 'bar-chart-outline',
      label: 'التحليلات',
      color: '#3B82F6',
      onPress: () => router.push('/analytics'),
    },
    {
      icon: 'document-text-outline',
      label: 'السجلات',
      color: '#F97316',
      onPress: () => router.push('/records'),
    },
  ];

  return (
    <View className="px-6 gap-6">
      <Text className="text-neutral-900 font-cairo-medium text-xl">إجراءات سريعة</Text>
      
      <View className="flex-row gap-3">
        {actions.map((action, index) => (
          <TouchableOpacity 
            key={index}
            className="flex-1 bg-white rounded-2xl p-4 border border-neutral-100 active:bg-neutral-50"
            onPress={action.onPress}
          >
            <View className="items-center gap-3">
              <View className="w-12 h-12 rounded-2xl bg-neutral-100 items-center justify-center">
                <Ionicons name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text className="text-neutral-700 font-cairo-medium text-sm text-center">
                {action.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}