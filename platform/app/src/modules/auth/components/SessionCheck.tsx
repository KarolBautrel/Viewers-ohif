import React, { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useAuthMutation from '../hooks/useAuthMutations';
import useAuthStore from '../store/useAuthStore';
import type { AuthorizationResponse } from '../types';
import { Roles } from '../consts';

interface SessionCheckProps {
  children: ReactNode;
}

export const SessionCheck: React.FC<SessionCheckProps> = ({ children }) => {
  const { fetchSession } = useAuthMutation();
  const { login, logout } = useAuthStore();
  const { t } = useTranslation('AuthSession');

  const [isAllowed, setIsAllowed] = useState<boolean | null>(null); // null = loading

  const loginUser = (response: AuthorizationResponse) => {
    const { meta, data } = response;
    const { is_authenticated } = meta;

    if (!is_authenticated || data.user.role !== Roles.RADIOLOGIST) {
      logout(response);
      setIsAllowed(false);
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

  if (isAllowed === false) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="border-border bg-card w-full max-w-md rounded-lg border p-8 text-center shadow-md">
          <h2 className="text-destructive mb-4 text-2xl font-semibold">
            {t('sessionErrorHeader')}
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">{t('sessionErrorBody')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
