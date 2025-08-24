import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Alert, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/stores/settings';
import { Moon, Sun, Globe, DollarSign, Bell, Shield, Calendar, Target, Edit3, Clock } from 'lucide-react-native';
import { formatCurrency, formatNumber, parseArabicNumber, getCurrency } from '@/lib/formatting';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, toggleLanguage } = useTranslation();
  const { 
    paydayDay, 
    savingsTarget, 
    quietHoursFrom, 
    quietHoursTo,
    updatePaydayDay,
    updateSavingsTarget,
    updateQuietHours 
  } = useSettingsStore();

  const [editingSalary, setEditingSalary] = useState(false);
  const [editingPayday, setEditingPayday] = useState(false);
  const [editingSavings, setEditingSavings] = useState(false);
  const [editingQuietHours, setEditingQuietHours] = useState(false);
  const [salaryInput, setSalaryInput] = useState('5000');
  const [paydayInput, setPaydayInput] = useState(paydayDay.toString());
  const [savingsInput, setSavingsInput] = useState(savingsTarget.toString());
  const [quietFromInput, setQuietFromInput] = useState(quietHoursFrom);
  const [quietToInput, setQuietToInput] = useState(quietHoursTo);

  const styles = createStyles(colors);

  const handleSalarySave = () => {
    const amount = language === 'ar' ? parseArabicNumber(salaryInput) : parseFloat(salaryInput);
    if (amount > 0) {
      // Here you would save to your settings store
      Alert.alert(language === 'ar' ? 'نجح' : 'Success', language === 'ar' ? 'تم حفظ الراتب' : 'Salary saved');
      setEditingSalary(false);
    } else {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'مبلغ غير صحيح' : 'Invalid amount');
    }
  };

  const handlePaydaySave = () => {
    const day = language === 'ar' ? parseArabicNumber(paydayInput) : parseInt(paydayInput);
    if (day >= 1 && day <= 31) {
      updatePaydayDay(day);
      Alert.alert(language === 'ar' ? 'نجح' : 'Success', language === 'ar' ? 'تم حفظ يوم الراتب' : 'Payday saved');
      setEditingPayday(false);
    } else {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'يوم غير صحيح' : 'Invalid day');
    }
  };

  const handleSavingsSave = () => {
    const amount = language === 'ar' ? parseArabicNumber(savingsInput) : parseFloat(savingsInput);
    if (amount >= 0) {
      updateSavingsTarget(amount);
      Alert.alert(language === 'ar' ? 'نجح' : 'Success', language === 'ar' ? 'تم حفظ هدف الادخار' : 'Savings target saved');
      setEditingSavings(false);
    } else {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'مبلغ غير صحيح' : 'Invalid amount');
    }
  };

  const handleQuietHoursSave = () => {
    const fromHour = parseInt(quietFromInput);
    const toHour = parseInt(quietToInput);
    if (fromHour >= 0 && fromHour <= 23 && toHour >= 0 && toHour <= 23) {
      updateQuietHours(quietFromInput, quietToInput);
      Alert.alert(language === 'ar' ? 'نجح' : 'Success', language === 'ar' ? 'تم حفظ ساعات الهدوء' : 'Quiet hours saved');
      setEditingQuietHours(false);
    } else {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'ساعات غير صحيحة' : 'Invalid hours');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'عام' : 'General'}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Globe size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>{language === 'ar' ? 'اللغة' : 'Language'}</Text>
            </View>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageToggle}>
              <Text style={styles.languageText}>
                {language === 'ar' ? 'العربية' : 'English'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              {isDark ? (
                <Moon size={20} color={colors.textSecondary} />
              ) : (
                <Sun size={20} color={colors.textSecondary} />
              )}
              <Text style={styles.settingLabel}>{language === 'ar' ? 'الوضع الليلي' : 'Dark Mode'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        {/* Financial Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'مالي' : 'Financial'}</Text>
          
          {/* Current Salary */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <DollarSign size={20} color={colors.textSecondary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{language === 'ar' ? 'الراتب الحالي' : 'Current Salary'}</Text>
                {editingSalary ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={salaryInput}
                      onChangeText={setSalaryInput}
                      keyboardType="numeric"
                      textAlign="right"
                      placeholder={language === 'ar' ? 'أدخل الراتب' : 'Enter Salary'}
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity onPress={handleSalarySave} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.amountDisplay}>
                    <Text style={styles.settingValue}>{formatNumber(Math.floor(parseFloat(salaryInput)), language)}</Text>
                    {parseFloat(salaryInput) % 1 !== 0 && (
                      <Text style={styles.decimalText}>.{formatNumber(Math.round((parseFloat(salaryInput) % 1) * 100), language)}</Text>
                    )}
                    <Text style={styles.currencyText}> {getCurrency(language)}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setEditingSalary(!editingSalary)}>
              <Edit3 size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Payday */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Calendar size={20} color={colors.textSecondary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{language === 'ar' ? 'يوم الراتب' : 'Payday'}</Text>
                {editingPayday ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={paydayInput}
                      onChangeText={setPaydayInput}
                      keyboardType="numeric"
                      textAlign="right"
                      placeholder={language === 'ar' ? 'أدخل اليوم' : 'Enter Day'}
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity onPress={handlePaydaySave} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.settingValue}>{language === 'ar' ? 'يوم' : 'Day'} {formatNumber(paydayDay, language)}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setEditingPayday(!editingPayday)}>
              <Edit3 size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Savings Target */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Target size={20} color={colors.textSecondary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{language === 'ar' ? 'هدف الادخار' : 'Savings Target'}</Text>
                {editingSavings ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={savingsInput}
                      onChangeText={setSavingsInput}
                      keyboardType="numeric"
                      textAlign="right"
                      placeholder={language === 'ar' ? 'أدخل الهدف' : 'Enter Target'}
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity onPress={handleSavingsSave} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.amountDisplay}>
                    <Text style={styles.settingValue}>{formatNumber(Math.floor(savingsTarget), language)}</Text>
                    {savingsTarget % 1 !== 0 && (
                      <Text style={styles.decimalText}>.{formatNumber(Math.round((savingsTarget % 1) * 100), language)}</Text>
                    )}
                    <Text style={styles.currencyText}> {getCurrency(language)}</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setEditingSavings(!editingSavings)}>
              <Edit3 size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'الإشعارات' : 'Notifications'}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Clock size={20} color={colors.textSecondary} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{language === 'ar' ? 'ساعات الهدوء' : 'Quiet Hours'}</Text>
                {editingQuietHours ? (
                  <View style={styles.quietHoursContainer}>
                    <View style={styles.timeInputContainer}>
                      <Text style={styles.timeLabel}>{language === 'ar' ? 'من' : 'From'}:</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={quietFromInput}
                        onChangeText={setQuietFromInput}
                        keyboardType="numeric"
                        textAlign="center"
                        placeholder="00"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                    <View style={styles.timeInputContainer}>
                      <Text style={styles.timeLabel}>{language === 'ar' ? 'إلى' : 'To'}:</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={quietToInput}
                        onChangeText={setQuietToInput}
                        keyboardType="numeric"
                        textAlign="center"
                        placeholder="00"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                    <TouchableOpacity onPress={handleQuietHoursSave} style={styles.saveButton}>
                      <Text style={styles.saveButtonText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.settingValue}>
                    {formatNumber(parseInt(quietHoursFrom), language)}:00 - {formatNumber(parseInt(quietHoursTo), language)}:00
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setEditingQuietHours(!editingQuietHours)}>
              <Edit3 size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'الخصوصية' : 'Privacy'}</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>{language === 'ar' ? 'تصدير البيانات' : 'Export Data'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={20} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>{language === 'ar' ? 'استيراد البيانات' : 'Import Data'}</Text>
            </View>
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
      paddingHorizontal: 16,
      paddingVertical: 20,
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'right',
    },
    settingItem: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 8,
    },
    settingInfo: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    settingContent: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      textAlign: 'right',
    },
    settingValue: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'right',
    },
    editContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    editInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      textAlign: 'right',
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
    },
    amountDisplay: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    decimalText: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
    currencyText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
    quietHoursContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    timeInputContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 4,
    },
    timeLabel: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
    },
    timeInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      width: 40,
    },
    languageToggle: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    languageText: {
      color: 'white',
      fontFamily: 'Cairo-SemiBold',
      fontSize: 14,
    },
  });
}