/**
 * Realistic Mock Payment Validator
 * Implements standard card validation rules (Luhn, Expiry, CVV)
 */

export const validateCardNumber = (num: string): boolean => {
  // Remove spaces and dashes
  const cleanNum = num.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleanNum)) return false;

  // Luhn Algorithm
  let sum = 0;
  let shouldDouble = false;
  for (let i = cleanNum.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNum.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

export const validateExpiry = (month: number, year: number): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Normalize year (handle YY as 20YY)
  const fullYear = year < 100 ? 2000 + year : year;

  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && month < currentMonth) return false;
  if (month < 1 || month > 12) return false;

  return true;
};

export const validateCVV = (cvv: string, brand?: string): boolean => {
  const cleanCVV = cvv.replace(/\D/g, '');
  if (brand === 'American Express') {
    return cleanCVV.length === 4;
  }
  return cleanCVV.length === 3;
};

export const getCardBrand = (num: string): string => {
  const cleanNum = num.replace(/[\s-]/g, '');
  if (/^4/.test(cleanNum)) return 'Visa';
  if (/^5[1-5]/.test(cleanNum)) return 'Mastercard';
  if (/^3[47]/.test(cleanNum)) return 'American Express';
  if (/^6(?:011|5)/.test(cleanNum)) return 'Discover';
  return 'Unknown';
};
