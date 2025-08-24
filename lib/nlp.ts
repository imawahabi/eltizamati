/**
 * Natural Language Processing for extracting debt information
 * from Arabic and English text (Notes/WhatsApp messages)
 */

interface ExtractedDebt {
  entity: {
    kind: string;
    name: string;
    phone?: string;
    note?: string;
  };
  debt: {
    entityName: string;
    kind: string;
    principal: number;
    apr: number;
    feeFixed: number;
    startDate: string;
    dueDay: number;
    totalInstallments?: number;
    remainingInstallments?: number;
    installmentAmount?: number;
    status: string;
    penaltyPolicy?: string;
    relationshipFactor: number;
    tags: string[];
  };
  assumptions: string[];
}

/**
 * Extract debt information from free text
 */
export function extractDebtFromText(text: string): ExtractedDebt | null {
  const assumptions: string[] = [];
  
  // Clean and normalize text
  const cleanText = text.trim().toLowerCase();
  
  // Extract amount (looking for numbers)
  const amountMatch = cleanText.match(/(\d+(?:\.\d{1,3})?)/);
  const principal = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  if (principal === 0) {
    return null; // No valid amount found
  }

  // Extract entity name (simple heuristic)
  let entityName = 'غير محدد';
  let entityKind = 'other';
  
  // Check for known entities
  const knownBanks = ['nbk', 'kfh', 'gulf', 'cbk', 'abk', 'burgan', 'boubyan', 'kib', 'warba'];
  const knownRetailers = ['xcite', 'x-cite', 'best', 'eureka', 'digits', 'hatef'];
  const knownBnpl = ['tabby', 'deema'];
  
  for (const bank of knownBanks) {
    if (cleanText.includes(bank)) {
      entityName = bank.toUpperCase();
      entityKind = 'bank';
      break;
    }
  }
  
  if (entityKind === 'other') {
    for (const retailer of knownRetailers) {
      if (cleanText.includes(retailer)) {
        entityName = retailer.charAt(0).toUpperCase() + retailer.slice(1);
        entityKind = 'retailer';
        break;
      }
    }
  }

  // Determine debt kind
  let debtKind = 'oneoff';
  if (cleanText.includes('قرض') || cleanText.includes('loan')) {
    debtKind = 'loan';
  } else if (cleanText.includes('تقسيط') || cleanText.includes('قسط') || knownRetailers.some(r => cleanText.includes(r))) {
    debtKind = 'bnpl';
  } else if (cleanText.includes('محمد') || cleanText.includes('أحمد') || cleanText.includes('من')) {
    debtKind = 'friend';
    entityKind = 'person';
    // Extract person name (simple heuristic)
    const nameMatch = cleanText.match(/(محمد|أحمد|علي|فاطمة|مريم|عبدالله)/);
    if (nameMatch) {
      entityName = nameMatch[1];
    }
  }

  // Extract installment information
  let totalInstallments: number | undefined;
  let installmentAmount: number | undefined;
  
  const monthsMatch = cleanText.match(/(\d+)\s*(شهر|month)/);
  if (monthsMatch) {
    totalInstallments = parseInt(monthsMatch[1]);
    installmentAmount = bankersRounding(principal / totalInstallments);
    assumptions.push('قسمت المبلغ على عدد الأشهر');
  }

  const installmentMatch = cleanText.match(/قسط\s*(\d+(?:\.\d{1,3})?)/);
  if (installmentMatch) {
    installmentAmount = parseFloat(installmentMatch[1]);
    if (!totalInstallments) {
      totalInstallments = Math.ceil(principal / installmentAmount);
      assumptions.push('حسبت عدد الأقساط من قيمة القسط');
    }
  }

  // Extract due day
  let dueDay = 15; // Default
  const dayMatch = cleanText.match(/يوم\s*(\d+)/);
  if (dayMatch) {
    dueDay = parseInt(dayMatch[1]);
  } else {
    assumptions.push('استخدمت يوم 15 كموعد افتراضي');
  }

  // Extract APR for loans
  let apr = 0;
  const aprMatch = cleanText.match(/(\d+(?:\.\d+)?)\s*%/);
  if (aprMatch && debtKind === 'loan') {
    apr = parseFloat(aprMatch[1]);
  }

  // Set relationship factor for friends
  const relationshipFactor = debtKind === 'friend' ? 0.3 : 0;

  return {
    entity: {
      kind: entityKind,
      name: entityName,
      phone: null,
      note: null,
    },
    debt: {
      entityName,
      kind: debtKind,
      principal: bankersRounding(principal),
      apr,
      feeFixed: 0,
      startDate: dayjs().format('YYYY-MM-DD'),
      dueDay,
      totalInstallments,
      remainingInstallments: totalInstallments,
      installmentAmount: installmentAmount ? bankersRounding(installmentAmount) : undefined,
      status: 'active',
      penaltyPolicy: debtKind === 'friend' ? JSON.stringify({ late_fee: 0, grace_days: 0 }) : undefined,
      relationshipFactor,
      tags: [debtKind],
    },
    assumptions,
  };
}

function bankersRounding(value: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}