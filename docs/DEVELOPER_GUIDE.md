# دليل المطور - إلتزاماتي

> دليل شامل للمطورين للمساهمة في تطوير تطبيق إلتزاماتي

---

## 🎯 مرحباً بك في فريق التطوير

هذا الدليل موجه للمطورين الذين يريدون المساهمة في تطوير تطبيق إلتزاماتي أو فهم بنية الكود والأنظمة المستخدمة.

### متطلبات أساسية
- خبرة في React Native و TypeScript
- فهم أساسي لـ Expo framework
- معرفة بقواعد البيانات (SQLite/PostgreSQL)
- خبرة مع Git وGitHub

---

## 🏗️ بنية المشروع

### هيكل المجلدات

```
eltizamati/
├── app/                    # شاشات التطبيق (Expo Router)
│   ├── (tabs)/            # التبويبات الرئيسية
│   ├── onboarding/        # شاشات التهيئة الأولى
│   ├── screens/           # شاشات إضافية
│   └── _layout.tsx        # Layout رئيسي
├── components/             # مكونات UI قابلة لإعادة الاستخدام
│   ├── ui/               # مكونات UI أساسية
│   └── *.tsx             # مكونات متخصصة
├── lib/                   # خدمات ومكتبات مساعدة
│   ├── database.ts       # خدمة قاعدة البيانات
│   ├── calculations.ts   # حسابات مالية
│   ├── dates.ts          # معالجة التواريخ
│   └── *.ts              # خدمات أخرى
├── hooks/                 # React Hooks مخصصة
├── stores/                # إدارة الحالة (Zustand)
├── docs/                  # المستندات
├── assets/                # الصور والأيقونات
└── types/                 # تعريفات TypeScript
```

### أنماط التسمية

```typescript
// Files: camelCase أو kebab-case
// Components: PascalCase
// Variables & Functions: camelCase
// Constants: UPPER_SNAKE_CASE
// Types & Interfaces: PascalCase

// أمثلة
const API_BASE_URL = 'https://api.example.com';
interface UserSettings { ... }
type PaymentMethod = 'cash' | 'card';
function calculateMonthlyPayment() { ... }
const DebtCard = () => { ... };
```

---

## 🛠️ إعداد بيئة التطوير

### 1. نسخ المستودع

```bash
# نسخ المشروع
git clone https://github.com/your-username/eltizamati.git
cd eltizamati

# تثبيت dependencies
npm install

# إعداد متغيرات البيئة
cp .env.example .env
# تعديل .env بالقيم المناسبة
```

### 2. إعداد قاعدة البيانات المحلية

```bash
# تشغيل PostgreSQL محلياً (Docker)
docker run --name eltizamati-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=eltizamati_dev \
  -p 5432:5432 \
  -d postgres:15

# أو استخدام SQLite للتطوير السريع (افتراضي)
# لا حاجة لإعداد إضافي
```

### 3. تشغيل التطبيق

```bash
# تشغيل في وضع التطوير
npm run dev

# تشغيل على جهاز iOS
npm run ios

# تشغيل على جهاز Android
npm run android
```

### 4. أدوات مفيدة

```bash
# فحص النوع
npm run type-check

# فحص الكود
npm run lint

# إصلاح مشاكل التنسيق
npm run lint:fix

# تشغيل الاختبارات
npm test

# مراقبة الاختبارات
npm run test:watch
```

---

## 📚 الأنماط والمعايير

### 1. هيكل المكونات

```typescript
// components/DebtCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Debt } from '../types/debt';
import { formatCurrency } from '../lib/formatting';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface DebtCardProps {
  debt: Debt;
  onPress?: (debt: Debt) => void;
  showProgress?: boolean;
}

export function DebtCard({ 
  debt, 
  onPress, 
  showProgress = true 
}: DebtCardProps) {
  const handlePress = () => {
    onPress?.(debt);
  };

  return (
    <Card>
      <Pressable onPress={handlePress}>
        <View className="p-4">
          <Text className="text-lg font-semibold">
            {debt.entity.name}
          </Text>
          <Text className="text-sm text-gray-600">
            {formatCurrency(debt.remainingAmount)}
          </Text>
          {showProgress && (
            <Badge variant={debt.status === 'active' ? 'success' : 'default'}>
              {debt.status}
            </Badge>
          )}
        </View>
      </Pressable>
    </Card>
  );
}
```

