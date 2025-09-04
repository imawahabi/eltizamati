import { Pool, neonConfig } from '@neondatabase/serverless';

// تكوين Neon للعمل مع React Native/Expo
neonConfig.fetchConnectionCache = true;

const connectionString = process.env.NEON_DB_URL || 
  'postgresql://neondb_owner:npg_7q4CPKmIuTOL@ep-cool-forest-adprkcwh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// إنشاء Pool للاتصالات
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// خدمة قاعدة البيانات الرئيسية
export class NeonDatabaseService {
  private static instance: NeonDatabaseService;
  private pool: Pool;

  private constructor() {
    this.pool = pool;
  }

  public static getInstance(): NeonDatabaseService {
    if (!NeonDatabaseService.instance) {
      NeonDatabaseService.instance = new NeonDatabaseService();
    }
    return NeonDatabaseService.instance;
  }

  // تنفيذ استعلام SQL مباشر
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

  // اختبار الاتصال
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as test');
      return result.rows[0]?.test === 1;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // إغلاق الـ pool
  async close(): Promise<void> {
    await this.pool.end();
  }

  // الحصول على pool للاستخدام في الخدمات الفرعية
  getPool(): Pool {
    return this.pool;
  }

  // تشغيل الـ migrations
  async runMigrations(): Promise<void> {
    const migrations = [
      this.createSettingsTable,
      this.createEntitiesTable,
      this.createDebtsTable,
      this.createPaymentsTable,
      this.createRemindersTable,
      this.createHolidaysTable,
      this.createIndexes,
      this.createTriggers,
      this.seedKuwaitData,
    ];

    for (const migration of migrations) {
      try {
        await migration.call(this);
        console.log(`Migration completed: ${migration.name}`);
      } catch (error) {
        console.error(`Migration failed: ${migration.name}`, error);
        throw error;
      }
    }
  }

  // إنشاء جدول الإعدادات
  private async createSettingsTable(): Promise<void> {
    const query = `
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
    `;
    await this.query(query);
  }

  // إنشاء جدول الجهات
  private async createEntitiesTable(): Promise<void> {
    const query = `
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
    `;
    await this.query(query);
  }

  // إنشاء جدول الالتزامات
  private async createDebtsTable(): Promise<void> {
    const query = `
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
    `;
    await this.query(query);
  }

  // إنشاء جدول الدفعات
  private async createPaymentsTable(): Promise<void> {
    const query = `
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
    `;
    await this.query(query);
  }

  // إنشاء جدول التذكيرات
  private async createRemindersTable(): Promise<void> {
    const query = `
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
    `;
    await this.query(query);
  }

