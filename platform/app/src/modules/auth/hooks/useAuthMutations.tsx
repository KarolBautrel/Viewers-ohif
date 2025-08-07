import { apiQuery } from '../api/client';

const useAuthMutation = () => {
  const loginMutation = apiQuery.useMutation('post', '/allauth/browser/v1/auth/login');
  const fetchSession = apiQuery.useQuery(
    'get',
    '/allauth/browser/v1/auth/session',
    {},
    { enabled: false, retry: 0 },
  );
  const deleteSessionMutation = apiQuery.useMutation('delete', '/allauth/browser/v1/auth/session');

  const fetchConfig = apiQuery.useQuery(
    'get',
    '/allauth/browser/v1/config',
    {},
    { enabled: false, retry: 0 },
  );

  const otpVerifyMutation = apiQuery.useMutation(
    'post',
    '/allauth/browser/v1/auth/2fa/authenticate',
  );

  const activateTotpMutation = apiQuery.useMutation(
    'post',
    '/allauth/browser/v1/account/authenticators/totp',
  );

  const deactivateTotpMutation = apiQuery.useMutation(
    'delete',
    '/allauth/browser/v1/account/authenticators/totp',
  );

  const reauthMutation = apiQuery.useMutation('post', '/allauth/browser/v1/auth/reauthenticate');

  const verifyEmail = apiQuery.useMutation('post', '/allauth/browser/v1/auth/email/verify');

  const updatePasswordMutation = apiQuery.useMutation(
    'post',
    '/allauth/browser/v1/account/password/change',
  );

  const resetPasswordLinkMutation = apiQuery.useMutation(
    'post',
    '/allauth/browser/v1/auth/password/request',
  );

  const resetPasswordMutation = apiQuery.useMutation(
    'post',
    '/allauth/browser/v1/auth/password/reset',
  );

  return {
    loginMutation,
    fetchSession,
    deleteSessionMutation,
    otpVerifyMutation,
    activateTotpMutation,
    deactivateTotpMutation,
    fetchConfig,
    verifyEmail,
    reauthMutation,
    updatePasswordMutation,
    resetPasswordLinkMutation,
    resetPasswordMutation,
  };
};

export default useAuthMutation;
