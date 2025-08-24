import * as SQLite from 'expo-sqlite';

const DB_NAME = 'eltizamati.db';

let db: SQLite.SQLiteDatabase;

export async function initializeDatabase() {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    await runMigrations();
    await seedKuwaitData();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

async function runMigrations() {
  // Settings table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id=1),
      language TEXT DEFAULT 'ar',
      payday_day INTEGER NOT NULL DEFAULT 25,
      currency TEXT DEFAULT 'KWD',
      strategy_default TEXT DEFAULT 'hybrid',
      quiet_hours_from TEXT DEFAULT '21:00',
      quiet_hours_to TEXT DEFAULT '08:00',
      savings_target REAL DEFAULT 0,
      theme TEXT DEFAULT 'light'
    );
  `);

  // Entities table (banks, retailers, etc.)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(kind, name)
    );
  `);

  // Debts table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY,
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Payments table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY,
      debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      method TEXT,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Reminders table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY,
      debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
      remind_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Kuwait holidays table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS holidays (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      name TEXT
    );
  `);

  // Create indexes
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_debts_entity ON debts(entity_id);
    CREATE INDEX IF NOT EXISTS idx_payments_debt ON payments(debt_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(remind_date);
  `);

  // Insert default settings if not exists
  await db.execAsync(`
    INSERT OR IGNORE INTO settings (id, payday_day, savings_target) 
    VALUES (1, 25, 0);
  `);
}

async function seedKuwaitData() {
  const entities = [
    // Banks
    { kind: 'bank', name: 'NBK', phone: '1801801' },
    { kind: 'bank', name: 'KFH', phone: '1866866' },
    { kind: 'bank', name: 'Gulf Bank', phone: '1805805' },
    { kind: 'bank', name: 'CBK', phone: '1888247' },
    { kind: 'bank', name: 'ABK', phone: '1899899' },
    { kind: 'bank', name: 'Burgan Bank', phone: '1804080' },
    { kind: 'bank', name: 'Boubyan Bank', phone: '1820082' },
    { kind: 'bank', name: 'KIB', phone: '1866866' },
    { kind: 'bank', name: 'Warba Bank', phone: '1825555' },
    
    // Retailers
    { kind: 'retailer', name: 'X-cite', phone: '1803535' },
    { kind: 'retailer', name: 'Best', phone: '1808880' },
    { kind: 'retailer', name: 'Eureka', phone: '1866090' },
    { kind: 'retailer', name: 'Digits', phone: '1870870' },
    { kind: 'retailer', name: 'Hatef 2000', phone: '22473636' },
    
    // Finance Companies
    { kind: 'finance', name: 'CFC', phone: '1803030' },
    { kind: 'finance', name: 'Al Mulla Finance', phone: '1804455' },
    { kind: 'finance', name: 'Al Manar Finance', phone: '1866030' },
    { kind: 'finance', name: 'KFIC Finance', phone: '1866030' },
    
    // BNPL
    { kind: 'bnpl', name: 'Tabby', phone: null },
    { kind: 'bnpl', name: 'Deema', phone: null },
    
    // Telecom
    { kind: 'telco', name: 'Zain', phone: '107' },
    { kind: 'telco', name: 'Ooredoo', phone: '121' },
    { kind: 'telco', name: 'stc', phone: '102' },
  ];

  for (const entity of entities) {
    await db.runAsync(
      `INSERT OR IGNORE INTO entities (kind, name, phone) VALUES (?, ?, ?)`,
      [entity.kind, entity.name, entity.phone]
    );
  }

  // Kuwait holidays for 2025
  const holidays = [
    { date: '2025-01-01', name: 'New Year Day' },
    { date: '2025-02-25', name: 'National Day' },
    { date: '2025-02-26', name: 'Liberation Day' },
    { date: '2025-03-30', name: 'Eid Al-Fitr (estimated)' },
    { date: '2025-03-31', name: 'Eid Al-Fitr Holiday' },
    { date: '2025-04-01', name: 'Eid Al-Fitr Holiday' },
    { date: '2025-06-06', name: 'Eid Al-Adha (estimated)' },
    { date: '2025-06-07', name: 'Eid Al-Adha Holiday' },
    { date: '2025-06-08', name: 'Eid Al-Adha Holiday' },
    { date: '2025-06-27', name: 'Islamic New Year (estimated)' },
    { date: '2025-09-05', name: 'Prophet Birthday (estimated)' },
  ];

  for (const holiday of holidays) {
    await db.runAsync(
      `INSERT OR IGNORE INTO holidays (date, name) VALUES (?, ?)`,
      [holiday.date, holiday.name]
    );
  }
}

export function getDatabase() {
  return db;
}