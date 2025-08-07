import type { Middleware } from 'openapi-fetch';

import { API_URL } from '../consts';
import { Flows } from './allauth';
import { getCSRFToken } from './django';
import useAuthStore from '../store/useAuthStore';
import { HttpError } from './exception';

export const csrfMiddleware: Middleware = {
  async onRequest({ request, options }) {
    const csrfToken = getCSRFToken();
    if (!csrfToken) {
      await fetch(`${API_URL}api/csrf/`);
    }
    request.headers.set('X-CSRFToken', csrfToken || '');
    return request;
  },
  async onResponse({ request, response, options }) {
    if (response.status === 204) {
      return response;
    }

    await response
      .clone()
      .json()
      .then((data) => {
        if (data.status === 401 || response.status === 401) {
          const authStore = useAuthStore.getState();
          const flows = data.data?.flows || [];
          const requiresReAuth = flows.some(
            (flow: { id: string; is_pending: boolean }) => flow.id === Flows.REAUTHENTICATE,
          );

          if (data.meta?.is_authenticated && requiresReAuth) {
            authStore.reAuth(data);
          } else if (!data.meta?.is_authenticated) {
            authStore.logout(data);
          }
          return undefined;
        }
        if (!response.ok) {
          throw new HttpError<typeof data>(response.status, data, response);
        }
      });
  },
};
