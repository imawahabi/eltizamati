import * as SQLite from 'expo-sqlite';

const DB_NAME = 'eltizamati.db';

let db: SQLite.SQLiteDatabase;

export async function initializeDatabase() {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    await runMigrations();
    await seedDefaultData();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Re-throw so callers can handle and avoid running queries on outdated schema
    throw error;
  }
}

async function runMigrations() {
  try {
    // Helpers: ensure columns exist on existing tables
    const columnExists = async (table: string, column: string) => {
      const info = await db.getAllAsync(`PRAGMA table_info(${table})`);
      return (info as any[]).some((c: any) => c.name === column);
    };

    const ensureColumn = async (table: string, column: string, definition: string) => {
      const exists = await columnExists(table, column);
      if (!exists) {
        await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    };

    // Users table - as per spec
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        salary REAL,
        payday_day INTEGER,
        settings_json TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        onboarding_completed INTEGER DEFAULT 0
      );
    `);

    // Ensure added columns for existing users table
    await ensureColumn('users', 'created_at', 'TEXT DEFAULT CURRENT_TIMESTAMP');
    await ensureColumn('users', 'onboarding_completed', 'INTEGER DEFAULT 0');

    // Obligations table - as per spec
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS obligations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        creditor_name TEXT,
        principal_amount REAL,
        installment_amount REAL,
        interest_rate REAL,
        start_date TEXT,
        due_day INTEGER,
        installments_count INTEGER,
        installments_paid INTEGER DEFAULT 0,
        remaining_amount REAL,
        status TEXT,
        meta_json TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Ensure added columns for existing obligations table
    await ensureColumn('obligations', 'user_id', 'INTEGER');
    await ensureColumn('obligations', 'installments_paid', 'INTEGER DEFAULT 0');
    await ensureColumn('obligations', 'remaining_amount', 'REAL');
    await ensureColumn('obligations', 'meta_json', 'TEXT');

    // Installments table - as per spec
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS installments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        obligation_id INTEGER,
        due_date TEXT,
        amount REAL,
        status TEXT,
        paid_amount REAL DEFAULT 0,
        paid_date TEXT,
        FOREIGN KEY (obligation_id) REFERENCES obligations (id)
      );
    `);

    // Ensure added columns for existing installments table
    await ensureColumn('installments', 'obligation_id', 'INTEGER');
    await ensureColumn('installments', 'status', 'TEXT');
    await ensureColumn('installments', 'paid_amount', 'REAL DEFAULT 0');
    await ensureColumn('installments', 'paid_date', 'TEXT');

    // Payments table - as per spec
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        obligation_id INTEGER,
        installment_id INTEGER,
        amount REAL,
        date TEXT,
        method TEXT,
        note TEXT,
        receipt_path TEXT,
        FOREIGN KEY (obligation_id) REFERENCES obligations (id),
        FOREIGN KEY (installment_id) REFERENCES installments (id)
      );
    `);

    // Ensure added columns for existing payments table
    await ensureColumn('payments', 'obligation_id', 'INTEGER');
    await ensureColumn('payments', 'installment_id', 'INTEGER');
    await ensureColumn('payments', 'method', 'TEXT');
    await ensureColumn('payments', 'note', 'TEXT');
    await ensureColumn('payments', 'receipt_path', 'TEXT');

    // Savings goals table - as per spec
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        target_amount REAL,
        saved_amount REAL DEFAULT 0,
        target_date TEXT,
        rule_json TEXT
      );
    `);

    // Persons table for personal debt management
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS persons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        relationship_type TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notifications log table - as per spec
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notifications_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        obligation_id INTEGER,
        scheduled_date TEXT,
        fired_at TEXT,
        status TEXT,
        FOREIGN KEY (obligation_id) REFERENCES obligations (id)
      );
    `);

    // Ensure added columns for existing notifications_log table
    await ensureColumn('notifications_log', 'obligation_id', 'INTEGER');

    // Create indexes for performance (skip if columns missing to avoid blocking migrations)
    try { await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_obligations_user ON obligations(user_id);`); } catch (e) { console.warn('Skipping index idx_obligations_user:', e); }
    try { await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_installments_obligation ON installments(obligation_id);`); } catch (e) { console.warn('Skipping index idx_installments_obligation:', e); }
    try { await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_payments_obligation ON payments(obligation_id);`); } catch (e) { console.warn('Skipping index idx_payments_obligation:', e); }
    try { await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_notifications_obligation ON notifications_log(obligation_id);`); } catch (e) { console.warn('Skipping index idx_notifications_obligation:', e); }

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
}

async function seedDefaultData() {
  // Default creditors as per spec
  const creditors = [
    // Banks - as per spec section 16
    'بنك الكويت الوطني (NBK)',
    'بنك برقان',
    'بنك الخليج',
    'بيت التمويل الكويتي (KFH)',
    'الملا للتمويل',
    'الأمانة للتمويل',
    'رساميل للتمويل',
    'X-cite',
    'Eureka',
    'Best Al-Yousifi'
  ];

  // This will be used for obligation wizard
  console.log('Default creditors seeded:', creditors.length);
}

async function seedKuwaitData() {
  // This function is not called in the current implementation
  // Keeping it for future use when entities and holidays tables are added
  console.log('Kuwait data seeding skipped - tables not implemented yet');
}

export function getDatabase() {
  return db;
}

// Database helper functions as per spec requirements
export async function getUserData() {
  const user = await db.getFirstAsync('SELECT * FROM users WHERE id = 1') as any;
  return user;
}

export async function checkOnboardingStatus() {
  try {
    const user = await db.getFirstAsync('SELECT onboarding_completed FROM users WHERE id = 1') as any;
    return user?.onboarding_completed === 1;
  } catch (e) {
    // If column is missing, add it and default to not completed
    try {
      await db.execAsync('ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0');
      const user = await db.getFirstAsync('SELECT onboarding_completed FROM users WHERE id = 1') as any;
      return user?.onboarding_completed === 1;
    } catch (inner) {
      console.warn('checkOnboardingStatus fallback failed:', inner);
      return false;
    }
  }
}

export async function completeOnboarding(name: string, salary: number, payday: number) {
  // Check if user exists
  const existingUser = await db.getFirstAsync('SELECT id FROM users WHERE id = 1');
  
  if (existingUser) {
    // Update existing user
    await db.runAsync(
      'UPDATE users SET name = ?, salary = ?, payday_day = ?, onboarding_completed = 1 WHERE id = 1',
      [name, salary, payday]
    );
  } else {
    // Create new user
    await db.runAsync(
      'INSERT INTO users (name, salary, payday_day, onboarding_completed, settings_json) VALUES (?, ?, ?, 1, ?)',
      [name, salary, payday, JSON.stringify({
        notifications_enabled: true,
        app_lock_enabled: false,
        theme: 'light',
        language: 'ar'
      })]
    );
  }
}

export async function updateUserSalary(salary: number, payday: number) {
  await db.runAsync(
    'UPDATE users SET salary = ?, payday_day = ? WHERE id = 1',
    [salary, payday]
  );
}

export async function getObligations() {
  const obligations = await db.getAllAsync(
    'SELECT * FROM obligations WHERE status = "active" ORDER BY due_day ASC'
  );
  return obligations;
}

export async function addObligation(obligation: any) {
  const result = await db.runAsync(
    `INSERT INTO obligations 
     (user_id, type, creditor_name, principal_amount, installment_amount, 
      interest_rate, start_date, due_day, installments_count, remaining_amount, status, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1, // default user
      obligation.type,
      obligation.creditor_name,
      obligation.principal_amount,
      obligation.installment_amount,
      obligation.interest_rate || 0,
      obligation.start_date,
      obligation.due_day,
      obligation.installments_count,
      obligation.principal_amount, // initially remaining = principal
      'active',
      JSON.stringify(obligation.meta || {})
    ]
  );
  
  // Generate installments
  await generateInstallments(result.lastInsertRowId, obligation);
  return result.lastInsertRowId;
}

