import { type ReactNode, useEffect, useState } from 'react';
import useAuthMutation from '../hooks/useAuthMutations';
import useAuthStore from '../store/useAuthStore';
import type { AuthorizationResponse } from '../types';
import React from 'react';
import { Roles } from '../consts';
import { useTranslation } from 'react-i18next';

interface SessionCheckProps {
  children: ReactNode;
}

export const SessionCheck: React.FC<SessionCheckProps> = ({ children }) => {
  const { fetchSession } = useAuthMutation();
  const { login, logout } = useAuthStore();

  const [isAllowed, setIsAllowed] = useState<boolean | null>(null); // null = loading
  const { t } = useTranslation('AuthSession');

  const loginUser = (response: AuthorizationResponse) => {
    const { meta, data } = response;
    const { is_authenticated } = meta;

    if (!is_authenticated) {
      setIsAllowed(false);
      logout(response);
      return;
    }

    if (data.user.role !== Roles.RADIOLOGIST) {
      setIsAllowed(false);
      logout(response);
      return;
    }

    login(response);
    setIsAllowed(true);
  };

  useEffect(() => {
    const checkSession = async () => {
      console.log('[SessionCheck] Checking session...');
      const response = await fetchSession.refetch();
      console.log('[SessionCheck] fetchSession response:', response);

      if (response.isError) {
        console.warn('[SessionCheck] Session check failed:', response.error);
        logout(response.error as AuthorizationResponse);
        setIsAllowed(false);
      } else if (response.isSuccess) {
        loginUser(response.data as AuthorizationResponse);
      }
    };

    void checkSession();
  }, []);

  // Loading state
  if (fetchSession.isPending || isAllowed === null) {
    return <div style={{ padding: 20, color: 'blue' }}>🔄 Checking session...</div>;
  }

  // Not allowed
  if (!isAllowed) {
    return (
      <div style={{ padding: 40, color: 'red', fontSize: 18 }}>
        {t('sessionErrorHeader')}
        <br />
        {t('sessionErrorBody')}
      </div>
    );
  }

  return <>{children}</>;
};
