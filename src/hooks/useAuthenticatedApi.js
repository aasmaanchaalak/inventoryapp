import { useAuth } from '@clerk/clerk-react';
import { useApi } from './useApi';
import { useCallback } from 'react';

/**
 * Custom hook that extends useApi with Clerk authentication
 * Follows Clerk's best practices for token management
 */
export const useAuthenticatedApi = (config = {}) => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const api = useApi(config);

  /**
   * Enhanced execute function that includes authentication
   */
  const authenticatedExecute = useCallback(
    async (url, options = {}) => {
      // Wait for Clerk to load
      if (!isLoaded) {
        throw new Error('Authentication not loaded');
      }

      // Check if user is signed in
      if (!isSignedIn) {
        throw new Error('User not authenticated');
      }

      try {
        // Get fresh token for each request
        const token = await getToken();

        if (!token) {
          throw new Error('Failed to obtain authentication token');
        }

        // Add authentication headers
        const authenticatedOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        };

        return api.execute(url, authenticatedOptions);
      } catch (error) {
        console.error('Authentication error:', error);
        throw error;
      }
    },
    [api, getToken, isSignedIn, isLoaded]
  );

  // Convenience methods with authentication
  const get = useCallback(
    (url, options = {}) => {
      return authenticatedExecute(url, { ...options, method: 'GET' });
    },
    [authenticatedExecute]
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

      return authenticatedExecute(url, postOptions);
    },
    [authenticatedExecute]
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

      return authenticatedExecute(url, putOptions);
    },
    [authenticatedExecute]
  );

  const del = useCallback(
    (url, options = {}) => {
      return authenticatedExecute(url, { ...options, method: 'DELETE' });
    },
    [authenticatedExecute]
  );

  return {
    // Include all original API hook properties
    ...api,

    // Override execute and HTTP methods with authenticated versions
    execute: authenticatedExecute,
    get,
    post,
    put,
    delete: del,

    // Add authentication state
    isAuthenticated: isSignedIn && isLoaded,
    authLoading: !isLoaded,
  };
};

export default useAuthenticatedApi;