export async function generateInstallments(obligationId: number, obligation: any) {
  const startDate = new Date(obligation.start_date);
  
  for (let i = 0; i < obligation.installments_count; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDate.setDate(obligation.due_day);
    
    await db.runAsync(
      'INSERT INTO installments (obligation_id, due_date, amount, status) VALUES (?, ?, ?, ?)',
      [obligationId, dueDate.toISOString().split('T')[0], obligation.installment_amount, 'pending']
    );
  }
}

export async function recordPayment(payment: any) {
  const result = await db.runAsync(
    'INSERT INTO payments (obligation_id, installment_id, amount, date, method, note) VALUES (?, ?, ?, ?, ?, ?)',
    [payment.obligation_id, payment.installment_id, payment.amount, payment.date, payment.method, payment.note]
  );
  
  // Update installment
  if (payment.installment_id) {
    await db.runAsync(
      'UPDATE installments SET paid_amount = paid_amount + ?, status = ?, paid_date = ? WHERE id = ?',
      [payment.amount, 'paid', payment.date, payment.installment_id]
    );
  }
  
  // Update obligation remaining amount
  await db.runAsync(
    'UPDATE obligations SET remaining_amount = remaining_amount - ?, installments_paid = installments_paid + 1 WHERE id = ?',
    [payment.amount, payment.obligation_id]
  );
  
  return result.lastInsertRowId;
}

