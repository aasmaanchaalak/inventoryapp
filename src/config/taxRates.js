// Tax Rate Configuration for Steel Tube Industry
// This file centralizes all tax rates used across the application

// Standard GST rates for steel tubes (12% as per GST rules for steel products)
export const STEEL_TUBE_TAX_RATE = 12;

// Tax rates by product category
export const TAX_RATES_BY_CATEGORY = {
  'square-tubes': 12,
  'rectangular-tubes': 12,
  'round-tubes': 12,
  'oval-tubes': 12,
  'custom-steel-products': 12,
  // Legacy category support
  'square': 12,
  'rectangular': 12,
  'round': 12,
  'oval': 12,
  'custom': 12
};

// Default tax rate for any undefined categories
export const DEFAULT_TAX_RATE = 12;

// Tax rate configuration with details
export const TAX_RATE_CONFIG = {
  steelTubes: {
    rate: 12,
    description: 'GST for steel tubes and related products',
    hsn: ['7306', '7307', '7308'], // HSN codes for steel tubes
    applicableFrom: '2017-07-01' // GST implementation date
  },
  general: {
    rate: 18,
    description: 'Standard GST rate for general goods',
    hsn: ['*'],
    applicableFrom: '2017-07-01'
  }
};

// Helper functions
export const getTaxRateForProduct = (productType) => {
  // Normalize product type to handle different formats
  const normalizedType = productType?.toLowerCase()?.trim();
  
  // Check specific category rates first
  if (TAX_RATES_BY_CATEGORY[normalizedType] !== undefined) {
    return TAX_RATES_BY_CATEGORY[normalizedType];
  }
  
  // Check if it's a steel tube related product
  if (normalizedType?.includes('tube') || normalizedType?.includes('steel')) {
    return STEEL_TUBE_TAX_RATE;
  }
  
  // Return default rate
  return DEFAULT_TAX_RATE;
};

export const calculateTaxAmount = (subtotal, taxRate = null, productType = null) => {
  // Determine tax rate
  let rate = taxRate;
  if (rate === null || rate === undefined) {
    rate = productType ? getTaxRateForProduct(productType) : DEFAULT_TAX_RATE;
  }
  
  // Calculate tax amount
  const taxAmount = (subtotal * rate) / 100;
  
  return {
    subtotal,
    taxRate: rate,
    taxAmount,
    total: subtotal + taxAmount
  };
};

export const formatTaxRate = (rate) => {
  return `${rate}%`;
};

export const getTaxDescription = (productType) => {
  const rate = getTaxRateForProduct(productType);
  if (rate === STEEL_TUBE_TAX_RATE) {
    return `${rate}% GST (Steel Tubes)`;
  }
  return `${rate}% GST`;
};

// Validation helpers
export const isValidTaxRate = (rate) => {
  return typeof rate === 'number' && rate >= 0 && rate <= 100;
};

export const getAllowedTaxRates = () => {
  return [0, 5, 12, 18, 28]; // Standard GST rates in India
};

// Export default configuration
export default {
  STEEL_TUBE_TAX_RATE,
  TAX_RATES_BY_CATEGORY,
  DEFAULT_TAX_RATE,
  TAX_RATE_CONFIG,
  getTaxRateForProduct,
  calculateTaxAmount,
  formatTaxRate,
  getTaxDescription,
  isValidTaxRate,
  getAllowedTaxRates
};