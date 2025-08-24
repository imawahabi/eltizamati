import { useSettingsStore } from '@/stores/settings';

const lightTheme = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  secondary: '#10B981',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  info: '#06B6D4',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceSecondary: '#F1F5F9',
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
  gradient: ['#2563EB', '#3B82F6'],
  shadowColor: '#000000',
};

const darkTheme = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  secondary: '#10B981',
  accent: '#8B5CF6',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  info: '#06B6D4',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  cardBackground: '#1E293B',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  border: '#475569',
  borderLight: '#334155',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textInverse: '#1E293B',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  gradient: ['#3B82F6', '#60A5FA'],
  shadowColor: '#000000',
};

export function useTheme() {
  const { theme, toggleTheme } = useSettingsStore();
  const isDark = theme === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  return {
    colors,
    isDark,
    toggleTheme,
  };
}