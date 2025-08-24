import { useSettingsStore } from '@/stores/settings';

const lightTheme = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceSecondary: '#F1F5F9',
  border: '#E2E8F0',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkTheme = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  secondary: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  border: '#475569',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  overlay: 'rgba(0, 0, 0, 0.7)',
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