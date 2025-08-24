import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { Calendar, DollarSign, FileText, Save, Repeat, ArrowLeft, Building, User, CreditCard, Smartphone, Brain, Camera } from 'lucide-react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function AddCommitmentScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { flexDirection, textAlign } = useLayout();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [entityType, setEntityType] = useState('');
  const [entityName, setEntityName] = useState('');
  const [debtType, setDebtType] = useState('');
  const [installments, setInstallments] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Entity type options
  const entityTypeOptions = [
    { label: t('bank'), value: 'bank', icon: <Building size={20} color={colors.primary} /> },
    { label: t('bnpl'), value: 'bnpl', icon: <CreditCard size={20} color={colors.primary} /> },
    { label: t('retailer'), value: 'retailer', icon: <Building size={20} color={colors.primary} /> },
    { label: t('person'), value: 'person', icon: <User size={20} color={colors.primary} /> },
    { label: t('finance'), value: 'finance', icon: <Building size={20} color={colors.primary} /> },
    { label: t('telco'), value: 'telco', icon: <Smartphone size={20} color={colors.primary} /> },
    { label: t('other'), value: 'other', icon: <FileText size={20} color={colors.primary} /> },
  ];
  
  // Debt type options
  const debtTypeOptions = [
    { label: t('loan'), value: 'loan', icon: <DollarSign size={20} color={colors.primary} /> },
    { label: t('installment'), value: 'installment', icon: <CreditCard size={20} color={colors.primary} /> },
    { label: t('friend'), value: 'friend', icon: <User size={20} color={colors.primary} /> },
    { label: t('oneoff'), value: 'oneoff', icon: <FileText size={20} color={colors.primary} /> },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount) newErrors.amount = t('requiredField');
    else if (isNaN(parseFloat(amount))) newErrors.amount = t('invalidAmount');
    
    if (!description) newErrors.description = t('requiredField');
    if (!entityType) newErrors.entityType = t('requiredField');
    if (!entityName) newErrors.entityName = t('requiredField');
    if (!debtType) newErrors.debtType = t('requiredField');
    if (!dueDate) newErrors.dueDate = t('requiredField');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCommitment = () => {
    if (!validateForm()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    Alert.alert(t('success'), t('commitmentSaved'), [
      { text: t('confirm'), onPress: () => router.back() }
    ]);
  };

  const handleNLPInput = () => {
    Alert.alert(t('nlpInput'), 'Feature coming soon!');
  };

  const handleBankSnapshot = () => {
    Alert.alert(t('bankSnapshot'), 'Feature coming soon!');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: flexDirection.row,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: textAlign.start,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    quickActionsCard: {
      marginTop: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: textAlign.start,
    },
    quickActions: {
      flexDirection: flexDirection.row,
      gap: 12,
    },
    quickActionButton: {
      flex: 1,
    },
    formCard: {
      marginBottom: 16,
    },
    switchContainer: {
      flexDirection: flexDirection.row,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
    },
    actionCard: {
      marginBottom: 32,
    },
    saveButton: {
      width: '100%',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('addCommitment')}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Quick Action Buttons */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>{t('aiSuggestions')}</Text>
          <View style={styles.quickActions}>
            <Button
              title={t('nlpInput')}
              onPress={handleNLPInput}
              variant="outline"
              size="small"
              icon={<Brain size={18} color={colors.primary} />}
              style={styles.quickActionButton}
            />
            <Button
              title={t('bankSnapshot')}
              onPress={handleBankSnapshot}
              variant="outline"
              size="small"
              icon={<Camera size={18} color={colors.primary} />}
              style={styles.quickActionButton}
            />
          </View>
        </Card>

        {/* Main Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('general')}</Text>
          
          <Select
            label={t('selectCategory')}
            placeholder={t('selectCategory')}
            options={entityTypeOptions}
            value={entityType}
            onSelect={setEntityType}
            error={errors.entityType}
            required
          />

          <Input
            label={t('selectEntity')}
            placeholder={t('enterDescription')}
            value={entityName}
            onChangeText={setEntityName}
            error={errors.entityName}
            icon={<Building size={20} color={colors.textSecondary} />}
            required
          />

          <Select
            label={t('selectCategory')}
            placeholder={t('selectCategory')}
            options={debtTypeOptions}
            value={debtType}
            onSelect={setDebtType}
            error={errors.debtType}
            required
          />

          <Input
            label={t('amount')}
            placeholder={t('enterAmount')}
            value={amount}
            onChangeText={setAmount}
            error={errors.amount}
            keyboardType="numeric"
            icon={<DollarSign size={20} color={colors.textSecondary} />}
            required
          />

          <Input
            label={t('description')}
            placeholder={t('enterDescription')}
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            icon={<FileText size={20} color={colors.textSecondary} />}
            required
          />
        </Card>

        {/* Advanced Settings */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('financial')}</Text>
          
          <Input
            label={t('dueDate')}
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={setDueDate}
            error={errors.dueDate}
            icon={<Calendar size={20} color={colors.textSecondary} />}
            required
          />

          <Input
            label="عدد الأقساط / Number of Installments"
            placeholder="12"
            value={installments}
            onChangeText={setInstallments}
            keyboardType="numeric"
            icon={<Repeat size={20} color={colors.textSecondary} />}
          />

          <Input
            label="معدل الفائدة % / Interest Rate %"
            placeholder="7.5"
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="numeric"
            icon={<DollarSign size={20} color={colors.textSecondary} />}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{t('recurring')}</Text>
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isRecurring ? colors.background : colors.textSecondary}
              ios_backgroundColor={colors.border}
              onValueChange={setIsRecurring}
              value={isRecurring}
            />
          </View>
        </Card>

        <Card style={styles.actionCard}>
          <Button
            title={t('save')}
            onPress={handleSaveCommitment}
            variant="primary"
            size="large"
            icon={<Save size={20} color={colors.textInverse} />}
            style={styles.saveButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
