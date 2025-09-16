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

// Legacy steel tube categories that need to be migrated
export const LEGACY_CATEGORIES = [
  'galvanized-tubes',
  'stainless-steel-tubes',
  'carbon-steel-tubes',
  'alloy-steel-tubes',
  'seamless-tubes',
  'welded-tubes',
  'precision-tubes',
  'structural-tubes',
];

// Category mapping for data migration - mapping legacy steel tube types to current categories
export const CATEGORY_MAPPING = {
  'galvanized-tubes': 'square-tubes',
  'stainless-steel-tubes': 'round-tubes',
  'carbon-steel-tubes': 'rectangular-tubes',
  'alloy-steel-tubes': 'custom-steel-products',
  'seamless-tubes': 'round-tubes',
  'welded-tubes': 'square-tubes',
  'precision-tubes': 'custom-steel-products',
  'structural-tubes': 'rectangular-tubes',
};

// Helper functions
export const getProductCategoryLabel = (value) => {
  const category = STEEL_TUBE_CATEGORIES.find(
    (cat) => cat.value === value || cat.shortValue === value
  );
  return category ? category.label : value;
};

export const getProductCategoryValue = (label) => {
  const category = STEEL_TUBE_CATEGORIES.find((cat) => cat.label === label);
  return category ? category.value : label;
};

export const isLegacyCategory = (value) => {
  return LEGACY_CATEGORIES.includes(value);
};

export const getMigratedCategory = (legacyValue) => {
  return CATEGORY_MAPPING[legacyValue] || 'custom-steel-products';
};

// Export default for easy import
export default STEEL_TUBE_CATEGORIES;
