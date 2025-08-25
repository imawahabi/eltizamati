import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Switch,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Moon,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Palette,
  Calendar,
  DollarSign,
} from 'lucide-react-native';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ar');

  // Mock theme colors
  const colors = {
    background: '#f8f9fa',
    surface: '#ffffff',
    primary: '#1E40AF',
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    text: '#212529',
    textSecondary: '#6c757d',
  };

  const settingsGroups = [
    {
      title: 'الحساب الشخصي',
      items: [
        { icon: User, title: 'الملف الشخصي', subtitle: 'إدارة معلوماتك الشخصية', action: 'navigate' },
        { icon: Shield, title: 'الخصوصية والأمان', subtitle: 'إعدادات الحماية', action: 'navigate' },
      ]
    },
    {
      title: 'التطبيق',
      items: [
        { icon: Bell, title: 'التنبيهات', subtitle: 'إدارة الإشعارات', action: 'switch', value: notifications, onToggle: setNotifications },
        { icon: Moon, title: 'الوضع الليلي', subtitle: 'تفعيل المظهر المظلم', action: 'switch', value: darkMode, onToggle: setDarkMode },
        { icon: Globe, title: 'اللغة', subtitle: 'العربية', action: 'navigate' },
        { icon: Palette, title: 'المظهر', subtitle: 'تخصيص ألوان التطبيق', action: 'navigate' },
      ]
    },
    {
      title: 'المالية',
      items: [
        { icon: DollarSign, title: 'العملة', subtitle: 'دينار كويتي (KWD)', action: 'navigate' },
        { icon: Calendar, title: 'يوم الراتب', subtitle: '25 من كل شهر', action: 'navigate' },
      ]
    },
    {
      title: 'المساعدة',
      items: [
        { icon: HelpCircle, title: 'المساعدة والدعم', subtitle: 'الأسئلة الشائعة والدعم', action: 'navigate' },
        { icon: LogOut, title: 'تسجيل الخروج', subtitle: 'إنهاء الجلسة الحالية', action: 'logout' },
      ]
    }
  ];

  const renderSettingItem = (item: any, index: number) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity key={index} style={styles.settingItem}>
        <View style={styles.settingContent}>
          <View style={styles.settingIcon}>
            <IconComponent size={20} color={colors.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          <View style={styles.settingAction}>
            {item.action === 'switch' ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
                thumbColor={item.value ? colors.primary : '#FFFFFF'}
              />
            ) : (
              <ChevronRight size={20} color={colors.textSecondary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Compact Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <Text style={styles.headerSubtitle}>تخصيص تجربتك في التطبيق</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
            </View>
          </View>
        ))}
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>إصدار التطبيق 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    opacity: 0.9,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'right',
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Cairo-SemiBold',
    color: '#212529',
    textAlign: 'right',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6c757d',
    textAlign: 'right',
  },
  settingAction: {
    marginRight: 12,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Cairo-Regular',
    color: '#6c757d',
  },
});
