import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Switch, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar, DollarSign, FileText, Save, Repeat, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { getCurrency } from '@/lib/formatting';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function AddCommitmentScreen() {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [category, setCategory] = useState('');

  const styles = createStyles(colors);

  const handleSaveCommitment = () => {
    if (!amount || !description) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    // Here you would save to database
    Alert.alert(language === 'ar' ? 'نجح' : 'Success', language === 'ar' ? 'تم حفظ الالتزام' : 'Commitment saved', [
      { text: language === 'ar' ? 'موافق' : 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{language === 'ar' ? 'إضافة التزام' : 'Add Commitment'}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{language === 'ar' ? 'المبلغ' : 'Amount'}</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter Amount'}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{language === 'ar' ? 'الوصف' : 'Description'}</Text>
            <View style={styles.inputContainer}>
              <FileText size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder={language === 'ar' ? 'أدخل الوصف' : 'Enter Description'}
                placeholderTextColor={colors.textSecondary}
                textAlign="right"
              />
            </View>
          </View>

          {/* Recurring Switch */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{language === 'ar' ? 'متكرر' : 'Recurring'}</Text>
            <Switch
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isRecurring ? colors.background : colors.textSecondary}
              ios_backgroundColor={colors.border}
              onValueChange={setIsRecurring}
              value={isRecurring}
            />
          </View>

          {/* Due Date Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                textAlign="right"
              />
            </View>
          </View>


          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveCommitment}>
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>{language === 'ar' ? 'حفظ الالتزام' : 'Save Commitment'}</Text>
          </TouchableOpacity>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'right',
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    form: {
      paddingVertical: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'right',
    },
    inputContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    inputIcon: {
      marginLeft: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      textAlign: 'right',
    },
    toggleContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 20,
    },
    toggleActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    toggleContent: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
    },
    toggleTextActive: {
      color: 'white',
    },
    saveButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginTop: 20,
      gap: 8,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      marginLeft: 8,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginBottom: 16,
    },
    switchLabel: {
      fontSize: 16,
      fontFamily: 'Cairo-Medium',
      color: colors.text,
    },
  });
}
