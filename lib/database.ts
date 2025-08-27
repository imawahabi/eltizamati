import * as SQLite from 'expo-sqlite';

const DB_NAME = 'eltizamati.db';
let db: SQLite.SQLiteDatabase;

// Database schema based on project specifications
export async function initializeDatabase() {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await runMigrations();
    await seedKuwaitData();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function runMigrations() {
  try {
    // Check if settings table exists and has the correct schema
    const tableInfo = await db.getAllAsync("PRAGMA table_info(settings)") as any[];
    const existingColumns = tableInfo.map(col => col.name);

    const requiredColumns = ['id', 'language', 'payday_day', 'currency', 'strategy_default', 'quiet_hours_from', 'quiet_hours_to', 'salary', 'user_name', 'onboarding_completed'];

    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log('Settings table is missing columns:', missingColumns);
      console.log('Recreating settings table...');

      // Drop and recreate the settings table
      await db.execAsync('DROP TABLE IF EXISTS settings;');

      await db.execAsync(`
        CREATE TABLE settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          language TEXT DEFAULT 'ar',
          payday_day INTEGER NOT NULL,
          currency TEXT DEFAULT 'KWD',
          strategy_default TEXT DEFAULT 'hybrid',
          quiet_hours_from TEXT DEFAULT '21:00',
          quiet_hours_to TEXT DEFAULT '08:00',
          salary REAL NOT NULL,
          user_name TEXT,
          onboarding_completed INTEGER DEFAULT 0
        );
      `);

      console.log('Settings table recreated successfully');
    } else {
      console.log('Settings table schema is correct');
    }

    // Entities table - banks, BNPL, retailers, persons, etc.
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        note TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(kind, name)
      );
    `);

    // Debts table - main obligations/commitments
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS debts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id INTEGER NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
        kind TEXT NOT NULL,
        principal REAL NOT NULL,
        apr REAL DEFAULT 0,
        fee_fixed REAL DEFAULT 0,
        start_date TEXT NOT NULL,
        due_day INTEGER NOT NULL,
        total_installments INTEGER,
        remaining_installments INTEGER,
        installment_amount REAL,
        status TEXT NOT NULL DEFAULT 'active',
        penalty_policy TEXT,
        relationship_factor REAL DEFAULT 0,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Payments table - supports multiple payments per month
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        method TEXT DEFAULT 'cash',
        note TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Reminders table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
        remind_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Holidays table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS holidays (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        name TEXT
      );
    `);

    // Create indexes for performance
    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_debts_entity ON debts(entity_id);`);
    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_payments_debt ON payments(debt_id);`);
    await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(remind_date);`);

    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  }
}

async function seedKuwaitData() {
  try {
    // Check if entities already exist
    const existingEntities = await db.getFirstAsync('SELECT COUNT(*) as count FROM entities') as any;
    if (existingEntities?.count > 0) {
      console.log('Entities already seeded');
      return;
    }

    // Kuwait banks
    const banks = [
      'National Bank of Kuwait (NBK)',
      'Kuwait Finance House (KFH)',
      'Gulf Bank',
      'Commercial Bank of Kuwait (CBK)',
      'Al Ahli Bank of Kuwait (ABK)',
      'Burgan Bank',
      'Boubyan Bank',
      'Kuwait International Bank (KIB)',
      'Warba Bank',
      'Industrial Bank of Kuwait (IBK)'
    ];

    // Retailers and electronics
    const retailers = [
      'X-cite (Alghanim)',
      'Best Al-Yousifi',
      'Eureka',
      'Digits',
      'Hatef 2000'
    ];

    // Finance companies
    const financeCompanies = [
      'Commercial Facilities Company (CFC)',
      'Al Mulla Finance',
      'Al Manar',
      'KFIC Finance'
    ];

    // BNPL services
    const bnplServices = [
      'Tabby',
      'Deema'
    ];

    // Telecom companies
    const telecomCompanies = [
      'Zain Kuwait',
      'Ooredoo Kuwait',
      'stc Kuwait'
    ];

    // Insert all entities
    for (const bank of banks) {
      await db.runAsync('INSERT INTO entities (kind, name) VALUES (?, ?)', ['bank', bank]);
    }

    for (const retailer of retailers) {
      await db.runAsync('INSERT INTO entities (kind, name) VALUES (?, ?)', ['retailer', retailer]);
    }

    for (const finance of financeCompanies) {
      await db.runAsync('INSERT INTO entities (kind, name) VALUES (?, ?)', ['finance', finance]);
    }

    for (const bnpl of bnplServices) {
      await db.runAsync('INSERT INTO entities (kind, name) VALUES (?, ?)', ['bnpl', bnpl]);
    }

    for (const telco of telecomCompanies) {
      await db.runAsync('INSERT INTO entities (kind, name) VALUES (?, ?)', ['telco', telco]);
    }

    // Add some common Kuwait holidays
    const holidays = [
      { date: '2025-01-01', name: 'New Year' },
      { date: '2025-02-25', name: 'National Day' },
      { date: '2025-02-26', name: 'Liberation Day' }
    ];

    for (const holiday of holidays) {
      await db.runAsync('INSERT INTO holidays (date, name) VALUES (?, ?)', [holiday.date, holiday.name]);
    }

    console.log('Kuwait data seeded successfully');
  } catch (error) {
    console.error('Error seeding Kuwait data:', error);
  }
}

export function getDatabase() {
  return db;
}

// Settings management
export async function getDebtById(debtId: number) {
  return await db.getFirstAsync('SELECT * FROM debts WHERE id = ?', [debtId]);
}

export async function getSettings() {
  const settings = await db.getFirstAsync('SELECT * FROM settings WHERE id = 1') as any;
  return settings;
}

export async function updateSettings(settingsData: any) {
  const existing = await getSettings();
  
  if (existing) {
    const setClause = Object.keys(settingsData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(settingsData) as any[];
    await db.runAsync(`UPDATE settings SET ${setClause} WHERE id = 1`, values);
  } else {
    const columns = Object.keys(settingsData).join(', ');
    const placeholders = Object.keys(settingsData).map(() => '?').join(', ');
    const values = Object.values(settingsData) as any[];
    await db.runAsync(`INSERT INTO settings (id, ${columns}) VALUES (1, ${placeholders})`, values);
  }
}

export async function completeOnboarding(userData: { name: string; salary: number; payday_day: number }) {
  await updateSettings({
    user_name: userData.name,
    salary: userData.salary,
    payday_day: userData.payday_day,
    onboarding_completed: 1
  });
}

export async function checkOnboardingStatus() {
  const settings = await getSettings();
  return settings?.onboarding_completed === 1;
}

// Entity management
export async function getEntities(kind?: string) {
  if (kind) {
    return await db.getAllAsync('SELECT * FROM entities WHERE kind = ? ORDER BY name ASC', [kind]);
  }
  return await db.getAllAsync('SELECT * FROM entities ORDER BY kind ASC, name ASC');
}

export async function addEntity(entityData: { kind: string; name: string; phone?: string; note?: string }) {
  const result = await db.runAsync(
    'INSERT INTO entities (kind, name, phone, note) VALUES (?, ?, ?, ?)',
    [entityData.kind, entityData.name, entityData.phone || null, entityData.note || null]
  );
  return result.lastInsertRowId;
}

// Debt management
export async function getDebts(status: string = 'active') {
  const debts = await db.getAllAsync(`
    SELECT d.*, e.name as entity_name, e.kind as entity_kind
    FROM debts d
    JOIN entities e ON d.entity_id = e.id
    WHERE d.status = ?
    ORDER BY d.due_day ASC
  `, [status]);
  return debts;
}

export async function addDebt(debtData: any) {
  const result = await db.runAsync(`
    INSERT INTO debts (
      entity_id, kind, principal, apr, fee_fixed, start_date, due_day,
      total_installments, remaining_installments, installment_amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    debtData.entity_id,
    debtData.kind,
    debtData.principal,
    debtData.apr || 0,
    debtData.fee_fixed || 0,
    debtData.start_date,
    debtData.due_day,
    debtData.total_installments,
    debtData.total_installments, // initially remaining = total
    debtData.installment_amount,
    'active'
  ]);
  
  return result.lastInsertRowId;
}

