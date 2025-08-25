import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { ArrowLeft, Plus, Building, CreditCard, Users, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface Entity {
  id: string;
  name: string;
  type: 'bank' | 'bnpl' | 'personal' | 'company';
  contactInfo?: string;
  notes?: string;
  createdAt: string;
}

export default function ManageEntitiesScreen() {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { isRTL, textAlign, flexDirection, getIconDirection } = useLayout();
  
  // State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [newEntity, setNewEntity] = useState({
    name: '',
    type: 'bank' as Entity['type'],
    contactInfo: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = createStyles(colors, isRTL);

  // Mock data - in real app, this would come from database
  useEffect(() => {
    const mockEntities: Entity[] = [
      {
        id: '1',
        name: 'بنك الكويت الوطني',
        type: 'bank',
        contactInfo: '1801801',
        createdAt: '2024-01-15'
      },
      {
        id: '2', 
        name: 'بنك الخليج',
        type: 'bank',
        contactInfo: '1805805',
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        name: 'تابي',
        type: 'bnpl',
        contactInfo: 'support@tabby.ai',
        createdAt: '2024-01-20'
      },
      {
        id: '4',
        name: 'أحمد محمد',
        type: 'personal',
        contactInfo: '+965 9999 9999',
        createdAt: '2024-01-25'
      }
    ];
    setEntities(mockEntities);
  }, []);

  const entityTypes = [
    { label: t('all'), value: 'all' },
    { label: t('banks'), value: 'bank' },
    { label: t('bnplCompanies'), value: 'bnpl' },
    { label: t('personalContacts'), value: 'personal' },
    { label: t('companies'), value: 'company' },
  ];

  const newEntityTypes = [
    { label: t('bank'), value: 'bank' },
    { label: t('bnplCompany'), value: 'bnpl' },
    { label: t('personalContact'), value: 'personal' },
    { label: t('company'), value: 'company' },
  ];

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || entity.type === filterType;
    return matchesSearch && matchesType;
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newEntity.name.trim()) newErrors.name = t('requiredField');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEntity = () => {
    if (!validateForm()) {
      Alert.alert(t('validationError'), t('fixErrorsMessage'));
      return;
    }

    const entity: Entity = {
      id: Date.now().toString(),
      ...newEntity,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setEntities(prev => [entity, ...prev]);
    setNewEntity({ name: '', type: 'bank', contactInfo: '', notes: '' });
    setShowAddForm(false);
    Alert.alert(t('success'), t('entitySaved'));
  };

  const handleDeleteEntity = (id: string) => {
    Alert.alert(
      t('confirmDelete'),
      t('deleteEntityConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => setEntities(prev => prev.filter(e => e.id !== id))
        }
      ]
    );
  };

  const getEntityIcon = (type: Entity['type']) => {
    switch (type) {
      case 'bank': return <Building size={20} color={colors.primary} />;
      case 'bnpl': return <CreditCard size={20} color={colors.secondary} />;
      case 'personal': return <Users size={20} color={colors.accent} />;
      case 'company': return <Building size={20} color={colors.warning} />;
      default: return <Building size={20} color={colors.textSecondary} />;
    }
  };

  const renderEntity = ({ item }: { item: Entity }) => (
    <Card style={styles.entityCard}>
      <View style={styles.entityHeader}>
        <View style={styles.entityInfo}>
          {getEntityIcon(item.type)}
          <View style={styles.entityDetails}>
            <Text style={styles.entityName}>{item.name}</Text>
            <Text style={styles.entityType}>{t(item.type)}</Text>
          </View>
        </View>
        <View style={styles.entityActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {/* TODO: Edit functionality */}}
          >
            <Edit size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteEntity(item.id)}
          >
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.contactInfo && (
        <Text style={styles.contactInfo}>{item.contactInfo}</Text>
      )}
      
      {item.notes && (
        <Text style={styles.notes}>{item.notes}</Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Professional Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>إدارة الجهات</Text>
          <Text style={styles.headerSubtitle}>إدارة البنوك والشركات والأشخاص</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#FFFFFF" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
              الكل
            </Text>
            <View style={[styles.filterBadge, filterType === 'all' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, filterType === 'all' && styles.filterBadgeTextActive]}>
                {entities.length}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'bank' && styles.filterButtonActive]}
            onPress={() => setFilterType('bank')}
          >
            <Text style={[styles.filterText, filterType === 'bank' && styles.filterTextActive]}>البنوك</Text>
            <View style={[styles.filterBadge, filterType === 'bank' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, filterType === 'bank' && styles.filterBadgeTextActive]}>
                {entities.filter(e => e.type === 'bank').length}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'bnpl' && styles.filterButtonActive]}
            onPress={() => setFilterType('bnpl')}
          >
            <Text style={[styles.filterText, filterType === 'bnpl' && styles.filterTextActive]}>شركات التقسيط</Text>
            <View style={[styles.filterBadge, filterType === 'bnpl' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, filterType === 'bnpl' && styles.filterBadgeTextActive]}>
                {entities.filter(e => e.type === 'bnpl').length}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'personal' && styles.filterButtonActive]}
            onPress={() => setFilterType('personal')}
          >
            <Text style={[styles.filterText, filterType === 'personal' && styles.filterTextActive]}>أشخاص</Text>
            <View style={[styles.filterBadge, filterType === 'personal' && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, filterType === 'personal' && styles.filterBadgeTextActive]}>
                {entities.filter(e => e.type === 'personal').length}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Search and Filter */}
        <Card style={styles.filterCard}>
          <Input
            placeholder={t('searchEntities')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Search size={20} color={colors.textSecondary} />}
            style={styles.searchInput}
          />
          
          <View style={styles.filterSelect}>
            <Text style={styles.filterLabel}>{t('filterByType')}</Text>
            {/* Filter select will be implemented with custom component */}
          </View>
        </Card>

        {/* Add Entity Form */}
        {showAddForm && (
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>{t('addNewEntity')}</Text>
            
            <Input
              label={t('entityName')}
              placeholder={t('enterEntityName')}
              value={newEntity.name}
              onChangeText={(text) => setNewEntity(prev => ({ ...prev, name: text }))}
              error={errors.name}
              required
            />

            <View style={styles.typeSelector}>
              <Text style={styles.typeLabel}>{t('entityType')}</Text>
              {/* Type selector will be implemented with custom component */}
            </View>

            <Input
              label={t('contactInfo')}
              placeholder={t('enterContactInfo')}
              value={newEntity.contactInfo}
              onChangeText={(text) => setNewEntity(prev => ({ ...prev, contactInfo: text }))}
            />

            <Input
              label={t('notes')}
              placeholder={t('enterNotes')}
              value={newEntity.notes}
              onChangeText={(text) => setNewEntity(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formActions}>
              <Button
                title={t('cancel')}
                variant="secondary"
                onPress={() => {
                  setShowAddForm(false);
                  setNewEntity({ name: '', type: 'bank', contactInfo: '', notes: '' });
                  setErrors({});
                }}
                style={styles.cancelButton}
              />
              <Button
                title={t('save')}
                variant="primary"
                onPress={handleAddEntity}
                style={styles.saveButton}
              />
            </View>
          </Card>
        )}

        {/* Entities List */}
        <View style={styles.entitiesContainer}>
          <Text style={styles.sectionTitle}>
            {t('entities')} ({filteredEntities.length})
          </Text>
          
          {filteredEntities.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('noEntitiesFound')}</Text>
              <Text style={styles.emptySubtext}>{t('addFirstEntity')}</Text>
            </Card>
          ) : (
            <FlatList
              data={filteredEntities}
              renderItem={renderEntity}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomLeftRadius: 25,
      borderBottomRightRadius: 25,
    },
    headerContent: {
      marginBottom: 15,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontFamily: 'Cairo',
      textAlign: 'right',
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#E0E7FF',
      fontFamily: 'Cairo',
      textAlign: 'right',
      marginTop: 4,
    },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    filtersContainer: {
      paddingVertical: 15,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    filtersScroll: {
      paddingHorizontal: 20,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
      borderRadius: 20,
      backgroundColor: '#F3F4F6',
      gap: 8,
    },
    filterButtonActive: {
      backgroundColor: '#1E40AF',
    },
    filterText: {
      fontSize: 14,
      color: '#6B7280',
      fontFamily: 'Cairo',
      fontWeight: '600',
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    filterBadge: {
      backgroundColor: '#E5E7EB',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      minWidth: 24,
      alignItems: 'center',
    },
    filterBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    filterBadgeText: {
      fontSize: 12,
      color: '#6B7280',
      fontFamily: 'Cairo',
      fontWeight: 'bold',
    },
    filterBadgeTextActive: {
      color: '#FFFFFF',
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    filterCard: {
      marginVertical: 8,
    },
    searchInput: {
      marginBottom: 16,
    },
    filterSelect: {
      marginBottom: 0,
    },
    formCard: {
      marginVertical: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: '#1E293B',
      marginBottom: 16,
      textAlign: 'right',
    },
    formActions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      marginTop: 16,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
    },
    saveButton: {
      flex: 1,
    },
    entitiesContainer: {
      marginVertical: 8,
    },
    entityCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    entityHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    entityInfo: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      flex: 1,
    },
    entityDetails: {
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
      flex: 1,
    },
    entityName: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
    },
    entityType: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
      marginTop: 2,
    },
    entityActions: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#F8FAFC',
    },
    filterLabel: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: '#374151',
      marginBottom: 8,
    },
    typeSelector: {
      marginBottom: 16,
    },
    typeLabel: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: '#374151',
      marginBottom: 8,
    },
    contactInfo: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: isRTL ? 'right' : 'left',
      marginBottom: 4,
    },
    notes: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      textAlign: isRTL ? 'right' : 'left',
      fontStyle: 'italic',
    },
    emptyCard: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
