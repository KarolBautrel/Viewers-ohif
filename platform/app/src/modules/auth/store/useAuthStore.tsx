import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import type { Roles } from '../consts';
import type { AuthorizationResponse } from '../types/types';

type AuthState = {
  isAuthenticated: boolean;
  reAuthenticateRequire: boolean;
  role: Roles | undefined;
  email: string;
  response: AuthorizationResponse;
  login: (response: AuthorizationResponse, email?: string) => void;
  logout: (response: AuthorizationResponse) => void;
  reAuth: (response: AuthorizationResponse) => void;
  reAuthDone: () => void;
  updateData: (data: AuthorizationResponse) => void;
  setEmail: (email: string) => void;
};

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        reAuthenticateRequire: false,
        role: undefined,
        email: '',
        response: {
          status: 0,
          data: {
            user: null,
            methods: [],
            flows: [],
          },
          meta: {
            is_authenticated: false,
          },
        },
        login: (response: AuthorizationResponse, email?: string) =>
          set({
            isAuthenticated: true,
            reAuthenticateRequire: false,
            email: email || '',
            response,
            role: response.data.user?.role,
          }),
        logout: (response: AuthorizationResponse) =>
          set({
            isAuthenticated: false,
            reAuthenticateRequire: false,
            email: '',
            response,
            role: undefined,
          }),
        reAuth: (response: AuthorizationResponse) =>
          set({ reAuthenticateRequire: true, response, role: response.data.user?.role }),
        reAuthDone: () => set({ reAuthenticateRequire: false }),
        updateData: (response: AuthorizationResponse) =>
          set({ response, role: response.data.user?.role }),
        setEmail: (email: string) => set({ email }),
      }),
      {
        name: 'auth',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  ),
);

export default useAuthStore;