### 2. خدمات API

```typescript
// lib/api/debt-service.ts
import { neonDB } from '../neon-database';
import type { Debt, CreateDebtInput, UpdateDebtInput } from '../../types/debt';

export class DebtService {
  static async getAll(): Promise<Debt[]> {
    const query = `
      SELECT d.*, e.name as entity_name, e.kind as entity_kind
      FROM debts d
      JOIN entities e ON d.entity_id = e.id
      WHERE d.status = 'active'
      ORDER BY d.due_day ASC
    `;

    try {
      const result = await neonDB.query(query);
      return result.rows.map(this.mapRowToDebt);
    } catch (error) {
      console.error('Error fetching debts:', error);
      throw new Error('Failed to fetch debts');
    }
  }

  static async create(input: CreateDebtInput): Promise<Debt> {
    const query = `
      INSERT INTO debts (
        entity_id, kind, principal, apr, start_date, 
        due_day, total_installments, installment_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      input.entityId,
      input.kind,
      input.principal,
      input.apr,
      input.startDate,
      input.dueDay,
      input.totalInstallments,
      input.installmentAmount
    ];

    try {
      const result = await neonDB.query(query, values);
      return this.mapRowToDebt(result.rows[0]);
    } catch (error) {
      console.error('Error creating debt:', error);
      throw new Error('Failed to create debt');
    }
  }

  private static mapRowToDebt(row: any): Debt {
    return {
      id: row.id,
      entityId: row.entity_id,
      entity: {
        id: row.entity_id,
        name: row.entity_name,
        kind: row.entity_kind,
      },
      kind: row.kind,
      principal: row.principal,
      remainingAmount: row.remaining_amount,
      installmentAmount: row.installment_amount,
      apr: row.apr,
      startDate: row.start_date,
      dueDay: row.due_day,
      totalInstallments: row.total_installments,
      remainingInstallments: row.remaining_installments,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

### 3. Hooks مخصصة

```typescript
// hooks/useDebts.ts
import { useState, useEffect } from 'react';
import { DebtService } from '../lib/api/debt-service';
import type { Debt } from '../types/debt';

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DebtService.getAll();
      setDebts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const refresh = () => fetchDebts();

  const addDebt = async (input: CreateDebtInput) => {
    const newDebt = await DebtService.create(input);
    setDebts(prev => [...prev, newDebt]);
    return newDebt;
  };

  return {
    debts,
    loading,
    error,
    refresh,
    addDebt,
  };
}
```

### 4. إدارة الحالة (Zustand)

```typescript
// stores/settings.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types/settings';

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      updateSettings: async (updates) => {
        try {
          set({ isLoading: true, error: null });
          
          const current = get().settings;
          if (!current) throw new Error('No settings to update');
          
          const updated = { ...current, ...updates };
          
          // Save to database
          await SettingsService.update(updated);
          
          set({ 
            settings: updated, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Update failed',
            isLoading: false 
          });
          throw error;
        }
      },

      loadSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const settings = await SettingsService.get();
          set({ settings, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Load failed',
            isLoading: false 
          });
        }
      },

      resetSettings: () => {
        set({ settings: null, isLoading: false, error: null });
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
```

---

## 🧪 الاختبارات

### 1. إعداد Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

### 2. اختبارات الوحدة

```typescript
// __tests__/lib/calculations.test.ts
import { calculateMonthlyPayment, calculateRemainingBalance } from '../lib/calculations';

describe('Financial Calculations', () => {
  test('should calculate monthly payment correctly', () => {
    const result = calculateMonthlyPayment({
      principal: 10000,
      apr: 7.5,
      months: 24
    });
    
    expect(result).toBeCloseTo(456.69, 2);
  });

  test('should calculate remaining balance after payment', () => {
    const result = calculateRemainingBalance({
      currentBalance: 5000,
      payment: 500,
      monthlyInterest: 0.00625 // 7.5% annual / 12
    });
    
    expect(result).toBeCloseTo(4531.25, 2);
  });
});
```

### 3. اختبارات المكونات

```typescript
// __tests__/components/DebtCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DebtCard } from '../components/DebtCard';
import type { Debt } from '../types/debt';

const mockDebt: Debt = {
  id: 1,
  entity: {
    id: 1,
    name: 'بنك الكويت الوطني',
    kind: 'bank'
  },
  kind: 'loan',
  principal: 10000,
  remainingAmount: 8500,
  installmentAmount: 450,
  status: 'active',
  // ... other properties
};

describe('DebtCard', () => {
  test('renders debt information correctly', () => {
    const { getByText } = render(<DebtCard debt={mockDebt} />);
    
    expect(getByText('بنك الكويت الوطني')).toBeTruthy();
    expect(getByText('8.500 د.ك')).toBeTruthy();
  });

  test('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <DebtCard debt={mockDebt} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('debt-card'));
    expect(onPress).toHaveBeenCalledWith(mockDebt);
  });
});
```

### 4. اختبارات التكامل

```typescript
// __tests__/integration/debt-workflow.test.ts
import { DebtService } from '../lib/api/debt-service';
import { PaymentService } from '../lib/api/payment-service';

describe('Debt Management Workflow', () => {
  test('should create debt and record payment', async () => {
    // Create debt
    const debt = await DebtService.create({
      entityId: 1,
      kind: 'loan',
      principal: 10000,
      apr: 7.5,
      startDate: '2024-01-01',
      dueDay: 15,
      totalInstallments: 24,
      installmentAmount: 456.69
    });

    expect(debt.id).toBeDefined();
    expect(debt.remainingAmount).toBe(10000);

    // Record payment
    const payment = await PaymentService.create({
      debtId: debt.id,
      amount: 456.69,
      paymentDate: '2024-01-15',
      method: 'bank_transfer'
    });

    expect(payment.id).toBeDefined();

    // Check updated debt
    const updatedDebt = await DebtService.getById(debt.id);
    expect(updatedDebt.remainingAmount).toBeLessThan(10000);
  });
});
```

---

## 🔄 سير العمل مع Git

### 1. استراتيجية التفريع

```
main                 # النسخة المستقرة للإنتاج
├── develop          # التطوير الرئيسي
├── feature/xxx      # ميزات جديدة
├── bugfix/xxx       # إصلاح أخطاء
├── hotfix/xxx       # إصلاحات طارئة
└── release/x.x.x    # إعداد الإصدارات
```

### 2. قواعد الcommit

```bash
# تنسيق الرسائل
type(scope): description

# الأنواع المتاحة
feat:     # ميزة جديدة
fix:      # إصلاح خطأ
docs:     # تحديث مستندات
style:    # تنسيق كود
refactor: # إعادة هيكلة
test:     # إضافة اختبارات
chore:    # مهام صيانة

# أمثلة
feat(debts): add debt creation form
fix(payments): resolve calculation error
docs(api): update endpoint documentation
```

### 3. عملية Pull Request

```markdown
## قالب Pull Request

### الوصف
وصف مختصر للتغييرات المقترحة

### نوع التغيير
- [ ] ميزة جديدة
- [ ] إصلاح خطأ
- [ ] تحسين أداء
- [ ] تحديث مستندات

### الاختبارات
- [ ] تمت إضافة اختبارات جديدة
- [ ] جميع الاختبارات تمر بنجاح
- [ ] تم اختبار الميزة يدوياً

### قائمة المراجعة
- [ ] الكود يتبع معايير المشروع
- [ ] تمت إضافة التوثيق اللازم
- [ ] لا توجد console.log في الكود النهائي
- [ ] تم اختبار التوافق مع الأجهزة المختلفة

### لقطات الشاشة (إن وجدت)
[إضافة لقطات شاشة للتغييرات في UI]
```

---

## 🏗️ البنية المعمارية

### 1. نمط Clean Architecture

```
Presentation Layer (UI)
├── Screens
├── Components
└── Navigation

Business Logic Layer
├── Services
├── Use Cases
└── Domain Models

Data Layer
├── Repositories
├── Data Sources
└── Database
```

### 2. إدارة الحالة

```typescript
// نمط Repository
interface DebtRepository {
  getAll(): Promise<Debt[]>;
  getById(id: number): Promise<Debt>;
  create(debt: CreateDebtInput): Promise<Debt>;
  update(id: number, updates: UpdateDebtInput): Promise<Debt>;
  delete(id: number): Promise<void>;
}

// تطبيق Repository
export class DatabaseDebtRepository implements DebtRepository {
  async getAll(): Promise<Debt[]> {
    // تطبيق استعلام قاعدة البيانات
  }
  
  // ... باقي الطرق
}

// Use Case
export class GetActiveDebtsUseCase {
  constructor(private debtRepository: DebtRepository) {}
  
  async execute(): Promise<Debt[]> {
    const debts = await this.debtRepository.getAll();
    return debts.filter(debt => debt.status === 'active');
  }
}
```

### 3. Dependency Injection

```typescript
// di/container.ts
import { Container } from 'typedi';
import { DatabaseDebtRepository } from '../repositories/database-debt-repository';
import { GetActiveDebtsUseCase } from '../use-cases/get-active-debts';

// تسجيل dependencies
Container.set('DebtRepository', new DatabaseDebtRepository());
Container.set('GetActiveDebtsUseCase', new GetActiveDebtsUseCase(
  Container.get('DebtRepository')
));

// استخدام في المكونات
export function useActiveDebts() {
  const getActiveDebtsUseCase = Container.get('GetActiveDebtsUseCase');
  // ... باقي المنطق
}
```

---

## 🚀 تحسين الأداء

### 1. تحسين React Native

```typescript
// استخدام React.memo للمكونات
export const DebtCard = React.memo<DebtCardProps>(({ debt, onPress }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.debt.id === nextProps.debt.id &&
         prevProps.debt.remainingAmount === nextProps.debt.remainingAmount;
});

// استخدام useMemo للحسابات المعقدة
function DebtSummary({ debts }: { debts: Debt[] }) {
  const totalRemaining = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  }, [debts]);

  return <Text>{formatCurrency(totalRemaining)}</Text>;
}

// استخدام useCallback للدوال
function DebtsList({ debts }: { debts: Debt[] }) {
  const handleDebtPress = useCallback((debt: Debt) => {
    navigation.navigate('DebtDetail', { debtId: debt.id });
  }, [navigation]);

  return (
    <FlatList
      data={debts}
      renderItem={({ item }) => (
        <DebtCard debt={item} onPress={handleDebtPress} />
      )}
      keyExtractor={item => item.id.toString()}
    />
  );
}
```

### 2. تحسين قاعدة البيانات

```sql
-- Indexes للاستعلامات المتكررة
CREATE INDEX idx_debts_status_due_day ON debts(status, due_day);
CREATE INDEX idx_payments_debt_date ON payments(debt_id, payment_date);

-- Composite indexes للاستعلامات المعقدة
CREATE INDEX idx_debts_entity_status ON debts(entity_id, status);
```

### 3. تحسين الصور والأصول

```bash
# ضغط الصور
npx expo optimize

# استخدام WebP للصور
# تحويل الصور في build time
```

---

## 🛡️ الأمان في التطوير

### 1. معالجة البيانات الحساسة

```typescript
// عدم تخزين كلمات مرور في plain text
import * as SecureStore from 'expo-secure-store';

export class SecureStorage {
  static async storeSecurely(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }
  
  static async getSecurely(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }
}

// تنظيف البيانات المدخلة
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// تشفير البيانات المالية الحساسة
export function encryptSensitiveData(data: string): string {
  // استخدام crypto library قوي
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}
```

### 2. SQL Injection Prevention

```typescript
// استخدام prepared statements دائماً
async function getDebtsByUser(userId: number): Promise<Debt[]> {
  // صحيح ✅
  const query = 'SELECT * FROM debts WHERE user_id = $1';
  return await db.query(query, [userId]);
  
  // خاطئ ❌
  // const query = `SELECT * FROM debts WHERE user_id = ${userId}`;
}
```

### 3. Input Validation

```typescript
// validation schemas
import { z } from 'zod';

const CreateDebtSchema = z.object({
  entityId: z.number().positive(),
  kind: z.enum(['loan', 'bnpl', 'friend', 'oneoff']),
  principal: z.number().positive().max(1000000),
  apr: z.number().min(0).max(100),
  startDate: z.string().datetime(),
  dueDay: z.number().min(1).max(31),
});

export function validateDebtInput(input: unknown): CreateDebtInput {
  return CreateDebtSchema.parse(input);
}
```

---

## 📊 المراقبة والتحليل

### 1. Performance Monitoring

```typescript
// lib/performance.ts
export class PerformanceMonitor {
  static startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      
      // إرسال للtanlytics في الإنتاج
      if (!__DEV__) {
        Analytics.track('performance_timing', {
          operation: label,
          duration,
        });
      }
    };
  }
}

// الاستخدام
const endTiming = PerformanceMonitor.startTiming('debt_calculation');
const result = calculateComplexDebt(data);
endTiming();
```

### 2. Error Tracking

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/react-native';

export class ErrorTracker {
  static captureException(error: Error, context?: Record<string, any>): void {
    console.error('Error occurred:', error);
    
    Sentry.withScope(scope => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setTag(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  }
  
  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    Sentry.captureMessage(message, level);
  }
}
```

### 3. Analytics Integration

```typescript
// lib/analytics.ts
export class Analytics {
  static track(event: string, properties?: Record<string, any>): void {
    if (__DEV__) {
      console.log('Analytics Event:', event, properties);
      return;
    }
    
    // Integration مع analytics provider
    // مثل Segment, Mixpanel, Firebase Analytics
  }
  
  static screen(screenName: string): void {
    this.track('screen_view', { screen_name: screenName });
  }
}
```

---

## 📚 الموارد والمراجع

### وثائق رسمية
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### أدوات مفيدة
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - للdebugging المتقدم
- [Reactotron](https://github.com/infinitered/reactotron) - للمراقبة والDebug

### مجتمعات
- [React Native Community](https://reactnative.dev/community/overview)
- [Expo Community](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

## 🤝 كيفية المساهمة

### 1. اختيار مهمة

```markdown
## نوع المساهمات المرحب بها

### للمبتدئين
- إصلاح أخطاء صغيرة
- تحسين التوثيق
- إضافة اختبارات
- تحسين تنسيق الكود

### للمتقدمين
- ميزات جديدة
- تحسينات الأداء
- إعادة هيكلة معمارية
- تحسينات الأمان
```

### 2. عملية التطوير

1. **Fork المستودع**
2. **إنشاء فرع جديد**: `git checkout -b feature/amazing-feature`
3. **تطوير الميزة** مع كتابة اختبارات
4. **Commit التغييرات**: `git commit -m 'feat: add amazing feature'`
5. **Push للفرع**: `git push origin feature/amazing-feature`
6. **إنشاء Pull Request**

### 3. مراجعة الكود

```markdown
## معايير مراجعة الكود

### الوظيفة
- [ ] الكود يعمل كما هو متوقع
- [ ] تمت معالجة حالات الخطأ
- [ ] الأداء مقبول

### الجودة
- [ ] الكود واضح ومفهوم
- [ ] التسمية واضحة ودقيقة
- [ ] لا يوجد كود مكرر

### الاختبارات
- [ ] تغطية اختبارات كافية
- [ ] اختبارات حالات الحد
- [ ] اختبارات التكامل

### المستندات
- [ ] توثيق APIs الجديدة
- [ ] تحديث README إن لزم
- [ ] تعليقات للكود المعقد
```

---

## 📞 التواصل والدعم

### قنوات التواصل
- **GitHub Issues**: للبلاغات والاقتراحات
- **GitHub Discussions**: للنقاشات العامة
- **Email**: dev@eltizamati.com

### ساعات الدعم
- **العمل**: الأحد - الخميس، 9 صباحاً - 5 مساءً (بتوقيت الكويت)
- **الطوارئ**: متاح عبر GitHub Issues

### تنسيق طلبات المساعدة

```markdown
## قالب طلب المساعدة

### البيئة
- نظام التشغيل: 
- إصدار Node.js:
- إصدار React Native:

### المشكلة
[وصف مفصل للمشكلة]

### الخطوات لإعادة إنتاج المشكلة
1. 
2. 
3. 

### النتيجة المتوقعة
[ما كنت تتوقع أن يحدث]

### النتيجة الفعلية
[ما حدث فعلاً]

### ملفات الكود ذات الصلة
```code
// أضف الكود هنا
```

### لقطات الشاشة/الفيديو
[إن أمكن]
```

---

**آخر تحديث:** $(date)  
**الإصدار:** 1.0.0  
**الحالة:** Active Development
