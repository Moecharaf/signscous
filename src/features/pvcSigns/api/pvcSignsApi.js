import { httpClient } from '../../../shared/api/httpClient';

export const getPvcSignsConfig = () => httpClient.get('/v1/products/pvc-signs/config');

export const createPvcSignsQuote = (payload) =>
  httpClient.post('/v1/quotes/pvc-signs', payload);
