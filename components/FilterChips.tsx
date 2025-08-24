import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface FilterChipsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterChips({ selectedFilter, onFilterChange }: FilterChipsProps) {
  const { colors } = useTheme();

  const filters = [
    { key: 'all', label: 'الكل' },
    { key: 'loan', label: 'قروض' },
    { key: 'bnpl', label: 'تقسيط' },
    { key: 'friend', label: 'شخصي' },
    { key: 'oneoff', label: 'فواتير' },
  ];

  const styles = createStyles(colors);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.chip,
            selectedFilter === filter.key && styles.chipSelected
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text style={[
            styles.chipText,
            selectedFilter === filter.key && styles.chipTextSelected
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    content: {
      gap: 8,
      paddingRight: 16,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: colors.textSecondary,
    },
    chipTextSelected: {
      color: 'white',
    },
  });
}