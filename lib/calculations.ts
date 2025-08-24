import dayjs from 'dayjs';
import { getDatabase } from './database';
import { bankersRounding } from './money';

/**
 * Calculate total commitments for a specific month
 */
export async function calculateMonthlyCommitments(month: string): Promise<number> {
  const db = getDatabase();
  
  try {
    const result = await db.getAllAsync(`
      SELECT d.installment_amount, d.due_day, d.status
      FROM debts d
      WHERE d.status = 'active'
    `) as any[];

    let total = 0;
    const monthStart = dayjs(month + '-01');
    
    for (const debt of result) {
      // Check if this debt has a due date in the specified month
      const dueDate = monthStart.date(Math.min(debt.due_day, monthStart.daysInMonth()));
      
      if (dueDate.format('YYYY-MM') === month) {
        total += debt.installment_amount;
      }
    }

    return bankersRounding(total);
  } catch (error) {
    console.error('Error calculating monthly commitments:', error);
    return 0;
  }
}

/**
 * Check if a month's installment is covered by payments
 */
export async function isMonthCovered(debtId: number, month: string): Promise<boolean> {
  const db = getDatabase();
  
  try {
    // Get installment amount
    const debt = await db.getFirstAsync(
      'SELECT installment_amount FROM debts WHERE id = ?',
      [debtId]
    ) as any;

    if (!debt) return false;

    // Get total payments for the month
    const paymentsResult = await db.getFirstAsync(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE debt_id = ? 
      AND strftime('%Y-%m', date) = ?
    `, [debtId, month]) as any;

    const totalPaid = paymentsResult?.total || 0;
    
    // Consider covered if payments are within 0.001 KWD of installment amount
    return totalPaid + 0.001 >= debt.installment_amount;
  } catch (error) {
    console.error('Error checking month coverage:', error);
    return false;
  }
}

/**
 * Calculate priority score for debt payment
 */
export function calculatePriorityScore(
  debt: any,
  daysToDue: number,
  penaltyRisk: number = 0
): number {
  // Cost index based on APR and fees
  const costIndex = (debt.apr + debt.fee_fixed) / 100;
  
  // Urgency based on days to due date
  const urgency = Math.max(0, 1 - (daysToDue / 30));
  
  // Relationship factor for personal debts
  const relationshipFactor = debt.relationship_factor || 0;

  // Hybrid scoring weights
  const score = 
    0.4 * costIndex +
    0.35 * urgency +
    0.2 * penaltyRisk +
    0.05 * relationshipFactor;

  return bankersRounding(score, 4);
}

/**
 * Simulate postponement impact
 */
export function simulatePostponement(
  debt: any,
  postponeToDate: string
): {
  extraCost: number;
  nextMonthPressure: number;
  recommendation: string;
} {
  const currentDue = dayjs().date(debt.due_day);
  const postponeTo = dayjs(postponeToDate);
  const daysDiff = postponeTo.diff(currentDue, 'days');

  let extraCost = 0;
  
  // Calculate late fees
  if (debt.penalty_policy) {
    try {
      const penalty = JSON.parse(debt.penalty_policy);
      extraCost += penalty.late_fee || 0;
    } catch {
      // Default late fee if parsing fails
      extraCost += 5; // 5 KWD default late fee
    }
  }

  // Calculate extra interest for loans
  if (debt.kind === 'loan' && debt.apr > 0) {
    const extraInterest = (debt.principal * (debt.apr / 100) / 365) * daysDiff;
    extraCost += extraInterest;
  }

  // Mock next month pressure calculation
  const nextMonthPressure = 1; // This would be calculated based on other debts

  const recommendation = extraCost > 10 
    ? 'ينصح بالسداد في الموعد لتجنب رسوم عالية'
    : 'التأجيل مقبول مع رسوم منخفضة';

  return {
    extraCost: bankersRounding(extraCost),
    nextMonthPressure,
    recommendation,
  };
}