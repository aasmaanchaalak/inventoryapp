import { toast } from 'react-toastify';

/**
 * Toast notification utilities for consistent user feedback
 * Uses react-toastify with predefined styling and behavior
 */

// Default toast options
const defaultOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/**
 * Display success toast notification
 * @param {string} message - Success message to display
 * @param {object} options - Additional toast options
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-success',
    style: {
      background: '#10b981', // green-500
      color: '#ffffff',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

/**
 * Display error toast notification
 * @param {string} message - Error message to display
 * @param {object} options - Additional toast options
 */
export const showError = (message, options = {}) => {
  toast.error(message, {
    ...defaultOptions,
    autoClose: 8000, // Keep error messages longer
    ...options,
    className: 'toast-error',
    style: {
      background: '#ef4444', // red-500
      color: '#ffffff',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

/**
 * Display info toast notification
 * @param {string} message - Info message to display
 * @param {object} options - Additional toast options
 */
export const showInfo = (message, options = {}) => {
  toast.info(message, {
    ...defaultOptions,
    ...options,
    className: 'toast-info',
    style: {
      background: '#3b82f6', // blue-500
      color: '#ffffff',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

/**
 * Display warning toast notification
 * @param {string} message - Warning message to display
 * @param {object} options - Additional toast options
 */
export const showWarning = (message, options = {}) => {
  toast.warn(message, {
    ...defaultOptions,
    autoClose: 6000, // Keep warnings slightly longer
    ...options,
    className: 'toast-warning',
    style: {
      background: '#f59e0b', // amber-500
      color: '#ffffff',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

/**
 * Display loading toast that can be updated
 * @param {string} message - Loading message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID for updating
 */
export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    autoClose: false, // Don't auto-close loading toasts
    ...options,
    className: 'toast-loading',
    style: {
      background: '#6b7280', // gray-500
      color: '#ffffff',
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

/**
 * Update an existing toast
 * @param {string} toastId - ID of the toast to update
 * @param {string} message - New message
 * @param {string} type - Toast type ('success', 'error', 'info', 'warning')
 * @param {object} options - Additional options
 */
export const updateToast = (
  toastId,
  message,
  type = 'success',
  options = {}
) => {
  const typeStyles = {
    success: { background: '#10b981', color: '#ffffff' },
    error: { background: '#ef4444', color: '#ffffff' },
    info: { background: '#3b82f6', color: '#ffffff' },
    warning: { background: '#f59e0b', color: '#ffffff' },
  };

  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: type === 'error' ? 8000 : 5000,
    ...options,
    style: {
      ...typeStyles[type],
      borderRadius: '8px',
      fontSize: '14px',
    },
  });
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Convenience method for API operation feedback
 * @param {object} result - API result object with success, message properties
 * @param {string} successMessage - Default success message
 * @param {string} errorMessage - Default error message
 */
export const showApiResult = (
  result,
  successMessage = 'Operation completed successfully!',
  errorMessage = 'Operation failed. Please try again.'
) => {
  if (result && result.success) {
    showSuccess(result.message || successMessage);
  } else {
    showError(result?.message || errorMessage);
  }
};

/**
 * Show form validation error
 * @param {string} message - Validation error message
 */
export const showValidationError = (message) => {
  showError(message, {
    autoClose: 6000,
    className: 'toast-validation-error',
  });
};

/**
 * Show network error
 * @param {string} customMessage - Custom error message (optional)
 */
export const showNetworkError = (
  customMessage = 'Network error. Please check your connection and try again.'
) => {
  showError(customMessage, {
    autoClose: 10000, // Keep network errors longer
    className: 'toast-network-error',
  });
};