  // إنشاء جدول العطل
  private async createHolidaysTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        holiday_date DATE NOT NULL UNIQUE,
        name VARCHAR(100),
        country VARCHAR(2) DEFAULT 'KW'
      );
    `;
    await this.query(query);
  }

  // إنشاء الـ indexes للأداء
  private async createIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_debts_entity_id ON debts(entity_id);',
      'CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);',
      'CREATE INDEX IF NOT EXISTS idx_debts_due_day ON debts(due_day);',
      'CREATE INDEX IF NOT EXISTS idx_payments_debt_id ON payments(debt_id);',
      'CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);',
      'CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(remind_date);',
      'CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);',
      'CREATE INDEX IF NOT EXISTS idx_entities_kind ON entities(kind);',
      'CREATE INDEX IF NOT EXISTS idx_debts_entity_status ON debts(entity_id, status);',
    ];

    for (const indexQuery of indexes) {
      await this.query(indexQuery);
    }
  }

  // إنشاء triggers للـ updated_at
  private async createTriggers(): Promise<void> {
    // إنشاء function للـ trigger
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    await this.query(triggerFunction);

    // إنشاء triggers للجداول
    const triggers = [
      'CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
    ];

    for (const triggerQuery of triggers) {
      try {
        await this.query(triggerQuery);
      } catch (error) {
        // تجاهل الخطأ إذا كان الـ trigger موجود بالفعل
        if (!(error instanceof Error) || !error.message.includes('already exists')) {
          throw error;
        }
      }
    }
  }

  // إدخال البيانات الأولية للكويت
  private async seedKuwaitData(): Promise<void> {
    // التحقق من وجود البيانات
    const entitiesCount = await this.query('SELECT COUNT(*) FROM entities');
    if (entitiesCount.rows[0].count > 0) {
      console.log('Seed data already exists, skipping...');
      return;
    }

    const entities = [
      // البنوك
      ['bank', 'بنك الكويت الوطني (NBK)', '+965 1801801'],
      ['bank', 'بيت التمويل الكويتي (KFH)', '+965 1866866'],
      ['bank', 'بنك برقان', '+965 1804080'],
      ['bank', 'بنك الخليج', '+965 1805805'],
      ['bank', 'البنك الأهلي الكويتي (ABK)', '+965 1899899'],
      ['bank', 'البنك التجاري الكويتي (CBK)', '+965 1888225'],
      ['bank', 'بنك بوبيان', '+965 1820082'],
      ['bank', 'بنك وربة', '+965 1825555'],

      // شركات التجزئة والإلكترونيات
      ['retailer', 'X-cite (الغانم)', '+965 1832832'],
      ['retailer', 'Best Al-Yousifi', '+965 1828000'],
      ['retailer', 'Eureka', '+965 1803535'],
      ['retailer', 'هاتف 2000', '+965 1805777'],
      ['retailer', 'Digits', '+965 1821821'],

      // شركات التمويل
      ['finance', 'شركة التسهيلات التجارية (CFC)', '+965 2208800'],
      ['finance', 'الملا للتمويل', '+965 1828555'],
      ['finance', 'المنار للتمويل', '+965 2220228'],
      ['finance', 'رساميل للتمويل', '+965 1812812'],

      // خدمات الدفع والـ BNPL
      ['bnpl', 'Tabby', null],
      ['bnpl', 'Deema', null],

      // شركات الاتصالات
      ['telco', 'زين الكويت', '+965 107'],
      ['telco', 'أوريدو الكويت', '+965 101'],
      ['telco', 'stc الكويت', '+965 102'],
    ];

    for (const [kind, name, phone] of entities) {
      await this.query(
        'INSERT INTO entities (kind, name, phone) VALUES ($1, $2, $3) ON CONFLICT (kind, name) DO NOTHING',
        [kind, name, phone]
      );
    }

    // إضافة العطل الكويتية
    const holidays = [
      ['2024-01-01', 'رأس السنة الميلادية'],
      ['2024-02-25', 'العيد الوطني'],
      ['2024-02-26', 'عيد التحرير'],
      ['2024-04-08', 'الإسراء والمعراج'],
      ['2024-04-10', 'أول أيام رمضان'],
      ['2024-05-09', 'عيد الفطر'],
      ['2024-05-10', 'ثاني أيام عيد الفطر'],
      ['2024-05-11', 'ثالث أيام عيد الفطر'],
      ['2024-06-16', 'عيد الأضحى'],
      ['2024-06-17', 'ثاني أيام عيد الأضحى'],
      ['2024-06-18', 'ثالث أيام عيد الأضحى'],
      ['2024-07-07', 'رأس السنة الهجرية'],
      ['2024-09-15', 'المولد النبوي'],
    ];

    for (const [date, name] of holidays) {
      await this.query(
        'INSERT INTO holidays (holiday_date, name) VALUES ($1, $2) ON CONFLICT (holiday_date) DO NOTHING',
        [date, name]
      );
    }

    console.log('Kuwait seed data inserted successfully');
  }

  // حساب إحصائيات مفيدة
  async getStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    const tables = ['settings', 'entities', 'debts', 'payments', 'reminders', 'holidays'];
    
    for (const table of tables) {
      const result = await this.query(`SELECT COUNT(*) FROM ${table}`);
      stats[table] = parseInt(result.rows[0].count);
    }

    return stats;
  }
}

// إنشاء instance عام
export const neonDB = NeonDatabaseService.getInstance();

// خدمات محددة لكل جدول
export class SettingsService {
  static async get(): Promise<any> {
    const result = await neonDB.query('SELECT * FROM settings WHERE id = 1');
    return result.rows[0] || null;
  }

  static async create(settings: any): Promise<any> {
    const query = `
      INSERT INTO settings (payday_day, salary, user_name, language)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        payday_day = EXCLUDED.payday_day,
        salary = EXCLUDED.salary,
        user_name = EXCLUDED.user_name,
        language = EXCLUDED.language,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await neonDB.query(query, [
      settings.payday_day,
      settings.salary,
      settings.user_name,
      settings.language || 'ar'
    ]);
    return result.rows[0];
  }

  static async update(updates: any): Promise<any> {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [1, ...Object.values(updates)];
    
    const query = `
      UPDATE settings 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    const result = await neonDB.query(query, values);
    return result.rows[0];
  }
}

export class EntitiesService {
  static async getAll(kind?: string): Promise<any[]> {
    let query = 'SELECT * FROM entities';
    const params = [];
    
    if (kind) {
      query += ' WHERE kind = $1';
      params.push(kind);
    }
    
    query += ' ORDER BY kind, name';
    
    const result = await neonDB.query(query, params);
    return result.rows;
  }

  static async getById(id: number): Promise<any> {
    const result = await neonDB.query('SELECT * FROM entities WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(entity: any): Promise<any> {
    const query = `
      INSERT INTO entities (kind, name, phone, note)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await neonDB.query(query, [
      entity.kind,
      entity.name,
      entity.phone,
      entity.note
    ]);
    return result.rows[0];
  }
}

