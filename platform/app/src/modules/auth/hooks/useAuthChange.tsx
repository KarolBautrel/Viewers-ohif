import { useEffect, useRef, useState } from 'react';

import useAuthStore from '../store/useAuthStore';
import type { AuthorizationResponse, FlowInfo, UserData } from '../types';

export enum AuthChangeEvent {
  LOGGED_OUT = 'LOGGED_OUT',
  LOGGED_IN = 'LOGGED_IN',
  REAUTHENTICATED = 'REAUTHENTICATED',
  REAUTHENTICATION_REQUIRED = 'REAUTHENTICATION_REQUIRED',
  FLOW_UPDATED = 'FLOW_UPDATED',
}

type AuthInfo = {
  isAuthenticated: boolean;
  requiresReauthentication: boolean;
  user: UserData | null;
  pendingFlow: FlowInfo | undefined;
};

const authInfo = (auth: AuthorizationResponse): AuthInfo => {
  const isAuthenticated =
    auth.status === 200 || (auth.status === 401 && auth.meta.is_authenticated);
  const requiresReauthentication = isAuthenticated && auth.status === 401;
  const pendingFlow = auth.data?.flows?.find((flow: FlowInfo) => flow.is_pending);
  return {
    isAuthenticated,
    requiresReauthentication,
    user: isAuthenticated ? auth.data.user : null,
    pendingFlow,
  };
};

const determineAuthChangeEvent = (
  fromAuth: AuthorizationResponse,
  toAuth: AuthorizationResponse,
): AuthChangeEvent | null => {
  let fromInfo = authInfo(fromAuth);
  const toInfo = authInfo(toAuth);
  if (toAuth.status === 410) {
    return AuthChangeEvent.LOGGED_OUT;
  }
  // Corner case: user ID change. Treat as if we're transitioning from anonymous state.
  if (fromInfo.user && toInfo.user && fromInfo.user?.id !== toInfo.user?.id) {
    fromInfo = {
      isAuthenticated: false,
      requiresReauthentication: false,
      user: null,
      pendingFlow: undefined,
    };
  }
  if (!fromInfo.isAuthenticated && toInfo.isAuthenticated) {
    // You typically don't transition from logged out to reauthentication required.
    return AuthChangeEvent.LOGGED_IN;
  }
  if (fromInfo.isAuthenticated && !toInfo.isAuthenticated) {
    return AuthChangeEvent.LOGGED_OUT;
  }
  if (fromInfo.isAuthenticated && toInfo.isAuthenticated) {
    if (toInfo.requiresReauthentication) {
      return AuthChangeEvent.REAUTHENTICATION_REQUIRED;
    }
    if (fromInfo.requiresReauthentication) {
      return AuthChangeEvent.REAUTHENTICATED;
    }
    if (fromAuth.data.methods.length < toAuth.data.methods.length) {
      // If you do a page reload when on the reauthentication page, both fromAuth
      // and toAuth are authenticated, and it won't see the change when
      // reauthentication without this.
      return AuthChangeEvent.REAUTHENTICATED;
    }
  }
  if (!fromInfo.isAuthenticated && !toInfo.isAuthenticated) {
    const fromFlow = fromInfo.pendingFlow;
    const toFlow = toInfo.pendingFlow;
    if (toFlow?.id && fromFlow?.id !== toFlow.id) {
      return AuthChangeEvent.FLOW_UPDATED;
    }
  }
  // No change.
  return null;
};

type AuthChangeStateRef = {
  prevAuth: AuthorizationResponse;
  event: AuthChangeEvent | null;
  didChange: boolean;
};

export const useAuthChange = (): [AuthorizationResponse, AuthChangeEvent | null] => {
  const { response: auth, reAuthenticateRequire } = useAuthStore();
  const ref = useRef<AuthChangeStateRef>({
    prevAuth: auth as AuthorizationResponse,
    event: null,
    didChange: false,
  });
  const [, setForcedUpdate] = useState(0);
  useEffect(() => {
    if (ref.current.prevAuth && !reAuthenticateRequire) {
      ref.current.didChange = true;
      const event = determineAuthChangeEvent(ref.current.prevAuth, auth as AuthorizationResponse);
      if (event) {
        ref.current.event = event;
        setForcedUpdate((gen) => gen + 1);
      }
    }
    ref.current.prevAuth = auth as AuthorizationResponse;
  }, [auth, reAuthenticateRequire]);
  const didChange = ref.current.didChange;
  if (didChange) {
    ref.current.didChange = false;
  }
  const event = ref.current.event;
  if (event) {
    ref.current.event = null;
  }

  return [auth, event];
};
