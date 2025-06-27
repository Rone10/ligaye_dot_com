// Client-safe pricing utility functions (no database access)

// Format price from smallest unit (bututs) to display format (dalasi)
export const formatPrice = (priceInBututs: number, includeSymbol = true): string => {
  const priceInDalasi = priceInBututs / 100;
  const formatted = priceInDalasi.toLocaleString('en-GM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return includeSymbol ? `D${formatted}` : formatted;
};

// Convert dalasi to bututs (smallest unit)
export const dalasiToBututs = (dalasi: number): number => {
  return Math.round(dalasi * 100);
};

// Convert bututs to dalasi
export const bututsToDalasi = (bututs: number): number => {
  return bututs / 100;
};

// Calculate total price based on duration
export const calculateTotalPrice = (pricePerMonth: number, durationInMonths: number): number => {
  return pricePerMonth * durationInMonths;
};

// Validate price (ensure it's within reasonable bounds)
export const validatePrice = (priceInBututs: number): { valid: boolean; error?: string } => {
  if (priceInBututs < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }
  
  if (priceInBututs > 100000000) { // 1,000,000 GMD max
    return { valid: false, error: 'Price exceeds maximum allowed amount' };
  }
  
  if (!Number.isInteger(priceInBututs)) {
    return { valid: false, error: 'Price must be a whole number in bututs' };
  }
  
  return { valid: true };
};

// Get default pricing if no config exists
export const getDefaultPricing = () => {
  return {
    pricePerMonth: 350000, // 3,500 GMD in bututs
    currency: 'GMD',
  };
};