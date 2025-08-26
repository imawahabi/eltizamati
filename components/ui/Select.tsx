import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Typography } from './Typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  containerClassName?: string;
  labelClassName?: string;
  buttonClassName?: string;
}

export function Select({
  label,
  placeholder = 'اختر خياراً',
  options,
  value,
  onSelect,
  error,
  required = false,
  containerClassName = '',
  labelClassName = '',
  buttonClassName = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = async (optionValue: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(optionValue);
    setIsOpen(false);
  };

  const handleOpen = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOpen(true);
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      className={`flex-row items-center justify-between px-4 py-3 rounded-lg mb-2 ${
        item.value === value ? 'bg-primary-50 border border-primary-200' : 'bg-muted-50'
      }`}
      onPress={() => handleSelect(item.value)}
    >
      <View className="flex-row items-center flex-1">
        {item.icon && <View className="mr-3">{item.icon}</View>}
        <Typography 
          variant="body" 
          className={`flex-1 ${
            item.value === value ? 'text-primary-600 font-cairo-medium' : 'text-text-primary'
          }`}
        >
          {item.label}
        </Typography>
      </View>
      
      {item.value === value && (
        <Ionicons name="checkmark" size={20} color="#0B63FF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <View className="flex-row items-center mb-2">
          <Typography 
            variant="body" 
            className={`text-text-secondary font-cairo-medium ${labelClassName}`}
          >
            {label}
          </Typography>
          {required && (
            <Typography variant="body" className="text-danger-500 mr-1">
              *
            </Typography>
          )}
        </View>
      )}
      
      <TouchableOpacity
        className={`flex-row items-center justify-between bg-surface border rounded-xl px-4 py-3 min-h-12 ${
          error ? 'border-danger-500' : 'border-muted-200'
        } ${buttonClassName}`}
        onPress={handleOpen}
      >
        <Typography 
          variant="body" 
          className={`flex-1 font-cairo-regular ${
            selectedOption ? 'text-text-primary' : 'text-text-tertiary'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Typography>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {error && (
        <Typography variant="caption" className="text-danger-500 mt-1">
          {error}
        </Typography>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />
          
          <View 
            className="bg-white rounded-2xl p-5 w-11/12 max-h-96"
            style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}
          >
            <Typography variant="h3" className="text-text-primary font-cairo-bold text-center mb-4">
              {label || 'اختر خياراً'}
            </Typography>
            
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
            
            <TouchableOpacity
              className="mt-4 bg-muted-100 rounded-xl py-3"
              onPress={() => setIsOpen(false)}
            >
              <Typography variant="body" className="text-text-secondary text-center font-cairo-medium">
                إلغاء
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
