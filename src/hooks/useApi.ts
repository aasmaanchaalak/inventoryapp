import { useState, useCallback } from 'react';

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
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second initial delay
  retryDelayMultiplier: 2, // Exponential backoff
  showToast: true,
};

// Error types that should trigger retries
const RETRY_ERROR_TYPES = [
  'Failed to fetch', // Network errors
  'NetworkError',
  'TypeError: Failed to fetch',
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

  const [state, setState] = useState({
    status: API_STATES.IDLE,
    data: null,
    error: null,
    isLoading: false,
    retryCount: 0,
  });

  /**
   * Sleep function for retry delays
   */
  const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Calculate retry delay with exponential backoff
   */
  const getRetryDelay = (attempt: any) => {
    return (
      finalConfig.retryDelay *
      Math.pow(finalConfig.retryDelayMultiplier, attempt)
    );
  };

  /**
   * Check if error should trigger a retry
   */
  const shouldRetry = (error: any, response: any, attempt: any) => {
    if (attempt >= finalConfig.retries) return false;

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
  };

  /**
   * Show user-friendly error notification
   */
  const showErrorNotification = (error: any, isTimeout = false) => {
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
  };

  /**
   * Create AbortController for timeout handling
   */
  const createTimeoutController = () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, finalConfig.timeout);

    return { controller, timeoutId };
  };

  /**
   * Main API call function with retry logic
   */
  const makeRequest = useCallback(
    async (url: any, options = {}, attempt = 0) => {
      const { controller, timeoutId } = createTimeoutController();

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
          data = await response.json();
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`,
            {
              cause: { status: response.status, data },
            }
          );
        }

        return { data, response };
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle timeout errors
        if (error.name === 'AbortError') {
          throw new Error('Request timeout', { cause: { isTimeout: true } });
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
    [finalConfig]
  );

  /**
   * Execute API call with full error handling
   */
  const execute = useCallback(
    async (url: any, options = {}) => {
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
        const isTimeout = error.cause?.isTimeout;
        const status = isTimeout ? API_STATES.TIMEOUT : API_STATES.ERROR;

        setState({
          status,
          data: null,
          error: {
            message: error.message,
            status: error.cause?.status,
            isTimeout,
          },
          isLoading: false,
          retryCount: 0,
        });

        showErrorNotification(error, isTimeout);
        throw error;
      }
    },
    [makeRequest, finalConfig]
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
    async (url: any, options = {}) => {
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
    (url: any, options = {}) => {
      return execute(url, { ...options, method: 'GET' });
    },
    [execute]
  );

  const post = useCallback(
    (url: any, data = null, options = {}) => {
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
    (url: any, data = null, options = {}) => {
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
    (url: any, options = {}) => {
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
