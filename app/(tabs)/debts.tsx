import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useDebts } from '@/hooks/useDebts';
import { DebtCard } from '@/components/DebtCard';
import { FilterChips } from '@/components/FilterChips';
import { SortOptions } from '@/components/SortOptions';
import { Plus, Filter } from 'lucide-react-native';
import { router } from 'expo-router';

export default function DebtsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { debts, loading } = useDebts();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const styles = createStyles(colors);

  const filteredDebts = debts.filter(debt => {
    if (filter === 'all') return true;
    return debt.kind === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('debts')}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-debt')}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filters and Sort */}
      <View style={styles.controlsContainer}>
        <FilterChips 
          selectedFilter={filter} 
          onFilterChange={setFilter} 
        />
        <SortOptions 
          selectedSort={sortBy} 
          onSortChange={setSortBy} 
        />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {filteredDebts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('noDebts')}</Text>
            <Text style={styles.emptySubtitle}>{t('addFirstDebt')}</Text>
          </View>
        ) : (
          <View style={styles.debtsList}>
            {filteredDebts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
          </View>
        )}
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlsContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    debtsList: {
      gap: 12,
      paddingBottom: 20,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}