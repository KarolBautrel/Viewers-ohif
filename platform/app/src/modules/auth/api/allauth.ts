export enum AuthenticatorType {
  TOTP = 'totp',
  RECOVERY_CODES = 'recovery_codes',
  WEBAUTHN = 'webauthn',
}

export enum Flows {
  VERIFY_EMAIL = 'verify_email',
  LOGIN = 'login',
  LOGIN_BY_CODE = 'login_by_code',
  PROVIDER_SIGNUP = 'provider_signup',
  REAUTHENTICATE = 'reauthenticate',
  MFA_REAUTHENTICATE = 'mfa_reauthenticate',
  CHANGE_PASSWORD = 'change_password',
  SET_PASSWORD = 'set_password',
}
