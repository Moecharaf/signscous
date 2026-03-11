import { httpClient } from '../../../shared/api/httpClient';

export const createAcrylicSignsQuote = (payload) =>
  httpClient.post('/v1/quotes/acrylic-signs', payload);