// Enhanced payment management
async function addPayment(paymentData: any): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO payments (obligation_id, installment_id, amount, payment_date, payment_method, note, receipt_path, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      paymentData.obligation_id,
      paymentData.installment_id || null,
      paymentData.amount,
      paymentData.payment_date || new Date().toISOString(),
      paymentData.payment_method || 'cash',
      paymentData.note || '',
      paymentData.receipt_path || null,
      paymentData.meta_json || null
    ]
  );
  
  return result.lastInsertRowId;
}

async function updateObligation(obligationId: number, updates: any): Promise<void> {
  const db = await getDatabase();
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates).map(v => typeof v === 'string' && !isNaN(Number(v)) ? Number(v) : v);
  
  await db.runAsync(
    `UPDATE obligations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [...values, obligationId]
  );
}

async function getObligationById(obligationId: number): Promise<any> {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    'SELECT * FROM obligations WHERE id = ?',
    [obligationId]
  );
  return result;
}

export async function getFinancialSummary() {
  const user = await getUserData() as any;
  const obligations = await getObligations();
  
  const totalCommitments = obligations.length;
  const monthlyPayments = obligations.reduce((sum: number, o: any) => sum + o.installment_amount, 0);
  const totalDebt = obligations.reduce((sum: number, o: any) => sum + o.remaining_amount, 0);
  const paidAmount = obligations.reduce((sum: number, o: any) => sum + (o.principal_amount - o.remaining_amount), 0);
  
  const upcomingPayments = await getUpcomingPayments(30);
  const completedPayments = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM installments WHERE status = "paid"'
  ) as any;
  
  return {
    salary: user?.salary || 0,
    totalCommitments,
    monthlyPayments,
    completedPayments: completedPayments?.count || 0,
    upcomingPayments: upcomingPayments.length,
    totalDebt,
    paidAmount,
    remainingBalance: (user?.salary || 0) - monthlyPayments
  };
}

// Person management functions
export async function addPerson(person: any) {
  const result = await db.runAsync(
    'INSERT INTO persons (name, phone, relationship_type) VALUES (?, ?, ?)',
    [person.name, person.phone || '', person.relationship_type || '']
  );
  return result.lastInsertRowId;
}

export async function getPersons() {
  const persons = await db.getAllAsync(
    'SELECT * FROM persons ORDER BY name ASC'
  );
  return persons;
}

export async function getPersonByName(name: string) {
  const person = await db.getFirstAsync(
    'SELECT * FROM persons WHERE name = ?',
    [name]
  );
  return person;
}

export async function updatePerson(id: number, person: any) {
  await db.runAsync(
    'UPDATE persons SET name = ?, phone = ?, relationship_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [person.name, person.phone || '', person.relationship_type || '', id]
  );
}

export async function deletePerson(id: number) {
  await db.runAsync('DELETE FROM persons WHERE id = ?', [id]);
}

async function getUpcomingPayments(days: number = 30): Promise<any[]> {
  const db = await getDatabase();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const payments = await db.getAllAsync(`
    SELECT i.*, o.creditor_name, o.type
    FROM installments i
    JOIN obligations o ON i.obligation_id = o.id
    WHERE i.due_date <= ? AND i.status = 'pending'
    ORDER BY i.due_date ASC`,
    [futureDate.toISOString().split('T')[0]]
  );
  
  return payments;
}

// Export new enhanced functions
export {
  addPayment,
  updateObligation,
  getObligationById,
  getUpcomingPayments
};