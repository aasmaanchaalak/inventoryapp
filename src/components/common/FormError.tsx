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
const FormError = ({ error, className = '' }: any) => {
  // Return null if no error exists
  if (!error || !error.message) {
    return null;
  }

  return (
    // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
    <p className={`mt-1 text-sm text-red-500 ${className}`}>{error.message}</p>
  );
};

export default FormError;
