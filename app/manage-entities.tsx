import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { ArrowLeft, Plus, Building, CreditCard, Users, Edit, Trash2, Search } from 'lucide-react-native';
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
          <Button
            variant="ghost"
            size="small"
            icon={<Edit size={16} color={colors.textSecondary} />}
            onPress={() => {/* TODO: Edit functionality */}}
          />
          <Button
            variant="ghost"
            size="small"
            icon={<Trash2 size={16} color={colors.error} />}
            onPress={() => handleDeleteEntity(item.id)}
          />
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="small"
          icon={<ArrowLeft size={24} color={colors.text} style={{ transform: [{ scaleX: getIconDirection() }] }} />}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text style={[styles.title, { textAlign }]}>{t('manageEntities')}</Text>
        <Button
          variant="ghost"
          size="small"
          icon={<Plus size={24} color={colors.primary} />}
          onPress={() => setShowAddForm(!showAddForm)}
        />
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
          
          <Select
            label={t('filterByType')}
            value={filterType}
            onValueChange={setFilterType}
            options={entityTypes}
            style={styles.filterSelect}
          />
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

            <Select
              label={t('entityType')}
              value={newEntity.type}
              onValueChange={(value) => setNewEntity(prev => ({ ...prev, type: value as Entity['type'] }))}
              options={newEntityTypes}
              required
            />

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
    </SafeAreaView>
  );
}

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    backButton: {
      marginRight: isRTL ? 0 : 16,
      marginLeft: isRTL ? 16 : 0,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
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
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: isRTL ? 'right' : 'left',
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
      marginBottom: 12,
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
