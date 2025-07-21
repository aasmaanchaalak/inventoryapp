import React from 'react';

/**
 * Standardized error message component for forms
 * Provides consistent styling and positioning for validation errors
 * 
 * @param {Object} props
 * @param {Object} props.error - Error object from react-hook-form (or custom error)
 * @param {string} props.error.message - Error message to display
 * @param {string} props.className - Additional CSS classes (optional)
 * @returns {JSX.Element|null} Error message element or null if no error
 */
const FormError = ({ error, className = '' }) => {
  // Return null if no error exists
  if (!error || !error.message) {
    return null;
  }

  return (
    <p className={`mt-1 text-sm text-red-500 ${className}`}>
      {error.message}
    </p>
  );
};

export default FormError;