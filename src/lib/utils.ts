/**
 * Generate next sequential number for documents
 */
export async function generateSequentialNumber(prefix: string, model: any, field: string) {
  const lastDoc = await model.findOne().sort({ [field]: -1 }).limit(1);
  
  if (!lastDoc || !lastDoc[field]) {
    return `${prefix}0001`;
  }

  const lastNumber = lastDoc[field];
  const numberPart = parseInt(lastNumber.replace(prefix, ''));
  const nextNumber = numberPart + 1;
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate total with GST
 */
export function calculateWithGST(baseAmount: number, gstPercentage: number) {
  const gstAmount = (baseAmount * gstPercentage) / 100;
  const totalAmount = baseAmount + gstAmount;
  
  return {
    baseAmount,
    gstAmount,
    totalAmount,
  };
}

/**
 * Validate GST number format
 */
export function validateGSTNumber(gstNumber: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber);
}
