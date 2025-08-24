export const formatCurrency = (amount: number, language: string = 'ar'): { main: string; decimal: string } => {
  const formatted = amount.toFixed(2);
  const [main, decimal] = formatted.split('.');
  
  if (language === 'ar') {
    // Arabic number formatting with Arabic-Indic numerals
    const arabicMain = main.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    const arabicDecimal = decimal.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    return { main: arabicMain, decimal: arabicDecimal };
  }
  
  return { main, decimal };
};

export const formatNumber = (num: number, language: string = 'ar'): string => {
  const formatted = num.toLocaleString();
  
  if (language === 'ar') {
    return formatted.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
  
  return formatted;
};

export const parseArabicNumber = (arabicNum: string): number => {
  const englishNum = arabicNum.replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  return parseFloat(englishNum) || 0;
};