export class DebtsService {
  static async getAll(status = 'active'): Promise<any[]> {
    const query = `
      SELECT d.*, e.name as entity_name, e.kind as entity_kind, e.phone as entity_phone
      FROM debts d
      JOIN entities e ON d.entity_id = e.id
      WHERE d.status = $1
      ORDER BY d.due_day ASC
    `;
    const result = await neonDB.query(query, [status]);
    return result.rows;
  }

  static async getById(id: number): Promise<any> {
    const query = `
      SELECT d.*, e.name as entity_name, e.kind as entity_kind, e.phone as entity_phone
      FROM debts d
      JOIN entities e ON d.entity_id = e.id
      WHERE d.id = $1
    `;
    const result = await neonDB.query(query, [id]);
    return result.rows[0];
  }

  static async create(debt: any): Promise<any> {
    const query = `
      INSERT INTO debts (
        entity_id, kind, principal, apr, fee_fixed, start_date, 
        due_day, total_installments, remaining_installments, 
        installment_amount, penalty_policy, relationship_factor, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const result = await neonDB.query(query, [
      debt.entity_id,
      debt.kind,
      debt.principal,
      debt.apr || 0,
      debt.fee_fixed || 0,
      debt.start_date,
      debt.due_day,
      debt.total_installments,
      debt.remaining_installments || debt.total_installments,
      debt.installment_amount,
      JSON.stringify(debt.penalty_policy || {}),
      debt.relationship_factor || 0,
      debt.tags
    ]);
    return result.rows[0];
  }

  static async updateRemainingAmount(id: number, amount: number): Promise<void> {
    await neonDB.query(
      'UPDATE debts SET remaining_installments = remaining_installments - 1 WHERE id = $1 AND remaining_installments > 0',
      [id]
    );
  }
}

export class PaymentsService {
  static async getByDebtId(debtId: number): Promise<any[]> {
    const query = `
      SELECT p.*, d.entity_id, e.name as entity_name
      FROM payments p
      JOIN debts d ON p.debt_id = d.id
      JOIN entities e ON d.entity_id = e.id
      WHERE p.debt_id = $1
      ORDER BY p.payment_date DESC
    `;
    const result = await neonDB.query(query, [debtId]);
    return result.rows;
  }

  static async create(payment: any): Promise<any> {
    // إنشاء transaction للتأكد من تحديث الدين أيضاً
    const client = await neonDB.getPool().connect();
    try {
      await client.query('BEGIN');
      
      // إضافة الدفعة
      const paymentQuery = `
        INSERT INTO payments (debt_id, amount, payment_date, method, note, receipt_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const paymentResult = await client.query(paymentQuery, [
        payment.debt_id,
        payment.amount,
        payment.payment_date,
        payment.method || 'cash',
        payment.note,
        payment.receipt_url
      ]);

      // تحديث الدين
      await client.query(
        'UPDATE debts SET remaining_installments = GREATEST(0, remaining_installments - 1) WHERE id = $1',
        [payment.debt_id]
      );

      await client.query('COMMIT');
      return paymentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// تصدير الـ pool للاستخدام المباشر إذا لزم الأمر
export { pool };
