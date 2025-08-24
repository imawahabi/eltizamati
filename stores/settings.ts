import { create } from 'zustand';
import { getDatabase } from '@/lib/database';

interface SettingsState {
  language: 'ar' | 'en';
  paydayDay: number;
  currency: string;
  strategyDefault: string;
  quietHoursFrom: string;
  quietHoursTo: string;
  savingsTarget: number;
  theme: 'light' | 'dark';
  
  // Actions
  toggleLanguage: () => void;
  toggleTheme: () => void;
  updatePaydayDay: (day: number) => void;
  updateSavingsTarget: (amount: number) => void;
  updateQuietHours: (from: string, to: string) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'ar',
  paydayDay: 25,
  currency: 'KWD',
  strategyDefault: 'hybrid',
  quietHoursFrom: '21:00',
  quietHoursTo: '08:00',
  savingsTarget: 0,
  theme: 'light',

  toggleLanguage: async () => {
    const newLanguage = get().language === 'ar' ? 'en' : 'ar';
    set({ language: newLanguage });
    
    const db = getDatabase();
    await db.runAsync(
      'UPDATE settings SET language = ? WHERE id = 1',
      [newLanguage]
    );
  },

  toggleTheme: async () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    
    const db = getDatabase();
    await db.runAsync(
      'UPDATE settings SET theme = ? WHERE id = 1',
      [newTheme]
    );
  },

  updatePaydayDay: async (day: number) => {
    set({ paydayDay: day });
    
    const db = getDatabase();
    await db.runAsync(
      'UPDATE settings SET payday_day = ? WHERE id = 1',
      [day]
    );
  },

  updateSavingsTarget: async (amount: number) => {
    set({ savingsTarget: amount });
    
    const db = getDatabase();
    await db.runAsync(
      'UPDATE settings SET savings_target = ? WHERE id = 1',
      [amount]
    );
  },

  updateQuietHours: async (from: string, to: string) => {
    set({ quietHoursFrom: from, quietHoursTo: to });
    
    const db = getDatabase();
    await db.runAsync(
      'UPDATE settings SET quiet_hours_from = ?, quiet_hours_to = ? WHERE id = 1',
      [from, to]
    );
  },

  loadSettings: async () => {
    try {
      const db = getDatabase();
      const result = await db.getFirstAsync(
        'SELECT * FROM settings WHERE id = 1'
      ) as any;

      if (result) {
        set({
          language: result.language || 'ar',
          paydayDay: result.payday_day || 25,
          currency: result.currency || 'KWD',
          strategyDefault: result.strategy_default || 'hybrid',
          quietHoursFrom: result.quiet_hours_from || '21:00',
          quietHoursTo: result.quiet_hours_to || '08:00',
          savingsTarget: result.savings_target || 0,
          theme: result.theme || 'light',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
}));