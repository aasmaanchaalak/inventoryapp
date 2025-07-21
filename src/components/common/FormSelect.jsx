import React from 'react';
import FormError from './FormError';

/**
 * Standardized form select component with consistent error styling
 * Provides consistent styling, error states, and validation feedback for select elements
 * 
 * @param {Object} props
 * @param {Object} props.error - Error object from react-hook-form
 * @param {string} props.label - Select label text
 * @param {string} props.id - Select ID for accessibility
 * @param {boolean} props.required - Whether field is required
 * @param {Array} props.options - Array of option objects {value, label}
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.className - Additional CSS classes for select
 * @param {string} props.containerClassName - Additional CSS classes for container
 * @param {React.Ref} props.innerRef - Ref to forward to select element
 * @param {...any} props.rest - All other props passed to select element
 * @returns {JSX.Element} Complete select with label and error
 */
const FormSelect = React.forwardRef(({ 
  error, 
  label, 
  id, 
  required = false,
  options = [],
  placeholder = 'Select an option',
  className = '', 
  containerClassName = '',
  children,
  ...rest 
}, ref) => {
  const baseSelectClasses = 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const errorClasses = error ? 'border-red-500' : 'border-gray-300';
  
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`${baseSelectClasses} ${errorClasses} ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <FormError error={error} />
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;