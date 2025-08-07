import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { API_URL } from '../consts';
import { csrfMiddleware } from './middleware';

export const fetchClient = createFetchClient({
  baseUrl: API_URL,
  credentials: 'include',
});
fetchClient.use(csrfMiddleware);
export const apiQuery = createClient(fetchClient);
