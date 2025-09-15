import { useState, useCallback, useRef, useEffect } from 'react';

// API states enum
export const API_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  TIMEOUT: 'timeout',
};

// Default configuration
const DEFAULT_CONFIG = {
  timeout: 8000, // 8 seconds - shorter for faster feedback
  retries: 2, // Fewer retries but faster feedback
  retryDelay: 500, // 500ms initial delay - faster retry
  retryDelayMultiplier: 2, // Exponential backoff
  showToast: true,
};

// Error types that should trigger retries
const RETRY_ERROR_TYPES = [
  'Failed to fetch', // Network errors
  'NetworkError',
  'TypeError: Failed to fetch',
  'Request timeout', // Our custom timeout errors
];

// HTTP status codes that should trigger retries (5xx server errors)
const RETRY_STATUS_CODES = [500, 502, 503, 504];

/**
 * Custom hook for API calls with comprehensive error handling
 * @param {Object} config - Configuration options
 * @returns {Object} - API state and methods
 */
export const useApi = (config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Use ref to track active controllers for cleanup
  const activeControllers = useRef(new Set());

  const [state, setState] = useState({
    status: API_STATES.IDLE,
    data: null,
    error: null,
    isLoading: false,
    retryCount: 0,
  });

  // Stable helper functions using useCallback with proper dependencies
  const sleep = useCallback(
    (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    []
  );

  const getRetryDelay = useCallback(
    (attempt) => {
      return (
        finalConfig.retryDelay *
        Math.pow(finalConfig.retryDelayMultiplier, attempt)
      );
    },
    [finalConfig.retryDelay, finalConfig.retryDelayMultiplier]
  );

  const shouldRetry = useCallback(
    (error, response, attempt) => {
      if (attempt >= finalConfig.retries) return false;

      // Check for timeout errors (always retry timeouts if we have attempts left)
      if (error && (error.isTimeout || error.name === 'AbortError')) {
        return true;
      }

      // Check for network errors
      if (
        error &&
        RETRY_ERROR_TYPES.some((type) => error.message.includes(type))
      ) {
        return true;
      }

      // Check for server errors (5xx status codes)
      if (response && RETRY_STATUS_CODES.includes(response.status)) {
        return true;
      }

      return false;
    },
    [finalConfig.retries]
  );

  const showErrorNotification = useCallback(
    (error, isTimeout = false) => {
      if (!finalConfig.showToast) return;

      let message = 'An unexpected error occurred. Please try again.';

      if (isTimeout) {
        message =
          'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        message = 'Network error. Please check your internet connection.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again in a moment.';
      } else if (error.status === 404) {
        message = 'Requested resource not found.';
      } else if (error.status === 401) {
        message = 'Authentication required. Please log in again.';
      } else if (error.status === 403) {
        message = 'You do not have permission to perform this action.';
      }

      // For now, use console.error. This will be replaced with toast notifications
      console.error('API Error:', message, error);

      // In a real application, you would show a toast notification here
      // toast.error(message);
    },
    [finalConfig.showToast]
  );

  const createTimeoutController = useCallback(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      activeControllers.current.delete(controller);
    }, finalConfig.timeout);

    // Track this controller for cleanup
    activeControllers.current.add(controller);

    return {
      controller,
      timeoutId,
      cleanup: () => {
        clearTimeout(timeoutId);
        activeControllers.current.delete(controller);
      },
    };
  }, [finalConfig.timeout]);

  /**
   * Main API call function with retry logic
   */
  const makeRequest = useCallback(
    async (url, options = {}, attempt = 0) => {
      const { controller, cleanup } = createTimeoutController();

      try {
        setState((prev) => ({ ...prev, retryCount: attempt }));

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        // Clean up timeout immediately on response
        cleanup();

        // Check if we should retry on server errors
        if (shouldRetry(null, response, attempt)) {
          const delay = getRetryDelay(attempt);
          await sleep(delay);
          return makeRequest(url, options, attempt + 1);
        }

        // Parse response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (parseError) {
            console.warn('Failed to parse JSON response:', parseError);
            data = await response.text();
          }
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const errorMessage =
            typeof data === 'object' && data.message
              ? data.message
              : typeof data === 'string' && data.length > 0
                ? data
                : `HTTP error! status: ${response.status}`;

          const error = new Error(errorMessage);
          error.status = response.status;
          error.data = data;
          throw error;
        }

        return { data, response };
      } catch (error) {
        // Ensure cleanup happens even on error
        cleanup();

        // Handle timeout errors specifically
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Request timeout');
          timeoutError.isTimeout = true;
          timeoutError.status = 408; // Request Timeout
          throw timeoutError;
        }

        // Check if we should retry on network errors
        if (shouldRetry(error, null, attempt)) {
          const delay = getRetryDelay(attempt);
          await sleep(delay);
          return makeRequest(url, options, attempt + 1);
        }

        throw error;
      }
    },
    [createTimeoutController, getRetryDelay, shouldRetry, sleep]
  );

  // Cleanup all active controllers on unmount
  useEffect(() => {
    // Copy the current ref value to a variable inside the effect
    const controllers = activeControllers.current;
    return () => {
      // Cancel all active requests on unmount
      controllers.forEach((controller) => {
        controller.abort();
      });
      controllers.clear();
    };
  }, []);

  /**
   * Execute API call with full error handling
   */
  const execute = useCallback(
    async (url, options = {}) => {
      setState((prev) => ({
        ...prev,
        status: API_STATES.LOADING,
        isLoading: true,
        error: null,
        retryCount: 0,
      }));

      try {
        const result = await makeRequest(url, options);

        setState({
          status: API_STATES.SUCCESS,
          data: result.data,
          error: null,
          isLoading: false,
          retryCount: 0,
        });

        return result.data;
      } catch (error) {
        const isTimeout = error.isTimeout || error.name === 'AbortError';
        const status = isTimeout ? API_STATES.TIMEOUT : API_STATES.ERROR;

        setState({
          status,
          data: null,
          error: {
            message: error.message,
            status: error.status,
            isTimeout,
            originalError: error,
          },
          isLoading: false,
          retryCount: 0,
        });

        showErrorNotification(error, isTimeout);
        throw error;
      }
    },
    [makeRequest, showErrorNotification]
  );

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    setState({
      status: API_STATES.IDLE,
      data: null,
      error: null,
      isLoading: false,
      retryCount: 0,
    });
  }, []);

  /**
   * Retry the last failed request
   */
  const retry = useCallback(
    async (url, options = {}) => {
      if (
        state.status === API_STATES.ERROR ||
        state.status === API_STATES.TIMEOUT
      ) {
        return execute(url, options);
      }
    },
    [state.status, execute]
  );

  // Convenience methods for different HTTP methods
  const get = useCallback(
    (url, options = {}) => {
      return execute(url, { ...options, method: 'GET' });
    },
    [execute]
  );

  const post = useCallback(
    (url, data = null, options = {}) => {
      const postOptions = {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      if (data) {
        postOptions.body = JSON.stringify(data);
      }

      return execute(url, postOptions);
    },
    [execute]
  );

  const put = useCallback(
    (url, data = null, options = {}) => {
      const putOptions = {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      if (data) {
        putOptions.body = JSON.stringify(data);
      }

      return execute(url, putOptions);
    },
    [execute]
  );

  const del = useCallback(
    (url, options = {}) => {
      return execute(url, { ...options, method: 'DELETE' });
    },
    [execute]
  );

  return {
    // State
    ...state,

    // Computed properties
    isIdle: state.status === API_STATES.IDLE,
    isSuccess: state.status === API_STATES.SUCCESS,
    isError: state.status === API_STATES.ERROR,
    isTimeout: state.status === API_STATES.TIMEOUT,

    // Methods
    execute,
    reset,
    retry,
    get,
    post,
    put,
    delete: del,
  };
};

export default useApi;
