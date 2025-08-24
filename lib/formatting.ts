export const formatCurrency = (amount: number, language: string = 'ar'): { main: string; decimal: string } => {
  const formatted = amount.toFixed(2);
  const [main, decimal] = formatted.split('.');
  return { 
    main: formatNumber(parseInt(main), language), 
    decimal: decimal 
  };
};

export const formatNumber = (num: number, language: string = 'ar'): string => {
  // Always use English numerals with comma separators
  return num.toLocaleString('en-US');
};

export const formatAmountWithDecimals = (amount: number, language: string = 'ar'): { whole: string; decimal: string; currency: string } => {
  const formatted = amount.toFixed(2);
  const [whole, decimal] = formatted.split('.');
  return {
    whole: formatNumber(parseInt(whole), language),
    decimal: decimal,
    currency: getCurrency(language)
  };
};

export const parseArabicNumber = (arabicNum: string): number => {
  // Handle both Arabic-Indic and English numerals
  const englishNum = arabicNum.replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
  return parseFloat(englishNum) || 0;
};

export const getCurrency = (language: string = 'ar'): string => {
  return language === 'ar' ? 'د.ك' : 'KWD';
};

export const getCurrencySymbol = (): string => {
  return 'KWD';
};
