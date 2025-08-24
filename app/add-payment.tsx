import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { Calendar, DollarSign, FileText, Save, ArrowLeft, CreditCard, Building, Receipt, Banknote, Smartphone } from 'lucide-react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function AddPaymentScreen() {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const { isRTL, textAlign, flexDirection, getIconDirection } = useLayout();
  
  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [entityName, setEntityName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [category, setCategory] = useState('');
  const [reference, setReference] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount) newErrors.amount = t('requiredField');
    if (!description) newErrors.description = t('requiredField');
    if (!paymentMethod) newErrors.paymentMethod = t('requiredField');
    if (!date) newErrors.date = t('requiredField');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePayment = () => {
    if (!validateForm()) {
      Alert.alert(t('validationError'), t('fixErrorsMessage'));
      return;
    }

    // Here you would save to database
    Alert.alert(t('success'), t('paymentSaved'), [
      { text: t('ok'), onPress: () => router.back() }
    ]);
  };

  const paymentMethods = [
    { label: t('cash'), value: 'cash', icon: 'banknote' },
    { label: t('creditCard'), value: 'credit_card', icon: 'credit-card' },
    { label: t('bankTransfer'), value: 'bank_transfer', icon: 'building' },
    { label: t('knet'), value: 'knet', icon: 'smartphone' },
  ];

  const categories = [
    { label: t('loan'), value: 'loan' },
    { label: t('bnpl'), value: 'bnpl' },
    { label: t('personalDebt'), value: 'personal_debt' },
    { label: t('oneOffPayment'), value: 'one_off' },
  ];

  const styles = createStyles(colors, isRTL);

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
        <Text style={[styles.title, { textAlign }]}>{t('addPayment')}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Payment Details */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('paymentDetails')}</Text>
          
          <Input
            label={t('amount')}
            placeholder={t('enterAmount')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            error={errors.amount}
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

          <Select
            label={t('paymentMethod')}
            placeholder={t('selectPaymentMethod')}
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            options={paymentMethods}
            error={errors.paymentMethod}
            icon={<CreditCard size={20} color={colors.textSecondary} />}
            required
          />

          <Input
            label={t('entityName')}
            placeholder={t('enterEntityName')}
            value={entityName}
            onChangeText={setEntityName}
            icon={<Building size={20} color={colors.textSecondary} />}
          />
        </Card>

        {/* Additional Information */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('additionalInfo')}</Text>
          
          <Select
            label={t('category')}
            placeholder={t('selectCategory')}
            value={category}
            onValueChange={setCategory}
            options={categories}
            icon={<Receipt size={20} color={colors.textSecondary} />}
          />

          <Input
            label={t('paymentDate')}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            error={errors.date}
            icon={<Calendar size={20} color={colors.textSecondary} />}
            required
          />

          <Input
            label={t('reference')}
            placeholder={t('enterReference')}
            value={reference}
            onChangeText={setReference}
            icon={<Receipt size={20} color={colors.textSecondary} />}
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
            title={t('savePayment')}
            onPress={handleSavePayment}
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

function createStyles(colors: any, isRTL: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
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
    formCard: {
      marginVertical: 8,
    },
    actionCard: {
      marginVertical: 8,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    switchContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      marginTop: 16,
    },
    switchLabel: {
      fontSize: 16,
      fontFamily: 'Cairo-Medium',
      color: colors.text,
    },
    saveButton: {
      width: '100%',
    },
  });
}