export async function updateDebt(debtId: number, updates: any) {
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates) as any[];
  
  await db.runAsync(`UPDATE debts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, debtId]);
}

// Payment management - supports multiple payments per installment
export async function addPayment(paymentData: { debt_id: number; amount: number; date: string; method?: string; note?: string }) {
  const result = await db.runAsync(
    'INSERT INTO payments (debt_id, amount, date, method, note) VALUES (?, ?, ?, ?, ?)',
    [
      paymentData.debt_id,
      paymentData.amount,
      paymentData.date,
      paymentData.method || 'cash',
      paymentData.note || null
    ]
  );

  // Update debt remaining installments if payment covers monthly amount
  const debt = await db.getFirstAsync('SELECT * FROM debts WHERE id = ?', [paymentData.debt_id]) as any;
  if (debt) {
    // Get total payments for current month
    const currentMonth = paymentData.date.substring(0, 7); // YYYY-MM
    const monthlyPayments = await db.getFirstAsync(`
      SELECT SUM(amount) as total
      FROM payments
      WHERE debt_id = ? AND date LIKE ?
    `, [paymentData.debt_id, `${currentMonth}%`]) as any;

    // If monthly payments cover installment amount, decrease remaining installments
    if (monthlyPayments?.total >= debt.installment_amount && debt.remaining_installments > 0) {
      await db.runAsync(
        'UPDATE debts SET remaining_installments = remaining_installments - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [paymentData.debt_id]
      );
    }
  }

  return result.lastInsertRowId;
}

export async function getPayments(debtId?: number) {
  if (debtId) {
    return await db.getAllAsync(`
      SELECT p.*, d.principal, e.name as entity_name
      FROM payments p
      JOIN debts d ON p.debt_id = d.id
      JOIN entities e ON d.entity_id = e.id
      WHERE p.debt_id = ?
      ORDER BY p.date DESC
    `, [debtId]);
  }
  
  return await db.getAllAsync(`
    SELECT p.*, d.principal, e.name as entity_name
    FROM payments p
    JOIN debts d ON p.debt_id = d.id
    JOIN entities e ON d.entity_id = e.id
    ORDER BY p.date DESC
  `);
}

// Upcoming payments
export async function getUpcomingPayments(days: number = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  const activeDebts = await getDebts('active');
  const upcomingPayments = [];
  
  for (const debt of activeDebts) {
    const debtRecord = debt as any;
    const dueDate = new Date();
    dueDate.setDate(debtRecord.due_day);
    
    // If due day has passed this month, set to next month
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
    
    if (dueDate <= futureDate) {
      upcomingPayments.push({
        ...debtRecord,
        due_date: dueDate.toISOString().split('T')[0],
        amount: debtRecord.installment_amount,
        status: dueDate < today ? 'overdue' : 'pending'
      });
    }
  }
  
  return upcomingPayments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
}

// Reminder management
export async function scheduleReminder(debtId: number, remindDate: string) {
  const result = await db.runAsync(
    'INSERT INTO reminders (debt_id, remind_date) VALUES (?, ?)',
    [debtId, remindDate]
  );
  return result.lastInsertRowId;
}

export async function getPendingReminders() {
  const today = new Date().toISOString().split('T')[0];
  return await db.getAllAsync(`
    SELECT r.*, d.installment_amount, e.name as entity_name
    FROM reminders r
    JOIN debts d ON r.debt_id = d.id
    JOIN entities e ON d.entity_id = e.id
    WHERE r.remind_date <= ? AND r.status = 'pending'
    ORDER BY r.remind_date ASC
  `, [today]);
}

export async function markReminderSent(reminderId: number) {
  await db.runAsync(
    'UPDATE reminders SET status = "sent" WHERE id = ?',
    [reminderId]
  );
}

// Missing functions that are imported in the app
export async function getUserSettings() {
  const settings = await getSettings();
  if (!settings) {
    return {
      name: 'المستخدم',
      salary: 0,
      paydayDay: 25,
      currency: 'KWD',
      language: 'ar'
    };
  }
  
  return {
    name: settings.user_name || 'المستخدم',
    salary: settings.salary || 0,
    paydayDay: settings.payday_day || 25,
    currency: settings.currency || 'KWD',
    language: settings.language || 'ar'
  };
}

export async function getFinancialSummary() {
  const settings = await getSettings();
  const activeDebts = await getDebts('active');
  const completedPayments = await db.getAllAsync('SELECT COUNT(*) as count FROM payments');
  
  const totalDebts = activeDebts.reduce((sum: number, debt: any) => {
    return sum + (debt.principal - (debt.installment_amount * (debt.total_installments - debt.remaining_installments)));
  }, 0);
  
  const monthlyPayments = activeDebts.reduce((sum: number, debt: any) => sum + debt.installment_amount, 0);
  
  return {
    totalSalary: settings?.salary || 0,
    totalDebts,
    monthlyPayments,
    remainingBalance: (settings?.salary || 0) - monthlyPayments,
    completedPayments: completedPayments[0]?.count || 0,
    overduePayments: 0 // TODO: Calculate actual overdue payments
  };
}

export async function getActiveDebts() {
  return await getDebts('active');
}

export async function getDebtsByCategory() {
  const debts = await db.getAllAsync(`
    SELECT e.kind, COUNT(*) as count, SUM(d.principal) as total_amount
    FROM debts d
    JOIN entities e ON d.entity_id = e.id
    WHERE d.status = 'active'
    GROUP BY e.kind
  `);
  return debts;
}

export async function getRecentPayments(limit: number = 10) {
  return await db.getAllAsync(`
    SELECT p.*, d.installment_amount, e.name as entity_name
    FROM payments p
    JOIN debts d ON p.debt_id = d.id
    JOIN entities e ON d.entity_id = e.id
    ORDER BY p.payment_date DESC
    LIMIT ?
  `, [limit]);
}

export async function getFinancialAnalytics() {
  const settings = await getSettings();
  const summary = await getFinancialSummary();
  
  const debtToIncomeRatio = settings?.salary ? (summary.totalDebts / settings.salary) * 100 : 0;
  const paymentEfficiency = 85; // Mock value - calculate based on on-time payments
  const savingsRate = settings?.salary ? ((settings.salary - summary.monthlyPayments) / settings.salary) * 100 : 0;
  
  return {
    totalDebt: summary.totalDebts,
    monthlyPayments: summary.monthlyPayments,
    completedPayments: summary.completedPayments,
    overduePayments: summary.overduePayments,
    debtToIncomeRatio,
    paymentEfficiency,
    savingsRate
  };
}

export async function getDebtTrends(period: string) {
  // Mock data for now - implement actual trend calculation
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
  return months.map(month => ({
    month,
    totalPayments: Math.floor(Math.random() * 10) + 5,
    completedPayments: Math.floor(Math.random() * 8) + 3,
    newDebts: Math.floor(Math.random() * 3)
  }));
}

export async function getOverduePayments() {
  const today = new Date().toISOString().split('T')[0];
  return await db.getAllAsync(`
    SELECT d.*, e.name as entity_name
    FROM debts d
    JOIN entities e ON d.entity_id = e.id
    WHERE d.status = 'active' AND d.due_day < ?
  `, [new Date().getDate()]);
}

export async function getNotificationSettings() {
  const settings = await getSettings();
  return {
    paymentReminders: true,
    overdueAlerts: true,
    budgetAlerts: false,
    weeklyReports: false,
    reminderDaysBefore: 3
  };
}

export async function updateNotificationSettings(notificationSettings: any) {
  // Store notification settings in the settings table or create a separate table
  // For now, just return success
  return true;
}
