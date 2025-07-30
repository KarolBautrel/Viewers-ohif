import { type ReactNode, useEffect } from 'react';

import useAuthMutation from '../hooks/useAuthMutations';
import useAuthStore from '../store/useAuthStore';
import type { AuthorizationResponse } from '../types';
import React from 'react';

interface SessionCheckProps {
  children: ReactNode;
}

export const SessionCheck: React.FC<SessionCheckProps> = ({ children }) => {
  const { fetchSession } = useAuthMutation();
  const { login, logout } = useAuthStore();

  const loginUser = (response: AuthorizationResponse) => {
    const { meta } = response;
    const { is_authenticated } = meta;
    if (is_authenticated) {
      console.log('[SessionCheck] User is authenticated:', response);
      login(response);
    } else {
      console.log('[SessionCheck] User NOT authenticated:', response);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      console.log('[SessionCheck] Checking session...');
      const response = await fetchSession.refetch();
      console.log('[SessionCheck] fetchSession response:', response);

      if (response.isError) {
        console.warn('[SessionCheck] Session check failed:', response.error);
        logout(response.error as AuthorizationResponse);
      } else if (response.isSuccess) {
        loginUser(response.data as AuthorizationResponse);
      }
    };

    void checkSession();
  }, []);

  // Debugowanie stanu ładowania
  if (fetchSession.isPending) {
    return <div style={{ padding: 20, color: 'blue' }}>🔄 Checking session...</div>;
  }

  return <>{children}</>;
};
