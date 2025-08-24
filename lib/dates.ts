import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getDatabase } from './database';

dayjs.extend(utc);
dayjs.extend(timezone);

// Set Kuwait timezone as default
dayjs.tz.setDefault('Asia/Kuwait');

/**
 * Check if a date is a weekend (Friday or Saturday in Kuwait)
 */
export function isWeekend(date: string | dayjs.Dayjs): boolean {
  const d = dayjs(date);
  const day = d.day(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  return day === 5 || day === 6; // Friday or Saturday
}

/**
 * Check if a date is a Kuwait holiday
 */
export async function isHoliday(date: string): Promise<boolean> {
  const db = getDatabase();
  
  try {
    const result = await db.getFirstAsync(
      'SELECT id FROM holidays WHERE date = ?',
      [date]
    );
    
    return !!result;
  } catch (error) {
    console.error('Error checking holiday:', error);
    return false;
  }
}

/**
 * Get the next business day (excluding weekends and holidays)
 */
export async function getNextBusinessDay(date: string): Promise<string> {
  let current = dayjs(date);
  
  while (isWeekend(current) || await isHoliday(current.format('YYYY-MM-DD'))) {
    current = current.subtract(1, 'day'); // Move to previous day for due dates
  }
  
  return current.format('YYYY-MM-DD');
}

/**
 * Calculate the actual due date considering month length and business days
 */
export async function calculateActualDueDate(dueDay: number, month: string): Promise<string> {
  const monthStart = dayjs(month + '-01');
  const lastDayOfMonth = monthStart.daysInMonth();
  
  // Use the minimum of due day and last day of month
  const actualDay = Math.min(dueDay, lastDayOfMonth);
  const proposedDate = monthStart.date(actualDay);
  
  // Adjust for business days
  return await getNextBusinessDay(proposedDate.format('YYYY-MM-DD'));
}

/**
 * Format date for Kuwait locale
 */
export function formatKuwaitDate(date: string | dayjs.Dayjs, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).tz('Asia/Kuwait').format(format);
}

/**
 * Get current Kuwait time
 */
export function getKuwaitNow(): dayjs.Dayjs {
  return dayjs().tz('Asia/Kuwait');
}

/**
 * Check if current time is within quiet hours
 */
export function isQuietTime(quietFrom: string, quietTo: string): boolean {
  const now = getKuwaitNow();
  const currentTime = now.format('HH:mm');
  
  // Handle cases where quiet hours cross midnight
  if (quietFrom > quietTo) {
    return currentTime >= quietFrom || currentTime <= quietTo;
  }
  
  return currentTime >= quietFrom && currentTime <= quietTo;
}