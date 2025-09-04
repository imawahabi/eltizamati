# إعداد قاعدة بيانات Neon

> دليل شامل للانتقال من SQLite إلى قاعدة بيانات Neon PostgreSQL

---

## 🎯 نظرة عامة

يهدف هذا الدليل إلى مساعدتك في الانتقال من استخدام SQLite المحلي إلى قاعدة بيانات Neon السحابية مع الاحتفاظ بكافة البيانات والوظائف.

### معلومات الاتصال الحالية
```
Connection String: 
postgresql://neondb_owner:npg_7q4CPKmIuTOL@ep-cool-forest-adprkcwh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## 📋 خطوات الإعداد

### الخطوة 1: تثبيت المكتبات المطلوبة

```bash
npm install @neondatabase/serverless
npm install --save-dev @types/pg
npm install dotenv
```

### الخطوة 2: إعداد متغيرات البيئة

إنشئ ملف `.env` في جذر المشروع:

```bash
# .env
NEON_DB_URL=postgresql://neondb_owner:npg_7q4CPKmIuTOL@ep-cool-forest-adprkcwh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Development settings
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_URL=https://your-api.com

# Production settings (عند النشر)
# EXPO_PUBLIC_ENV=production
```

### الخطوة 3: إنشاء خدمة قاعدة البيانات الجديدة

إنشئ ملف `lib/neon-database.ts`:

```typescript
import { Pool } from '@neondatabase/serverless';

export class NeonDatabaseService {
  private pool: Pool;
  private static instance: NeonDatabaseService;

  constructor() {
    const connectionString = process.env.NEON_DB_URL;
    if (!connectionString) {
      throw new Error('NEON_DB_URL environment variable is not set');
    }
    
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
  }

  public static getInstance(): NeonDatabaseService {
    if (!NeonDatabaseService.instance) {
      NeonDatabaseService.instance = new NeonDatabaseService();
    }
    return NeonDatabaseService.instance;
  }

  // Execute query method
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Close pool
  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const neonDB = NeonDatabaseService.getInstance();
```

---

## 🗄️ Schema قاعدة البيانات

### إنشاء الجداول في Neon

قم بتشغيل هذا الـ SQL في dashboard الخاص بـ Neon:

```sql
-- Settings table (محسن لـ PostgreSQL)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  user_id UUID DEFAULT gen_random_uuid() UNIQUE,
  language VARCHAR(2) DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  payday_day INTEGER NOT NULL CHECK (payday_day BETWEEN 1 AND 31),
  currency VARCHAR(3) DEFAULT 'KWD',
  strategy_default VARCHAR(20) DEFAULT 'hybrid' 
    CHECK (strategy_default IN ('avalanche', 'snowball', 'hybrid')),
  quiet_hours_from TIME DEFAULT '21:00',
  quiet_hours_to TIME DEFAULT '08:00',
  salary DECIMAL(10,3) NOT NULL CHECK (salary > 0),
  user_name VARCHAR(100),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entities table (الجهات)
CREATE TABLE IF NOT EXISTS entities (
  id SERIAL PRIMARY KEY,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('bank', 'bnpl', 'retailer', 'telco', 'person', 'finance', 'other')),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(kind, name)
);

