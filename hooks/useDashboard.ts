import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settings';
import { getDatabase } from '@/lib/database';
import { calculateMonthlyCommitments } from '@/lib/calculations';
import dayjs from 'dayjs';

interface Alert {
  type: 'due_soon' | 'overdue';
  entity: string;
  amount: number;
  dueDate: string;
  debtId: number;
}

export function useDashboard() {
  const { paydayDay, savingsTarget } = useSettingsStore();
  const [salaryAmount, setSalaryAmount] = useState(800); // Default for demo
  const [commitmentsThisMonth, setCommitmentsThisMonth] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const projectedRemaining = salaryAmount - commitmentsThisMonth - savingsTarget;

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const db = getDatabase();
      
      // Get current month commitments
      const currentMonth = dayjs().format('YYYY-MM');
      const commitments = await calculateMonthlyCommitments(currentMonth);
      setCommitmentsThisMonth(commitments);

      // Get alerts for due soon and overdue debts
      const currentDate = dayjs().format('YYYY-MM-DD');
      const nextWeek = dayjs().add(7, 'days').format('YYYY-MM-DD');

      const alertsQuery = await db.getAllAsync(`
        SELECT d.id, e.name as entity_name, d.installment_amount, d.due_day, d.kind
        FROM debts d
        JOIN entities e ON d.entity_id = e.id
        WHERE d.status = 'active'
        ORDER BY d.due_day ASC
      `) as any[];

      const alertsData: Alert[] = [];
      
      for (const debt of alertsQuery) {
        const dueDate = dayjs().date(debt.due_day).format('YYYY-MM-DD');
        const daysDiff = dayjs(dueDate).diff(dayjs(), 'days');

        if (daysDiff < 0) {
          alertsData.push({
            type: 'overdue',
            entity: debt.entity_name,
            amount: debt.installment_amount,
            dueDate,
            debtId: debt.id,
          });
        } else if (daysDiff <= 7) {
          alertsData.push({
            type: 'due_soon',
            entity: debt.entity_name,
            amount: debt.installment_amount,
            dueDate,
            debtId: debt.id,
          });
        }
      }

      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    salaryAmount,
    commitmentsThisMonth,
    savingsTarget,
    projectedRemaining,
    alerts,
    paydayDay,
    loading,
    refreshDashboard: loadDashboardData,
  };
}