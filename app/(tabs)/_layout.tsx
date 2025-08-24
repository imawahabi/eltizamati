import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useLayout } from '../../hooks/useLayout';
import { LayoutDashboard, CreditCard, TrendingUp, Bell, UserCircle } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLayout();

  // Define screens once, then order them per direction so Home sits at the start edge
  const screens = [
    {
      name: 'index',
      title: t('dashboard'),
      icon: (color: string, size: number) => <LayoutDashboard size={size - 2} color={color} />,
    },
    {
      name: 'operations',
      title: t('operations'),
      icon: (color: string, size: number) => <CreditCard size={size - 2} color={color} />,
    },
    {
      name: 'analytics',
      title: t('analytics'),
      icon: (color: string, size: number) => <TrendingUp size={size - 2} color={color} />,
    },
    {
      name: 'notifications',
      title: t('notifications'),
      icon: (color: string, size: number) => <Bell size={size - 2} color={color} />,
    },
    {
      name: 'settings',
      title: t('settings'),
      icon: (color: string, size: number) => <UserCircle size={size - 2} color={color} />,
    },
  ];

  const ordered = isRTL ? [...screens].reverse() : screens;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 15,
          writingDirection: isRTL ? 'rtl' : 'ltr',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          fontFamily: 'Cairo-Bold',
          marginTop: 2,
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {ordered.map((s) => (
        <Tabs.Screen
          key={s.name}
          name={s.name as any}
          options={{
            title: s.title,
            tabBarIcon: ({ color, size }) => s.icon(color, size),
          }}
        />
      ))}
    </Tabs>
  );
}