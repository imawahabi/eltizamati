import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLayout } from '@/hooks/useLayout';
import { Card } from '@/components/ui/Card';
import { Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isRTL, textAlign } = useLayout();

  const styles = createStyles(colors, isRTL);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Bell size={24} color={colors.primary} />
            <Text style={[styles.title, { textAlign }]}>{t('notifications')}</Text>
          </View>
        </View>

        <Card style={styles.comingSoonCard}>
          <View style={styles.comingSoonContent}>
            <Clock size={48} color={colors.textSecondary} />
            <Text style={[styles.comingSoonTitle, { textAlign }]}>قريباً</Text>
            <Text style={[styles.comingSoonText, { textAlign }]}>
              سيتم إضافة نظام التنبيهات الذكية قريباً لمساعدتك في متابعة التزاماتك المالية
            </Text>
          </View>
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
    scrollContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 24,
    },
    headerContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    comingSoonCard: {
      padding: 32,
      marginTop: 20,
    },
    comingSoonContent: {
      alignItems: 'center',
      gap: 16,
    },
    comingSoonTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: colors.text,
    },
    comingSoonText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: colors.textSecondary,
      lineHeight: 24,
    },
  });
}
