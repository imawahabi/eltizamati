import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ArrowUpDown } from 'lucide-react-native';

interface SortOptionsProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

export function SortOptions({ selectedSort, onSortChange }: SortOptionsProps) {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.container}>
      <ArrowUpDown size={16} color={colors.textSecondary} />
      <Text style={styles.text}>ترتيب حسب الأولوية</Text>
    </TouchableOpacity>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    text: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
    },
  });
}