-- Debts table (الالتزامات)
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('loan', 'bnpl', 'friend', 'oneoff')),
  principal DECIMAL(10,3) NOT NULL CHECK (principal > 0),
  apr DECIMAL(5,2) DEFAULT 0 CHECK (apr >= 0),
  fee_fixed DECIMAL(8,3) DEFAULT 0 CHECK (fee_fixed >= 0),
  start_date DATE NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  total_installments INTEGER CHECK (total_installments > 0),
  remaining_installments INTEGER CHECK (remaining_installments >= 0),
  installment_amount DECIMAL(10,3) CHECK (installment_amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'closed', 'paused')),
  penalty_policy JSONB,
  relationship_factor DECIMAL(3,2) DEFAULT 0 CHECK (relationship_factor BETWEEN 0 AND 1),
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table (الدفعات)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount DECIMAL(10,3) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  method VARCHAR(20) DEFAULT 'cash' 
    CHECK (method IN ('cash', 'knet', 'visa', 'applepay', 'banktransfer', 'other')),
  note TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reminders table (التذكيرات)
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  remind_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'sent', 'snoozed', 'done')),
  reminder_type VARCHAR(20) DEFAULT 'due_date'
    CHECK (reminder_type IN ('due_date', 'overdue', 'custom')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holidays table (العطل)
CREATE TABLE IF NOT EXISTS holidays (
  id SERIAL PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  name VARCHAR(100),
  country VARCHAR(2) DEFAULT 'KW'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_debts_entity_id ON debts(entity_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
CREATE INDEX IF NOT EXISTS idx_payments_debt_id ON payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(remind_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔄 استراتيجية المزامنة

### 1. إعداد نظام Hybrid (محلي + سحابي)

```typescript
// lib/sync-service.ts
import { neonDB } from './neon-database';
import { initializeDatabase as initSQLite } from './database';

export class SyncService {
  private isOnline: boolean = true;

  constructor() {
    this.checkConnectivity();
  }

  async syncData(): Promise<void> {
    if (!this.isOnline) {
      console.log('Offline mode - data will sync when connection is restored');
      return;
    }

    try {
      // Sync settings
      await this.syncSettings();
      
      // Sync entities
      await this.syncEntities();
      
      // Sync debts
      await this.syncDebts();
      
      // Sync payments
      await this.syncPayments();
      
      console.log('Data sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  private async syncSettings(): Promise<void> {
    // Implementation for syncing settings
  }

  private async syncEntities(): Promise<void> {
    // Implementation for syncing entities
  }

  private async syncDebts(): Promise<void> {
    // Implementation for syncing debts
  }

  private async syncPayments(): Promise<void> {
    // Implementation for syncing payments
  }

  private checkConnectivity(): void {
    // Check network connectivity
    // Update this.isOnline accordingly
  }
}
```

### 2. Data Migration من SQLite

```typescript
// lib/migration-service.ts
export class MigrationService {
  async migrateSQLiteToNeon(): Promise<void> {
    try {
      // 1. Export data from SQLite
      const sqliteData = await this.exportSQLiteData();
      
      // 2. Transform data for PostgreSQL
      const transformedData = this.transformData(sqliteData);
      
      // 3. Import to Neon
      await this.importToNeon(transformedData);
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private async exportSQLiteData(): Promise<any> {
    // Export logic from SQLite
  }

  private transformData(data: any): any {
    // Transform SQLite data to PostgreSQL format
    // Handle data type conversions
    // Handle ID mapping (INTEGER -> SERIAL)
  }

  private async importToNeon(data: any): Promise<void> {
    // Import logic to Neon
  }
}
```

---

## 🛡️ الأمان والأداء

### 1. Connection Pooling

```typescript
// lib/connection-pool.ts
import { Pool } from '@neondatabase/serverless';

export class ConnectionPool {
  private static pool: Pool;

  static getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        connectionString: process.env.NEON_DB_URL,
        max: 10, // Maximum connections
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
    return this.pool;
  }
}
```

### 2. Error Handling

```typescript
// lib/error-handler.ts
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function handleDatabaseError(error: any): DatabaseError {
  if (error.code === '23505') {
    return new DatabaseError('Duplicate entry found', 'DUPLICATE_ENTRY');
  }
  
  if (error.code === '23503') {
    return new DatabaseError('Referenced record not found', 'FOREIGN_KEY_VIOLATION');
  }
  
  return new DatabaseError(error.message || 'Unknown database error', 'UNKNOWN_ERROR');
}
```

---

## 🧪 الاختبار والتطوير

### 1. إعداد بيئة التطوير

```bash
# Install development dependencies
npm install --save-dev jest @types/jest
npm install --save-dev supertest
```

### 2. اختبارات قاعدة البيانات

```typescript
// __tests__/database.test.ts
import { neonDB } from '../lib/neon-database';

describe('Database Connection', () => {
  test('should connect successfully', async () => {
    const result = await neonDB.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
  });

  test('should create and read settings', async () => {
    // Test settings CRUD operations
  });
});
```

---

## 📊 المراقبة والصيانة

### 1. Monitoring الأداء

```typescript
// lib/performance-monitor.ts
export class PerformanceMonitor {
  static async logQuery(query: string, duration: number): Promise<void> {
    if (duration > 1000) { // Log slow queries (>1s)
      console.warn(`Slow query detected: ${query} (${duration}ms)`);
    }
  }
}
```

### 2. النسخ الاحتياطي

```sql
-- Backup script (يمكن تشغيله من Neon dashboard)
pg_dump $NEON_DB_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 🚀 التطبيق العملي

### مثال كامل للاستخدام

```typescript
// app/services/debt-service.ts
import { neonDB } from '../../lib/neon-database';
import type { Debt, CreateDebtInput } from '../types/debt';

export class DebtService {
  async createDebt(input: CreateDebtInput): Promise<Debt> {
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
      return result.rows[0];
    } catch (error) {
      console.error('Error creating debt:', error);
      throw new Error('Failed to create debt');
    }
  }

  async getActiveDebts(): Promise<Debt[]> {
    const query = `
      SELECT d.*, e.name as entity_name, e.kind as entity_kind
      FROM debts d
      JOIN entities e ON d.entity_id = e.id
      WHERE d.status = 'active'
      ORDER BY d.due_day ASC
    `;

    try {
      const result = await neonDB.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching active debts:', error);
      throw new Error('Failed to fetch debts');
    }
  }
}
```

---

## 📝 ملاحظات مهمة

### التحديات المحتملة
1. **تحويل أنواع البيانات**: SQLite مرن أكثر من PostgreSQL في أنواع البيانات
2. **Auto-increment IDs**: SQLite يستخدم INTEGER PRIMARY KEY، PostgreSQL يستخدم SERIAL
3. **Date handling**: اختلافات في تعامل مع التواريخ
4. **JSON support**: PostgreSQL يدعم JSON/JSONB بشكل أفضل

### أفضل الممارسات
- استخدم connection pooling لتحسين الأداء
- طبق indexes مناسبة للاستعلامات المتكررة
- استخدم prepared statements لتجنب SQL injection
- طبق data validation على مستوى التطبيق والقاعدة
- احتفظ بنسخ احتياطية منتظمة

---

## 🔗 روابط مفيدة

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL Guide](https://node-postgres.com/)
- [SQL Migration Tools](https://github.com/golang-migrate/migrate)

---

**آخر تحديث:** $(date)
**الإصدار:** 1.0.0
