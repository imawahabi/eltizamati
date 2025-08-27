import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Database
import { 
  getFinancialAnalytics,
  getDebtTrends,
  getUserSettings
} from '@/lib/database';

// Components
import { SmartInsights } from '@/components/SmartInsights';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  totalDebt: number;
  monthlyPayments: number;
  completedPayments: number;
  overduePayments: number;
  debtToIncomeRatio: number;
  paymentEfficiency: number;
  savingsRate: number;
}

interface MonthlyTrend {
  month: string;
  totalPayments: number;
  completedPayments: number;
  newDebts: number;
}

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [userSettings, setUserSettings] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [analytics, trends, settings] = await Promise.all([
        getFinancialAnalytics(),
        getDebtTrends(selectedPeriod),
        getUserSettings()
      ]);

      setAnalyticsData(analytics);
      setMonthlyTrends(trends);
      setUserSettings(settings);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('خطأ', 'حدث خطأ في تحميل البيانات التحليلية');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthScoreText = (score: number) => {
    if (score >= 80) return 'ممتازة';
    if (score >= 60) return 'جيدة';
    if (score >= 40) return 'متوسطة';
    return 'تحتاج تحسين';
  };

  const calculateHealthScore = () => {
    if (!analyticsData || !userSettings) return 0;
    
    let score = 100;
    const dti = analyticsData.debtToIncomeRatio;
    const efficiency = analyticsData.paymentEfficiency;
    const savings = analyticsData.savingsRate;
    
    // DTI penalty
    if (dti > 50) score -= 40;
    else if (dti > 30) score -= 20;
    else if (dti > 20) score -= 10;
    
    // Payment efficiency bonus/penalty
    if (efficiency < 70) score -= 20;
    else if (efficiency > 90) score += 10;
    
    // Savings rate bonus/penalty
    if (savings < 5) score -= 15;
    else if (savings > 15) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B63FF" />
          <Text style={styles.loadingText}>جاري تحميل التحليلات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const healthScore = calculateHealthScore();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>التحليلات المالية</Text>
              <Text style={styles.headerSubtitle}>تحليل شامل لوضعك المالي</Text>
            </View>
            
            <View style={styles.headerIcon}>
              <Ionicons name="analytics-outline" size={28} color="#FFFFFF" />
            </View>
          </View>

          {/* Health Score */}
          <View style={styles.healthScoreCard}>
            <View style={styles.healthScoreHeader}>
              <Text style={styles.healthScoreTitle}>نقاط الصحة المالية</Text>
              <View style={[
                styles.healthScoreBadge,
                { backgroundColor: getHealthScoreColor(healthScore) }
              ]}>
                <Text style={styles.healthScoreValue}>{healthScore}</Text>
              </View>
            </View>
            <Text style={[
              styles.healthScoreText,
              { color: getHealthScoreColor(healthScore) }
            ]}>
              {getHealthScoreText(healthScore)}
            </Text>
            <View style={styles.healthScoreBar}>
              <View 
                style={[
                  styles.healthScoreFill,
                  { 
                    width: `${healthScore}%`,
                    backgroundColor: getHealthScoreColor(healthScore)
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0B63FF"
            colors={['#0B63FF']}
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[
            { key: '3months', label: '3 أشهر' },
            { key: '6months', label: '6 أشهر' },
            { key: '1year', label: 'سنة' },
            { key: 'all', label: 'الكل' },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.periodButtonTextActive
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>المؤشرات الرئيسية</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name="trending-down" size={24} color="#EF4444" />
              </View>
              <Text style={styles.metricValue}>
                {formatPercentage(analyticsData?.debtToIncomeRatio || 0)}
              </Text>
              <Text style={styles.metricLabel}>نسبة الدين للدخل</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
              <Text style={styles.metricValue}>
                {formatPercentage(analyticsData?.paymentEfficiency || 0)}
              </Text>
              <Text style={styles.metricLabel}>كفاءة السداد</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name="wallet" size={24} color="#0B63FF" />
              </View>
              <Text style={styles.metricValue}>
                {formatPercentage(analyticsData?.savingsRate || 0)}
              </Text>
              <Text style={styles.metricLabel}>معدل الادخار</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name="calendar" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.metricValue}>
                {analyticsData?.completedPayments || 0}
              </Text>
              <Text style={styles.metricLabel}>دفعات مكتملة</Text>
            </View>
          </View>
        </View>

        {/* Smart Insights */}
        {analyticsData && (
          <SmartInsights 
            data={{
              totalDebt: analyticsData.totalDebt,
              monthlyPayments: analyticsData.monthlyPayments,
              completedPayments: analyticsData.completedPayments,
              overduePayments: analyticsData.overduePayments,
            }}
          />
        )}

        {/* Monthly Trends */}
        <View style={styles.trendsContainer}>
          <Text style={styles.sectionTitle}>الاتجاهات الشهرية</Text>
          
          {monthlyTrends.length > 0 ? (
            <View style={styles.trendsChart}>
              {monthlyTrends.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendMonth}>{trend.month}</Text>
                  <View style={styles.trendBars}>
                    <View style={styles.trendBar}>
                      <View 
                        style={[
                          styles.trendBarFill,
                          { 
                            height: `${(trend.totalPayments / Math.max(...monthlyTrends.map(t => t.totalPayments))) * 100}%`,
                            backgroundColor: '#0B63FF'
                          }
                        ]} 
                      />
                    </View>
                    <View style={styles.trendBar}>
                      <View 
                        style={[
                          styles.trendBarFill,
                          { 
                            height: `${(trend.completedPayments / Math.max(...monthlyTrends.map(t => t.completedPayments))) * 100}%`,
                            backgroundColor: '#10B981'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  <Text style={styles.trendValue}>{trend.totalPayments}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyTrends}>
              <Ionicons name="bar-chart-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTrendsText}>لا توجد بيانات كافية</Text>
              <Text style={styles.emptyTrendsSubtext}>ابدأ بتسجيل المدفوعات لرؤية الاتجاهات</Text>
            </View>
          )}
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsContainer}>
          <Text style={styles.sectionTitle}>التوصيات المالية</Text>
          
          <View style={styles.recommendationsList}>
            {healthScore < 60 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: '#FEF3F2' }]}>
                  <Ionicons name="warning" size={20} color="#EF4444" />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>تحسين نسبة الدين للدخل</Text>
                  <Text style={styles.recommendationText}>
                    نسبة الديون مرتفعة، حاول تقليل الالتزامات الجديدة وزيادة المدفوعات
                  </Text>
                </View>
              </View>
            )}

            {(analyticsData?.savingsRate || 0) < 10 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="wallet" size={20} color="#F59E0B" />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>زيادة معدل الادخار</Text>
                  <Text style={styles.recommendationText}>
                    حاول توفير 10-20% من دخلك الشهري لبناء صندوق طوارئ
                  </Text>
                </View>
              </View>
            )}

            {(analyticsData?.paymentEfficiency || 0) < 80 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="time" size={20} color="#0B63FF" />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>تحسين انتظام المدفوعات</Text>
                  <Text style={styles.recommendationText}>
                    فعّل التنبيهات والدفع التلقائي لتجنب التأخير في السداد
                  </Text>
                </View>
              </View>
            )}

            {healthScore >= 80 && (
              <View style={styles.recommendationItem}>
                <View style={[styles.recommendationIcon, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View style={styles.recommendationContent}>
                  <Text style={styles.recommendationTitle}>أداء ممتاز!</Text>
                  <Text style={styles.recommendationText}>
                    وضعك المالي ممتاز، استمر في هذا النهج وفكر في استثمارات إضافية
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Cairo-Regular',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Health Score
  healthScoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthScoreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  healthScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Cairo-Bold',
  },
  healthScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
    marginBottom: 12,
  },
  healthScoreBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthScoreFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#0B63FF',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },

  // Metrics
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (screenWidth - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    textAlign: 'center',
  },

  // Trends
  trendsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  trendsChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendMonth: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    marginBottom: 8,
  },
  trendBars: {
    flexDirection: 'row',
    gap: 4,
    height: 120,
    alignItems: 'flex-end',
  },
  trendBar: {
    width: 12,
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  trendValue: {
    fontSize: 12,
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginTop: 8,
  },
  emptyTrends: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyTrendsText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Cairo-Medium',
    marginTop: 16,
  },
  emptyTrendsSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Cairo-Regular',
    marginTop: 4,
    textAlign: 'center',
  },

  // Recommendations
  recommendationsContainer: {
    paddingHorizontal: 20,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#0B63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: 'Cairo-Bold',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Cairo-Regular',
    lineHeight: 20,
  },
});
