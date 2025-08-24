import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { ChevronDown, Check } from 'lucide-react-native';

interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onSelect,
  error,
  required = false,
}: SelectProps) {
  const { colors } = useTheme();
  const { flexDirection, textAlign } = useLayout();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    labelContainer: {
      flexDirection: flexDirection.row,
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      textAlign: textAlign.start,
    },
    required: {
      color: colors.error,
      marginLeft: 4,
    },
    selectButton: {
      flexDirection: flexDirection.rowReverse,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: error ? colors.error : colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: 48,
    },
    selectText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: selectedOption ? colors.text : colors.textMuted,
      textAlign: textAlign.start,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      width: '90%',
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    optionItem: {
      flexDirection: flexDirection.rowReverse,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 4,
    },
    selectedOption: {
      backgroundColor: colors.primary + '20',
    },
    optionText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: colors.text,
      flex: 1,
      textAlign: textAlign.start,
    },
    optionIcon: {
      marginLeft: 12,
    },
    errorText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.error,
      marginTop: 4,
      textAlign: textAlign.start,
    },
  });

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        item.value === value && styles.selectedOption,
      ]}
      onPress={() => {
        onSelect(item.value);
        setIsOpen(false);
      }}
    >
      {item.icon && <View style={styles.optionIcon}>{item.icon}</View>}
      <Text style={styles.optionText}>{item.label}</Text>
      {item.value === value && (
        <Check size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.selectText}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
