import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { Card } from './ui/Card';
import { Clock, CreditCard, TrendingUp, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface TabNavigationProps {
  children?: React.ReactNode;
}

interface TabItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ children }) => {
  const { colors, isDark } = useTheme();
  const { isRTL } = useLayout();
  const [activeTab, setActiveTab] = useState('payments');

  // Styles must be defined before usage in tabs below
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: '#fff',
      textAlign: isRTL ? 'right' : 'left' as 'left' | 'right',
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: '#fff',
      opacity: 0.8,
      marginTop: 4,
      textAlign: isRTL ? 'right' : 'left' as 'left' | 'right',
    },
    mainContent: {
      flex: 1,
      position: 'relative' as 'relative',
    },
    fixedRight: {
      backgroundColor: colors.primary,
      position: 'absolute' as 'absolute',
      right: 0,
      height: 40,
      width: 40,
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopRightRadius: 30,
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    tabContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row' as 'row' | 'row-reverse',
      backgroundColor: colors.surface,
      borderRadius: 25,
      padding: 4,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    tabButton: {
      flex: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row' as 'row' | 'row-reverse',
      alignItems: 'center' as 'center',
      justifyContent: 'center' as 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      gap: 8,
    },
    activeTabButton: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      textAlign: 'center' as 'center',
    },
    activeTabText: {
      color: '#fff',
    },
    inactiveTabText: {
      color: colors.text,
    },
    tabContent: {
      flex: 1,
    },
    paymentItem: {
      padding: 16,
      marginBottom: 8,
    },
    paymentContent: {
      alignItems: 'center' as 'center',
      gap: 12,
    },
    paymentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center' as 'center',
      alignItems: 'center' as 'center',
    },
    paymentInfo: {
      flex: 1,
    },
    paymentTitle: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      marginBottom: 4,
    },
    paymentDate: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
    },
    paymentAmount: {
      alignItems: isRTL ? 'flex-start' : 'flex-end' as 'flex-start' | 'flex-end',
    },
    amountText: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      marginBottom: 2,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'Cairo-Medium',
    },
  };

  // Sample data for payments history
  const recentPayments = [
    { id: '1', title: 'قسط السيارة', amount: '1,250', date: '2024-01-15', type: 'car', status: 'completed' },
    { id: '2', title: 'فاتورة الكهرباء', amount: '320', date: '2024-01-14', type: 'utilities', status: 'completed' },
    { id: '3', title: 'قسط المنزل', amount: '2,800', date: '2024-01-10', type: 'home', status: 'completed' },
    { id: '4', title: 'بطاقة ائتمانية', amount: '890', date: '2024-01-08', type: 'credit', status: 'completed' },
  ];

  // Sample data for commitments
  const commitments = [
    { id: '1', title: 'قسط السيارة', amount: '1,250', dueDate: '2024-02-15', type: 'car', priority: 'high' },
    { id: '2', title: 'فاتورة الإنترنت', amount: '180', dueDate: '2024-02-20', type: 'utilities', priority: 'medium' },
    { id: '3', title: 'قسط المنزل', amount: '2,800', dueDate: '2024-02-01', type: 'home', priority: 'high' },
    { id: '4', title: 'تأمين السيارة', amount: '450', dueDate: '2024-02-25', type: 'insurance', priority: 'low' },
  ];

  const tabs: TabItem[] = [
    {
      id: 'payments',
      title: 'سجل المدفوعات',
      icon: <Clock size={18} color={activeTab === 'payments' ? '#fff' : colors.text} />,
      component: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12 }}>
            {recentPayments.map((payment) => (
              <Card key={payment.id} style={styles.paymentItem}>
                <View style={[styles.paymentContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.paymentIcon, { backgroundColor: colors.success + '20' }]}>
                    {payment.type === 'car' && <CreditCard size={20} color={colors.success} />}
                    {payment.type === 'utilities' && <TrendingUp size={20} color={colors.success} />}
                    {payment.type === 'home' && <Calendar size={20} color={colors.success} />}
                    {payment.type === 'credit' && <CreditCard size={20} color={colors.success} />}
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                      {payment.title}
                    </Text>
                    <Text style={[styles.paymentDate, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {payment.date}
                    </Text>
                  </View>
                  <View style={styles.paymentAmount}>
                    <Text style={[styles.amountText, { color: colors.success }]}>
                      {payment.amount} ر.س
                    </Text>
                    <Text style={[styles.statusText, { color: colors.success }]}>
                      مكتمل
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )
    },
    {
      id: 'commitments',
      title: 'سجل الالتزامات',
      icon: <Calendar size={18} color={activeTab === 'commitments' ? '#fff' : colors.text} />,
      component: (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12 }}>
            {commitments.map((commitment) => (
              <Card key={commitment.id} style={styles.paymentItem}>
                <View style={[styles.paymentContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.paymentIcon, { 
                    backgroundColor: commitment.priority === 'high' ? colors.error + '20' : 
                                   commitment.priority === 'medium' ? colors.warning + '20' : colors.info + '20' 
                  }]}>
                    {commitment.type === 'car' && <CreditCard size={20} color={
                      commitment.priority === 'high' ? colors.error : 
                      commitment.priority === 'medium' ? colors.warning : colors.info
                    } />}
                    {commitment.type === 'utilities' && <TrendingUp size={20} color={
                      commitment.priority === 'high' ? colors.error : 
                      commitment.priority === 'medium' ? colors.warning : colors.info
                    } />}
                    {commitment.type === 'home' && <Calendar size={20} color={
                      commitment.priority === 'high' ? colors.error : 
                      commitment.priority === 'medium' ? colors.warning : colors.info
                    } />}
                    {commitment.type === 'insurance' && <CreditCard size={20} color={
                      commitment.priority === 'high' ? colors.error : 
                      commitment.priority === 'medium' ? colors.warning : colors.info
                    } />}
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                      {commitment.title}
                    </Text>
                    <Text style={[styles.paymentDate, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                      مستحق: {commitment.dueDate}
                    </Text>
                  </View>
                  <View style={styles.paymentAmount}>
                    <Text style={[styles.amountText, { 
                      color: commitment.priority === 'high' ? colors.error : 
                             commitment.priority === 'medium' ? colors.warning : colors.info
                    }]}>
                      {commitment.amount} ر.س
                    </Text>
                    <Text style={[styles.statusText, { 
                      color: commitment.priority === 'high' ? colors.error : 
                             commitment.priority === 'medium' ? colors.warning : colors.info
                    }]}>
                      {commitment.priority === 'high' ? 'عاجل' : 
                       commitment.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header with S-curve design */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>السجلات المالية</Text>
        <Text style={styles.headerSubtitle}>تتبع مدفوعاتك والتزاماتك المالية</Text>
      </LinearGradient>

      {/* Main content with curved design */}
      <View style={styles.mainContent}>
        <View style={styles.fixedRight} />
        <View style={styles.scrollContainer}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  activeTab === tab.id && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id ? styles.activeTabText : styles.inactiveTabText
                ]}>
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {tabs.find(tab => tab.id === activeTab)?.component}
          </View>
        </View>
      </View>
    </View>
  );
};

export default TabNavigation;
