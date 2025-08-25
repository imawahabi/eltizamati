import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  I18nManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  CreditCard,
  Settings,
} from 'lucide-react-native';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function NotificationsScreen() {
  const [filter, setFilter] = useState('all');

  // Mock theme colors
  const colors = {
    background: '#f8f9fa',
    surface: '#ffffff',
    primary: '#007AFF',
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    text: '#212529',
    textSecondary: '#6c757d',
  };

  const styles = createStyles(colors);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'payment_due',
      title: 'استحقاق دفعة قرض البنك الأهلي',
      message: 'موعد دفع القسط الشهري خلال 3 أيام',
      time: '2025-01-20T10:00:00Z',
      priority: 'high',
      read: false,
    },
    {
      id: 2,
      type: 'payment_reminder',
      title: 'تذكير دفع قسط تابي',
      message: 'لا تنسى دفع قسط تابي المستحق غداً',
      time: '2025-01-19T14:30:00Z',
      priority: 'medium',
      read: false,
    },
    {
      id: 3,
      type: 'payment_success',
      title: 'تم الدفع بنجاح',
      message: 'تم دفع قسط كريدي ماكس بنجاح',
      time: '2025-01-18T09:15:00Z',
      priority: 'low',
      read: true,
    },
    {
      id: 4,
      type: 'budget_alert',
      title: 'تنبيه الميزانية',
      message: 'وصلت نسبة الالتزامات إلى 75% من الراتب',
      time: '2025-01-17T16:45:00Z',
      priority: 'high',
      read: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_due':
        return <AlertTriangle size={20} color={colors.error} />;
      case 'payment_reminder':
        return <Clock size={20} color={colors.warning} />;
      case 'payment_success':
        return <CheckCircle size={20} color={colors.success} />;
      case 'budget_alert':
        return <DollarSign size={20} color={colors.primary} />;
      default:
        return <Bell size={20} color={colors.primary} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>التنبيهات</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              الكل
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.activeFilterTab]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
              غير مقروءة
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'important' && styles.activeFilterTab]}
            onPress={() => setFilter('important')}
          >
            <Text style={[styles.filterText, filter === 'important' && styles.activeFilterText]}>
              مهمة
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity key={notification.id} style={styles.notificationCard}>
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>
                      {new Date(notification.time).toLocaleDateString('ar-KW')}
                    </Text>
                  </View>
                  <View style={styles.notificationMeta}>
                    {!notification.read && <View style={styles.unreadDot} />}
                    <View
                      style={[
                        styles.priorityIndicator,
                        { backgroundColor: getPriorityColor(notification.priority) },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Smart Reminders Section */}
        <View style={styles.smartRemindersSection}>
          <Text style={styles.sectionTitle}>التذكيرات الذكية</Text>
          
          <View style={styles.smartReminderCard}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              style={styles.smartReminderHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Bell size={20} color="#fff" />
              <Text style={styles.smartReminderHeaderText}>تفعيل التذكيرات الذكية</Text>
            </LinearGradient>
            
            <View style={styles.smartReminderContent}>
              <Text style={styles.smartReminderDescription}>
                احصل على تذكيرات مخصصة قبل استحقاق المدفوعات وتنبيهات الميزانية
              </Text>
              
              <TouchableOpacity style={styles.enableButton}>
                <Text style={styles.enableButtonText}>تفعيل الآن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'right',
    },
    settingsButton: {
      padding: 8,
    },
    filterContainer: {
      flexDirection: 'row-reverse',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    activeFilterTab: {
      backgroundColor: colors.primary,
    },
    filterText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.textSecondary,
    },
    activeFilterText: {
      color: '#fff',
    },
    notificationsList: {
      gap: 12,
    },
    notificationCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    notificationContent: {
      gap: 12,
    },
    notificationHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
    },
    notificationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationInfo: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 4,
    },
    notificationTime: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'right',
    },
    notificationMeta: {
      alignItems: 'center',
      gap: 8,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    priorityIndicator: {
      width: 4,
      height: 20,
      borderRadius: 2,
    },
    notificationMessage: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'right',
      lineHeight: 20,
    },
    smartRemindersSection: {
      marginTop: 32,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'right',
      marginBottom: 16,
    },
    smartReminderCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    smartReminderHeader: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      padding: 16,
      gap: 8,
    },
    smartReminderHeaderText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: '#fff',
    },
    smartReminderContent: {
      padding: 16,
      alignItems: 'center',
      gap: 16,
    },
    smartReminderDescription: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    enableButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    enableButtonText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: '#fff',
    },
  });
}
