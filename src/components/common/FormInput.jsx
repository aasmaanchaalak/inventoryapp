import React from 'react';
import FormError from './FormError';

/**
 * Standardized form input component with consistent error styling
 * Provides consistent styling, error states, and validation feedback
 *
 * @param {Object} props
 * @param {Object} props.error - Error object from react-hook-form
 * @param {string} props.label - Input label text
 * @param {string} props.id - Input ID for accessibility
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.className - Additional CSS classes for input
 * @param {string} props.containerClassName - Additional CSS classes for container
 * @param {React.Ref} ref - Ref to forward to input element
 * @param {...any} props.rest - All other props passed to input element
 * @returns {JSX.Element} Complete input with label and error
 */
const FormInput = React.forwardRef(
  (
    {
      error,
      label,
      id,
      required = false,
      className = '',
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    const baseInputClasses =
      'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    const errorClasses = error ? 'border-red-500' : 'border-gray-300';

    return (
      <div className={containerClassName}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`${baseInputClasses} ${errorClasses} ${className}`}
          {...rest}
        />
        <FormError error={error} />
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
