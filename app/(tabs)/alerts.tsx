import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Database
import { 
  getUpcomingPayments,
  getOverduePayments,
  getNotificationSettings,
  updateNotificationSettings
} from '@/lib/database';

// Components
import { AlertsList } from '@/components/AlertsList';

interface AlertItem {
  id: number;
  type: 'due_soon' | 'overdue' | 'payment_reminder' | 'budget_alert';
  title: string;
  message: string;
  entityName: string;
  amount: number;
  dueDate: string;
  debtId: number;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
}

interface NotificationSettings {
  paymentReminders: boolean;
  overdueAlerts: boolean;
  budgetAlerts: boolean;
  weeklyReports: boolean;
  reminderDaysBefore: number;
}

export default function AlertsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadAlertsData();
  }, []);

  const loadAlertsData = async () => {
    try {
      setLoading(true);
      
      const [upcomingPayments, overduePayments, settings] = await Promise.all([
        getUpcomingPayments(10),
        getOverduePayments(),
        getNotificationSettings()
      ]);

      // Convert payments to alerts
      const alertsData: AlertItem[] = [];

      // Add overdue payment alerts
      overduePayments.forEach((payment: any) => {
        alertsData.push({
          id: payment.id,
          type: 'overdue',
          title: 'دفعة متأخرة',
          message: `دفعة ${payment.entityName} متأخرة منذ ${Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} يوم`,
          entityName: payment.entityName,
          amount: payment.amount,
          dueDate: payment.dueDate,
          debtId: payment.debtId,
          priority: 'high',
          isRead: false,
          createdAt: payment.dueDate
        });
      });

      // Add upcoming payment alerts
      upcomingPayments.forEach((payment: any) => {
        const daysUntilDue = Math.ceil((new Date(payment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 7) {
          alertsData.push({
            id: payment.id + 1000, // Offset to avoid ID conflicts
            type: 'due_soon',
            title: 'دفعة قادمة',
            message: `دفعة ${payment.entityName} مستحقة خلال ${daysUntilDue} أيام`,
            entityName: payment.entityName,
            amount: payment.amount,
            dueDate: payment.dueDate,
            debtId: payment.debtId,
            priority: daysUntilDue <= 3 ? 'high' : 'medium',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      });

      // Sort by priority and date
      alertsData.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setAlerts(alertsData);
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading alerts data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل التنبيهات');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlertsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue': return 'alert-circle';
      case 'due_soon': return 'time';
      case 'payment_reminder': return 'notifications';
      case 'budget_alert': return 'trending-down';
      default: return 'information-circle';
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'عادية';
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean | number) => {
    if (!notificationSettings) return;

    try {
      const updatedSettings = { ...notificationSettings, [key]: value };
      await updateNotificationSettings(updatedSettings);
      setNotificationSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحديث الإعدادات');
    }
  };

  const getFilteredAlerts = () => {
    return alerts.filter(alert => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unread') return !alert.isRead;
      if (selectedFilter === 'high') return alert.priority === 'high';
      if (selectedFilter === 'overdue') return alert.type === 'overdue';
      return true;
    });
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = alerts.filter(a => !a.isRead).length;
  const highPriorityCount = alerts.filter(a => a.priority === 'high').length;
  const overdueCount = alerts.filter(a => a.type === 'overdue').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B63FF" />
          <Text style={styles.loadingText}>جاري تحميل التنبيهات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>التنبيهات والإشعارات</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0 ? `${unreadCount} تنبيه غير مقروء` : 'جميع التنبيهات مقروءة'}
              </Text>
            </View>
            
            <View style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{alerts.length}</Text>
              <Text style={styles.summaryLabel}>إجمالي التنبيهات</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{highPriorityCount}</Text>
              <Text style={styles.summaryLabel}>أولوية عالية</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{overdueCount}</Text>
              <Text style={styles.summaryLabel}>متأخرة</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          {[
            { key: 'all', label: 'الكل', count: alerts.length },
            { key: 'unread', label: 'غير مقروء', count: unreadCount },
            { key: 'high', label: 'أولوية عالية', count: highPriorityCount },
            { key: 'overdue', label: 'متأخرة', count: overdueCount },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                selectedFilter === filter.key && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter.key && styles.filterChipTextActive
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0B63FF"
            colors={['#0B63FF']}
          />
        }
      >
        {/* Alerts List */}
        {filteredAlerts.length > 0 ? (
          <View style={styles.alertsContainer}>
            {filteredAlerts.map((alert) => (
              <TouchableOpacity key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={[
                    styles.alertIcon,
                    { backgroundColor: getAlertColor(alert.priority) + '20' }
                  ]}>
                    <Ionicons 
                      name={getAlertIcon(alert.type) as any} 
                      size={20} 
                      color={getAlertColor(alert.priority)} 
                    />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                  </View>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getAlertColor(alert.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{getPriorityText(alert.priority)}</Text>
                  </View>
                </View>

                <View style={styles.alertDetails}>
                  <View style={styles.alertAmount}>
                    <Text style={styles.alertAmountLabel}>المبلغ:</Text>
                    <Text style={styles.alertAmountValue}>{formatCurrency(alert.amount)}</Text>
                  </View>
                  <View style={styles.alertDate}>
                    <Text style={styles.alertDateLabel}>التاريخ:</Text>
                    <Text style={styles.alertDateValue}>
                      {new Date(alert.dueDate).toLocaleDateString('ar-KW')}
                    </Text>
                  </View>
                </View>

                <View style={styles.alertActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>عرض التفاصيل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]}>
                    <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
                      {alert.type === 'overdue' ? 'دفع الآن' : 'تذكيرني لاحقاً'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyStateText}>لا توجد تنبيهات</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedFilter === 'all' 
                ? 'جميع التزاماتك محدثة!' 
                : 'لا توجد تنبيهات تطابق الفلتر المحدد'}
            </Text>
          </View>
        )}

        {/* Notification Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>إعدادات الإشعارات</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>تذكير بالدفعات</Text>
                <Text style={styles.settingDescription}>إشعارات قبل موعد الاستحقاق</Text>
              </View>
              <Switch
                value={notificationSettings?.paymentReminders || false}
                onValueChange={(value) => handleSettingChange('paymentReminders', value)}
                trackColor={{ false: '#E2E8F0', true: '#0B63FF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>تنبيهات التأخير</Text>
                <Text style={styles.settingDescription}>إشعارات عند تأخر الدفعات</Text>
              </View>
              <Switch
                value={notificationSettings?.overdueAlerts || false}
                onValueChange={(value) => handleSettingChange('overdueAlerts', value)}
                trackColor={{ false: '#E2E8F0', true: '#0B63FF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>تنبيهات الميزانية</Text>
                <Text style={styles.settingDescription}>إشعارات عند تجاوز الحدود المالية</Text>
              </View>
              <Switch
                value={notificationSettings?.budgetAlerts || false}
                onValueChange={(value) => handleSettingChange('budgetAlerts', value)}
                trackColor={{ false: '#E2E8F0', true: '#0B63FF' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>التقارير الأسبوعية</Text>
                <Text style={styles.settingDescription}>ملخص أسبوعي للوضع المالي</Text>
              </View>
              <Switch
                value={notificationSettings?.weeklyReports || false}
                onValueChange={(value) => handleSettingChange('weeklyReports', value)}
                trackColor={{ false: '#E2E8F0', true: '#0B63FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  filterChips: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0B63FF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Alerts
  alertsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    lineHeight: 20,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  alertDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  alertAmount: {
    flex: 1,
  },
  alertAmountLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
  },
  alertAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  alertDate: {
    flex: 1,
    alignItems: 'flex-end',
  },
  alertDateLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 4,
  },
  alertDateValue: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Cairo-Medium',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  primaryActionButton: {
    backgroundColor: '#0B63FF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    fontFamily: 'Cairo-Bold',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    fontFamily: 'Cairo-Bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Settings
  settingsContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },
});
