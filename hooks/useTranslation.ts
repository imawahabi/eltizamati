import { useSettingsStore } from '@/stores/settings';

const translations = {
  ar: {
    appName: 'التزاماتي',
    dashboard: 'الرئيسية',
    debts: 'الالتزامات',
    analytics: 'التحليلات',
    settings: 'الإعدادات',
    currentMonth: 'الشهر الحالي',
    payday: 'يوم الراتب',
    salary: 'الراتب',
    commitments: 'الالتزامات',
    savings: 'الادخار',
    remaining: 'المتبقي',
    alerts: 'التنبيهات',
    addCommitment: 'إضافة التزام',
    noDebts: 'لا توجد التزامات',
    addFirstDebt: 'أضف أول التزام لك',
    general: 'عام',
    financial: 'مالي',
    notifications: 'الإشعارات',
    privacy: 'الخصوصية',
    language: 'اللغة',
    darkMode: 'الوضع الداكن',
    savingsTarget: 'هدف الادخار',
    quietHours: 'ساعات الهدوء',
    exportData: 'تصدير البيانات',
    importData: 'استيراد البيانات',
    currency: 'د.ك',
    day: 'يوم',
    dueSoon: 'مستحق قريبًا',
    overdue: 'متأخر',
    paid: 'مدفوع',
    payNow: 'ادفع الآن',
    postpone: 'تأجيل',
    markPaid: 'تمييز كمدفوع',
  },
  en: {
    appName: 'Eltizamati',
    dashboard: 'Dashboard',
    debts: 'Debts',
    analytics: 'Analytics',
    settings: 'Settings',
    currentMonth: 'Current Month',
    payday: 'Payday',
    salary: 'Salary',
    commitments: 'Commitments',
    savings: 'Savings',
    remaining: 'Remaining',
    alerts: 'Alerts',
    addCommitment: 'Add Commitment',
    noDebts: 'No debts',
    addFirstDebt: 'Add your first debt',
    general: 'General',
    financial: 'Financial',
    notifications: 'Notifications',
    privacy: 'Privacy',
    language: 'Language',
    darkMode: 'Dark Mode',
    savingsTarget: 'Savings Target',
    quietHours: 'Quiet Hours',
    exportData: 'Export Data',
    importData: 'Import Data',
    currency: 'KWD',
    day: 'Day',
    dueSoon: 'Due Soon',
    overdue: 'Overdue',
    paid: 'Paid',
    payNow: 'Pay Now',
    postpone: 'Postpone',
    markPaid: 'Mark as Paid',
  },
};

export function useTranslation() {
  const { language, toggleLanguage } = useSettingsStore();

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return {
    t,
    language,
    toggleLanguage,
  };
}