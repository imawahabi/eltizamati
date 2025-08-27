import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Database
import {
  getUserSettings,
  updateSettings,
  getEntities,
  addEntity,
} from '@/lib/database';

interface UserSettings {
  id?: number;
  name: string;
  salary: number;
  currency: string;
  paydayDay: number;
  notifications: boolean;
  darkMode: boolean;
  language: string;
}

interface Entity {
  id: number;
  name: string;
  kind: string;
}

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    salary: 0,
    currency: 'KWD',
    paydayDay: 25,
    notifications: true,
    darkMode: false,
    language: 'ar',
  });
  const [entities, setEntities] = useState<Entity[]>([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [entityName, setEntityName] = useState('');
  const [entityKind, setEntityKind] = useState('');

  useEffect(() => {
    loadSettings();
    loadEntities();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getUserSettings();
      if (userSettings) {
        setSettings({
          name: userSettings.name || '',
          salary: userSettings.salary || 0,
          currency: userSettings.currency || 'KWD',
          paydayDay: userSettings.paydayDay || 25,
          language: userSettings.language || 'ar',
          notifications: false,
          darkMode: false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      const entitiesData = await getEntities();
      setEntities(entitiesData as Entity[]);
    } catch (error) {
      console.error('Error loading entities:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await updateSettings({
        user_name: settings.name,
        salary: settings.salary,
        payday_day: settings.paydayDay,
        currency: settings.currency,
        language: settings.language,
      });
      Alert.alert('نجح', 'تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('خطأ', 'حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleEntitySave = async () => {
    if (!entityName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الجهة');
      return;
    }

    try {
      await addEntity({
        kind: entityKind || 'other',
        name: entityName.trim(),
      });
      await loadEntities();
      setShowEntityModal(false);
      setEditingEntity(null);
      setEntityName('');
      setEntityKind('');
      Alert.alert('نجح', 'تم إضافة الجهة بنجاح');
    } catch (error) {
      console.error('Error saving entity:', error);
      Alert.alert('خطأ', 'حدث خطأ في حفظ الجهة');
    }
  };

  const openEntityModal = (entity?: Entity) => {
    if (entity) {
      setEditingEntity(entity);
      setEntityName(entity.name);
      setEntityKind(entity.kind);
    } else {
      setEditingEntity(null);
      setEntityName('');
      setEntityKind('');
    }
    setShowEntityModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>جاري تحميل الإعدادات...</Text>
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
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveSettings}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>الإعدادات</Text>
              <Text style={styles.headerSubtitle}>إدارة حسابك وتفضيلاتك</Text>
            </View>
            
            <View style={styles.headerIcon}>
              <Ionicons name="settings-outline" size={28} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
          
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الاسم</Text>
              <TextInput
                style={styles.textInput}
                value={settings.name}
                onChangeText={(text) => setSettings({...settings, name: text})}
                placeholder="أدخل اسمك"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الراتب الشهري (د.ك)</Text>
              <TextInput
                style={styles.textInput}
                value={settings.salary.toString()}
                onChangeText={(text) => setSettings({...settings, salary: parseFloat(text) || 0})}
                placeholder="0.000"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>يوم الراتب</Text>
              <TextInput
                style={styles.textInput}
                value={settings.paydayDay.toString()}
                onChangeText={(text) => setSettings({...settings, paydayDay: parseInt(text) || 25})}
                placeholder="25"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.inputHint}>اليوم من الشهر الذي تستلم فيه راتبك</Text>
            </View>
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفضيلات التطبيق</Text>
          
          <View style={styles.card}>
            <View style={styles.switchItem}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>التنبيهات</Text>
                <Text style={styles.switchSubtitle}>تلقي إشعارات حول الاستحقاقات</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => setSettings({...settings, notifications: value})}
                trackColor={{ false: '#E5E7EB', true: '#1E40AF40' }}
                thumbColor={settings.notifications ? '#1E40AF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>الوضع الليلي</Text>
                <Text style={styles.switchSubtitle}>استخدام المظهر المظلم</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => setSettings({...settings, darkMode: value})}
                trackColor={{ false: '#E5E7EB', true: '#1E40AF40' }}
                thumbColor={settings.darkMode ? '#1E40AF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>العملة</Text>
              <Text style={styles.infoValue}>دينار كويتي (KWD)</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>اللغة</Text>
              <Text style={styles.infoValue}>العربية</Text>
            </View>
          </View>
        </View>

        {/* Entities Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => openEntityModal()}
            >
              <Ionicons name="add" size={20} color="#1E40AF" />
              <Text style={styles.addButtonText}>إضافة جهة</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>إدارة الجهات</Text>
          </View>
          
          <View style={styles.card}>
            {entities.length > 0 ? (
              entities.map((entity) => (
                <View key={entity.id} style={styles.entityItem}>
                  <View style={styles.entityActions}>
                    <TouchableOpacity 
                      style={styles.entityActionButton}
                      onPress={() => handleEntityDelete(entity.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.entityActionButton}
                      onPress={() => openEntityModal(entity)}
                    >
                      <Ionicons name="pencil-outline" size={16} color="#1E40AF" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.entityInfo}>
                    <Text style={styles.entityName}>{entity.name}</Text>
                    <Text style={styles.entityKind}>{entity.kind}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="business-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyStateText}>لا توجد جهات</Text>
                <Text style={styles.emptyStateSubtext}>ابدأ بإضافة الجهات التي تتعامل معها</Text>
              </View>
            )}
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات التطبيق</Text>
          
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>إصدار التطبيق</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>تاريخ آخر تحديث</Text>
              <Text style={styles.infoValue}>يناير 2024</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Entity Modal */}
      <Modal
        visible={showEntityModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEntityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEntityModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingEntity ? 'تعديل الجهة' : 'إضافة جهة جديدة'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>اسم الجهة *</Text>
                <TextInput
                  style={styles.textInput}
                  value={entityName}
                  onChangeText={setEntityName}
                  placeholder="مثال: بنك الكويت الوطني"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نوع الجهة</Text>
                <TextInput
                  style={styles.textInput}
                  value={entityKind}
                  onChangeText={setEntityKind}
                  placeholder="مثال: بنك، شركة، شخص"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEntityModal(false)}
              >
                <Text style={styles.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleEntitySave}
              >
                <Text style={styles.modalSaveText}>
                  {editingEntity ? 'تحديث' : 'إضافة'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 50,
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
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  
  // Content
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#1E40AF',
    fontFamily: 'Cairo-Medium',
  },
  
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // Input Group
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Cairo-Regular',
    textAlign: 'right',
    backgroundColor: '#FFFFFF',
  },
  inputHint: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
    textAlign: 'right',
  },
  
  // Switch Item
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
  },
  
  // Info Item
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Cairo-SemiBold',
  },
  infoValue: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
  },
  
  // Entity Item
  entityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entityInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  entityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 4,
  },
  entityKind: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Cairo-Regular',
  },
  entityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  entityActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Cairo-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'Cairo-Bold',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Cairo-SemiBold',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Cairo-SemiBold',
  },
});
