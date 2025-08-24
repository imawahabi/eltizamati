import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar, DollarSign, FileText, Save, Repeat, CreditCard } from 'lucide-react-native';
import { router } from 'expo-router';

export default function AddCommitmentScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [category, setCategory] = useState('');

  const styles = createStyles(colors);

  const handleSaveCommitment = () => {
    if (!amount || !description || !dueDate) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    // Here you would save to database
    Alert.alert(t('success'), t('commitmentSaved'), [
      { text: t('ok'), onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('addCommitment')}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('amount')}</Text>
            <View style={styles.inputContainer}>
              <DollarSign size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder={t('enterAmount')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('description')}</Text>
            <View style={styles.inputContainer}>
              <FileText size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder={t('enterDescription')}
                placeholderTextColor={colors.textSecondary}
                textAlign="right"
              />
            </View>
          </View>

          {/* Category Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('category')}</Text>
            <View style={styles.inputContainer}>
              <CreditCard size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder={t('enterCategory')}
                placeholderTextColor={colors.textSecondary}
                textAlign="right"
              />
            </View>
          </View>

          {/* Due Date Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('dueDate')}</Text>
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

          {/* Recurring Toggle */}
          <TouchableOpacity 
            style={[styles.toggleContainer, isRecurring && styles.toggleActive]}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View style={styles.toggleContent}>
              <Text style={[styles.toggleText, isRecurring && styles.toggleTextActive]}>
                {t('recurringCommitment')}
              </Text>
              <Repeat size={20} color={isRecurring ? 'white' : colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveCommitment}>
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>{t('saveCommitment')}</Text>
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
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    },
  });
}
