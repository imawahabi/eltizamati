import { useState, useEffect } from 'react';
import { getDatabase } from '@/lib/database';

interface Debt {
  id: number;
  entityName: string;
  kind: string;
  principal: number;
  installmentAmount: number;
  remainingInstallments: number;
  dueDay: number;
  status: string;
  apr: number;
}

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebts();
  }, []);

  async function loadDebts() {
    try {
      setLoading(true);
      const db = getDatabase();
      
      const result = await db.getAllAsync(`
        SELECT 
          d.id,
          e.name as entity_name,
          d.kind,
          d.principal,
          d.installment_amount,
          d.remaining_installments,
          d.due_day,
          d.status,
          d.apr
        FROM debts d
        JOIN entities e ON d.entity_id = e.id
        WHERE d.status = 'active'
        ORDER BY d.due_day ASC
      `) as any[];

      const debtsData: Debt[] = result.map(row => ({
        id: row.id,
        entityName: row.entity_name,
        kind: row.kind,
        principal: row.principal,
        installmentAmount: row.installment_amount,
        remainingInstallments: row.remaining_installments,
        dueDay: row.due_day,
        status: row.status,
        apr: row.apr,
      }));

      setDebts(debtsData);
    } catch (error) {
      console.error('Failed to load debts:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    debts,
    loading,
    refreshDebts: loadDebts,
  };
}