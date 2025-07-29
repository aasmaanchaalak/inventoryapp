// Steel Tube Industry Product Categories Configuration
// This file centralizes all product categories used across the application

export const STEEL_TUBE_CATEGORIES = [
  {
    value: 'square-tubes',
    label: 'Square Tubes',
    shortValue: 'square', // For backward compatibility with existing data
  },
  {
    value: 'rectangular-tubes',
    label: 'Rectangular Tubes',
    shortValue: 'rectangular',
  },
  {
    value: 'round-tubes',
    label: 'Round Tubes',
    shortValue: 'round',
  },
  {
    value: 'oval-tubes',
    label: 'Oval Tubes',
    shortValue: 'oval',
  },
  {
    value: 'custom-steel-products',
    label: 'Custom Steel Products',
    shortValue: 'custom',
  },
];

// Legacy categories that need to be migrated
export const LEGACY_CATEGORIES = [
  'electronics',
  'clothing',
  'home-garden',
  'sports',
  'books',
  'automotive',
  'health-beauty',
  'toys-games',
];

// Category mapping for data migration
export const CATEGORY_MAPPING = {
  electronics: 'custom-steel-products',
  clothing: 'custom-steel-products',
  'home-garden': 'custom-steel-products',
  sports: 'custom-steel-products',
  books: 'custom-steel-products',
  automotive: 'custom-steel-products',
  'health-beauty': 'custom-steel-products',
  'toys-games': 'custom-steel-products',
};

// Helper functions
export const getProductCategoryLabel = (value: any) => {
  const category = STEEL_TUBE_CATEGORIES.find(
    (cat) => cat.value === value || cat.shortValue === value
  );
  return category ? category.label : value;
};

export const getProductCategoryValue = (label: any) => {
  const category = STEEL_TUBE_CATEGORIES.find((cat) => cat.label === label);
  return category ? category.value : label;
};

export const isLegacyCategory = (value: any) => {
  return LEGACY_CATEGORIES.includes(value);
};

export const getMigratedCategory = (legacyValue: any) => {
  return CATEGORY_MAPPING[legacyValue] || 'custom-steel-products';
};

// Export default for easy import
export default STEEL_TUBE_CATEGORIES;
