import { httpClient } from '../../../shared/api/httpClient';

export const createWindowGraphicsQuote = (payload) =>
  httpClient.post('/v1/quotes/window-graphics', payload);
