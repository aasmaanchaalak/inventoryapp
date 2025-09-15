import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setAuthToken } from '../utils/api';

const AuthProvider = ({ children }) => {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    const updateToken = async () => {
      if (isLoaded) {
        try {
          const token = await getToken();
          setAuthToken(token);
        } catch (error) {
          console.error('Failed to get auth token:', error);
          setAuthToken(null);
        }
      }
    };

    updateToken();
  }, [isLoaded, getToken]);

  return <>{children}</>;
};

export default AuthProvider;
