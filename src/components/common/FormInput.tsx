import React from 'react';
// @ts-expect-error TS(6142): Module './FormError' was resolved to '/home/ubuntu... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2339): Property 'error' does not exist on type '{}'.
      error,
      // @ts-expect-error TS(2339): Property 'label' does not exist on type '{}'.
      label,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type '{}'.
      id,
      // @ts-expect-error TS(2339): Property 'required' does not exist on type '{}'.
      required = false,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type '{}'.
      className = '',
      // @ts-expect-error TS(2339): Property 'containerClassName' does not exist on ty... Remove this comment to see the full error message
      containerClassName = '',
      ...rest
    },
    ref
  ) => {
    const baseInputClasses =
      'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    const errorClasses = error ? 'border-red-500' : 'border-gray-300';

    return (
      // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
      <div className={containerClassName}>
        {label && (
          // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is provided... Remove this comment to see the full error message
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx'
            flag is provided... Remove this comment to see the full error
            message
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <input
          id={id}
          // @ts-expect-error TS(2322): Type 'ForwardedRef<unknown>' is not assignable to ... Remove this comment to see the full error message
          ref={ref}
          className={`${baseInputClasses} ${errorClasses} ${className}`}
          {...rest}
        />
        // @ts-expect-error TS(17004): Cannot use JSX unless the '--jsx' flag is
        provided... Remove this comment to see the full error message
        <FormError error={error} />
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
